import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout.tsx'
import Landing from './pages/Landing.tsx'
import Editor from './pages/Editor.tsx'
import Auth from './pages/Auth.tsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="auth" element={<Auth />} />
          <Route path="editor" element={<Editor />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
