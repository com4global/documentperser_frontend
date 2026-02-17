// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { APP_CONFIG, STATUS_TYPES } from '../utils/constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLanguage } from '../contexts/LanguageContext';
import NotificationBar from './NotificationBar';
import StatsGrid from './StatsGrid';
import MultimodalUploader from './MultimodalUploader';
import FilesTable from './FilesTable';
import FileDistribution from './FileDistribution';
import LoadingSpinner from './LoadingSpinner';
import '../Styles/AdminDashboard.css';

export default function AdminDashboard() {
  const { t } = useLanguage();

  // State Management
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [supportedFormats, setSupportedFormats] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  
  // Persist dark mode preference
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);

  // Single fetch that gets both files AND stats from the same /api/files endpoint
  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await apiService.fetchFiles();
      const filesList = Array.isArray(data) ? data : (data?.files || []);
      const statsData = data?.stats || null;
      setFiles(filesList);
      if (statsData) setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, []);

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
  }, []);

  // Initialize data — single fetch + static formats (no network needed)
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        // Formats are static, set them immediately (no API call)
        setSupportedFormats(['.pdf', '.xlsx', '.xls', '.csv', '.txt', '.docx', '.doc', '.xml',
          '.mp4', '.avi', '.mov', '.mp3', '.wav', '.jpg', '.png', '.jpeg']);
        await fetchDashboardData();
      } catch (error) {
        if (!cancelled) showNotification('Failed to initialize dashboard', STATUS_TYPES.ERROR);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    
    // Polling for updates — single call instead of two
    const interval = setInterval(() => {
      if (!uploading && !processing) {
        fetchDashboardData();
      }
    }, APP_CONFIG.REFRESH_INTERVAL);
    
    // Network status monitoring with stable refs for proper cleanup
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchDashboardData, uploading, processing, showNotification]);


  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setNotification({ message: '', type: '' });
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async (type, data, mediaType, onProgress) => {
    setUploading(true);
    showNotification('Processing upload...', STATUS_TYPES.PROCESSING);

    try {
      if (type === 'youtube') {
        await apiService.processYoutube(data);
        showNotification('🎉 YouTube video successfully processed!', STATUS_TYPES.SUCCESS);
      } else {
        await apiService.uploadFile(data, onProgress);
        showNotification('✅ File uploaded successfully!', STATUS_TYPES.SUCCESS);
      }
      
      setSelectedFile(null);
      await fetchDashboardData();
    } catch (error) {
      showNotification(
        `❌ Upload failed: ${error.message}`, 
        STATUS_TYPES.ERROR
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUploadAndProcess = async (type, file, mediaType, onProgress) => {
    if (type !== 'file' && type !== 'media') return;
    setUploading(true);
    showNotification('Uploading...', STATUS_TYPES.PROCESSING);

    try {
      const uploadResult = await apiService.uploadFile(file, onProgress);
      const filename = uploadResult?.file_name ?? uploadResult?.filename ?? uploadResult?.file?.file_name ?? file?.name;
      setSelectedFile(null);
      await fetchDashboardData();
      if (!filename) {
        showNotification('✅ File uploaded. Process it from the list below.', STATUS_TYPES.SUCCESS);
        setUploading(false);
        return;
      }
      showNotification(`Chunking & saving ${filename} to DB...`, STATUS_TYPES.PROCESSING);
      setUploading(false);
      await handleProcessFile(filename);
    } catch (error) {
      showNotification(`❌ Upload failed: ${error.message}`, STATUS_TYPES.ERROR);
      setUploading(false);
    }
  };

  const handleProcessFile = async (filename) => {
    setProcessing(filename);
    showNotification(`Processing ${filename}...`, STATUS_TYPES.PROCESSING);

    try {
      await apiService.processFile(filename);
      showNotification(`🎉 ${filename} processed successfully!`, STATUS_TYPES.SUCCESS);
      await fetchDashboardData();
    } catch (error) {
      showNotification(`❌ Processing failed: ${error.message}`, STATUS_TYPES.ERROR);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteFile = async (filename) => {
    try {
      await apiService.deleteFile(filename);
      showNotification(`🗑️ ${filename} deleted successfully`, STATUS_TYPES.SUCCESS);
      await fetchDashboardData();
    } catch (error) {
      showNotification(`❌ Delete failed: ${error.message}`, STATUS_TYPES.ERROR);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="large" message="Loading Dashboard..." />
      </div>
    );
  }

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark-mode' : ''}`}>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="offline-banner">
          <span className="offline-icon">📡</span>
          {t('offlineBanner')}
        </div>
      )}

      {/* Notification System */}
      <NotificationBar 
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-branding">
            <div className="brand-logo">
              <span className="logo-icon">🚀</span>
            </div>
            <div className="brand-text">
              <h1 className="dashboard-title">{t('adminDashboardTitle')}</h1>
              <p className="dashboard-subtitle">{t('adminDashboardSubtitle')}</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="theme-toggle" 
              onClick={toggleDarkMode}
              title={darkMode ? t('switchToLight') : t('switchToDark')}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <div className="status-indicator">
              <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
              <span className="status-text">{isOnline ? t('online') : t('offline')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Statistics Section */}
        <StatsGrid stats={stats} loading={false} />

        {/* Upload Section */}
        <section className="content-section upload-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">📤</span>
              {t('uploadContent')}
            </h2>
            <div className="section-subtitle">
              {t('uploadContentDesc')}
            </div>
          </div>
          <MultimodalUploader
            onUpload={handleUpload}
            onUploadAndProcess={handleUploadAndProcess}
            uploading={uploading}
            processing={processing}
            supportedFormats={supportedFormats}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
          />
        </section>

        {/* Files Table Section */}
        <section className="content-section files-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">📑</span>
              {t('uploadedFiles')}
            </h2>
            <div className="section-subtitle">
              {t('uploadedFilesDesc')}
            </div>
          </div>
          <FilesTable
            files={files}
            processing={processing}
            onProcess={handleProcessFile}
            onDelete={handleDeleteFile}
          />
        </section>

        {/* Distribution Analytics */}
        {stats && stats.file_types_distribution && (
          <FileDistribution distribution={stats.file_types_distribution} />
        )}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-info">
            <span className="footer-text">
              {t('dashboardFooter')}
            </span>
            <span className="footer-divider">•</span>
            <span className="footer-text">
              {t('enterpriseEdition')}
            </span>
          </div>
          <div className="footer-links">
            <a href="#docs" className="footer-link">{t('documentation')}</a>
            <a href="#support" className="footer-link">{t('support')}</a>
            <a href="#api" className="footer-link">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// import React, { useState, useEffect } from 'react';
// import { apiService } from '../services/api';
// import NotificationBar from './NotificationBar';
// import StatsGrid from './StatsGrid';
// import MultimodalUploader from './MultimodalUploader';
// import FilesTable from './FilesTable';
// import FileDistribution from './FileDistribution';
// import '../AdminDashboard.css';

// export default function AdminDashboard() {
//   const [files, setFiles] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [supportedFormats, setSupportedFormats] = useState([]);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [processing, setProcessing] = useState(null);
//   const [notification, setNotification] = useState({ message: '', type: '' });

//   useEffect(() => {
//     fetchFiles();
//     fetchStats();
//     fetchSupportedFormats();
//     const interval = setInterval(() => { fetchFiles(); fetchStats(); }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchFiles = async () => {
//     try {
//       const data = await apiService.fetchFiles();
//       setFiles(data.files);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const data = await apiService.fetchStats();
//       setStats(data);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const fetchSupportedFormats = async () => {
//     try {
//       const formats = await apiService.fetchSupportedFormats();
//       setSupportedFormats(formats);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//       setNotification({ message: '', type: '' });
//     }
//   };

//  const refreshData = async () => {
//   try {
//     const data = await apiService.getFiles(); // Uses the new name in api.js
//     setFiles(data.files || []);
//     setStats(data.stats || null);
//   } catch (err) {
//     console.error("Failed to refresh dashboard data:", err);
//   }
// };
//   useEffect(() => {
//     refreshData();
//   }, []);

//   const handleUpload = async (type, data, mediaType = '') => {
//   setUploading(true);
//   try {
//     if (type === 'file' || (type === 'media' && mediaType !== 'youtube')) {
//       // 1. Upload the physical file first
//       const uploadRes = await apiService.uploadFile(data); 
//       const fileName = uploadRes.file.file_name;
//       await fetchFiles(); 
//       setNotification({ message: '🧠 Transcribing video... (This may take a minute)', type: 'processing' });

//       // 2. Decide which processing endpoint to call
//       if (mediaType === 'video' || fileName.toLowerCase().endsWith('.mp4') || fileName.toLowerCase().endsWith('.mov')) {
//         await apiService.processVideoFile(fileName);
//       } else {
//         await apiService.processFile(fileName);
//       }
      
//       setNotification({ message: 'Media processed successfully!', type: 'success' });
//     } else if (type === 'youtube') {
//       await apiService.processYoutube(data);
//       setNotification({ message: 'YouTube video indexed!', type: 'success' });
//     }
//     refreshData();
//   } catch (err) {
//     console.error("Upload/Process Error:", err);
//     setNotification({ message: 'Error: ' + err.message, type: 'error' });
//   } finally {
//     setUploading(false);
//   }
// };

//   const handleUpload = async (type, data) => {
//     setUploading(true);
//     setNotification({ message: 'Processing upload...', type: 'processing' });

//     try {
//       if (type === 'youtube') {
//         await apiService.processYoutube(data);
//         setNotification({ message: '🎉 Video processed!', type: 'success' });
//       } else {
//         await apiService.uploadFile(data);
//         setNotification({ message: '✅ File uploaded!', type: 'success' });
//       }
//       setSelectedFile(null);
//       fetchFiles();
//       fetchStats();
//     } catch (error) {
//       setNotification({ message: `❌ Error: ${error.message}`, type: 'error' });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleProcessFile = async (filename) => {
//     setProcessing(filename);
//     try {
//       await apiService.processFile(filename);
//       setNotification({ message: `🎉 ${filename} processed!`, type: 'success' });
//       fetchFiles();
//       fetchStats();
//     } catch (error) {
//       setNotification({ message: `❌ Error: ${error.message}`, type: 'error' });
//     } finally {
//       setProcessing(null);
//     }
//   };

//   return (
//     <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea,#764ba2)',padding:'2rem'}}>
//       <NotificationBar message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
      
//       <header style={{background:'white',borderRadius:'20px',padding:'2rem',marginBottom:'2rem',boxShadow:'0 10px 40px rgba(0,0,0,0.1)'}}>
//         <h1 style={{fontSize:'2.5rem',fontWeight:800,background:'linear-gradient(135deg,#667eea,#764ba2)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:0}}>
//           Admin Dashboard
//         </h1>
//         <p style={{color:'#6b7280',marginTop:'0.5rem',fontSize:'1.1rem'}}>Multimodal RAG Content Management System</p>
//       </header>

//       <main style={{display:'flex',flexDirection:'column',gap:'2rem'}}>
//         <StatsGrid stats={stats} />
        
//         <section style={{background:'white',borderRadius:'20px',padding:'2rem',boxShadow:'0 10px 40px rgba(0,0,0,0.1)'}}>
//           <h2 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'1.5rem'}}>📤 Upload Content</h2>
//           <MultimodalUploader onUpload={handleUpload} uploading={uploading} supportedFormats={supportedFormats} selectedFile={selectedFile} onFileSelect={handleFileSelect} />
//         </section>

//         <section style={{background:'white',borderRadius:'20px',padding:'2rem',boxShadow:'0 10px 40px rgba(0,0,0,0.1)'}}>
//           <h2 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'1.5rem'}}>📑 Uploaded Files</h2>
//           <FilesTable files={files} processing={processing} onProcess={handleProcessFile} />
//         </section>

//         {stats && <FileDistribution distribution={stats.file_types_distribution} />}
//       </main>
//     </div>
//   );
// }