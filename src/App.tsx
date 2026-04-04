import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout.tsx'
import Landing from './pages/Landing.tsx'
import Dashboard from './pages/App.tsx'
import PackView from './pages/PackView.tsx'
import Editor from './pages/Editor.tsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path='app' element={<Dashboard />} />
          <Route path="pack/:packId" element={<PackView />} />
          <Route path="editor" element={<Editor />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
