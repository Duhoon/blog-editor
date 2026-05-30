import { useEffect, useState } from "react";
import { ApiErrorResponse, RecentPostSummary, RecentPostsResponse } from "@blog-editor/types/Post";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Sidebar (){
  const [posts, setPosts] = useState<RecentPostSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(()=>{
    let ignore = false;

    const fetchRecentPosts = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch("/api/posts/recent?limit=10");
        const data = await response.json() as RecentPostsResponse | ApiErrorResponse;

        if (!response.ok) {
          throw new Error("message" in data ? data.message : "최근 글을 불러오지 못했습니다.");
        }

        if (!ignore) {
          setPosts((data as RecentPostsResponse).posts);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error instanceof Error ? error.message : "최근 글을 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchRecentPosts();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <aside className="h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-5 text-slate-900">
      <div className="mb-4">
        <h2 className="text-base font-semibold">최근 작성글</h2>
        <p className="mt-1 text-xs text-slate-500">Supabase posts</p>
      </div>

      {isLoading && (
        <div className="rounded-md border border-slate-200 px-3 py-4 text-sm text-slate-500">
          불러오는 중
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && posts.length === 0 && (
        <div className="rounded-md border border-slate-200 px-3 py-4 text-sm text-slate-500">
          작성글이 없습니다.
        </div>
      )}

      {!isLoading && !errorMessage && posts.length > 0 && (
        <ul className="space-y-2">
          {posts.map((post)=>(
            <li
              className="rounded-md border border-slate-200 px-3 py-3"
              key={post.id}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="truncate text-xs text-slate-500">{post.locale}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    post.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {post.isPublished ? "발행" : "초안"}
                </span>
              </div>
              <h3 className="line-clamp-2 text-sm font-medium leading-5">{post.title}</h3>
              <p className="mt-1 truncate text-xs text-slate-500">/{post.slug}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDate(post.updatedAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
