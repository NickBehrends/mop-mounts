import { Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './routes/HomePage'
import ExpansionPage from './routes/ExpansionPage'
import MountPage from './routes/MountPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/expansion/:name" element={<ExpansionPage />} />
      <Route path="/mount/:id" element={<MountPage />} />
    </Routes>
  )
}

export default App
