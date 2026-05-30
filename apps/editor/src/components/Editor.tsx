import { Editor as EditorUI } from "@toast-ui/react-editor"
import Button from "./Button";
import "@toast-ui/editor/toastui-editor.css";

import { FormEvent, useMemo, useRef, useState } from "react";
import { ApiErrorResponse, locales, Locales, PostPublishRequest, PostPublishResponse } from "@blog-editor/types/Post";

const categoryOptions = [
  {id: "development", label: "개발"},
  {id: "movie", label: "영화"},
  {id: "book", label: "책"},
];

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣-_\s]/g, "")
    .replace(/\s+/g, "-");
}

export default function Editor() {
  const [ title, setTitle ] = useState<string>("");
  const [ slug, setSlug ] = useState<string>("");
  const [ locale, setLocale ] = useState<Locales>("ko");
  const [ categoryId, setCategoryId ] = useState<string>(categoryOptions[0].id);
  const [ brief, setBrief ] = useState<string>("");
  const [ thumbnail, setThumbnail ] = useState<string>("");
  const [ tags, setTags ] = useState<string[]>([]);
  const [ tag, setTag ] = useState<string>("");
  const [ isPublishing, setIsPublishing ] = useState<boolean>(false);
  const [ statusMessage, setStatusMessage ] = useState<string>("");
  const [ errorMessage, setErrorMessage ] = useState<string>("");
  const editorRef = useRef<EditorUI>(null);

  const canPublish = useMemo(()=>{
    return Boolean(title.trim() && slug.trim() && categoryId && locale && !isPublishing);
  }, [categoryId, isPublishing, locale, slug, title]);

  const addTag = () => {
    const nextTag = tag.trim();
    if (!nextTag || tags.includes(nextTag)) return;

    setTags((prevTags)=>[...prevTags, nextTag]);
    setTag("");
  }

  const handlePublish = async (e: FormEvent) => {
    e.preventDefault();

    const content = editorRef.current?.getInstance().getMarkdown() ?? "";

    setStatusMessage("");
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("제목을 입력하세요.");
      return;
    }

    if (!slug.trim()) {
      setErrorMessage("슬러그를 입력하세요.");
      return;
    }

    if (!content.trim()) {
      setErrorMessage("본문을 입력하세요.");
      return;
    }

    const payload: PostPublishRequest = {
      title: title.trim(),
      slug: slug.trim(),
      locale,
      categoryId,
      brief: brief.trim() || undefined,
      thumbnail: thumbnail.trim() || undefined,
      tags,
      content,
    };

    setIsPublishing(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as PostPublishResponse | ApiErrorResponse;

      if (!response.ok) {
        throw new Error("message" in data ? data.message : "포스트 발행에 실패했습니다.");
      }

      setStatusMessage(`발행 완료: ${(data as PostPublishResponse).slug}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "포스트 발행에 실패했습니다.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <form className="min-h-screen bg-slate-50 px-4 py-4 text-slate-900" onSubmit={handlePublish}>
      {/* 포스트 발행 및 액션 바 */}
      <div className={`mb-3 flex items-center justify-between gap-3`}>
        <div className="min-h-6 text-sm">
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}
          {statusMessage && <p className="text-green-700">{statusMessage}</p>}
        </div>
        <Button type="submit" disabled={!canPublish}>
          {isPublishing ? "발행 중" : "발행"}
        </Button>
      </div>
      {/* 포스트 제목 입력 부분 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <input 
          className={`
            w-full text-4xl p-2 border border-gray-300 rounded-lg outline-none
          `} 
          placeholder="제목을 입력하세요."
          onChange={(e)=>{
            const nextTitle = e.target.value;
            setTitle(nextTitle);
            if (!slug) {
              setSlug(normalizeSlug(nextTitle));
            }
          }}
          value={title}
        />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Slug
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base font-normal outline-none focus:border-green-500"
              placeholder="my-post"
              value={slug}
              onChange={(e)=> setSlug(normalizeSlug(e.target.value))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Locale
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base font-normal outline-none focus:border-green-500"
              value={locale}
              onChange={(e)=> setLocale(e.target.value as Locales)}
            >
              {locales.map((localeOption)=>(
                <option value={localeOption} key={localeOption}>{localeOption}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Category
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base font-normal outline-none focus:border-green-500"
              value={categoryId}
              onChange={(e)=> setCategoryId(e.target.value)}
            >
              {categoryOptions.map((category)=>(
                <option value={category.id} key={category.id}>{category.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Thumbnail URL
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base font-normal outline-none focus:border-green-500"
              placeholder="https://..."
              value={thumbnail}
              onChange={(e)=> setThumbnail(e.target.value)}
            />
          </label>
        </div>
        <label className="mt-3 block text-sm font-medium text-slate-700">
          Brief
          <textarea
            className="mt-1 min-h-20 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-base font-normal outline-none focus:border-green-500"
            maxLength={100}
            placeholder="요약을 입력하세요."
            value={brief}
            onChange={(e)=> setBrief(e.target.value)}
          />
        </label>
      </div>
      {/* 포스트 태그 입력 부분 */}
      <div className="flex min-h-[56px] flex-wrap items-center gap-2 py-3">
          <input 
            className={"h-10 rounded-xl bg-gray-200 px-3 outline-none"}
            placeholder="태그를 입력하세요."
            value={tag}
            onChange={(e)=>{
              setTag(e.target.value);
            }}
            onKeyUp={(e)=>{
              if (e.code === "Enter"){
                e.preventDefault();
                addTag();
              }
            }}
          />
          {
            tags.map((tag, idx)=>{
              return (
                <div
                  className={`bg-gray-400 rounded-xl
                    h-10 px-3 text-sm text-white outline-none flex items-center
                    hover:cursor-pointer`
                  }
                  data-idx={idx} 
                  key={`tag_${idx}`}
                  onClick={(e)=>{
                    const idx = Number.parseInt(e.currentTarget.dataset["idx"]!);
                    setTags((before)=> [...before.slice(0, idx), ...before.slice(idx + 1)])
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    className={`ml-2`}
                  >X</button>
                </div>
              )
            })
          }
      </div>
      {/* 에디터, 포스트 내용 입력 부분 */}
      <EditorUI
        previewStyle="vertical"
        height="70vh"
        initialEditType="markdown"
        ref={editorRef}
      />
    </form>
  )
}
