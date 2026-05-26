export type ForumPost = {
    id: number | string;
    title?: string;
    content?: string;
    createdAt?: string;
    user?: {
        id?: number;
        email?: string;
        firstName?: string;
        lastName?: string;
    };
    replies?: ForumReply[];
};

export type ForumReply = {
    id: number | string;
    content?: string;
    createdAt?: string;
    validated?: boolean;
    approvals?: number;
    user?: { id?: number; email?: string };
    post?: { id?: number | string; title?: string };
};

type PostCardProps = {
    post: ForumPost;
    replyCount: number;
    onClick: () => void;
};

export default function PostCard({ post, replyCount, onClick }: PostCardProps) {
    const author =
        post.user?.firstName
            ? `${post.user.firstName} ${post.user.lastName ?? ""}`.trim()
            : (post.user?.email ?? "Desconocido");

    const date = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : null;

    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition group"
        >
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                {post.title ?? "Sin título"}
            </h3>
            {post.content && (
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                    {post.content}
                </p>
            )}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{author}</span>
                <div className="flex items-center gap-3">
                    {date && <span>{date}</span>}
                    <span className="font-medium text-slate-600">
                        💬 {replyCount}
                    </span>
                </div>
            </div>
        </button>
    );
}
