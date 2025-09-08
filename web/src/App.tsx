import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import type { Mount } from './lib/types'
import { loadMounts } from './lib/dataset'
import './App.css'
import HomePage from './routes/HomePage'
import ExpansionPage from './routes/ExpansionPage'
import MountPage from './routes/MountPage'
import SettingsPage from './routes/SettingsPage'

function App() {
  const [mounts, setMounts] = useState<Mount[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const mountsData = await loadMounts();
        setMounts(mountsData);
      } catch (error) {
        console.error('Failed to load mounts in App:', error);
      }
    };
    loadData();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/expansion/:name" element={<ExpansionPage />} />
      <Route path="/mount/:id" element={<MountPage />} />
      <Route path="/settings" element={<SettingsPage mounts={mounts} />} />
    </Routes>
  )
}

export default App
