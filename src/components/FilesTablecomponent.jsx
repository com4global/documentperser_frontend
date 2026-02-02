import React from 'react';
import { formatFileSize, formatDate } from '../utils/helpers';
import '../Styles/AdminDashboard.css';

const FilesTableComponent = ({ files, processing, onProcess }) => {
  if (files.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <div className="empty-title">No files uploaded yet</div>
        <div className="empty-text">Start by uploading your first document or media file</div>
      </div>
    );
  }

  return (
    <div className="files-table-container">
      <table className="files-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Type</th>
            <th>Size</th>
            <th>Uploaded</th>
            <th>Status</th>
            <th>Chunks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="file-row">
              <td className="file-name-cell">
                <span className="file-icon">📄</span>
                <span className="file-name-text">{file.file_name}</span>
              </td>
              <td>
                <span className="type-badge">{file.file_type.toUpperCase()}</span>
              </td>
              <td className="file-size-cell">{formatFileSize(file.file_size)}</td>
              <td className="file-date-cell">{formatDate(file.uploaded_at)}</td>
              <td>
                {file.status === 'completed' ? (
                  <span className="status-badge status-completed">
                    <span className="status-icon">✓</span>
                    Vector DB Ready
                  </span>
                ) : (
                  <span className="status-badge status-pending">
                    <span className="status-icon">⏳</span>
                    Pending
                  </span>
                )}
              </td>
              <td className="chunks-cell">
                {file.chunks_created > 0 ? (
                  <span className="chunks-badge">{file.chunks_created}</span>
                ) : (
                  <span className="chunks-empty">—</span>
                )}
              </td>
              <td>
                {file.status !== 'completed' ? (
                  <button
                    className={`process-btn ${processing === file.file_name ? 'processing' : ''}`}
                    onClick={() => onProcess(file.file_name)}
                    disabled={processing === file.file_name}
                  >
                    {processing === file.file_name ? (
                      <>
                        <span className="spinner"></span>
                        Processing
                      </>
                    ) : (
                      <>⚙️ Process</>
                    )}
                  </button>
                ) : (
                  <span className="completed-label">✓ Done</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FilesTableComponent;