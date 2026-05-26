"use client";

import { useEffect, useState } from "react";
import apiService from "@/lib/apiService";
import PostCard, {
    type ForumPost,
    type ForumReply,
} from "@/components/dashboard/forum/PostCard";
import PostThread from "@/components/dashboard/forum/PostThread";

type ForumTabProps = {
    roles: string[];
    canCreate: boolean;
};

export default function ForumTab({ roles, canCreate }: ForumTabProps) {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [allReplies, setAllReplies] = useState<ForumReply[]>([]);
    const [selectedPostId, setSelectedPostId] = useState<
        number | string | null
    >(null);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingReplies, setLoadingReplies] = useState(true);

    const canValidate =
        roles.includes("Professor") || roles.includes("TA");

    useEffect(() => {
        let active = true;
        apiService
            .get<ForumPost[]>("/post")
            .then((data) => {
                if (active) {
                    setPosts(Array.isArray(data) ? data : []);
                    setLoadingPosts(false);
                }
            })
            .catch(() => {
                if (active) setLoadingPosts(false);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        apiService
            .get<ForumReply[]>("/reply")
            .then((data) => {
                if (active) {
                    setAllReplies(Array.isArray(data) ? data : []);
                    setLoadingReplies(false);
                }
            })
            .catch(() => {
                if (active) setLoadingReplies(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const getRepliesForPost = (postId: number | string): ForumReply[] => {
        return allReplies.filter((r) => {
            const pid = r.post?.id;
            return String(pid) === String(postId);
        });
    };

    const handleReplyValidated = (replyId: number | string) => {
        setAllReplies((prev) =>
            prev.map((r) =>
                String(r.id) === String(replyId)
                    ? { ...r, validated: true }
                    : r
            )
        );
    };

    const handleReplyAdded = (reply: ForumReply) => {
        setAllReplies((prev) => [...prev, reply]);
    };

    const isLoading = loadingPosts || loadingReplies;

    if (isLoading) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-500 text-sm">Cargando foro...</p>
            </div>
        );
    }

    if (selectedPostId !== null) {
        const post = posts.find(
            (p) => String(p.id) === String(selectedPostId)
        );
        if (!post) {
            return null;
        }
        const replies = getRepliesForPost(selectedPostId);
        return (
            <PostThread
                post={post}
                replies={replies}
                canValidate={canValidate}
                canCreate={canCreate}
                onBack={() => setSelectedPostId(null)}
                onReplyValidated={handleReplyValidated}
                onReplyAdded={handleReplyAdded}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Foro
                    </h2>
                    <p className="text-sm text-slate-500">
                        Publicaciones y discusiones del curso.
                    </p>
                </div>
            </div>
            {posts.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <p className="text-slate-500 text-sm">
                        Sin publicaciones por ahora.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            replyCount={getRepliesForPost(post.id).length}
                            onClick={() => setSelectedPostId(post.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
