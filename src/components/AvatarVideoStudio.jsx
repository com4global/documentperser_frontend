/**
 * Avatar Video Studio — Lip-Sync Edition
 * ========================================
 * Simple 3-step wizard: Upload Photo → Enter Script → Generate Lip-Sync Video
 * Uses Replicate Wav2Lip for affordable lip-sync (~$0.07/min vs HeyGen $24+/mo)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './AvatarVideoStudio.css';

const VOICES = [
    { id: 'nova', label: 'Nova (Warm Female)', icon: '🎤' },
    { id: 'alloy', label: 'Alloy (Neutral)', icon: '🔊' },
    { id: 'echo', label: 'Echo (Clear Male)', icon: '🎧' },
    { id: 'fable', label: 'Fable (Storyteller)', icon: '📖' },
    { id: 'onyx', label: 'Onyx (Deep Male)', icon: '🎙️' },
    { id: 'shimmer', label: 'Shimmer (Warm Female)', icon: '✨' },
];

const PIPELINE_STEPS = [
    { key: 'script', label: 'Generating Script', icon: '📝' },
    { key: 'audio', label: 'Creating Voice Audio', icon: '🔊' },
    { key: 'lipsync', label: 'Lip-Sync Animation', icon: '👄' },
    { key: 'compose', label: 'Composing Video', icon: '🎬' },
    { key: 'finalize', label: 'Finalizing', icon: '✅' },
];

export default function AvatarVideoStudio() {
    const navigate = useNavigate();
    const pollRef = useRef(null);
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    const videoRef = useRef(null);
    const activeSceneRef = useRef(null);

    // ── Wizard step: 1=avatar, 2=content, 3=generate ──
    const [step, setStep] = useState(1);

    // ── Avatar state ──
    const [avatars, setAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [uploadPreview, setUploadPreview] = useState(null); // Data URL for uploaded photo preview
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    // ── Content state ──
    const [topic, setTopic] = useState('');
    const [script, setScript] = useState('');
    const [voice, setVoice] = useState('nova');
    const [language, setLanguage] = useState('en');

    // ── Generation state ──
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState('');
    const [error, setError] = useState('');

    // ── Result state ──
    const [videoUrl, setVideoUrl] = useState('');
    const [resultData, setResultData] = useState(null);

    // ── History ──
    const [showHistory, setShowHistory] = useState(false);
    const [historyVideos, setHistoryVideos] = useState([]);

    // ── Active scene tracking for side text panel ──
    const [activeSceneIndex, setActiveSceneIndex] = useState(0);

    // ── Load avatars on mount ──
    useEffect(() => {
        loadAvatars();
    }, []);

    const loadAvatars = async () => {
        try {
            const res = await apiService.listAvatars();
            if (res.avatars) {
                setAvatars(res.avatars);
            }
        } catch (err) {
            console.log('Could not load avatars:', err.message);
            setAvatars([]);
        }
    };

    // ── Upload custom avatar photo ──
    const handlePhotoUpload = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => setUploadPreview(e.target.result);
        reader.readAsDataURL(file);

        setUploading(true);
        setError('');
        try {
            const res = await apiService.uploadCustomAvatar(file);
            if (res.success) {
                setSelectedAvatar(res.avatar_id);
                await loadAvatars();
            } else {
                setError('Upload failed. Please try again.');
                setUploadPreview(null);
            }
        } catch (err) {
            console.error('Avatar upload failed:', err);
            setError('Upload failed. Please try again.');
            setUploadPreview(null);
        }
        setUploading(false);
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) handlePhotoUpload(file);
    };

    // ── Drag & Drop handlers ──
    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handlePhotoUpload(file);
    };

    // ── Start generation ──
    const handleGenerate = async () => {
        if (!topic.trim() && !script.trim()) return;

        setGenerating(true);
        setError('');
        setProgress(0);
        setStage('Starting...');

        try {
            const res = await apiService.generateAvatarVideo({
                topic: topic.trim() || 'Custom Script',
                script: script.trim(),
                language,
                voice,
                avatarId: selectedAvatar || 'teacher_female_1',
                style: 'educational',
                aspectRatio: '16:9',
                includeCaptions: true,
                includeBroll: false, // No B-roll — just lip-sync avatar
            });

            if (res.success && res.job_id) {
                startPolling(res.job_id);
            } else {
                setError(res.detail || 'Failed to start generation');
                setGenerating(false);
            }
        } catch (err) {
            setError(err.message || 'Failed to start generation');
            setGenerating(false);
        }
    };

    // ── Poll for status ──
    const startPolling = useCallback((id) => {
        if (pollRef.current) clearInterval(pollRef.current);

        pollRef.current = setInterval(async () => {
            try {
                const res = await apiService.checkAvatarVideoStatus(id);
                if (res.progress !== undefined) setProgress(res.progress);
                if (res.stage) setStage(res.stage);

                if (res.status === 'completed') {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                    setVideoUrl(res.video_url || '');
                    setResultData(res);
                    setGenerating(false);
                } else if (res.status === 'failed') {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                    setError(res.error || 'Video generation failed');
                    setGenerating(false);
                }
            } catch (err) {
                console.error('Status poll error:', err);
            }
        }, 3000);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    // ── Load history ──
    const loadHistory = async () => {
        try {
            const res = await apiService.listAvatarVideos();
            if (res.videos) setHistoryVideos(res.videos);
        } catch (err) {
            console.log('Could not load video history:', err.message);
        }
        setShowHistory(true);
    };

    // ── Resolve video URL ──
    const resolveVideoUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        return `${backendUrl}${url}`;
    };

    // ── Get current pipeline step ──
    const getCurrentStep = () => {
        if (progress < 15) return 0;
        if (progress < 30) return 1;
        if (progress < 55) return 2;
        if (progress < 80) return 3;
        return 4;
    };

    // ── Progress ring math ──
    const circumference = 2 * Math.PI * 60;
    const dashOffset = circumference - (progress / 100) * circumference;

    // ── Get the avatar image for the selected avatar ──
    const getSelectedAvatarImage = () => {
        if (uploadPreview && selectedAvatar?.startsWith('custom_')) return uploadPreview;
        const av = avatars.find(a => a.id === selectedAvatar);
        if (av?.available && av?.image) {
            const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
            return `${backendUrl}/static/avatars/${av.image}`;
        }
        return null;
    };

    // ── Reset for new video ──
    const startOver = () => {
        setStep(1);
        setVideoUrl('');
        setResultData(null);
        setError('');
        setProgress(0);
        setStage('');
        setGenerating(false);
        setActiveSceneIndex(0);
    };

    // ── Compute scene timings from resultData ──
    const sceneTimings = useMemo(() => {
        if (resultData?.scene_timings) return resultData.scene_timings;
        // Fallback: build from scenes + duration_estimate
        if (!resultData?.scenes) return [];
        let cumulative = 0;
        return resultData.scenes.map((sc, i) => {
            const dur = sc.duration_estimate || 10;
            const entry = {
                index: i,
                start_time: cumulative,
                end_time: cumulative + dur,
                narration: sc.narration || '',
                text_overlay: sc.text_overlay || '',
            };
            cumulative += dur;
            return entry;
        });
    }, [resultData]);

    // ── Video timeupdate handler ──
    const handleTimeUpdate = useCallback(() => {
        if (!videoRef.current || sceneTimings.length === 0) return;
        const currentTime = videoRef.current.currentTime;
        for (let i = sceneTimings.length - 1; i >= 0; i--) {
            if (currentTime >= sceneTimings[i].start_time) {
                setActiveSceneIndex(i);
                break;
            }
        }
    }, [sceneTimings]);

    // ── Auto-scroll active scene into view ──
    useEffect(() => {
        if (activeSceneRef.current) {
            activeSceneRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [activeSceneIndex]);

    // ═══════════════════════════════════════════════════════════════
    // ▸ Render
    // ═══════════════════════════════════════════════════════════════

    // ── History View ──
    if (showHistory) {
        return (
            <div className="avatar-studio">
                <header className="studio-header">
                    <h1>📁 My Videos</h1>
                    <button className="back-btn" onClick={() => setShowHistory(false)}>← Back to Studio</button>
                </header>
                <div className="studio-main" style={{ padding: '28px 32px' }}>
                    {historyVideos.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: 60 }}>
                            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎬</div>
                            <p style={{ color: '#7c7c9a' }}>No videos yet. Create your first one!</p>
                            <button className="generate-btn" style={{ maxWidth: 300, margin: '20px auto 0' }}
                                onClick={() => setShowHistory(false)}>
                                ✨ Create Video
                            </button>
                        </div>
                    ) : (
                        <div className="video-history">
                            {historyVideos.map((vid, i) => (
                                <div key={i} className="history-card" onClick={() => {
                                    setVideoUrl(vid.url);
                                    setResultData(null);
                                    setShowHistory(false);
                                    setStep(3);
                                }}>
                                    <div className="thumb">
                                        <video src={resolveVideoUrl(vid.url)} muted
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                                            onMouseEnter={e => e.target.play().catch(() => { })}
                                            onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
                                        />
                                    </div>
                                    <div className="card-info">
                                        <div style={{ fontWeight: 500, color: '#d0d0e8' }}>{vid.name}</div>
                                        <div style={{ fontSize: '0.7rem', marginTop: 4, color: '#6a6a8a' }}>
                                            {vid.created_at || ''}{vid.size ? ` · ${vid.size}` : ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="avatar-studio">
            {/* ── Header ── */}
            <header className="studio-header">
                <h1>🎬 Lip-Sync Avatar Studio</h1>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="back-btn" onClick={loadHistory}>📁 My Videos</button>
                    <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                </div>
            </header>

            {/* ── Step Indicator ── */}
            {!generating && !videoUrl && (
                <div className="step-indicator">
                    {[
                        { num: 1, label: 'Choose Avatar' },
                        { num: 2, label: 'Enter Content' },
                        { num: 3, label: 'Generate' },
                    ].map((s) => (
                        <div
                            key={s.num}
                            className={`step-dot ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}
                            onClick={() => { if (s.num < step || (s.num === 2 && selectedAvatar)) setStep(s.num); }}
                        >
                            <span className="dot">{step > s.num ? '✓' : s.num}</span>
                            <span className="step-label">{s.label}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="studio-main" style={{ padding: '28px 32px', maxWidth: videoUrl ? 1200 : 900, margin: '0 auto', width: '100%' }}>
                {error && <div className="error-banner">⚠️ {error}</div>}

                {/* ═══════════════════════════════════════════
                    STEP 1: Choose Avatar (Photo Upload)
                    ═══════════════════════════════════════════ */}
                {step === 1 && !generating && !videoUrl && (
                    <div className="fade-in">
                        <div className="glass-panel" style={{ textAlign: 'center' }}>
                            <div className="section-title" style={{ fontSize: '0.9rem', marginBottom: 20 }}>
                                Upload Your Photo or Choose an Avatar
                            </div>

                            {/* Drag-drop upload zone */}
                            <div
                                ref={dropZoneRef}
                                className={`upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {uploadPreview && selectedAvatar?.startsWith('custom_') ? (
                                    <div className="upload-preview">
                                        <img src={uploadPreview} alt="Avatar preview" />
                                        <div className="preview-overlay">
                                            <span>Click to change</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="upload-icon-large">📷</div>
                                        <div className="upload-text">
                                            {uploading ? 'Uploading...' : 'Drag & drop a photo here'}
                                        </div>
                                        <div className="upload-subtext">or click to browse • JPG, PNG</div>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileInputChange}
                                />
                            </div>

                            {/* Divider */}
                            <div className="or-divider">
                                <span>OR</span>
                            </div>

                            {/* Pre-made avatars */}
                            <div className="section-title" style={{ marginTop: 8 }}>Pre-made Avatars</div>
                            <div className="avatar-gallery" style={{ maxWidth: 500, margin: '0 auto' }}>
                                {avatars.map((av) => (
                                    <div
                                        key={av.id}
                                        className={`avatar-card ${selectedAvatar === av.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedAvatar(av.id);
                                            setUploadPreview(null);
                                        }}
                                        title={av.name}
                                    >
                                        {av.available && av.image ? (
                                            <img
                                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/static/avatars/${av.image}`}
                                                alt={`${av.name} avatar`}
                                            />
                                        ) : (
                                            <span className="avatar-placeholder">👤</span>
                                        )}
                                        <span className="avatar-name">{av.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            className="generate-btn"
                            style={{ marginTop: 20 }}
                            disabled={!selectedAvatar}
                            onClick={() => setStep(2)}
                        >
                            Next: Enter Content →
                        </button>
                    </div>
                )}

                {/* ═══════════════════════════════════════════
                    STEP 2: Enter Content
                    ═══════════════════════════════════════════ */}
                {step === 2 && !generating && !videoUrl && (
                    <div className="fade-in">
                        {/* Selected avatar preview */}
                        {getSelectedAvatarImage() && (
                            <div className="selected-avatar-preview">
                                <img src={getSelectedAvatarImage()} alt="Selected avatar" />
                                <button className="change-avatar-btn" onClick={() => setStep(1)}>Change</button>
                            </div>
                        )}

                        <div className="glass-panel">
                            <div className="section-title">What should the avatar say?</div>
                            <input
                                type="text"
                                className="topic-input"
                                placeholder="Enter a topic — e.g. 'Introduction to Machine Learning'"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>

                        <div className="glass-panel" style={{ marginTop: 16 }}>
                            <div className="section-title">Script (Optional — auto-generated from topic)</div>
                            <textarea
                                className="script-area"
                                placeholder="Paste your own script here, or leave empty to auto-generate..."
                                value={script}
                                onChange={(e) => setScript(e.target.value)}
                                rows={6}
                            />
                        </div>

                        {/* Voice & Language — side by side */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                            <div className="glass-panel">
                                <div className="section-title">Voice</div>
                                <select className="setting-select" value={voice} onChange={(e) => setVoice(e.target.value)}
                                    style={{ width: '100%' }}>
                                    {VOICES.map((v) => (
                                        <option key={v.id} value={v.id}>{v.icon} {v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="glass-panel">
                                <div className="section-title">Language</div>
                                <select className="setting-select" value={language} onChange={(e) => setLanguage(e.target.value)}
                                    style={{ width: '100%' }}>
                                    <option value="en">🇺🇸 English</option>
                                    <option value="ta">🇮🇳 Tamil</option>
                                    <option value="hi">🇮🇳 Hindi</option>
                                    <option value="es">🇪🇸 Spanish</option>
                                    <option value="fr">🇫🇷 French</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            <button className="back-btn" onClick={() => setStep(1)} style={{ flex: '0 0 auto' }}>
                                ← Back
                            </button>
                            <button
                                className="generate-btn"
                                onClick={handleGenerate}
                                disabled={!topic.trim() && !script.trim()}
                                style={{ flex: 1 }}
                            >
                                <span className="btn-icon">🚀</span>
                                Generate Lip-Sync Video
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════
                    STEP 3: Generating / Progress
                    ═══════════════════════════════════════════ */}
                {generating && (
                    <div className="progress-view fade-in generating">
                        <div className="progress-ring">
                            <svg viewBox="0 0 130 130">
                                <circle className="ring-bg" cx="65" cy="65" r="60" />
                                <circle
                                    className="ring-fill"
                                    cx="65" cy="65" r="60"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashOffset}
                                />
                            </svg>
                            <span className="progress-percent">{progress}%</span>
                        </div>

                        <div className="progress-stage">{stage}</div>

                        {getSelectedAvatarImage() && (
                            <div className="generating-avatar-preview">
                                <img src={getSelectedAvatarImage()} alt="Avatar being animated" />
                                <div className="pulse-ring" />
                            </div>
                        )}

                        <div className="progress-steps">
                            {PIPELINE_STEPS.map((s, i) => {
                                const current = getCurrentStep();
                                let cls = 'progress-step';
                                if (i < current) cls += ' done';
                                else if (i === current) cls += ' active';
                                return (
                                    <div key={s.key} className={cls}>
                                        <span className="step-icon">
                                            {i < current ? '✅' : s.icon}
                                        </span>
                                        {s.label}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════
                    STEP 3: Video Result
                    ═══════════════════════════════════════════ */}
                {!generating && videoUrl && (
                    <div className="video-preview fade-in">
                        <div className="video-text-split">
                            {/* Left: Video Player */}
                            <div className="video-player-side">
                                <div className="video-player-container">
                                    <video
                                        ref={videoRef}
                                        controls
                                        autoPlay
                                        src={resolveVideoUrl(videoUrl)}
                                        onTimeUpdate={handleTimeUpdate}
                                    />
                                </div>
                            </div>

                            {/* Right: Narration Text Panel */}
                            {sceneTimings.length > 0 && (
                                <div className="narration-panel">
                                    <div className="narration-panel-header">
                                        <span className="narration-icon">📜</span>
                                        <span>Narration</span>
                                    </div>
                                    <div className="narration-scenes">
                                        {sceneTimings.map((st, i) => (
                                            <div
                                                key={i}
                                                ref={i === activeSceneIndex ? activeSceneRef : null}
                                                className={`narration-scene-block ${i === activeSceneIndex ? 'active' : ''
                                                    } ${i < activeSceneIndex ? 'past' : ''}`}
                                                onClick={() => {
                                                    if (videoRef.current) {
                                                        videoRef.current.currentTime = st.start_time;
                                                        videoRef.current.play();
                                                    }
                                                }}
                                            >
                                                <div className="scene-label">
                                                    <span className="scene-number">Scene {i + 1}</span>
                                                    {st.text_overlay && (
                                                        <span className="scene-overlay-text">{st.text_overlay}</span>
                                                    )}
                                                </div>
                                                <div className="scene-narration-text">
                                                    {st.narration}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="video-actions">
                            <a
                                href={resolveVideoUrl(videoUrl)}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="video-action-btn primary"
                            >
                                ⬇️ Download MP4
                            </a>
                            <button className="video-action-btn" onClick={startOver}>
                                ✨ Create Another
                            </button>
                            <button className="video-action-btn" onClick={loadHistory}>
                                📁 My Videos
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
