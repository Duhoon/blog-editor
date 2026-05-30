import Editor from "./components/Editor"
import Sidebar from "./components/Sidebar"

function App() {
  return (
    <main className="flex min-h-screen bg-slate-50">
      <Sidebar/>
      <Editor/>
    </main>
  )
}

export default App
