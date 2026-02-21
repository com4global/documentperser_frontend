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

  // Timeout: 10s for GET (fast reads), 120s for mutations (upload/delete can be slow)
  const method = (options.method || 'GET').toUpperCase();
  const timeoutMs = method === 'GET' ? 10000 : 120000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const config = {
    ...options,
    headers,
    signal: controller.signal
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    clearTimeout(timeoutId);
    return handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${endpoint} timed out. Is the backend running on ${API_URL}?`);
    }
    throw error;
  }
};

export const apiService = {
  // Chat API
  sendMessage: async (query, sessionId = null, language = 'en') => {
    return authenticatedFetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, session_id: sessionId, language }) // Backend expects session_id & language
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

      // 0. Validate File Size — allow large textbooks/PDFs (up to 500MB)
      const MAX_UPLOAD_SIZE = 500 * 1024 * 1024; // 500 MB
      if (file.size > MAX_UPLOAD_SIZE) {
        throw new Error(`File too large. Maximum size is 500MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      }

      const token = await getAuthToken();

      // VERCEL BLOB UPLOAD (Cloud Mode)
      // 1. UPLOAD TO VERCEL BLOB (If Token Available)
      // 1. UPLOAD TO VERCEL BLOB (Cloud Mode) -> DISABLED!
      // We are forcing the Backend Proxy method to avoid CORS and timeouts.
      // if (BLOB_TOKEN) {
      if (false) {
        console.log("🚀 PATH: Vercel Blob (Client-Side) - SKIPPED");
        console.log("☁️ Uploading to Vercel Blob...");
        try {
          const blob = await put(file.name, file, {
            access: 'public',
            token: BLOB_TOKEN,
            addRandomSuffix: true // Prevent "Blob already exists" error
          });

          console.log("✅ Blob Encrypted & Uploaded:", blob.url);

          // 2. Register with Backend
          await authenticatedFetch('/api/register-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name, // Original name
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
        } catch (error) {
          console.error("Vercel Blob Error:", error);
          // If Vercel Blob fails, we MIGHT want to fall back to Supabase/Local,
          // but traditionally we throw here. Let's make it clearer.
          throw new Error(`Cloud upload failed: ${error.message}`);
        }
      }

      // SUPABASE STORAGE UPLOAD (Persistent Mode)
      // Use if Blob token missing but Supabase client available
      if (supabase && supabase.storage) {
        console.log("☁️ Uploading to Supabase Storage...");
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`; // Sanitize & Unique

        try {
          // 1. Upload to Supabase 'uploads' bucket
          const { error } = await supabase.storage
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

          // 3. Register with Backend (auto-queues processing)
          const registerResult = await authenticatedFetch('/api/register-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              file_type: file.type || 'application/octet-stream',
              file_size: file.size,
              blob_url: publicUrl
            })
          });

          console.log("✅ File registered & queued for processing");

          return {
            success: true,
            filename: file.name,
            file_name: file.name,
            url: publicUrl,
            batch_job_id: registerResult?.batch_job_id || null,
            status: 'queued'
          };

        } catch (err) {
          console.warn("⚠️ Supabase Storage failed, falling back to local:", err.message);
          // Fallthrough to local upload below
        }
      }

      // FALLBACK: Local/Server Upload
      // Large textbooks are handled via batched processing on the backend

      console.log("🚀 PATH: Backend Proxy (Server-Side)");
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

        xhr.timeout = 300000; // 5 minute timeout (large files go to backend → Supabase)
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

  // Process File — long-running operation (chunking + embedding), needs extended timeout
  processFile: async (filename) => {
    const token = await getAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes

    try {
      const response = await fetch(`${API_URL}/api/process-file?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') throw new Error('File processing timed out (10 min). Try a smaller file or check backend logs.');
      throw error;
    }
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
    if (payload.language) formData.append('language', payload.language);

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

  // ---- EdTech AI Teacher ----
  getEdtechDocuments: async () => {
    const token = await getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/api/edtech/documents`, { headers });
    return handleResponse(response);
  },

  getEdtechChapters: async (docName) => {
    const token = await getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/api/edtech/chapters?doc_name=${encodeURIComponent(docName)}`, { headers });
    return handleResponse(response);
  },

  getEdtechTopics: async (docName, language = 'en', chapter = '') => {
    const token = await getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    let url = `${API_URL}/api/edtech/topics?doc_name=${encodeURIComponent(docName)}&language=${language}`;
    if (chapter) {
      url += `&chapter=${encodeURIComponent(chapter)}`;
    }
    const response = await fetch(url, { headers });
    return handleResponse(response);
  },

  generateLesson: async (topic, language = 'en', docName = '') => {
    const formData = new FormData();
    formData.append('topic', topic);
    formData.append('language', language);
    formData.append('doc_name', docName);
    const token = await getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/api/edtech/generate-lesson`, {
      method: 'POST', body: formData, headers
    });
    return handleResponse(response);
  },

  askEdtechQuestion: async (question, topic = '', language = 'en') => {
    const formData = new FormData();
    formData.append('question', question);
    formData.append('topic', topic);
    formData.append('language', language);
    const token = await getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/api/edtech/ask`, {
      method: 'POST', body: formData, headers
    });
    return handleResponse(response);
  },

  speakAnswer: async (text, language = 'en') => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('language', language);
    const token = await getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/api/edtech/speak-answer`, {
      method: 'POST', body: formData, headers
    });
    return handleResponse(response);
  },

  askDoubt: async (question, topic = '', language = 'en') => {
    const formData = new FormData();
    formData.append('question', question);
    formData.append('topic', topic);
    formData.append('language', language);
    const token = await getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/api/edtech/ask-doubt`, {
      method: 'POST', body: formData, headers
    });
    return handleResponse(response);
  },

  // ---- HeyGen AI Video ----
  generateVideo: async (topic, docName = '', language = 'en') => {
    const formData = new FormData();
    formData.append('topic', topic);
    formData.append('doc_name', docName);
    formData.append('language', language);
    const token = await getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/api/edtech/generate-video`, {
      method: 'POST', body: formData, headers
    });
    return handleResponse(response);
  },

  checkVideoStatus: async (videoId, topic = '', docName = '') => {
    const token = await getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    let url = `${API_URL}/api/edtech/video-status?video_id=${encodeURIComponent(videoId)}`;
    if (topic) url += `&topic=${encodeURIComponent(topic)}`;
    if (docName) url += `&doc_name=${encodeURIComponent(docName)}`;
    const response = await fetch(url, { headers });
    return handleResponse(response);
  },

  checkVideoCache: async (topic, docName = '') => {
    const token = await getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    let url = `${API_URL}/api/edtech/video-cache?topic=${encodeURIComponent(topic)}`;
    if (docName) url += `&doc_name=${encodeURIComponent(docName)}`;
    const response = await fetch(url, { headers });
    return handleResponse(response);
  },

  generateTTSVideo: async (topic, docName = '', language = 'en', voice = 'nova') => {
    const formData = new FormData();
    formData.append('topic', topic);
    formData.append('doc_name', docName);
    formData.append('language', language);
    formData.append('voice', voice);
    const token = await getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/api/edtech/generate-tts-video`, {
      method: 'POST', body: formData, headers
    });
    return handleResponse(response);
  },

  // ---- Classroom / LMS ----
  async getUserInfo() {
    return authenticatedFetch('/api/users/me');
  },

  async updateUserRole(role) {
    const formData = new FormData();
    formData.append('role', role);
    return authenticatedFetch('/api/users/role', {
      method: 'PATCH', body: formData
    });
  },

  async listClassrooms() {
    return authenticatedFetch('/api/classrooms');
  },

  async deleteClassroom(classroomId) {
    return authenticatedFetch(`/api/classrooms/${classroomId}`, { method: 'DELETE' });
  },

  async createClassroom(name, description = '', docName = '') {

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('doc_name', docName);
    return authenticatedFetch('/api/classrooms', {
      method: 'POST', body: formData
    });
  },

  async joinClassroom(joinCode) {
    const formData = new FormData();
    formData.append('join_code', joinCode);
    return authenticatedFetch('/api/classrooms/join', {
      method: 'POST', body: formData
    });
  },

  async getClassroomDetail(classroomId) {
    return authenticatedFetch(`/api/classrooms/${classroomId}`);
  },

  async createAssignment(classroomId, chapterTitle, topics = [], dueDate = '', docName = '', studentId = '') {
    const formData = new FormData();
    formData.append('chapter_title', chapterTitle);
    formData.append('topics', JSON.stringify(topics));
    formData.append('due_date', dueDate);
    formData.append('doc_name', docName);
    formData.append('student_id', studentId);
    return authenticatedFetch(`/api/classrooms/${classroomId}/assignments`, {
      method: 'POST', body: formData
    });
  },

  // ---- Documents / Book Structure ----
  async getDocuments() {
    return authenticatedFetch('/api/documents');
  },

  async getDocumentStructure(filename) {
    return authenticatedFetch(`/api/documents/${encodeURIComponent(filename)}/structure`);
  },

  async updateProgress(classroomId, topic, activityType, quizScore = 0, quizAnswers = {}) {
    const formData = new FormData();
    formData.append('classroom_id', classroomId);
    formData.append('topic', topic);
    formData.append('activity_type', activityType);
    formData.append('quiz_score', quizScore.toString());
    formData.append('quiz_answers', JSON.stringify(quizAnswers));
    return authenticatedFetch('/api/progress/update', {
      method: 'POST', body: formData
    });
  },

  async getMyProgress(classroomId = '') {
    const params = classroomId ? `?classroom_id=${classroomId}` : '';
    return authenticatedFetch(`/api/progress/me${params}`);
  },

  async getClassroomProgress(classroomId) {
    return authenticatedFetch(`/api/classrooms/${classroomId}/progress`);
  },

  // ---- Web URL Ingestion ----
  async ingestUrl(url) {
    const formData = new FormData();
    formData.append('url', url);
    return authenticatedFetch('/api/ingest-url', {
      method: 'POST', body: formData
    });
  },

  // ---- Batch Processing Status ----
  async getBatchStatus(docName = '', jobId = '') {
    const params = new URLSearchParams();
    if (docName) params.append('doc_name', docName);
    if (jobId) params.append('job_id', jobId);
    return authenticatedFetch(`/api/batch-status?${params.toString()}`);
  },

  // Auth (Legacy/Supabase wrapper if needed, but we use Supabase client directly in Context)
};

export default apiService;