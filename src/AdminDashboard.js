import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [supportedFormats, setSupportedFormats] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('.pdf');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'processing'

  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchFiles();
    fetchStats();
    fetchSupportedFormats();
    
    // Refresh files every 10 seconds
    const interval = setInterval(() => {
      fetchFiles();
      fetchStats();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/files`);
      setFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/files/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSupportedFormats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/supported-formats`);
      console.log('API Response:', response.data);
      setSupportedFormats(response.data.supported_formats);
      console.log('Supported formats set to:', response.data.supported_formats);
    } catch (error) {
      console.error('Error fetching formats:', error);
      // Set default formats as fallback
      setSupportedFormats(['.pdf', '.xlsx', '.xls', '.csv', '.txt', '.docx', '.doc', '.xml']);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      console.log('File selected:', file.name);
      console.log('File extension:', ext);
      console.log('Supported formats:', supportedFormats);
      console.log('Is supported:', supportedFormats.includes(ext));
      
      if (supportedFormats.includes(ext)) {
        setSelectedFile(file);
        setSelectedFormat(ext);
        setMessage('');
      } else {
        setMessage(`❌ File type ${ext} not supported. Supported: ${supportedFormats.join(', ')}`);
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('❌ Please select a file');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('');
    setMessageType('processing');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(`✅ ${response.data.message}`);
      setMessageType('success');
      setSelectedFile(null);
      fetchFiles();
      fetchStats();

      // Reset file input
      document.getElementById('fileInput').value = '';
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.detail || error.message}`);
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const handleProcessFile = async (filename) => {
    setProcessing(filename);
    setMessage('');
    setMessageType('processing');

    try {
      const response = await axios.post(`${API_URL}/api/process-file`, null, {
        params: { filename },
      });

      setMessage(`✅ ${response.data.message}`);
      setSuccessMessage(`🎉 ${filename} successfully processed and stored in vector database!`);
      setMessageType('success');
      fetchFiles();
      fetchStats();
      
      // Auto-clear success message after 4 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setMessage('');
      }, 4000);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.detail || error.message}`);
      setMessageType('error');
      
      // Auto-clear error message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setProcessing(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>📊 Admin Dashboard</h1>
        <p>Manage and process files for HR Assistant RAG</p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="success-notification animated-pop-in">
          <div className="success-content">
            <span className="success-icon">✨</span>
            <span className="success-text">{successMessage}</span>
          </div>
          <div className="success-progress"></div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`message-box message-${messageType}`}>
          <span className="message-icon">
            {messageType === 'success' && '✅'}
            {messageType === 'error' && '❌'}
            {messageType === 'processing' && '⏳'}
          </span>
          <span className="message-text">{message}</span>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon">📁</div>
            <div className="stat-number">{stats.total_files}</div>
            <div className="stat-label">Total Files</div>
          </div>
          <div className="stat-card stat-processed">
            <div className="stat-icon">✅</div>
            <div className="stat-number">{stats.processed_files}</div>
            <div className="stat-label">Processed</div>
          </div>
          <div className="stat-card stat-chunks">
            <div className="stat-icon">📦</div>
            <div className="stat-number">{stats.total_chunks}</div>
            <div className="stat-label">Total Chunks</div>
          </div>
          <div className="stat-card stat-size">
            <div className="stat-icon">💾</div>
            <div className="stat-number">{formatFileSize(stats.total_size_bytes)}</div>
            <div className="stat-label">Total Size</div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="upload-section">
        <h2>📤 Upload New File</h2>
        <div className="upload-area">
          <div className="format-selector">
            <label>Select File Format:</label>
            <div className="format-buttons">
              {supportedFormats.map((format) => (
                <button
                  key={format}
                  className={`format-btn ${selectedFormat === format ? 'active' : ''}`}
                  onClick={() => setSelectedFormat(format)}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div className="file-input-wrapper">
            <input
              id="fileInput"
              type="file"
              onChange={handleFileSelect}
              accept={supportedFormats.join(',')}
              className="file-input"
            />
            <label htmlFor="fileInput" className="file-input-label">
              {selectedFile ? `📁 ${selectedFile.name}` : '📎 Click to select file or drag & drop'}
            </label>
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="upload-btn"
          >
            {uploading ? '⏳ Uploading...' : '✅ Upload File'}
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="files-section">
        <h2>📑 Uploaded Files</h2>
        {files.length === 0 ? (
          <div className="no-files">
            <p>No files uploaded yet. Start by uploading a file above!</p>
          </div>
        ) : (
          <div className="files-table-wrapper">
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
                  <tr key={file.id} className={`file-row ${file.status}`}>
                    <td className="file-name">
                      <span className="file-icon">📄</span>
                      <span className="file-name-text">{file.file_name}</span>
                    </td>
                    <td className="file-type">
                      <span className="type-badge">{file.file_type.toUpperCase()}</span>
                    </td>
                    <td className="file-size">{formatFileSize(file.file_size)}</td>
                    <td className="file-date">{formatDate(file.uploaded_at)}</td>
                    <td className="file-status">
                      {file.status === 'completed' ? (
                        <span className="status-badge completed animated-checkmark">
                          <span className="checkmark-icon">✅</span>
                          <span className="status-text">Vector DB Ready</span>
                        </span>
                      ) : (
                        <span className="status-badge uploaded">
                          <span className="upload-icon">⏳</span>
                          <span className="status-text">Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="file-chunks">
                      {file.chunks_created > 0 ? (
                        <span className="chunks-badge">{file.chunks_created} chunks</span>
                      ) : (
                        <span className="chunks-empty">—</span>
                      )}
                    </td>
                    <td className="file-actions">
                      {file.status !== 'completed' ? (
                        <button
                          onClick={() => handleProcessFile(file.file_name)}
                          disabled={processing === file.file_name}
                          className={`process-btn ${processing === file.file_name ? 'processing' : ''}`}
                        >
                          {processing === file.file_name ? (
                            <>
                              <span className="spinner"></span>
                              Processing...
                            </>
                          ) : (
                            <>
                              <span className="process-icon">⚙️</span>
                              Process
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="completed-badge success-pulse">
                          <span className="checkmark">✓</span>
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File Type Distribution */}
      {stats && Object.keys(stats.file_types_distribution).length > 0 && (
        <div className="distribution-section">
          <h2>📊 File Type Distribution</h2>
          <div className="distribution-grid">
            {Object.entries(stats.file_types_distribution).map(([type, count]) => (
              <div key={type} className="distribution-card">
                <div className="dist-type">{type.toUpperCase()}</div>
                <div className="dist-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
