/**
 * API Service with Authentication
 * Handles all API calls with automatic token management
 */

import { APP_CONFIG } from '../utils/constants';

const API_URL = APP_CONFIG.API_URL || 'http://localhost:10000';
console.log('Using API URL:', API_URL); // Debug log to verify API URL

//https://ragsysetm-backendpart.onrender.com

// Get tokens from localStorage
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

// Refresh access token
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (response.ok) {
      const { access_token } = await response.json();
      localStorage.setItem('access_token', access_token);
      return access_token;
    } else {
      // Clear tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Session expired');
    }
  } catch (error) {
    throw new Error('Failed to refresh token');
  }
};

// Authenticated fetch with automatic token refresh
const authenticatedFetch = async (url, options = {}) => {
  const token = getAccessToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  const config = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  };

  let response = await fetch(url, config);

  // If unauthorized, try refreshing token
  if (response.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      config.headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, config);
    } catch (error) {
      // Refresh failed, redirect to login
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
};

// Error handler
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      detail: `Request failed with status ${response.status}` 
    }));
    throw new Error(error.detail || error.message || 'Request failed');
  }
  return response.json();
};

// Retry logic for failed requests
const fetchWithRetry = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await authenticatedFetch(url, options);
      return await handleResponse(response);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

export const apiService = {
  // Authentication APIs
  register: async (email, password, fullName, company = null) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        company
      })
    });
    return handleResponse(response);
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  logout: async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await authenticatedFetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    return fetchWithRetry(`${API_URL}/api/auth/me`);
  },

  // Files API - User-specific
  fetchFiles: async () => {
    return fetchWithRetry(`${API_URL}/api/files`);
  },

  fetchStats: async () => {
    const data = await fetchWithRetry(`${API_URL}/api/files`);
    return data.stats || {};
  },

  fetchSupportedFormats: async () => {
    try {
      const response = await fetch(`${API_URL}/api/supported-formats`);
      const data = await handleResponse(response);
      return data.supported_formats;
    } catch (error) {
      console.warn('Using fallback formats:', error);
      return ['.pdf', '.xlsx', '.xls', '.csv', '.txt', '.docx', '.doc', '.xml', 
              '.mp4', '.avi', '.mov', '.mp3', '.wav', '.jpg', '.png', '.jpeg'];
    }
  },

  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getAccessToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 401) {
          // Try to refresh token and retry
          refreshAccessToken()
            .then(() => {
              // Retry upload with new token
              apiService.uploadFile(file, onProgress).then(resolve).catch(reject);
            })
            .catch(reject);
        } else if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.open('POST', `${API_URL}/api/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  processFile: async (filename) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/process-file?filename=${encodeURIComponent(filename)}`,
      { method: 'POST' }
    );
    console.log(`Processing file: ${filename}, response status: ${response.status}`);
    return handleResponse(response);
  },

  deleteFile: async (filename) => {
    const response = await authenticatedFetch(
      `${API_URL}/api/files/${encodeURIComponent(filename)}`,
      { method: 'DELETE' }
    );
    return handleResponse(response);
  },

  // Media processing
  processVideoFile: async (filename) => {
    console.log(`🎬 Starting video process for: ${filename}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);

    try {
      const response = await authenticatedFetch(
        `${API_URL}/api/process-video-file?filename=${encodeURIComponent(filename)}`,
        { 
          method: 'POST',
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Video processing timed out.');
      }
      throw error;
    }
  },

  processAudioFile: async (filename) => {
    console.log(`🎙️ Starting audio transcription for: ${filename}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);

    try {
      const response = await authenticatedFetch(
        `${API_URL}/api/process-audio-file?filename=${encodeURIComponent(filename)}`,
        { 
          method: 'POST',
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Audio processing timed out.');
      }
      throw error;
    }
  },

  processImageFile: async (filename) => {
    console.log(`🖼️ Starting image analysis for: ${filename}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await authenticatedFetch(
        `${API_URL}/api/process-image-file?filename=${encodeURIComponent(filename)}`,
        { 
          method: 'POST',
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Image processing timed out.');
      }
      throw error;
    }
  },

  // Chat API - User-specific
  sendMessage: async (query, sessionId = null) => {
    const response = await authenticatedFetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, session_id: sessionId })
    });
    return handleResponse(response);
  },

  getChatHistory: async (sessionId = null, limit = 50) => {
    const url = new URL(`${API_URL}/api/chat/history`);
    if (sessionId) url.searchParams.append('session_id', sessionId);
    url.searchParams.append('limit', limit);
    
    return fetchWithRetry(url.toString());
  }
};

export default apiService;






// import { APP_CONFIG } from '../utils/constants';

// const API_URL = APP_CONFIG.API_URL;

// // Error handler
// const handleResponse = async (response) => {
//   if (!response.ok) {
//     const error = await response.json().catch(() => ({ detail: 'Request failed' }));
//     throw new Error(error.detail || error.message || 'Request failed');
//   }
//   return response.json();
// };

// // Retry logic for failed requests
// const fetchWithRetry = async (url, options = {}, retries = 3) => {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const response = await fetch(url, options);
//       return await handleResponse(response);
//     } catch (error) {
//       if (i === retries - 1) throw error;
//       await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
//     }
//   }
// };

// export const apiService = {
//   // Files API
//   fetchFiles: async () => {
//     return fetchWithRetry(`${API_URL}/api/files`);
//   },

//   fetchStats: async () => {
//     return fetchWithRetry(`${API_URL}/api/files/stats`);
//   },

//   fetchSupportedFormats: async () => {
//     try {
//       const data = await fetchWithRetry(`${API_URL}/api/supported-formats`);
//       return data.supported_formats;
//     } catch (error) {
//       console.warn('Using fallback formats:', error);
//       return ['.pdf', '.xlsx', '.xls', '.csv', '.txt', '.docx', '.doc', '.xml'];
//     }
//   },

//   uploadFile: async (file, onProgress) => {
//     const formData = new FormData();
//     formData.append('file', file);

//     return new Promise((resolve, reject) => {
//       const xhr = new XMLHttpRequest();

//       xhr.upload.addEventListener('progress', (e) => {
//         if (e.lengthComputable && onProgress) {
//           const percentComplete = (e.loaded / e.total) * 100;
//           onProgress(percentComplete);
//         }
//       });

//       xhr.addEventListener('load', () => {
//         if (xhr.status >= 200 && xhr.status < 300) {
//           resolve(JSON.parse(xhr.responseText));
//         } else {
//           reject(new Error('Upload failed'));
//         }
//       });

//       xhr.addEventListener('error', () => reject(new Error('Upload failed')));
//       xhr.open('POST', `${API_URL}/api/upload`);
//       xhr.send(formData);
//     });
//   },
//   processVideoFile: async (filename) => {
//   console.log(`🎬 Starting video process for: ${filename}`);
  
//   // Create an AbortController to manage long-running requests
//   const controller = new AbortController();
//   // Optional: Set a very long timeout (e.g., 5 minutes)
//   const timeoutId = setTimeout(() => controller.abort(), 1200000);

//   try {
//     const response = await fetch(
//       `${API_URL}/api/process-video-file?filename=${encodeURIComponent(filename)}`,
//       { 
//         method: 'POST',
//         signal: controller.signal // Link the abort signal
//       }
//     );

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Video processing failed');
//     }
    
//     return await response.json();
//   } catch (error) {
//     if (error.name === 'AbortError') {
//       throw new Error('Video processing took too long and timed out.');
//     }
//     throw error;
//   }
// },



// // --- AUDIO FILE PROCESSING ---
// processAudioFile: async (filename) => {
//   console.log(`🎙️ Starting audio transcription for: ${filename}`);
  
//   const controller = new AbortController();
//   // 5 minute timeout for long audio files
//   const timeoutId = setTimeout(() => controller.abort(), 300000); 

//   try {
//     const response = await fetch(
//       `${API_URL}/api/process-audio-file?filename=${encodeURIComponent(filename)}`,
//       { 
//         method: 'POST',
//         signal: controller.signal 
//       }
//     );

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Audio processing failed');
//     }
    
//     return await response.json();
//   } catch (error) {
//     if (error.name === 'AbortError') {
//       throw new Error('Audio processing timed out (took longer than 5 mins).');
//     }
//     throw error;
//   }
// },

// // --- IMAGE FILE PROCESSING ---
// processImageFile: async (filename) => {
//   console.log(`🖼️ Starting image analysis for: ${filename}`);
  
//   const controller = new AbortController();
//   // 2 minute timeout for complex images/OCR
//   const timeoutId = setTimeout(() => controller.abort(), 120000); 

//   try {
//     const response = await fetch(
//       `${API_URL}/api/process-image-file?filename=${encodeURIComponent(filename)}`,
//       { 
//         method: 'POST',
//         signal: controller.signal 
//       }
//     );

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Image processing failed');
//     }
    
//     return await response.json();
//   } catch (error) {
//     if (error.name === 'AbortError') {
//       throw new Error('Image processing timed out.');
//     }
//     throw error;
//   }
// },

//   processYoutube: async (url) => {
//     const response = await fetch(`${API_URL}/api/process-youtube`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ url })
//     });
//     return handleResponse(response);
//   },

//   processFile: async (filename) => {
//     const response = await fetch(
//       `${API_URL}/api/process-file?filename=${encodeURIComponent(filename)}`,
//       { method: 'POST' }
//     );
//     return handleResponse(response);
//   },

//   deleteFile: async (filename) => {
//     const response = await fetch(
//       `${API_URL}/api/files/${encodeURIComponent(filename)}`,
//       { method: 'DELETE' }
//     );
//     return handleResponse(response);
//   },

//   // Health check
//   healthCheck: async () => {
//     try {
//       const response = await fetch(`${API_URL}/health`, { timeout: 5000 });
//       return response.ok;
//     } catch {
//       return false;
//     }
//   }
// };


// const API_URL = 'http://localhost:8000';

// export const apiService = {
//   // dashboard calls getFiles, so we map it to our fetch logic
//   getFiles: async () => {
//     const response = await fetch(`${API_URL}/api/files`);
//     if (!response.ok) throw new Error('Failed to fetch files');
//     return await response.json();
//   },

//   // Kept for backward compatibility
//   fetchFiles: async () => {
//     const response = await fetch(`${API_URL}/api/files`);
//     if (!response.ok) throw new Error('Failed to fetch files');
//     return await response.json();
//   },

//   fetchStats: async () => {
//     const response = await fetch(`${API_URL}/api/files/stats`);
//     if (!response.ok) throw new Error('Failed to fetch stats');
//     return await response.json();
//   },

//   fetchSupportedFormats: async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/supported-formats`);
//       if (!response.ok) throw new Error('Failed to fetch formats');
//       const data = await response.json();
//       return data.supported_formats;
//     } catch (error) {
//       return ['.pdf', '.xlsx', '.xls', '.csv', '.txt', '.docx', '.doc', '.xml'];
//     }
//   },

//   uploadFile: async (file) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     const response = await fetch(`${API_URL}/api/upload`, {
//       method: 'POST',
//       body: formData
//     });
//     if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Upload failed');
//     }
//     return response.json();
//   },

//   // NEW: Needed for local video processing
//   processVideoFile: async (filename) => {
//   console.log(`🎬 Starting video process for: ${filename}`);
  
//   // Create an AbortController to manage long-running requests
//   const controller = new AbortController();
//   // Optional: Set a very long timeout (e.g., 5 minutes)
//   const timeoutId = setTimeout(() => controller.abort(), 1200000);

//   try {
//     const response = await fetch(
//       `${API_URL}/api/process-video-file?filename=${encodeURIComponent(filename)}`,
//       { 
//         method: 'POST',
//         signal: controller.signal // Link the abort signal
//       }
//     );

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Video processing failed');
//     }
    
//     return await response.json();
//   } catch (error) {
//     if (error.name === 'AbortError') {
//       throw new Error('Video processing took too long and timed out.');
//     }
//     throw error;
//   }
// },


//   processYoutube: async (url) => {
//     const response = await fetch(`${API_URL}/api/process-youtube`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ url })
//     });
//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.detail || 'YouTube processing failed');
//     }
//     return response.json();
//   },

//   processFile: async (filename) => {
//     const response = await fetch(
//       `${API_URL}/api/process-file?filename=${encodeURIComponent(filename)}`,
//       { method: 'POST' }
//     );
//     if (!response.ok) throw new Error('File processing failed');
//     return response.json();
//   }
// };
// const API_URL = 'http://localhost:8000';
// // src/services/api.js

// export const apiService = {
//   fetchFiles: async () => {
//     const response = await fetch(`${API_URL}/api/files`);
//     if (!response.ok) throw new Error('Failed to fetch files');
//     const data = await response.json();
//     return data;
//   },

//   fetchStats: async () => {
//     const response = await fetch(`${API_URL}/api/files/stats`);
//     if (!response.ok) throw new Error('Failed to fetch stats');
//     const data = await response.json();
//     return data;
//   },

//   fetchSupportedFormats: async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/supported-formats`);
//       if (!response.ok) throw new Error('Failed to fetch formats');
//       const data = await response.json();
//       return data.supported_formats;
//     } catch (error) {
//       return ['.pdf', '.xlsx', '.xls', '.csv', '.txt', '.docx', '.doc', '.xml'];
//     }
//   },

//   uploadFile: async (file) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     const response = await fetch(`${API_URL}/api/upload`, {
//       method: 'POST',
//       body: formData
//     });
//     if (!response.ok) throw new Error('Upload failed');
//     return response.json();
//   },

//   processYoutube: async (url) => {
//     const response = await fetch(`${API_URL}/api/process-youtube`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ url })
//     });
//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.detail || 'YouTube processing failed');
//     }
//     return response.json();
//   },

//   processFile: async (filename) => {
//     const response = await fetch(
//       `${API_URL}/api/process-file?filename=${encodeURIComponent(filename)}`,
//       { method: 'POST' }
//     );
//     if (!response.ok) throw new Error('File processing failed');
//     return response.json();
//   }
// };