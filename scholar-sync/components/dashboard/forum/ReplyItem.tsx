import type { ForumReply } from "@/components/dashboard/forum/PostCard";

type ReplyItemProps = {
    reply: ForumReply;
    canValidate: boolean;
    canLike: boolean;
    onLike: (id: number | string) => void;
    onValidate: (id: number | string) => void;
};

export default function ReplyItem({
    reply,
    canValidate,
    canLike,
    onLike,
    onValidate,
}: ReplyItemProps) {
    const author = reply.user?.email ?? "Desconocido";
    const date = reply.createdAt
        ? new Date(reply.createdAt).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : null;

    return (
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-slate-800 flex-1">
                    {reply.content ?? "Sin contenido."}
                </p>
                <div className="shrink-0 flex items-center gap-2">
                    {canLike && (
                        <button
                            type="button"
                            onClick={() => onLike(reply.id)}
                            className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                        >
                            👍 Like
                        </button>
                    )}
                    {canValidate && !reply.validated && (
                        <button
                            type="button"
                            onClick={() => onValidate(reply.id)}
                            className="rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 transition"
                        >
                            Validar
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                <span>{author}</span>
                {date && <span>{date}</span>}
                {reply.approvals !== undefined && reply.approvals > 0 && (
                    <span>{reply.approvals} aprobaciones</span>
                )}
                {reply.validated && (
                    <span className="font-medium text-green-600">
                        ✓ Aprobada
                    </span>
                )}
            </div>
        </div>
    );
}
