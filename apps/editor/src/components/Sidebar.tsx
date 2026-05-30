import { useEffect, useState } from "react";
import { ApiErrorResponse, RecentPostSummary, RecentPostsResponse } from "@blog-editor/types/Post";

const PAGE_SIZE = 10;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

interface SidebarProps {
  selectedPostId: number | null;
  onSelectPost: (postId: number) => void;
  onCreateNewPost: () => void;
}

export default function Sidebar ({selectedPostId, onSelectPost, onCreateNewPost}: SidebarProps){
  const [posts, setPosts] = useState<RecentPostSummary[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(()=>{
    let ignore = false;

    const fetchRecentPosts = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(`/api/posts/recent?page=${page}&limit=${PAGE_SIZE}`);
        const data = await response.json() as RecentPostsResponse | ApiErrorResponse;

        if (!response.ok) {
          throw new Error("message" in data ? data.message : "최근 글을 불러오지 못했습니다.");
        }

        if (!ignore) {
          const recentPosts = data as RecentPostsResponse;
          setPosts(recentPosts.posts);
          setTotalPages(recentPosts.totalPages);
          setHasPreviousPage(recentPosts.hasPreviousPage);
          setHasNextPage(recentPosts.hasNextPage);
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
  }, [page]);

  return (
    <aside className="h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-5 text-slate-900">
      <div className="mb-4">
        <h2 className="text-base font-semibold">최근 작성글</h2>
        <p className="mt-1 text-xs text-slate-500">Supabase posts</p>
      </div>

      <button
        className="mb-4 w-full rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:cursor-pointer hover:bg-green-700"
        type="button"
        onClick={onCreateNewPost}
      >
        새 글 작성
      </button>

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
        <>
          <div className="mb-4 flex items-center justify-between">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-lg text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:cursor-pointer enabled:hover:border-slate-400"
              type="button"
              disabled={!hasPreviousPage || isLoading}
              aria-label="이전 페이지"
              onClick={()=> setPage((currentPage)=> Math.max(currentPage - 1, 1))}
            >
              {"<"}
            </button>
            <span className="text-sm text-slate-500">
              {page} / {totalPages}
            </span>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-lg text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:cursor-pointer enabled:hover:border-slate-400"
              type="button"
              disabled={!hasNextPage || isLoading}
              aria-label="다음 페이지"
              onClick={()=> setPage((currentPage)=> currentPage + 1)}
            >
              {">"}
            </button>
          </div>
          <ul className="space-y-2">
            {posts.map((post)=>(
              <li key={post.id}>
                <button
                  className={`w-full rounded-md border px-3 py-3 text-left hover:cursor-pointer hover:border-slate-400 ${
                    selectedPostId === post.id
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 bg-white"
                  }`}
                  type="button"
                  onClick={()=> onSelectPost(post.id)}
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
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  )
}
