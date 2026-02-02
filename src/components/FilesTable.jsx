import React, { useState } from 'react';
import { formatFileSize, formatDate, truncateText, getFileCategory } from '../utils/helpers';
import ConfirmDialog from './ConfirmDialog';
//import '../Styles/AdminDashboard.css';
import '../Styles/FilesTable.css';

const FilesTable = ({ files, processing, onProcess, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterType, setFilterType] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, file: null });

  if (files.length === 0) {
    return (
      <div className="empty-state fade-in">
        <div className="empty-icon bounce">📭</div>
        <div className="empty-title">No files uploaded yet</div>
        <div className="empty-text">Start by uploading your first document or media file</div>
        <div className="empty-hint">
          💡 Supported formats: PDF, DOCX, XLSX, MP4, MP3, Images, and more
        </div>
      </div>
    );
  }

  // Filter and sort logic
  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || file.file_type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      if (sortBy === 'name') return a.file_name.localeCompare(b.file_name);
      if (sortBy === 'size') return b.file_size - a.file_size;
      return 0;
    });

  const fileTypes = ['all', ...new Set(files.map(f => f.file_type))];

  const handleDeleteClick = (file) => {
    setDeleteConfirm({ isOpen: true, file });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.file && onDelete) {
      onDelete(deleteConfirm.file.file_name);
    }
    setDeleteConfirm({ isOpen: false, file: null });
  };

  return (
    <div className="files-table-wrapper">
      {/* Table Controls */}
      <div className="table-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>

        <div className="table-filters">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            {fileTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.toUpperCase()}
              </option>
            ))}
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredFiles.length} of {files.length} files
      </div>

      {/* Files Table */}
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
            {filteredFiles.map((file, index) => {
              const category = getFileCategory(file.file_type);
              return (
                <tr key={file.id} className="file-row fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                  <td className="file-name-cell">
                    <div className="file-info">
                      <span className={`file-icon file-icon-${category}`}>
                        {category === 'document' && '📄'}
                        {category === 'video' && '🎥'}
                        {category === 'audio' && '🎵'}
                        {category === 'image' && '🖼️'}
                      </span>
                      <div className="file-details">
                        <div className="file-name-text" title={file.file_name}>
                          {truncateText(file.file_name, 40)}
                        </div>
                        <div className="file-meta">ID: {file.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge type-${category}`}>
                      {file.file_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="file-size-cell">{formatFileSize(file.file_size)}</td>
                  <td className="file-date-cell" title={new Date(file.uploaded_at).toLocaleString()}>
                    {formatDate(file.uploaded_at)}
                  </td>
                  <td>
                    {file.status === 'completed' ? (
                      <span className="status-badge status-completed pulse-success">
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
                      <span className="chunks-badge">
                        <span className="chunks-icon">📦</span>
                        {file.chunks_created}
                      </span>
                    ) : (
                      <span className="chunks-empty">—</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      {file.status !== 'completed' ? (
                        <button
                          className={`process-btn ${processing === file.file_name ? 'processing' : ''}`}
                          onClick={() => onProcess(file.file_name)}
                          disabled={processing === file.file_name}
                          title="Process this file"
                        >
                          {processing === file.file_name ? (
                            <>
                              <span className="btn-spinner"></span>
                              Processing
                            </>
                          ) : (
                            <>
                              <span className="btn-icon">⚙️</span>
                              Process
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="completed-label">
                          <span className="checkmark">✓</span>
                          Completed
                        </span>
                      )}
                      {onDelete && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteClick(file)}
                          title="Delete this file"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete File"
        message={`Are you sure you want to delete "${deleteConfirm.file?.file_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, file: null })}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default FilesTable;




// import React from 'react';
// import '../AdminDashboard.css';
// import { formatFileSize, formatDate } from '../utils/helpers';

// const FilesTable = ({ files, processing, onProcess }) => {
//   if (files.length === 0) {
//     return (
//       <div className="empty-state">
//         <div className="empty-icon">📭</div>
//         <div className="empty-title">No files uploaded yet</div>
//         <div className="empty-text">Start by uploading your first document or media file</div>
//       </div>
//     );
//   }

//   return (
//     <div className="files-table-container">
//       <table className="files-table">
//         <thead>
//           <tr>
//             <th>File Name</th>
//             <th>Type</th>
//             <th>Size</th>
//             <th>Uploaded</th>
//             <th>Status</th>
//             <th>Chunks</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {files.map(file => (
//             <tr key={file.id} className="file-row">
//               <td className="file-name-cell">
//                 <span className="file-icon">📄</span>
//                 <span>{file.file_name}</span>
//               </td>
//               <td>
//                 <span className="type-badge">{file.file_type.toUpperCase()}</span>
//               </td>
//               <td>{formatFileSize(file.file_size)}</td>
//               <td>{formatDate(file.uploaded_at)}</td>
//               <td>
//                 {file.status === 'completed' ? (
//                   <span className="status-badge status-completed">✓ Vector DB Ready</span>
//                 ) : (
//                   <span className="status-badge status-pending">⏳ Pending</span>
//                 )}
//               </td>
//               <td>
//                 {file.chunks_created > 0 ? (
//                   <span className="chunks-badge">{file.chunks_created}</span>
//                 ) : '—'}
//               </td>
//               <td>
//                 {file.status !== 'completed' ? (
//                   <button onClick={() => onProcess(file.file_name)} disabled={processing === file.file_name} className="process-btn">
//                     {processing === file.file_name ? '⏳ Processing' : '⚙️ Process'}
//                   </button>
//                 ) : (
//                   <span className="completed-label">✓ Done</span>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default FilesTable;