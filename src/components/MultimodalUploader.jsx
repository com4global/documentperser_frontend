import React, { useState, useRef } from 'react';
import { MEDIA_TYPES, APP_CONFIG } from '../utils/constants';
import { isValidYouTubeUrl, validateFileSize } from '../utils/helpers';
import '../Styles/AdminDashboard.css';

const MultimodalUploader = ({ onUpload, onUploadAndProcess, uploading, processing, supportedFormats, selectedFile, onFileSelect }) => {
  const [activeTab, setActiveTab] = useState('document');
  const [urlInput, setUrlInput] = useState('');
  const [mediaType, setMediaType] = useState('youtube');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [urlError, setUrlError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileValidation(file);
    }
  };

  const handleFileValidation = (file) => {
    // Check file size
    if (!validateFileSize(file, APP_CONFIG.MAX_FILE_SIZE)) {
      alert(`File size exceeds maximum limit of ${APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    // Create synthetic event for onFileSelect
    const syntheticEvent = {
      target: { files: [file] }
    };
    onFileSelect(syntheticEvent);
  };

  const handleMediaUpload = () => {
    if (activeTab === 'document') {
      onUpload('file', selectedFile, null, setUploadProgress);
      setUploadProgress(0);
    } else if (mediaType === 'youtube') {
      if (!isValidYouTubeUrl(urlInput)) {
        setUrlError('Please enter a valid YouTube URL');
        return;
      }
      setUrlError('');
      onUpload('youtube', urlInput);
      setUrlInput('');
    } else {
      onUpload('media', selectedFile, mediaType, setUploadProgress);
      setUploadProgress(0);
    }
  };

  const handleUploadAndProcessClick = () => {
    if (activeTab === 'document') {
      onUploadAndProcess?.('file', selectedFile, null, setUploadProgress);
      setUploadProgress(0);
    } else if (mediaType !== 'youtube') {
      onUploadAndProcess?.('media', selectedFile, mediaType, setUploadProgress);
      setUploadProgress(0);
    }
  };

  const canUploadAndProcess = (activeTab === 'document' && selectedFile) || (activeTab === 'media' && mediaType !== 'youtube' && selectedFile);
  const isBusy = uploading || !!processing;

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="multimodal-uploader">
      {/* Tab Navigation */}
      <div className="upload-tabs">
        <button 
          className={`upload-tab ${activeTab === 'document' ? 'active' : ''}`}
          onClick={() => { setActiveTab('document'); resetFileInput(); }}
        >
          <span className="tab-icon">📄</span>
          <span className="tab-label">Documents</span>
          <span className="tab-badge">{supportedFormats.length} formats</span>
        </button>
        <button 
          className={`upload-tab ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => { setActiveTab('media'); resetFileInput(); }}
        >
          <span className="tab-icon">🎬</span>
          <span className="tab-label">Media</span>
          <span className="tab-badge">4 types</span>
        </button>
      </div>

      {/* Upload Content */}
      <div className="upload-content">
        {activeTab === 'document' ? (
          <div className="document-upload fade-in">
            {/* Format Chips */}
            <div className="format-chips-container">
              <label className="format-label">Supported Formats:</label>
              <div className="format-chips">
                {supportedFormats.map(format => (
                  <span key={format} className="format-chip">{format}</span>
                ))}
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div 
              className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                id="docFile"
                type="file"
                onChange={onFileSelect}
                accept={supportedFormats.join(',')}
                style={{display: 'none'}}
              />
              <label htmlFor="docFile" className="file-drop-label">
                {selectedFile ? (
                  <>
                    <div className="file-preview">
                      <div className="file-preview-icon">📄</div>
                      <div className="file-preview-info">
                        <div className="file-preview-name">{selectedFile.name}</div>
                        <div className="file-preview-size">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                      <button 
                        type="button"
                        className="file-preview-remove"
                        onClick={(e) => {
                          e.preventDefault();
                          onFileSelect({ target: { files: [] } });
                          resetFileInput();
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="drop-icon pulse">📎</div>
                    <div className="drop-text">Click to browse or drag & drop</div>
                    <div className="drop-hint">Maximum file size: 100MB</div>
                  </>
                )}
              </label>
            </div>

            {/* Upload Progress */}
            {uploading && uploadProgress > 0 && (
              <div className="upload-progress-container">
                <div className="upload-progress-bar">
                  <div 
                    className="upload-progress-fill" 
                    style={{width: `${uploadProgress}%`}}
                  ></div>
                </div>
                <div className="upload-progress-text">{Math.round(uploadProgress)}%</div>
              </div>
            )}

            {/* Upload Buttons */}
            <div className="upload-actions-row">
              <button 
                onClick={handleMediaUpload} 
                disabled={!selectedFile || isBusy} 
                className="upload-action-btn primary-btn"
              >
                {uploading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Uploading... {uploadProgress > 0 ? `${Math.round(uploadProgress)}%` : ''}
                  </>
                ) : (
                  <>
                    <span className="btn-icon">✅</span>
                    Upload Document
                  </>
                )}
              </button>
              {onUploadAndProcess && (
                <button 
                  onClick={handleUploadAndProcessClick} 
                  disabled={!selectedFile || isBusy} 
                  className="upload-action-btn process-after-btn"
                  title="Upload then chunk and save to database"
                >
                  {processing ? (
                    <>
                      <span className="btn-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">⚙️</span>
                      Upload & process to DB
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="media-upload fade-in">
            {/* Media Type Selector */}
            <div className="media-type-selector">
              {Object.entries(MEDIA_TYPES).map(([key, type]) => (
                <button
                  key={key}
                  className={`media-type-btn ${mediaType === key ? 'active' : ''}`}
                  onClick={() => setMediaType(key)}
                >
                  <div className="media-type-icon">{type.icon}</div>
                  <div className="media-type-label">{type.label}</div>
                  <div className="media-type-desc">{type.description}</div>
                </button>
              ))}
            </div>

            {/* YouTube URL Input */}
            {mediaType === 'youtube' ? (
              <div className="url-input-section">
                <label className="input-label">
                  <span className="label-icon">🎬</span>
                  YouTube Video URL
                </label>
                <div className="url-input-wrapper">
                  <input
                    type="text"
                    className={`url-input ${urlError ? 'error' : ''}`}
                    placeholder={MEDIA_TYPES[mediaType].placeholder}
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUrlError('');
                    }}
                    disabled={uploading}
                  />
                  {urlInput && (
                    <button 
                      className="url-clear-btn"
                      onClick={() => setUrlInput('')}
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </div>
                {urlError && <div className="input-error">{urlError}</div>}
                <div className="input-hint">
                  💡 Tip: Paste a YouTube video URL to automatically transcribe and index the content
                </div>
                <button 
                  onClick={handleMediaUpload} 
                  disabled={!urlInput || uploading} 
                  className="upload-action-btn youtube-btn"
                >
                  {uploading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Processing Video...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🚀</span>
                      Process YouTube Video
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="file-upload-section">
                <div className="format-chips-container">
                  <label className="format-label">Supported Formats:</label>
                  <div className="format-chips">
                    {MEDIA_TYPES[mediaType].formats.map(format => (
                      <span key={format} className="format-chip">{format}</span>
                    ))}
                  </div>
                </div>

                <div 
                  className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    id="mediaFile"
                    type="file"
                    onChange={onFileSelect}
                    accept={MEDIA_TYPES[mediaType].formats.join(',')}
                    style={{display: 'none'}}
                  />
                  <label htmlFor="mediaFile" className="file-drop-label">
                    {selectedFile ? (
                      <div className="file-preview">
                        <div className="file-preview-icon">{MEDIA_TYPES[mediaType].icon}</div>
                        <div className="file-preview-info">
                          <div className="file-preview-name">{selectedFile.name}</div>
                          <div className="file-preview-size">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                        <button 
                          type="button"
                          className="file-preview-remove"
                          onClick={(e) => {
                            e.preventDefault();
                            onFileSelect({ target: { files: [] } });
                            resetFileInput();
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="drop-icon pulse">{MEDIA_TYPES[mediaType].icon}</div>
                        <div className="drop-text">Click to browse or drag & drop</div>
                        <div className="drop-hint">Maximum file size: 100MB</div>
                      </>
                    )}
                  </label>
                </div>

                {uploading && uploadProgress > 0 && (
                  <div className="upload-progress-container">
                    <div className="upload-progress-bar">
                      <div 
                        className="upload-progress-fill" 
                        style={{width: `${uploadProgress}%`}}
                      ></div>
                    </div>
                    <div className="upload-progress-text">{Math.round(uploadProgress)}%</div>
                  </div>
                )}

                <div className="upload-actions-row">
                  <button 
                    onClick={handleMediaUpload} 
                    disabled={!selectedFile || isBusy} 
                    className="upload-action-btn primary-btn"
                  >
                    {uploading ? (
                      <>
                        <span className="btn-spinner"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">✅</span>
                        Upload {MEDIA_TYPES[mediaType].label}
                      </>
                    )}
                  </button>
                  {onUploadAndProcess && (
                    <button 
                      onClick={handleUploadAndProcessClick} 
                      disabled={!selectedFile || isBusy} 
                      className="upload-action-btn process-after-btn"
                      title="Upload then chunk and save to database"
                    >
                      {processing ? (
                        <>
                          <span className="btn-spinner"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">⚙️</span>
                          Upload & process to DB
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultimodalUploader;

// import React, { useState } from 'react';
// import '../AdminDashboard.css';

// const MultimodalUploader = ({ onUpload, uploading, supportedFormats, selectedFile, onFileSelect }) => {
//   const [activeTab, setActiveTab] = useState('document');
//   const [urlInput, setUrlInput] = useState('');
//   const [mediaType, setMediaType] = useState('youtube');

//   const mediaTypes = {
//     youtube: { icon: '🎬', label: 'YouTube', placeholder: 'https://youtube.com/watch?v=...' },
//     video: { icon: '🎥', label: 'Video File', formats: ['.mp4', '.avi', '.mov', '.mkv', '.webm'] },
//     audio: { icon: '🎵', label: 'Audio File', formats: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'] },
//     image: { icon: '🖼️', label: 'Image File', formats: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'] }
//   };

//   const handleMediaUpload = () => {
//     if (activeTab === 'document') {
//       onUpload('file', selectedFile);
//     } else if (mediaType === 'youtube') {
//       onUpload('youtube', urlInput);
//       setUrlInput('');
//     } else {
//       onUpload('media', selectedFile, mediaType);
//     }
//   };

//   return (
//     <div className="multimodal-uploader">
//       <div className="upload-tabs">
//         <button className={`upload-tab ${activeTab === 'document' ? 'active' : ''}`} onClick={() => setActiveTab('document')}>
//           <span>📄</span><span>Documents</span>
//         </button>
//         <button className={`upload-tab ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
//           <span>🎬</span><span>Media</span>
//         </button>
//       </div>

//       <div className="upload-content">
//         {activeTab === 'document' ? (
//           <div>
//             <div className="format-chips">
//               {supportedFormats.map(f => <span key={f} className="format-chip">{f}</span>)}
//             </div>
//             <div className="file-drop-zone">
//               <input id="docFile" type="file" onChange={onFileSelect} accept={supportedFormats.join(',')} style={{display:'none'}} />
//               <label htmlFor="docFile" style={{cursor:'pointer',display:'block'}}>
//                 <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📎</div>
//                 <div style={{fontSize:'1.1rem',fontWeight:600,marginBottom:'0.5rem',color:'#1f2937'}}>
//                   {selectedFile ? selectedFile.name : 'Click to browse or drag & drop'}
//                 </div>
//                 <div style={{color:'#6b7280',fontSize:'0.9rem'}}>Supported: PDF, DOCX, XLSX, CSV, TXT, XML</div>
//               </label>
//             </div>
//             <button onClick={handleMediaUpload} disabled={!selectedFile || uploading} className="upload-action-btn">
//               {uploading ? '⏳ Uploading...' : '✅ Upload Document'}
//             </button>
//           </div>
//         ) : (
//           <div>
//             <div className="media-type-selector">
//               {Object.entries(mediaTypes).map(([key, type]) => (
//                 <button key={key} onClick={() => setMediaType(key)} className={`media-type-btn ${mediaType === key ? 'active' : ''}`}>
//                   <div style={{fontSize:'2rem'}}>{type.icon}</div>
//                   <div style={{fontSize:'0.9rem',fontWeight:600}}>{type.label}</div>
//                 </button>
//               ))}
//             </div>
//             {mediaType === 'youtube' ? (
//               <div>
//                 <input type="text" value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder={mediaTypes[mediaType].placeholder} className="url-input" />
//                 <button onClick={handleMediaUpload} disabled={!urlInput || uploading} className="upload-action-btn">
//                   {uploading ? '⏳ Processing...' : '🚀 Process Video'}
//                 </button>
//               </div>
//             ) : (
//               <div>
//                 <div className="format-chips">
//                   {mediaTypes[mediaType].formats.map(f => <span key={f} className="format-chip">{f}</span>)}
//                 </div>
//                 <div className="file-drop-zone">
//                   <input id="mediaFile" type="file" onChange={onFileSelect} accept={mediaTypes[mediaType].formats.join(',')} style={{display:'none'}} />
//                   <label htmlFor="mediaFile" style={{cursor:'pointer',display:'block'}}>
//                     <div style={{fontSize:'3rem',marginBottom:'1rem'}}>{mediaTypes[mediaType].icon}</div>
//                     <div style={{fontSize:'1.1rem',fontWeight:600,color:'#1f2937'}}>
//                       {selectedFile ? selectedFile.name : 'Click to browse or drag & drop'}
//                     </div>
//                   </label>
//                 </div>
//                 <button onClick={handleMediaUpload} disabled={!selectedFile || uploading} className="upload-action-btn">
//                   {uploading ? '⏳ Uploading...' : `✅ Upload ${mediaTypes[mediaType].label}`}
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MultimodalUploader;