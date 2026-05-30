import { useCallback, useState } from "react"
import Editor from "./components/Editor"
import Sidebar from "./components/Sidebar"

function App() {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [newPostVersion, setNewPostVersion] = useState<number>(0);
  const rejectSelectedPost = useCallback(()=> {
    setSelectedPostId(null);
  }, []);
  const createNewPost = useCallback(()=> {
    setSelectedPostId(null);
    setNewPostVersion((version)=> version + 1);
  }, []);

  return (
    <main className="flex min-h-screen bg-slate-50">
      <Sidebar
        selectedPostId={selectedPostId}
        onSelectPost={setSelectedPostId}
        onCreateNewPost={createNewPost}
      />
      <Editor
        selectedPostId={selectedPostId}
        newPostVersion={newPostVersion}
        onRejectSelectedPost={rejectSelectedPost}
      />
    </main>
  )
}

export default App
