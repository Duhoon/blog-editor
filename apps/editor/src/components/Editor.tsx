import { Editor as EditorUI } from "@toast-ui/react-editor"
import Button from "./Button";
import "@toast-ui/editor/toastui-editor.css";

import { useState, useRef, useEffect } from "react";

export default function Editor() {
  const [ title, setTitle ] = useState<string>("");
  const [ tags, setTags ] = useState<string[]>([]);
  const [ tag, setTag ] = useState<string>("");
  const [ content, setContent ] = useState<string>("");
  const editorRef = useRef<EditorUI>(null);

  useEffect(()=>{
    console.log(content);
  }, [content])

  return (
    <div className="px-4">
      {/* 포스트 발행 및 액션 바 */}
      <div className={`flex justify-end py-2`}>
        <Button>발행</Button>
      </div>
      {/* 포스트 제목 입력 부분 */}
      <div>
        <input 
          className={`
            w-full text-4xl p-2 border-1 border-gray-300 rounded-lg outline-none
          `} 
          placeholder="제목을 입력하세요."
          onChange={(e)=>{
            setTitle(e.target.value);
          }}
          value={title}
        />
      </div>
      {/* 포스트 태그 입력 부분 */}
      <div className="py-2 flex gap-2 h-[50px]">
          <input 
            className={"bg-gray-200 rounded-xl outline-none px-2"}
            placeholder="태그를 입력하세요."
            value={tag}
            onChange={(e)=>{
              setTag(e.target.value);
            }}
            onKeyUp={(e)=>{
              if (e.code === "Enter" && tag){
                setTags((prevTags)=>[...prevTags, tag]);
                setTag("");
              }
            }}
          />
          {
            tags.map((tag, idx)=>{
              return (
                <div
                  className={`bg-gray-400 rounded-xl
                    h-full px-2 text-sm text-white outline-none flex items-center
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
        height="90vh"
        initialEditType="markdown"
        onLoad={()=>{
          
        }}
        onChange={()=>{
          if (editorRef.current) {
            const editorInstance = editorRef.current.getInstance();
            const currentContent = editorInstance.getMarkdown();
            setContent(currentContent);
          }
        }}
        ref={editorRef}
      />
    </div>
  )
}