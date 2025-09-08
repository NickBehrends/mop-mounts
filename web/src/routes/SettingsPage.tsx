import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Mount } from '../lib/types';
import { exportCollection, importCollection } from '../lib/storage';

interface SettingsPageProps {
  mounts?: Mount[];
}

export default function SettingsPage({ mounts = [] }: SettingsPageProps) {
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    droppedIds?: string[];
  }>({ type: null, message: '' });

  const handleExport = () => {
    try {
      exportCollection();
      setImportStatus({
        type: 'success',
        message: 'Collection exported successfully!'
      });
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Failed to export collection: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validMountIds = mounts.map(mount => mount.id);
    const result = await importCollection(file, validMountIds);

    if (result.success) {
      let message = 'Collection imported successfully!';
      if (result.droppedIds && result.droppedIds.length > 0) {
        message += ` Note: ${result.droppedIds.length} unknown mount(s) were dropped.`;
      }
      setImportStatus({
        type: 'success',
        message,
        droppedIds: result.droppedIds
      });
    } else {
      setImportStatus({
        type: 'error',
        message: result.error || 'Import failed'
      });
    }

    // Reset file input
    event.target.value = '';
  };

  const clearStatus = () => {
    setImportStatus({ type: null, message: '' });
  };

  return (
    <div className="settings-page">
      <header>
        <Link to="/">← Back to Home</Link>
        <h1>Settings</h1>
      </header>

      <main>
        <section className="import-export-section">
          <h2>Collection Management</h2>
          <p>Export your owned mount collection or import a collection from another user.</p>

          <div className="action-group">
            <h3>Export Collection</h3>
            <p>Download your current owned mounts as a JSON file.</p>
            <button 
              onClick={handleExport}
              className="export-button"
            >
              📥 Export Collection
            </button>
          </div>

          <div className="action-group">
            <h3>Import Collection</h3>
            <p>Import a collection file. This will replace your current owned mounts.</p>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="import-input"
              id="import-file"
            />
            <label htmlFor="import-file" className="import-button">
              📤 Choose Collection File
            </label>
          </div>

          {importStatus.type && (
            <div className={`status-message ${importStatus.type}`}>
              <p>{importStatus.message}</p>
              {importStatus.droppedIds && importStatus.droppedIds.length > 0 && (
                <details>
                  <summary>View dropped mount IDs ({importStatus.droppedIds.length})</summary>
                  <ul>
                    {importStatus.droppedIds.map(id => (
                      <li key={id}>{id}</li>
                    ))}
                  </ul>
                </details>
              )}
              <button onClick={clearStatus} className="close-status">×</button>
            </div>
          )}
        </section>

        <section className="help-section">
          <h2>About Collection Files</h2>
          <p>Collection files contain:</p>
          <ul>
            <li>Your owned mount IDs</li>
            <li>Export timestamp</li>
            <li>Dataset version for compatibility</li>
          </ul>
          <p>When importing, unknown mount IDs (not in the current dataset) are automatically dropped with a warning.</p>
        </section>
      </main>
    </div>
  );
}