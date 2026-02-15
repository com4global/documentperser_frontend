/**
 * API Service with Authentication
 * Handles all API calls with automatic token management via Supabase
 */
import { APP_CONFIG } from '../utils/constants';
// import { put } from '@vercel/blob'; // Not used for local deployment
import { supabase } from '../supabaseClient';

const API_URL = APP_CONFIG.API_URL || 'http://localhost:10001';
// const BLOB_TOKEN = process.env.REACT_APP_BLOB_READ_WRITE_TOKEN; // Not used for local deployment

// Helper to get current session token
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// Error handler
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `Request failed with status ${response.status}`
    }));

    if (response.status === 401) {
      // Optional: Redirect to login or handle session expiry
      console.error("Authentication Error: 401");
    }

    throw new Error(error.detail || error.message || 'Request failed');
  }
  return response.json();
};

// Authenticated Fetch Wrapper
const authenticatedFetch = async (endpoint, options = {}) => {
  const token = await getAuthToken();

  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  return handleResponse(response);
};

export const apiService = {
  // Chat API
  sendMessage: async (query, sessionId = null) => {
    return authenticatedFetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, session_id: sessionId }) // Backend expects session_id
    });
  },

  getChatHistory: async (sessionId = null, limit = 50) => {
    let query = `?limit=${limit}`;
    if (sessionId) query += `&session_id=${sessionId}`;
    return authenticatedFetch(`/api/chat/history${query}`);
  },

  // Files API
  fetchFiles: async () => {
    return authenticatedFetch('/api/files');
  },

  fetchStats: async () => {
    return authenticatedFetch('/api/files'); // Backend returns stats in this endpoint currently? Or separate? 
    // Creating a dedicated stats endpoint might be better, but sticking to existing pattern for now.
    // Wait, original code had fetchStats calling /api/files too? 
    // Yes: "const response = await fetch(`${API_URL}/api/files`);"
    // But it returned "data.stats".
  },

  // Fallback for supported formats
  fetchSupportedFormats: async () => {
    return ['.pdf', '.xlsx', '.xls', '.csv', '.txt', '.docx', '.doc', '.xml',
      '.mp4', '.avi', '.mov', '.mp3', '.wav', '.jpg', '.png', '.jpeg'];
  },

  // Upload File — Local Storage Direct Upload
  uploadFile: async (file, onProgress) => {
    try {
      console.log("🚀 Starting upload process for:", file.name, "Size:", file.size, "Type:", file.type);
      const token = await getAuthToken();
      console.log("🔑 Auth token:", token ? `${token.substring(0, 20)}...` : "NONE");

      // Always use local upload path
      console.log("📂 Uploading to Local Storage via XHR...");
      console.log("📡 Target URL:", `${API_URL}/api/upload`);
      const formData = new FormData();
      formData.append('file', file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track all state changes
        xhr.onreadystatechange = () => {
          console.log(`📊 XHR readyState: ${xhr.readyState} (0=UNSENT, 1=OPENED, 2=HEADERS_RECEIVED, 3=LOADING, 4=DONE)`);
          if (xhr.readyState === 4) {
            console.log(`📊 XHR final status: ${xhr.status}, response: ${xhr.responseText?.substring(0, 200)}`);
          }
        };

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            console.log(`📤 Upload progress: ${percent}% (${e.loaded}/${e.total} bytes)`);
            if (onProgress) onProgress(percent);
          }
        });

        xhr.addEventListener('load', () => {
          console.log(`✅ XHR load event: status=${xhr.status}`);
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log("✅ Upload successful:", xhr.responseText?.substring(0, 200));
            resolve(JSON.parse(xhr.responseText));
          } else {
            console.error(`❌ Upload failed: status=${xhr.status}, body=${xhr.responseText}`);
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
          }
        });

        xhr.addEventListener('error', (e) => {
          console.error("❌ XHR error event:", e);
          reject(new Error('Network error during upload. Check if backend is running on ' + API_URL));
        });

        xhr.addEventListener('abort', () => {
          console.error("❌ XHR aborted");
          reject(new Error('Upload was aborted'));
        });

        xhr.addEventListener('timeout', () => {
          console.error("❌ XHR timeout after 60 seconds");
          reject(new Error('Upload timed out after 60 seconds'));
        });

        xhr.timeout = 60000; // 60 second timeout
        xhr.open('POST', `${API_URL}/api/upload`);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          console.log("🔑 Authorization header set");
        } else {
          console.warn("⚠️ No auth token available!");
        }
        console.log("📤 Sending upload request...");
        xhr.send(formData);
      });
    } catch (error) {
      console.error("❌ Upload failed:", error);
      throw error;
    }
  },

  // Process File
  processFile: async (filename) => {
    return authenticatedFetch(`/api/process-file?filename=${encodeURIComponent(filename)}`, {
      method: 'POST'
    });
  },

  deleteFile: async (filename) => {
    return authenticatedFetch(`/api/files/${encodeURIComponent(filename)}`, {
      method: 'DELETE'
    });
  },

  deleteFileChunks: async (filename) => {
    return authenticatedFetch(`/api/files/${encodeURIComponent(filename)}/chunks`, {
      method: 'DELETE'
    });
  },

  // Multimedia
  processVideoFile: async (filename) => {
    // Note: Long running process, explicit fetch might be better for timeout control
    const token = await getAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 mins

    try {
      const response = await fetch(`${API_URL}/api/process-video-file?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        sub: controller.signal,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Video processing timed out.');
      throw error;
    }
  },

  processAudioFile: async (filename) => {
    const token = await getAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);

    try {
      const response = await fetch(`${API_URL}/api/process-audio-file?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        sub: controller.signal,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Audio processing timed out.');
      throw error;
    }
  },

  // External Sources
  processYoutube: async (url) => {
    return authenticatedFetch('/api/process-youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
  },

  analyzeLegalDocument: async (payload) => {
    const formData = new FormData();
    if (payload.file) formData.append('file', payload.file);
    if (payload.url) formData.append('url', payload.url);

    // Cannot use authenticatedFetch easily with FormData + automatic Content-Type
    // So we use fetch manually
    const token = await getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_URL}/api/analyze-legal`, {
      method: 'POST',
      body: formData,
      headers
    });
    return handleResponse(response);
  },

  // Auth (Legacy/Supabase wrapper if needed, but we use Supabase client directly in Context)
};

export default apiService;