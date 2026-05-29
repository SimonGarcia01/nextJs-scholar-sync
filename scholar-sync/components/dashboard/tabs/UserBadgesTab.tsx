import { useEffect, useState } from "react";
import EntityFormModal, {
    FieldConfig,
} from "@/components/dashboard/EntityFormModal";
import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";
import apiService from "@/lib/apiService";

type SelectOption = { value: string; label: string };
type UserBadgeRow = Record<string, string | number> & { id: string | number };

const toOptions = (data: unknown, labels: string[]): SelectOption[] => {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map((item, index) => {
            if (!item || typeof item !== "object") {
                return null;
            }
            const record = item as Record<string, unknown>;
            const rawId = record.id ?? record._id ?? index;
            const label = labels.find(
                (key) =>
                    typeof record[key] === "string" &&
                    String(record[key]).trim() !== ""
            );
            if (!label) {
                return null;
            }
            return { value: String(rawId), label: String(record[label]) };
        })
        .filter((option): option is SelectOption => option !== null);
};

export default function UserBadgesTab({
    rows,
    canCreate,
    canUpdate,
    canDelete,
    onRefresh,
    onDelete,
    isLoading,
    emptyMessage,
}: EntityTabProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [initialValues, setInitialValues] = useState<
        Record<string, string> | undefined
    >(undefined);
    const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
    const [badgeOptions, setBadgeOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
        apiService
            .get<unknown>("/user")
            .then((data) => setUserOptions(toOptions(data, ["email", "name"])))
            .catch(() => setUserOptions([]));
        apiService
            .get<unknown>("/experience-badge")
            .then((data) => setBadgeOptions(toOptions(data, ["name", "title"])))
            .catch(() => setBadgeOptions([]));
    }, []);

    const USER_BADGE_FIELDS: FieldConfig[] = [
        {
            name: "userId",
            label: "Usuario",
            required: true,
            options: userOptions,
        },
        {
            name: "experienceBadgeId",
            label: "Insignia",
            required: true,
            options: badgeOptions,
        },
        {
            name: "dateAcquired",
            label: "Fecha",
            type: "date",
            required: true,
        },
    ];

    const handleCreate = () => {
        setEditingId(null);
        setInitialValues(undefined);
        setModalOpen(true);
    };

    const handleEdit = async (row: UserBadgeRow) => {
        setEditingId(row.id);
        try {
            const data = await apiService.get<Record<string, unknown>>(
                `/user-badge/${row.id}`
            );
            setInitialValues({
                userId: String(
                    (data.user as { id?: string | number } | undefined)?.id ?? ""
                ),
                experienceBadgeId: String(
                    (
                        data.experienceBadge as
                            | { id?: string | number }
                            | undefined
                    )?.id ?? ""
                ),
                dateAcquired: String(data.dateAcquired ?? "").slice(0, 10),
            });
        } catch {
            setInitialValues({
                userId: "",
                experienceBadgeId: "",
                dateAcquired: String(row.Fecha ?? "").slice(0, 10),
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (values: Record<string, string>) => {
        const payload = {
            userId: Number(values.userId),
            experienceBadgeId: Number(values.experienceBadgeId),
            dateAcquired: values.dateAcquired,
        };
        if (editingId !== null) {
            await apiService.patch(`/user-badge/${editingId}`, payload);
        } else {
            await apiService.post("/user-badge", payload);
        }
        await onRefresh?.();
    };

    return (
        <>
            <EntityFormModal
                isOpen={modalOpen}
                title={
                    editingId !== null
                        ? "Editar asignacion de insignia"
                        : "Asignar insignia"
                }
                fields={USER_BADGE_FIELDS}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                onClose={() => setModalOpen(false)}
            />
            <TablePanel
                title="Usuarios e insignias"
                description="Insignias asignadas a usuarios."
                columns={["Usuario", "Insignia", "Fecha"]}
                rows={rows}
                canCreate={canCreate}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={onDelete}
                isLoading={isLoading}
                emptyMessage={emptyMessage}
            />
        </>
    );
}
