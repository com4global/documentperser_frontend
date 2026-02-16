/**
 * API Service with Authentication
 * Handles all API calls with automatic token management via Supabase
 */
import { APP_CONFIG } from '../utils/constants';
import { put } from '@vercel/blob';
import { supabase } from '../supabaseClient';

const API_URL = APP_CONFIG.API_URL || 'http://localhost:10001';
const BLOB_TOKEN = process.env.REACT_APP_BLOB_READ_WRITE_TOKEN;

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

      // 0. Validate File Size
      // Conditional size limit based on upload method
      if (BLOB_TOKEN) {
        // Limit for Blob Storage (5GB max supported by Vercel, setting safe 4.5GB)
        const MAX_BLOB_SIZE = 4.5 * 1024 * 1024 * 1024;
        if (file.size > MAX_BLOB_SIZE) {
          throw new Error(`File too large for cloud storage. Limit is 4.5GB. Your file: ${(file.size / 1024 / 1024 / 1024).toFixed(2)} GB`);
        }
      } else {
        // Limit for local upload via Vercel Serverless Function (4.5MB)
        const MAX_SERVERLESS_SIZE = 4.5 * 1024 * 1024; // 4.5 MB
        if (file.size > MAX_SERVERLESS_SIZE) {
          throw new Error(`File too large for local processing. Limit is 4.5MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        }
      }

      const token = await getAuthToken();

      // VERCEL BLOB UPLOAD (Cloud Mode)
      if (BLOB_TOKEN) {
        console.log("☁️ Uploading to Vercel Blob storage...");
        try {
          // 1. Upload to Blob
          const blob = await put(file.name, file, {
            access: 'public',
            token: BLOB_TOKEN,
            handleUploadUrl: null,
            onUploadProgress: (progressEvent) => {
              if (onProgress) onProgress(progressEvent.percentage);
            }
          });

          console.log("✅ Blob uploaded:", blob.url);

          // 2. Register with Backend
          console.log("📝 Registering metadata...");
          await authenticatedFetch('/api/register-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              file_type: file.type || 'application/octet-stream',
              file_size: file.size,
              blob_url: blob.url
            })
          });

          return {
            success: true,
            filename: file.name,
            file_name: file.name,
            url: blob.url
          };

        } catch (err) {
          console.error("❌ Blob upload failed:", err);
          throw new Error(`Cloud upload failed: ${err.message}`);
        }
      }

      // SUPABASE STORAGE UPLOAD (Persistent Mode)
      // Use if Blob token missing but Supabase client available
      if (supabase && supabase.storage) {
        console.log("☁️ Uploading to Supabase Storage...");
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`; // Sanitize & Unique

        try {
          // 1. Upload to Supabase 'uploads' bucket
          const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.warn("⚠️ Supabase upload failed (bucket missing or permissions?):", error.message);
            throw error; // Fallback to local
          }

          // 2. Get Public URL
          const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);

          console.log("✅ Supabase File Uploaded:", publicUrl);

          // 3. Register with Backend (using blob_url field for compatibility)
          await authenticatedFetch('/api/register-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name, // Original name
              file_type: file.type || 'application/octet-stream',
              file_size: file.size,
              blob_url: publicUrl
            })
          });

          return {
            success: true,
            filename: file.name,
            file_name: file.name,
            url: publicUrl
          };

        } catch (err) {
          console.warn("⚠️ Supabase Storage failed, falling back to local:", err.message);
          // Fallthrough to local upload below
        }
      }

      // LOCAL UPLOAD (Dev Mode / Fallback)
      // Vercel Serverless Functions have a strict request body limit of 4.5MB
      const MAX_SERVERLESS_SIZE = 4.5 * 1024 * 1024; // 4.5 MB

      if (file.size > MAX_SERVERLESS_SIZE) {
        throw new Error(`File too large for serverless upload (${(file.size / 1024 / 1024).toFixed(2)} MB). \n\nLimit is 4.5 MB when Vercel Blob is not configured.\n\nPlease configure REACT_APP_BLOB_READ_WRITE_TOKEN in Netlify to enable large file uploads (up to 4.5GB).`);
      }

      console.log("FOLDER: Uploading to Local Storage via XHR...");
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