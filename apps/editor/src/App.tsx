import { useCallback, useState } from "react"
import Editor from "./components/Editor"
import Sidebar from "./components/Sidebar"

function App() {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const rejectSelectedPost = useCallback(()=> {
    setSelectedPostId(null);
  }, []);

  return (
    <main className="flex min-h-screen bg-slate-50">
      <Sidebar
        selectedPostId={selectedPostId}
        onSelectPost={setSelectedPostId}
      />
      <Editor
        selectedPostId={selectedPostId}
        onRejectSelectedPost={rejectSelectedPost}
      />
    </main>
  )
}

export default App
