import { useState } from "react";
import EntityFormModal, {
    FieldConfig,
} from "@/components/dashboard/EntityFormModal";
import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";
import apiService from "@/lib/apiService";

const USER_FIELDS: FieldConfig[] = [
    { name: "firstName", label: "Nombre", required: true },
    { name: "lastName", label: "Apellido", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password" },
];

type UserRow = Record<string, string | number> & { id: string | number };

export default function UsersTab({
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
    const [editingRow, setEditingRow] =
        useState<Record<string, string> | null>(null);
    const [editingId, setEditingId] = useState<string | number | null>(null);

    const handleCreate = () => {
        setEditingRow(null);
        setEditingId(null);
        setModalOpen(true);
    };

    const handleEdit = (row: UserRow) => {
        const fullName = String(row.Nombre ?? "").trim();
        const [firstName = "", ...lastNameParts] = fullName.split(/\s+/);

        setEditingRow({
            firstName,
            lastName: lastNameParts.join(" "),
            email: String(row.Email ?? ""),
            password: "",
        });
        setEditingId(row.id);
        setModalOpen(true);
    };

    const handleSubmit = async (values: Record<string, string>) => {
        if (editingId !== null) {
            const payload = values.password
                ? values
                : {
                      firstName: values.firstName,
                      lastName: values.lastName,
                      email: values.email,
                  };
            await apiService.patch(`/user/${editingId}`, payload);
            await onRefresh?.();
            return;
        }

        await apiService.post("/user", values);
        await onRefresh?.();
    };

    return (
        <>
            <EntityFormModal
                isOpen={modalOpen}
                title={editingId !== null ? "Editar usuario" : "Crear usuario"}
                fields={USER_FIELDS}
                initialValues={editingRow ?? undefined}
                onSubmit={handleSubmit}
                onClose={() => setModalOpen(false)}
            />

            <TablePanel
                title="Usuarios"
                description="Listado general de estudiantes y docentes."
                columns={["Nombre", "Email", "Roles", "Nivel"]}
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
