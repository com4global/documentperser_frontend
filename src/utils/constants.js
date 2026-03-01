// Application constants
export const APP_CONFIG = {
  API_URL: process.env.REACT_APP_API_URL || 'https://ragsysetm-backendpart.onrender.com',
  // Render (persistent server — supports video generation)
  // Old Vercel: 'https://ragsystem-api1.vercel.app',
  REFRESH_INTERVAL: 10000, // 10 seconds
  MAX_FILE_SIZE: 3 * 1024 * 1024, // 3MB — safe default (free tier), overridden by plan limits when loaded
  NOTIFICATION_DURATION: 5000,
};

export const FILE_CATEGORIES = {
  DOCUMENT: {
    formats: ['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.xls', '.csv', '.xml'],
    icon: '📄',
    color: '#3b82f6'
  },
  VIDEO: {
    formats: ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
    icon: '🎥',
    color: '#8b5cf6'
  },
  AUDIO: {
    formats: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
    icon: '🎵',
    color: '#10b981'
  },
  IMAGE: {
    formats: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
    icon: '🖼️',
    color: '#f59e0b'
  },
  YOUTUBE: {
    formats: [],
    icon: '🎬',
    color: '#ef4444'
  }
};

export const STATUS_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  PROCESSING: 'processing',
  WARNING: 'warning'
};

export const MEDIA_TYPES = {
  youtube: {
    icon: '🎬',
    label: 'YouTube',
    placeholder: 'https://youtube.com/watch?v=...',
    description: 'Process YouTube videos with automatic transcription'
  },
  video: {
    icon: '🎥',
    label: 'Video File',
    formats: FILE_CATEGORIES.VIDEO.formats,
    description: 'Upload video files for processing'
  },
  audio: {
    icon: '🎵',
    label: 'Audio File',
    formats: FILE_CATEGORIES.AUDIO.formats,
    description: 'Upload audio files for transcription'
  },
  image: {
    icon: '🖼️',
    label: 'Image File',
    formats: FILE_CATEGORIES.IMAGE.formats,
    description: 'Upload images for OCR and analysis'
  }
};