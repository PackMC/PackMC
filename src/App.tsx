import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout.tsx'
import Landing from './pages/Landing.tsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
