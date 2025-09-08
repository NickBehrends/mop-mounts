import { useState } from 'react'
import type { Mount } from '../../schemas/types'
import MountForm from './components/MountForm'

function AdminApp() {
  const [mounts, setMounts] = useState<Mount[]>([])
  const [selectedMount, setSelectedMount] = useState<Mount | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editingMount, setEditingMount] = useState<Mount | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const text = await file.text()
      const data: Mount[] = JSON.parse(text)
      setMounts(data)
    } catch (error) {
      console.error('Failed to load file:', error)
      alert('Failed to load file. Please check the format.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveMount = (mountData: Mount) => {
    if (editingMount) {
      // Update existing mount
      setMounts(prev => prev.map(m => m.id === editingMount.id ? mountData : m))
    } else {
      // Add new mount
      setMounts(prev => [...prev, mountData])
    }
    setEditingMount(null)
    setShowNewForm(false)
  }

  const handleCancelEdit = () => {
    setEditingMount(null)
    setShowNewForm(false)
  }

  const handleExport = () => {
    const sortedMounts = [...mounts].sort((a, b) => {
      const expCompare = a.expansion.localeCompare(b.expansion)
      return expCompare !== 0 ? expCompare : a.name.localeCompare(b.name)
    })

    const blob = new Blob([JSON.stringify(sortedMounts, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mounts.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header>
        <h1>MoP Mounts Admin</h1>
        <p>Local mount dataset editor - Never deployed to production</p>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept=".json"
          onChange={handleFileImport}
          disabled={isLoading}
        />
        <button
          onClick={handleExport}
          disabled={mounts.length === 0}
          style={{ marginLeft: '10px' }}
        >
          Export JSON
        </button>
        <button
          onClick={() => setShowNewForm(true)}
          style={{ marginLeft: '10px', background: '#2196F3', color: 'white' }}
        >
          New Mount
        </button>
      </div>

      {isLoading && <p>Loading...</p>}

      {mounts.length > 0 && (
        <div>
          <h2>Loaded {mounts.length} mounts</h2>
          <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #ccc' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Expansion</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Source</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mounts.map((mount) => (
                  <tr
                    key={mount.id}
                    style={{
                      background: selectedMount?.id === mount.id ? '#e3f2fd' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '8px' }}>{mount.id}</td>
                    <td style={{ padding: '8px' }}>{mount.name}</td>
                    <td style={{ padding: '8px' }}>{mount.expansion}</td>
                    <td style={{ padding: '8px' }}>{mount.category}</td>
                    <td style={{ padding: '8px' }}>{mount.sourceType}</td>
                    <td style={{ padding: '8px' }}>
                      <button
                        onClick={() => setSelectedMount(mount)}
                        style={{ marginRight: '5px', fontSize: '12px' }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => setEditingMount(mount)}
                        style={{ fontSize: '12px', background: '#FF9800', color: 'white' }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(editingMount || showNewForm) && (
        <div style={{ marginTop: '20px' }}>
          <MountForm
            mount={editingMount || undefined}
            onSave={handleSaveMount}
            onCancel={handleCancelEdit}
            existingIds={mounts.map(m => m.id)}
          />
        </div>
      )}

      {selectedMount && !editingMount && !showNewForm && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
          <h3>Selected Mount: {selectedMount.name}</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(selectedMount, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default AdminApp