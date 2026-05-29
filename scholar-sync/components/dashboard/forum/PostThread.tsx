"use client";

import { useState } from "react";
import type {
    ForumPost,
    ForumReply,
} from "@/components/dashboard/forum/PostCard";
import ReplyItem from "@/components/dashboard/forum/ReplyItem";
import apiService from "@/lib/apiService";

type PostThreadProps = {
    post: ForumPost;
    replies: ForumReply[];
    canValidate: boolean;
    canCreate: boolean;
    userId: number | null;
    onBack: () => void;
    onReplyValidated: (replyId: number | string) => void;
    onReplyAdded: (reply: ForumReply) => void;
};

export default function PostThread({
    post,
    replies,
    canValidate,
    canCreate,
    userId,
    onBack,
    onReplyValidated,
    onReplyAdded,
}: PostThreadProps) {
    const [replyContent, setReplyContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const author =
        post.user?.firstName
            ? `${post.user.firstName} ${post.user.lastName ?? ""}`.trim()
            : (post.user?.email ?? "Desconocido");

    const date = post.dateAdded
        ? new Date(post.dateAdded).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : null;

    const handleValidate = async (replyId: number | string) => {
        await apiService.patch(`/reply/${replyId}/validate`, {});
        onReplyValidated(replyId);
    };

    const handleSubmitReply = async () => {
        const content = replyContent.trim();
        if (!content) {
            return;
        }
        setSubmitting(true);
        try {
            const created = await apiService.post<ForumReply>("/reply", {
                postId: post.id,
                replyMessage: content,
                userId,
            });
            onReplyAdded(created);
            setReplyContent("");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition"
            >
                ← Volver
            </button>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-slate-900">
                    {post.title ?? "Sin título"}
                </h2>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span>{author}</span>
                    {date && <span>{date}</span>}
                </div>
                {post.question && (
                    <p className="mt-4 text-sm text-slate-700 leading-relaxed">
                        {post.question}
                    </p>
                )}
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Respuestas ({replies.length})
                </h3>
                {replies.length === 0 && (
                    <p className="text-sm text-slate-400">
                        Sin respuestas todavía.
                    </p>
                )}
                {replies.map((reply) => (
                    <ReplyItem
                        key={reply.id}
                        reply={reply}
                        canValidate={canValidate}
                        onValidate={handleValidate}
                    />
                ))}
            </div>

            {canCreate && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700">
                        Agregar respuesta
                    </h3>
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={3}
                        placeholder="Escribe tu respuesta..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                    <button
                        type="button"
                        disabled={submitting || !replyContent.trim()}
                        onClick={handleSubmitReply}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 transition"
                    >
                        {submitting ? "Enviando..." : "Enviar"}
                    </button>
                </div>
            )}
        </div>
    );
}
