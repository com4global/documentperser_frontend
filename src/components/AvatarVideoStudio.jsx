/**
 * Avatar Video Studio
 * ==================
 * Standalone AI Avatar Video Generation Studio
 * Similar to HeyGen / Revid.ai — converts topic/script to polished teaching video
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import './AvatarVideoStudio.css';

const PIPELINE_STEPS = [
    { key: 'script', label: 'Writing Script', icon: '📝' },
    { key: 'scenes', label: 'Planning Scenes', icon: '🎬' },
    { key: 'audio', label: 'Generating Voice', icon: '🔊' },
    { key: 'avatar', label: 'Creating Avatar', icon: '🤖' },
    { key: 'broll', label: 'Finding Footage', icon: '📹' },
    { key: 'compose', label: 'Composing Video', icon: '🎞️' },
    { key: 'upload', label: 'Uploading', icon: '☁️' },
];

const VOICES = [
    { id: 'nova', label: 'Nova (Female)', icon: '👩' },
    { id: 'alloy', label: 'Alloy (Neutral)', icon: '🤖' },
    { id: 'echo', label: 'Echo (Male)', icon: '👨' },
    { id: 'fable', label: 'Fable (Storyteller)', icon: '📖' },
    { id: 'onyx', label: 'Onyx (Deep Male)', icon: '🎙️' },
    { id: 'shimmer', label: 'Shimmer (Warm Female)', icon: '✨' },
];

const STYLES = [
    { id: 'educational', label: 'Educational', icon: '📚' },
    { id: 'presentation', label: 'Presentation', icon: '📊' },
    { id: 'story', label: 'Storytelling', icon: '📖' },
];

const ASPECT_RATIOS = [
    { id: '16:9', label: '16:9 Landscape', icon: '🖥️' },
    { id: '9:16', label: '9:16 Portrait', icon: '📱' },
    { id: '1:1', label: '1:1 Square', icon: '⬜' },
];

const DEFAULT_AVATAR_EMOJIS = {
    teacher_female_1: '👩‍🏫',
    teacher_male_1: '👨‍🏫',
    presenter_female_1: '👩‍💼',
    presenter_male_1: '👨‍💼',
    corporate_female_1: '👩‍💻',
    corporate_male_1: '👨‍💻',
};

export default function AvatarVideoStudio() {
    const navigate = useNavigate();
    const pollRef = useRef(null);

    // ── State ──
    const [view, setView] = useState('input'); // input | generating | preview | history
    const [topic, setTopic] = useState('');
    const [script, setScript] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('teacher_female_1');
    const [avatars, setAvatars] = useState([]);
    const [voice, setVoice] = useState('nova');
    const [style, setStyle] = useState('educational');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [language, setLanguage] = useState('en');
    const [includeCaptions, setIncludeCaptions] = useState(true);
    const [includeBroll, setIncludeBroll] = useState(true);

    // Generation state
    const [jobId, setJobId] = useState(null); // eslint-disable-line no-unused-vars
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState('');
    const [error, setError] = useState('');

    // Result state
    const [videoUrl, setVideoUrl] = useState('');
    const [resultData, setResultData] = useState(null);

    // History
    const [historyVideos, setHistoryVideos] = useState([]);

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
            // Use defaults
            setAvatars([
                { id: 'teacher_female_1', name: 'Professor Maya', available: false, type: 'premade' },
                { id: 'teacher_male_1', name: 'Dr. James', available: false, type: 'premade' },
                { id: 'presenter_female_1', name: 'Sarah', available: false, type: 'premade' },
                { id: 'presenter_male_1', name: 'Alex', available: false, type: 'premade' },
                { id: 'corporate_female_1', name: 'Diana', available: false, type: 'premade' },
                { id: 'corporate_male_1', name: 'Michael', available: false, type: 'premade' },
            ]);
        }
    };

    // ── Start Generation ──
    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setView('generating');
        setError('');
        setProgress(0);
        setStage('Starting...');

        try {
            const res = await apiService.generateAvatarVideo({
                topic: topic.trim(),
                language,
                voice,
                avatarId: selectedAvatar,
                style,
                aspectRatio,
                includeCaptions,
                includeBroll,
            });

            if (res.success && res.job_id) {
                setJobId(res.job_id);
                startPolling(res.job_id);
            } else {
                setError(res.detail || 'Failed to start generation');
                setView('input');
            }
        } catch (err) {
            setError(err.message || 'Failed to start generation');
            setView('input');
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
                    setView('preview');
                } else if (res.status === 'failed') {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                    setError(res.error || 'Video generation failed');
                    setView('input');
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

    // ── Upload custom avatar ──
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const res = await apiService.uploadCustomAvatar(file);
            if (res.success) {
                setSelectedAvatar(res.avatar_id);
                loadAvatars(); // Refresh list
            }
        } catch (err) {
            console.error('Avatar upload failed:', err);
        }
    };

    // ── Load history ──
    const loadHistory = async () => {
        try {
            const res = await apiService.listAvatarVideos();
            if (res.videos) setHistoryVideos(res.videos);
        } catch (err) {
            console.log('Could not load video history:', err.message);
        }
        setView('history');
    };

    // ── Resolve video URL (local paths need backend origin) ──
    const resolveVideoUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Local path like /static/avatar_video_temp/xxx.mp4 — prepend backend origin
        const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        return `${backendUrl}${url}`;
    };

    // ── Get current pipeline step ──
    const getCurrentStep = () => {
        if (progress < 15) return 0;
        if (progress < 25) return 1;
        if (progress < 40) return 2;
        if (progress < 60) return 3;
        if (progress < 75) return 4;
        if (progress < 90) return 5;
        return 6;
    };

    // ── Progress ring ──
    const circumference = 2 * Math.PI * 60;
    const dashOffset = circumference - (progress / 100) * circumference;

    return (
        <div className="avatar-studio">
            {/* ── Header ── */}
            <header className="studio-header">
                <h1>🎬 Avatar Video Studio</h1>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="back-btn" onClick={loadHistory}>📁 My Videos</button>
                    <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                </div>
            </header>

            <div className="studio-body">
                {/* ══════════════════════════════════════════════
            LEFT: Main Content Area
            ══════════════════════════════════════════════ */}
                <div className="studio-main">
                    {/* ── Input View ── */}
                    {view === 'input' && (
                        <div className="fade-in">
                            {error && (
                                <div className="error-banner">⚠️ {error}</div>
                            )}

                            <div className="glass-panel">
                                <div className="section-title">Topic</div>
                                <div className="topic-input-area">
                                    <input
                                        type="text"
                                        className="topic-input"
                                        placeholder="Enter a topic — e.g. 'Introduction to Machine Learning'"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                    />
                                </div>
                            </div>

                            <div className="glass-panel">
                                <div className="section-title">Script (Optional — Auto-generated if empty)</div>
                                <textarea
                                    className="script-area"
                                    placeholder="Paste your own script here, or leave empty to auto-generate from the topic..."
                                    value={script}
                                    onChange={(e) => setScript(e.target.value)}
                                />
                            </div>

                            <button
                                className="generate-btn"
                                onClick={handleGenerate}
                                disabled={!topic.trim()}
                            >
                                <span className="btn-icon">🚀</span>
                                Generate Avatar Video
                            </button>
                        </div>
                    )}

                    {/* ── Generating View ── */}
                    {view === 'generating' && (
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

                            <div className="progress-steps">
                                {PIPELINE_STEPS.map((step, i) => {
                                    const current = getCurrentStep();
                                    let cls = 'progress-step';
                                    if (i < current) cls += ' done';
                                    else if (i === current) cls += ' active';
                                    return (
                                        <div key={step.key} className={cls}>
                                            <span className="step-icon">
                                                {i < current ? '✅' : step.icon}
                                            </span>
                                            {step.label}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Preview View ── */}
                    {view === 'preview' && (
                        <div className="video-preview fade-in">
                            {videoUrl ? (
                                <div className="video-player-container">
                                    <video controls autoPlay src={resolveVideoUrl(videoUrl)} />
                                </div>
                            ) : (
                                <div className="glass-panel" style={{ textAlign: 'center', padding: 40 }}>
                                    <p style={{ fontSize: '1.1rem', color: '#a0a0c0' }}>
                                        Video generated but upload may still be processing.
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: '#6a6a8a', marginTop: 8 }}>
                                        Check "My Videos" in a moment.
                                    </p>
                                </div>
                            )}

                            <div className="video-actions">
                                {videoUrl && (
                                    <a
                                        href={resolveVideoUrl(videoUrl)}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="video-action-btn primary"
                                    >
                                        ⬇️ Download MP4
                                    </a>
                                )}
                                <button className="video-action-btn" onClick={() => { setView('input'); setError(''); }}>
                                    ✨ Generate Another
                                </button>
                                <button className="video-action-btn" onClick={loadHistory}>
                                    📁 My Videos
                                </button>
                            </div>

                            {resultData?.scenes && (
                                <div className="glass-panel" style={{ width: '100%', maxWidth: 800 }}>
                                    <div className="section-title">Scene Breakdown ({resultData.scenes.length} scenes)</div>
                                    {resultData.scenes.map((scene, i) => (
                                        <div key={i} style={{
                                            padding: '12px 0',
                                            borderBottom: i < resultData.scenes.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                        }}>
                                            <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, marginBottom: 4 }}>
                                                Scene {i + 1} — {scene.text_overlay || 'Untitled'}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#a0a0c0', lineHeight: 1.5 }}>
                                                {scene.narration?.substring(0, 150)}{scene.narration?.length > 150 ? '...' : ''}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── History View ── */}
                    {view === 'history' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#d0d0e8' }}>My Generated Videos</h2>
                                <button className="back-btn" onClick={() => setView('input')}>
                                    ← Back to Studio
                                </button>
                            </div>

                            {historyVideos.length === 0 ? (
                                <div className="glass-panel" style={{ textAlign: 'center', padding: 60 }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎬</div>
                                    <p style={{ color: '#7c7c9a' }}>No videos yet. Create your first one!</p>
                                    <button
                                        className="generate-btn"
                                        style={{ maxWidth: 300, margin: '20px auto 0' }}
                                        onClick={() => setView('input')}
                                    >
                                        ✨ Create Video
                                    </button>
                                </div>
                            ) : (
                                <div className="video-history">
                                    {historyVideos.map((vid, i) => (
                                        <div key={i} className="history-card" onClick={() => { setVideoUrl(vid.url); setResultData(null); setView('preview'); }}>
                                            <div className="thumb">
                                                <video
                                                    src={resolveVideoUrl(vid.url)}
                                                    muted
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                                                    onMouseEnter={e => { const v = e.target; v.play().catch(() => { }); }}
                                                    onMouseLeave={e => { const v = e.target; v.pause(); v.currentTime = 0; }}
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
                    )}
                </div>

                {/* ══════════════════════════════════════════════
            RIGHT: Settings Sidebar
            ══════════════════════════════════════════════ */}
                <div className="studio-sidebar">
                    {/* ── Avatar Selection ── */}
                    <div>
                        <div className="section-title">Choose Avatar</div>
                        <div className="avatar-gallery">
                            {avatars.map((av) => (
                                <div
                                    key={av.id}
                                    className={`avatar-card ${selectedAvatar === av.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedAvatar(av.id)}
                                    title={av.name}
                                >
                                    {av.available && av.image ? (
                                        <img src={`/static/avatars/${av.image}`} alt={av.name} />
                                    ) : (
                                        <span className="avatar-placeholder">{DEFAULT_AVATAR_EMOJIS[av.id] || '👤'}</span>
                                    )}
                                    <span className="avatar-name">{av.name}</span>
                                </div>
                            ))}

                            {/* Upload custom avatar */}
                            <label className="avatar-card upload-card" htmlFor="avatar-upload">
                                <span className="upload-icon">➕</span>
                                <span>Upload</span>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleAvatarUpload}
                                />
                            </label>
                        </div>
                    </div>

                    {/* ── Voice ── */}
                    <div className="setting-group">
                        <span className="setting-label">Voice</span>
                        <select className="setting-select" value={voice} onChange={(e) => setVoice(e.target.value)}>
                            {VOICES.map((v) => (
                                <option key={v.id} value={v.id}>{v.icon} {v.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* ── Style ── */}
                    <div className="setting-group">
                        <span className="setting-label">Video Style</span>
                        <select className="setting-select" value={style} onChange={(e) => setStyle(e.target.value)}>
                            {STYLES.map((s) => (
                                <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* ── Aspect Ratio ── */}
                    <div className="setting-group">
                        <span className="setting-label">Aspect Ratio</span>
                        <select className="setting-select" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                            {ASPECT_RATIOS.map((ar) => (
                                <option key={ar.id} value={ar.id}>{ar.icon} {ar.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* ── Language ── */}
                    <div className="setting-group">
                        <span className="setting-label">Language</span>
                        <select className="setting-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="en">🇺🇸 English</option>
                            <option value="ta">🇮🇳 Tamil</option>
                            <option value="hi">🇮🇳 Hindi</option>
                            <option value="es">🇪🇸 Spanish</option>
                            <option value="fr">🇫🇷 French</option>
                        </select>
                    </div>

                    {/* ── Toggles ── */}
                    <div className="setting-group">
                        <div className="setting-toggle">
                            <span className="setting-label">Captions</span>
                            <div
                                className={`toggle-switch ${includeCaptions ? 'active' : ''}`}
                                onClick={() => setIncludeCaptions(!includeCaptions)}
                            />
                        </div>
                        <div className="setting-toggle">
                            <span className="setting-label">B-Roll Footage</span>
                            <div
                                className={`toggle-switch ${includeBroll ? 'active' : ''}`}
                                onClick={() => setIncludeBroll(!includeBroll)}
                            />
                        </div>
                    </div>

                    {/* ── Cost Estimate ── */}
                    <div className="glass-panel" style={{ padding: 16, marginTop: 'auto' }}>
                        <div className="section-title" style={{ marginBottom: 8 }}>Estimated Cost</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399' }}>~$0.28</div>
                        <div style={{ fontSize: '0.75rem', color: '#6a6a8a', marginTop: 4 }}>
                            Script + Audio + Avatar + Composition
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
