import type { ForumReply } from "@/components/dashboard/forum/PostCard";

type ReplyItemProps = {
    reply: ForumReply;
    canValidate: boolean;
    onValidate: (id: number | string) => void;
};

export default function ReplyItem({
    reply,
    canValidate,
    onValidate,
}: ReplyItemProps) {
    const author = reply.user?.email ?? "Desconocido";
    const date = reply.dateAdded
        ? new Date(reply.dateAdded).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : null;

    return (
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-slate-800 flex-1">
                    {reply.replyMessage ?? "Sin contenido."}
                </p>
                {canValidate && !reply.isValidated && (
                    <button
                        type="button"
                        onClick={() => onValidate(reply.id)}
                        className="shrink-0 rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 transition"
                    >
                        Validar
                    </button>
                )}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                <span>{author}</span>
                {date && <span>{date}</span>}
                {reply.approvals !== undefined && reply.approvals > 0 && (
                    <span>{reply.approvals} aprobaciones</span>
                )}
                {reply.isValidated && (
                    <span className="font-medium text-green-600">
                        ✓ Aprobada
                    </span>
                )}
            </div>
        </div>
    );
}
