import { Editor as EditorUI } from "@toast-ui/react-editor"
import "@toast-ui/editor/toastui-editor.css";

import { useState, useRef, useEffect } from "react";

export default function Editor() {
  const [ content, setContent ] = useState<string>("");
  const editorRef = useRef<EditorUI>(null);

  useEffect(()=>{
    console.log(content);
  }, [content])

  return (
    <EditorUI
      previewStyle="vertical"
      height="600px"
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
  )
}