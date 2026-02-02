// Enhanced utility functions
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Relative time for recent files
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  // Absolute date for older files
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getFileExtension = (filename) => {
  if (!filename) return '';
  return '.' + filename.split('.').pop().toLowerCase();
};

export const validateFileType = (file, supportedFormats) => {
  const ext = getFileExtension(file.name);
  return supportedFormats.includes(ext);
};

export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

export const getFileCategory = (fileType) => {
  const ext = fileType.toLowerCase();
  if (['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.xls', '.csv', '.xml'].includes(ext)) return 'document';
  if (['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(ext)) return 'video';
  if (['.mp3', '.wav', '.ogg', '.m4a', '.flac'].includes(ext)) return 'audio';
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) return 'image';
  return 'other';
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateFileId = () => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const isValidYouTubeUrl = (url) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/;
  return pattern.test(url);
};

export const calculateProgress = (current, total) => {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
};

export const sortFilesByDate = (files, ascending = false) => {
  return [...files].sort((a, b) => {
    const dateA = new Date(a.uploaded_at);
    const dateB = new Date(b.uploaded_at);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const filterFilesByType = (files, fileType) => {
  if (!fileType || fileType === 'all') return files;
  return files.filter(file => file.file_type === fileType);
};

export const searchFiles = (files, searchTerm) => {
  if (!searchTerm) return files;
  const term = searchTerm.toLowerCase();
  return files.filter(file => 
    file.file_name.toLowerCase().includes(term)
  );
};




// export const formatFileSize = (bytes) => {
//   if (!bytes) return '0 Bytes';
//   const k = 1024;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// };

// export const formatDate = (dateString) => {
//   return new Date(dateString).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   });
// };

// export const getFileExtension = (filename) => {
//   return '.' + filename.split('.').pop().toLowerCase();
// };

// export const validateFileType = (file, supportedFormats) => {
//   const ext = getFileExtension(file.name);
//   return supportedFormats.includes(ext);
// };