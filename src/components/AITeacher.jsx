import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { APP_CONFIG } from '../utils/constants';
import '../Styles/AITeacher.css';

const AITeacher = ({ onClose }) => {
    const { t, language } = useLanguage();
    const [view, setView] = useState('documents'); // documents | chapters | topics | mode-select | loading | lesson | video-loading | video
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState('');
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [topics, setTopics] = useState([]);
    const [lesson, setLesson] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [error, setError] = useState('');
    const [visibleBubbles, setVisibleBubbles] = useState(0);

    // Quiz state (per-question tracking)
    const [quizAnswers, setQuizAnswers] = useState({});
    const [showExplanations, setShowExplanations] = useState({});

    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Q&A state
    const [qaQuestion, setQaQuestion] = useState('');
    const [qaAnswer, setQaAnswer] = useState('');
    const [qaLoading, setQaLoading] = useState(false);

    // Video state
    const [videoStatus, setVideoStatus] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [videoId, setVideoId] = useState('');
    const [videoError, setVideoError] = useState('');
    const [cachedVideoUrl, setCachedVideoUrl] = useState('');
    const videoPollingRef = useRef(null);

    // TTS Avatar state
    const [ttsSentences, setTtsSentences] = useState([]);
    const [ttsAudioUrl, setTtsAudioUrl] = useState('');
    const [ttsScript, setTtsScript] = useState('');
    const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
    const [isTtsPlaying, setIsTtsPlaying] = useState(false);
    const audioRef = useRef(null);
    const sentenceTimerRef = useRef(null);
    const dialogueAudioRef = useRef(null);

    const dialogueEndRef = useRef(null);

    // Load documents on mount
    useEffect(() => {
        loadDocuments();
    }, []);

    // Animate dialogue bubbles + auto-play audio sequentially (wait for each to finish)
    useEffect(() => {
        if (view === 'lesson' && lesson?.dialogue) {
            setVisibleBubbles(0);
            const total = lesson.dialogue.length;
            const audioUrls = lesson.audio_urls || [];
            let cancelled = false;

            const playSequence = async () => {
                for (let i = 0; i < total; i++) {
                    if (cancelled) return;
                    setVisibleBubbles(i + 1);

                    const audioUrl = audioUrls[i];
                    if (audioUrl) {
                        // Play audio and wait for it to finish
                        await new Promise((resolve) => {
                            if (dialogueAudioRef.current) {
                                dialogueAudioRef.current.pause();
                            }
                            const fullUrl = audioUrl.startsWith('http') ? audioUrl : `${APP_CONFIG.API_URL}${audioUrl}`;
                            const audio = new Audio(fullUrl);
                            dialogueAudioRef.current = audio;
                            audio.onended = resolve;
                            audio.onerror = resolve; // Move on if audio fails
                            audio.play().catch(() => resolve());
                        });
                        // Small pause between speakers
                        if (!cancelled) await new Promise(r => setTimeout(r, 600));
                    } else {
                        // No audio — use a short delay
                        await new Promise(r => setTimeout(r, 2000));
                    }
                }
            };

            playSequence();
            return () => { cancelled = true; };
        }
    }, [view, lesson]);

    // Scroll to latest bubble
    useEffect(() => {
        if (dialogueEndRef.current) {
            dialogueEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [visibleBubbles]);

    // Cleanup video polling and TTS timer on unmount
    useEffect(() => {
        return () => {
            if (videoPollingRef.current) clearInterval(videoPollingRef.current);
            if (sentenceTimerRef.current) clearInterval(sentenceTimerRef.current);
        };
    }, []);

    const loadDocuments = async () => {
        setLoadingDocs(true);
        try {
            const result = await apiService.getEdtechDocuments();
            if (result.success && result.documents) {
                setDocuments(result.documents);
            }
        } catch (err) {
            console.error('Failed to load documents:', err);
        }
        setLoadingDocs(false);
    };

    const selectDocument = async (docName) => {
        setSelectedDoc(docName);
        setView('chapters');
        setLoadingChapters(true);
        setChapters([]);
        setSelectedChapter(null);
        setTopics([]);
        setError('');

        try {
            const result = await apiService.getEdtechChapters(docName);
            if (result.success && result.chapters && result.chapters.length > 0) {
                setChapters(result.chapters);
            } else {
                setError(result.message || 'No chapters found in this document.');
            }
        } catch (err) {
            console.error('Failed to load chapters:', err);
            setError(`Error loading chapters: ${err.message || 'Unknown error'}`);
        }
        setLoadingChapters(false);
    };

    const selectChapter = async (chapter) => {
        setSelectedChapter(chapter);
        setView('topics');
        setLoadingTopics(true);
        setTopics([]);
        setError('');

        try {
            const result = await apiService.getEdtechTopics(selectedDoc, language, chapter.name);
            if (result.success && result.topics && result.topics.length > 0) {
                setTopics(result.topics);
            } else {
                setError(result.message || 'No topics could be extracted from this chapter.');
            }
        } catch (err) {
            console.error('Failed to load topics:', err);
            const msg = err.message || 'Failed to extract topics';
            if (msg.includes('timeout') || msg.includes('aborted') || msg.includes('Failed to fetch')) {
                setError('Topic extraction took too long. Please try again.');
            } else {
                setError(`Error: ${msg}`);
            }
        }
        setLoadingTopics(false);
    };

    // Select a topic → show mode selection (Conversation vs Video)
    const selectTopic = async (topicTitle) => {
        setSelectedTopic(topicTitle);
        setView('mode-select');
        setVideoError('');
        setCachedVideoUrl('');

        // Check if a cached video exists for this topic
        try {
            const cacheResult = await apiService.checkVideoCache(topicTitle, selectedDoc);
            if (cacheResult.has_video && cacheResult.video_url) {
                setCachedVideoUrl(cacheResult.video_url);
            }
        } catch (err) {
            console.log('Video cache check skipped:', err.message);
        }
    };

    const generateLesson = async (topicTitle) => {
        setView('loading');
        setQuizAnswers({});
        setShowExplanations({});
        setQaAnswer('');

        try {
            const result = await apiService.generateLesson(topicTitle, language);
            if (result.success && result.lesson) {
                setLesson(result.lesson);
                setView('lesson');
            } else {
                alert(result.detail || 'Failed to generate lesson');
                setView('mode-select');
            }
        } catch (err) {
            console.error('Lesson generation failed:', err);
            alert('Failed to generate lesson. Please try again.');
            setView('mode-select');
        }
    };

    // Start TTS video generation (replaces HeyGen for default)
    const startVideoGeneration = async () => {
        setView('video-loading');
        setVideoStatus('generating');
        setVideoError('');
        setTtsSentences([]);
        setTtsAudioUrl('');
        setTtsScript('');
        setCurrentSentenceIdx(0);
        setIsTtsPlaying(false);

        try {
            const result = await apiService.generateTTSVideo(selectedTopic, selectedDoc, language);

            if (result.success && result.status === 'completed') {
                setTtsSentences(result.sentences || []);
                setTtsScript(result.script || '');
                const audioUrl = result.audio_url.startsWith('http') ? result.audio_url : `${APP_CONFIG.API_URL}${result.audio_url}`;
                setTtsAudioUrl(audioUrl);
                setVideoStatus('completed');
                setView('tts-video');
            } else {
                setVideoStatus('failed');
                setVideoError(result.error || 'TTS generation failed');
            }
        } catch (err) {
            console.error('TTS video generation failed:', err);
            setVideoStatus('failed');
            setVideoError(err.message || 'TTS video generation failed');
        }
    };

    // TTS playback controls
    const handleTtsPlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsTtsPlaying(true);
            startSentenceSync();
        }
    };

    const handleTtsPause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsTtsPlaying(false);
            if (sentenceTimerRef.current) clearInterval(sentenceTimerRef.current);
        }
    };

    const handleTtsRestart = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentSentenceIdx(0);
            audioRef.current.play();
            setIsTtsPlaying(true);
            startSentenceSync();
        }
    };

    // Sync subtitles with audio playback
    const startSentenceSync = () => {
        if (sentenceTimerRef.current) clearInterval(sentenceTimerRef.current);
        if (!audioRef.current || ttsSentences.length === 0) return;

        const audio = audioRef.current;

        sentenceTimerRef.current = setInterval(() => {
            if (!audio.duration || audio.paused) return;
            const progress = audio.currentTime / audio.duration;
            const sentenceIdx = Math.min(
                Math.floor(progress * ttsSentences.length),
                ttsSentences.length - 1
            );
            setCurrentSentenceIdx(sentenceIdx);
        }, 300);
    };

    // Poll HeyGen for video completion (every 15 seconds) — kept for HeyGen fallback
    // eslint-disable-next-line no-unused-vars
    const startVideoPolling = (vId) => {
        if (videoPollingRef.current) clearInterval(videoPollingRef.current);

        videoPollingRef.current = setInterval(async () => {
            try {
                const status = await apiService.checkVideoStatus(vId, selectedTopic, selectedDoc);

                if (status.status === 'completed' && status.video_url) {
                    clearInterval(videoPollingRef.current);
                    videoPollingRef.current = null;
                    setVideoUrl(status.video_url);
                    setVideoStatus('completed');
                    setView('video');
                } else if (status.status === 'failed') {
                    clearInterval(videoPollingRef.current);
                    videoPollingRef.current = null;
                    setVideoStatus('failed');
                    setVideoError(status.error || 'Video generation failed');
                }
                // else still processing — keep polling
            } catch (err) {
                console.error('Video polling error:', err);
            }
        }, 15000); // Poll every 15 seconds
    };

    const handleQuizAnswer = (quizIndex, optionIndex) => {
        if (quizAnswers[quizIndex] !== undefined) return;
        setQuizAnswers(prev => ({ ...prev, [quizIndex]: optionIndex }));
        setShowExplanations(prev => ({ ...prev, [quizIndex]: true }));
    };

    const handleAskQuestion = async () => {
        if (!qaQuestion.trim() || qaLoading) return;
        setQaLoading(true);
        setQaAnswer('');

        try {
            const result = await apiService.askEdtechQuestion(qaQuestion, selectedTopic, language);
            if (result.success) {
                setQaAnswer(result.answer);
            }
        } catch (err) {
            console.error('Q&A failed:', err);
            setQaAnswer('Sorry, I could not find an answer. Please try rephrasing your question.');
        }
        setQaLoading(false);
    };

    // ── Dialogue audio playback ──
    const playDialogueAudio = (audioUrl) => {
        if (dialogueAudioRef.current) {
            dialogueAudioRef.current.pause();
        }
        const fullUrl = audioUrl.startsWith('http') ? audioUrl : `${APP_CONFIG.API_URL}${audioUrl}`;
        const audio = new Audio(fullUrl);
        dialogueAudioRef.current = audio;
        audio.play().catch(err => console.log('Audio autoplay blocked:', err.message));
    };

    // ── TTS Video avatar theme (varies per topic) ──
    const AVATAR_THEMES = [
        { className: 'theme-purple', label: '👩‍🏫 AI Teacher' },
        { className: 'theme-blue', label: '🧑‍🔬 Professor Bot' },
        { className: 'theme-green', label: '🌟 Study Buddy' },
        { className: 'theme-orange', label: '🎯 Mentor AI' },
        { className: 'theme-pink', label: '✨ Guide' },
        { className: 'theme-teal', label: '🔭 Explorer' },
    ];

    const getAvatarTheme = () => {
        if (!selectedTopic) return AVATAR_THEMES[0];
        let hash = 0;
        for (let i = 0; i < selectedTopic.length; i++) {
            hash = ((hash << 5) - hash) + selectedTopic.charCodeAt(i);
            hash |= 0;
        }
        return AVATAR_THEMES[Math.abs(hash) % AVATAR_THEMES.length];
    };

    const getTeacherIndex = (speakerName) => {
        if (!lesson?.teachers) return 0;
        const idx = lesson.teachers.findIndex(tc => tc.name === speakerName);
        return idx >= 0 ? idx : 0;
    };

    const getTeacherEmoji = (speakerName) => {
        if (!lesson?.teachers) return '👩‍🏫';
        const teacher = lesson.teachers.find(tc => tc.name === speakerName);
        return teacher?.emoji || '👩‍🏫';
    };

    const getFileIcon = (fileType) => {
        if (!fileType) return '📄';
        if (fileType.includes('pdf')) return '📕';
        if (fileType.includes('doc')) return '📘';
        if (fileType.includes('txt')) return '📝';
        if (fileType.includes('csv') || fileType.includes('excel')) return '📊';
        return '📄';
    };

    return (
        <div className="ai-teacher-overlay" onClick={onClose}>
            <div className={`ai-teacher-modal ${isFullscreen ? 'ai-teacher-fullscreen' : ''}`} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="ai-teacher-header">
                    <div className="ai-teacher-header-left">
                        <div className="ai-teacher-header-icon">🎓</div>
                        <div>
                            <h2>{t('aiTeacherTitle') || 'AI Teacher'}</h2>
                            <p>{t('aiTeacherSubtitle') || 'Interactive Learning from Your Documents'}</p>
                        </div>
                    </div>
                    <div className="ai-teacher-header-actions">
                        <button
                            className="ai-teacher-fullscreen-btn"
                            onClick={() => setIsFullscreen(prev => !prev)}
                            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? '⊡' : '⊞'}
                        </button>
                        <button className="ai-teacher-close" onClick={onClose}>✕</button>
                    </div>
                </div>

                <div className="ai-teacher-content">

                    {/* ===== STEP 1: DOCUMENTS VIEW ===== */}
                    {view === 'documents' && (
                        <div>
                            <div className="ai-teacher-topics-title">
                                📂 {t('selectDocument') || 'Select a Document to Learn From'}
                            </div>
                            <p className="ai-teacher-topics-subtitle">
                                {t('chooseDocDesc') || 'Choose a processed document to generate interactive lessons'}
                            </p>

                            {loadingDocs ? (
                                <div className="ai-teacher-loading">
                                    <div className="ai-teacher-loading-spinner"></div>
                                    <h3>{t('loadingDocs') || 'Loading Documents...'}</h3>
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="ai-teacher-empty">
                                    <div className="ai-teacher-empty-icon">📭</div>
                                    <h4>{t('noDocsFound') || 'No Processed Documents'}</h4>
                                    <p>{t('uploadDocsFirst') || 'Please upload and process documents in the Admin Panel first'}</p>
                                </div>
                            ) : (
                                <div className="ai-teacher-docs-grid">
                                    {documents.map((doc, idx) => (
                                        <div
                                            key={idx}
                                            className="ai-teacher-doc-card"
                                            onClick={() => selectDocument(doc.filename)}
                                        >
                                            <div className="ai-teacher-doc-icon">
                                                {getFileIcon(doc.file_type)}
                                            </div>
                                            <div className="ai-teacher-doc-info">
                                                <div className="ai-teacher-doc-name">{doc.filename}</div>
                                                <div className="ai-teacher-doc-meta">
                                                    {doc.chunks_created > 0 && (
                                                        <span>📦 {doc.chunks_created} chunks</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ai-teacher-doc-arrow">→</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== STEP 2: CHAPTERS VIEW ===== */}
                    {view === 'chapters' && (
                        <div>
                            <button className="ai-teacher-back-btn" onClick={() => setView('documents')}>
                                ← {t('backToDocs') || 'Back to Documents'}
                            </button>
                            <div className="ai-teacher-topics-title">
                                📖 {t('selectChapter') || 'Chapters in'}: <span style={{ color: '#a78bfa' }}>{selectedDoc}</span>
                            </div>
                            <p className="ai-teacher-topics-subtitle">
                                {t('chapterDesc') || 'Select a chapter to explore its topics in detail'}
                            </p>

                            {loadingChapters ? (
                                <div className="ai-teacher-loading">
                                    <div className="ai-teacher-loading-spinner"></div>
                                    <h3>{t('loadingChapters') || 'Loading Chapters...'}</h3>
                                    <p>{t('scanningDoc') || 'Scanning document structure...'}</p>
                                </div>
                            ) : error ? (
                                <div className="ai-teacher-empty">
                                    <div className="ai-teacher-empty-icon">⚠️</div>
                                    <h4>Failed to Load Chapters</h4>
                                    <p style={{ color: '#f87171', marginBottom: '12px' }}>{error}</p>
                                    <button
                                        className="ai-teacher-back-btn"
                                        onClick={() => selectDocument(selectedDoc)}
                                        style={{ display: 'inline-block', marginTop: '8px' }}
                                    >
                                        🔄 Retry
                                    </button>
                                </div>
                            ) : chapters.length === 0 ? (
                                <div className="ai-teacher-empty">
                                    <div className="ai-teacher-empty-icon">📭</div>
                                    <h4>{t('noChaptersFound') || 'No Chapters Found'}</h4>
                                    <p>This document does not have detectable chapter structure.</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="ai-teacher-chapters-summary">
                                        📚 {chapters.length} {t('chaptersDetected') || 'chapters detected'}
                                    </div>
                                    <div className="ai-teacher-chapters-grid">
                                        {chapters.map((ch, idx) => (
                                            <div
                                                key={idx}
                                                className="ai-teacher-chapter-card"
                                                onClick={() => selectChapter(ch)}
                                            >
                                                <div className="ai-teacher-chapter-number">
                                                    {idx + 1}
                                                </div>
                                                <div className="ai-teacher-chapter-info">
                                                    <div className="ai-teacher-chapter-name">{ch.name}</div>
                                                    <div className="ai-teacher-chapter-meta">
                                                        {ch.page_start > 0 && (
                                                            <span>📄 Pages {ch.page_start}–{ch.page_end}</span>
                                                        )}
                                                        <span>📦 {ch.chunk_count} chunks</span>
                                                    </div>
                                                    {ch.preview && (
                                                        <div className="ai-teacher-chapter-preview">
                                                            {ch.preview}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ai-teacher-doc-arrow">→</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== STEP 3: TOPICS VIEW ===== */}
                    {view === 'topics' && (
                        <div>
                            <button className="ai-teacher-back-btn" onClick={() => setView('chapters')}>
                                ← {t('backToChapters') || 'Back to Chapters'}
                            </button>
                            <div className="ai-teacher-topics-title">
                                📚 {t('selectTopic') || 'Topics from'}: <span style={{ color: '#a78bfa' }}>{selectedChapter?.name || selectedDoc}</span>
                            </div>
                            <p className="ai-teacher-topics-subtitle">
                                {selectedChapter ? `Detailed topics from "${selectedChapter.name}" (${selectedChapter.chunk_count} chunks)` : 'Topics extracted from this document'}
                            </p>

                            {loadingTopics ? (
                                <div className="ai-teacher-loading">
                                    <div className="ai-teacher-loading-spinner"></div>
                                    <h3>{t('extractingTopics') || 'Extracting Topics...'}</h3>
                                    <p>Analyzing chapter content and identifying teaching topics...</p>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '8px' }}>
                                        This may take 15-30 seconds...
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="ai-teacher-empty">
                                    <div className="ai-teacher-empty-icon">⚠️</div>
                                    <h4>Topic Extraction Failed</h4>
                                    <p style={{ color: '#f87171', marginBottom: '12px' }}>{error}</p>
                                    <button
                                        className="ai-teacher-back-btn"
                                        onClick={() => selectChapter(selectedChapter)}
                                        style={{ display: 'inline-block', marginTop: '8px' }}
                                    >
                                        🔄 Retry
                                    </button>
                                </div>
                            ) : topics.length === 0 ? (
                                <div className="ai-teacher-empty">
                                    <div className="ai-teacher-empty-icon">🔍</div>
                                    <h4>{t('noTopicsFound') || 'No Topics Found'}</h4>
                                    <p>{t('noTopicsDesc') || 'Could not extract topics from this chapter.'}</p>
                                </div>
                            ) : (
                                <div className="ai-teacher-topics-grid">
                                    {topics.map((topic, idx) => (
                                        <div
                                            key={idx}
                                            className="ai-teacher-topic-card"
                                            onClick={() => selectTopic(topic.title)}
                                        >
                                            <div className="ai-teacher-topic-title">{topic.title}</div>
                                            <div className="ai-teacher-topic-desc">{topic.description}</div>
                                            {topic.key_concepts && (
                                                <div className="ai-teacher-topic-concepts">
                                                    {topic.key_concepts.slice(0, 4).map((c, i) => (
                                                        <span key={i} className="ai-teacher-concept-tag">{c}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {topic.difficulty && (
                                                <span className={`ai-teacher-topic-difficulty ${topic.difficulty}`}>
                                                    {topic.difficulty}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== MODE SELECTION VIEW ===== */}
                    {view === 'mode-select' && (
                        <div>
                            <button className="ai-teacher-back-btn" onClick={() => setView('topics')}>
                                ← {t('backToTopics') || 'Back to Topics'}
                            </button>
                            <div className="ai-teacher-topics-title">
                                🎯 {t('chooseLearningMode') || 'Choose Learning Mode'}
                            </div>
                            <p className="ai-teacher-topics-subtitle">
                                {selectedTopic}
                            </p>

                            <div className="ai-teacher-mode-grid">
                                {/* Option 1: Interactive Conversation */}
                                <div
                                    className="ai-teacher-mode-card"
                                    onClick={() => generateLesson(selectedTopic)}
                                >
                                    <div className="ai-teacher-mode-icon">🎙️</div>
                                    <div className="ai-teacher-mode-info">
                                        <div className="ai-teacher-mode-title">
                                            {t('interactiveConversation') || 'Interactive Conversation'}
                                        </div>
                                        <div className="ai-teacher-mode-desc">
                                            {t('conversationDesc') || 'Two AI teachers discuss the topic in an engaging dialogue with quiz and Q&A'}
                                        </div>
                                    </div>
                                    <div className="ai-teacher-doc-arrow">→</div>
                                </div>

                                {/* Option 2: Interactive Video */}
                                <div
                                    className="ai-teacher-mode-card ai-teacher-mode-video"
                                    onClick={startVideoGeneration}
                                >
                                    <div className="ai-teacher-mode-icon">🎬</div>
                                    <div className="ai-teacher-mode-info">
                                        <div className="ai-teacher-mode-title">
                                            {t('interactiveVideo') || 'Interactive Video'}
                                            {cachedVideoUrl && (
                                                <span className="ai-teacher-cached-badge">✅ Ready</span>
                                            )}
                                        </div>
                                        <div className="ai-teacher-mode-desc">
                                            {cachedVideoUrl
                                                ? (t('videoReadyDesc') || 'AI-generated teaching video is ready to play!')
                                                : (t('videoDesc') || 'AI avatar explains the topic in a professional teaching video (2-5 min to generate)')}
                                        </div>
                                    </div>
                                    <div className="ai-teacher-doc-arrow">→</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== LOADING VIEW (Conversation) ===== */}
                    {view === 'loading' && (
                        <div className="ai-teacher-loading">
                            <div className="ai-teacher-loading-spinner"></div>
                            <h3>🎙️ {t('generatingLesson') || 'Generating AI Lesson...'}</h3>
                            <p>{t('creatingDialogue') || 'Creating an engaging dialogue between AI teachers'}</p>
                        </div>
                    )}

                    {/* ===== VIDEO LOADING VIEW ===== */}
                    {view === 'video-loading' && (
                        <div className="ai-teacher-loading">
                            <button className="ai-teacher-back-btn" onClick={() => {
                                if (videoPollingRef.current) clearInterval(videoPollingRef.current);
                                setView('mode-select');
                            }}>
                                ← {t('backToModes') || 'Back'}
                            </button>
                            {videoStatus === 'failed' ? (
                                <>
                                    <div className="ai-teacher-empty-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                                    <h3 style={{ color: '#f87171' }}>{t('videoFailed') || 'Video Generation Failed'}</h3>
                                    <p style={{ color: '#94a3b8', marginBottom: '16px' }}>{videoError}</p>
                                    <button className="ai-teacher-qa-btn" onClick={startVideoGeneration}>
                                        🔄 {t('retry') || 'Try Again'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="ai-teacher-loading-spinner"></div>
                                    <h3>🎬 {t('generatingScript') || 'Generating AI Teaching Video...'}</h3>
                                    <p>{t('ttsWait') || 'Creating script and generating audio... (5-10 seconds)'}</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* ===== TTS AVATAR VIDEO PLAYER ===== */}
                    {view === 'tts-video' && ttsAudioUrl && (
                        <div className="ai-teacher-lesson">
                            <button className="ai-teacher-back-btn" onClick={() => {
                                handleTtsPause();
                                setView('mode-select');
                            }}>
                                ← {t('backToModes') || 'Back to Learning Modes'}
                            </button>

                            <div className="ai-teacher-lesson-title">
                                🎬 {selectedTopic}
                            </div>

                            {/* Avatar + Subtitle Container */}
                            <div className={`tts-avatar-stage ${getAvatarTheme().className}`}>
                                {/* Animated Avatar */}
                                <div className={`tts-avatar ${isTtsPlaying ? 'speaking' : ''}`}>
                                    <div className="tts-avatar-body">
                                        <div className="tts-avatar-head">
                                            <div className="tts-avatar-face">
                                                <div className="tts-avatar-eyes">
                                                    <div className="tts-avatar-eye left"></div>
                                                    <div className="tts-avatar-eye right"></div>
                                                </div>
                                                <div className={`tts-avatar-mouth ${isTtsPlaying ? 'talking' : ''}`}></div>
                                            </div>
                                        </div>
                                        <div className="tts-avatar-torso"></div>
                                    </div>
                                    <div className="tts-avatar-label">👩‍🏫 AI Teacher</div>
                                </div>

                                {/* Subtitle Display */}
                                <div className="tts-subtitle-card">
                                    <div className="tts-subtitle-text">
                                        {ttsSentences[currentSentenceIdx] || '...'}
                                    </div>
                                    <div className="tts-subtitle-counter">
                                        {currentSentenceIdx + 1} / {ttsSentences.length}
                                    </div>
                                </div>
                            </div>

                            {/* Hidden audio element */}
                            <audio
                                ref={audioRef}
                                src={ttsAudioUrl}
                                onEnded={() => {
                                    setIsTtsPlaying(false);
                                    if (sentenceTimerRef.current) clearInterval(sentenceTimerRef.current);
                                    setCurrentSentenceIdx(ttsSentences.length - 1);
                                }}
                                onPlay={() => { setIsTtsPlaying(true); startSentenceSync(); }}
                                onPause={() => { setIsTtsPlaying(false); }}
                            />

                            {/* Playback Controls */}
                            <div className="tts-controls">
                                <button className="tts-control-btn" onClick={handleTtsRestart} title="Restart">
                                    ⏮️
                                </button>
                                {isTtsPlaying ? (
                                    <button className="tts-control-btn tts-play-btn" onClick={handleTtsPause} title="Pause">
                                        ⏸️
                                    </button>
                                ) : (
                                    <button className="tts-control-btn tts-play-btn" onClick={handleTtsPlay} title="Play">
                                        ▶️
                                    </button>
                                )}
                            </div>

                            {/* Full script toggle */}
                            <details className="tts-script-details">
                                <summary>📝 View Full Script</summary>
                                <div className="tts-script-text">{ttsScript}</div>
                            </details>

                            <div className="ai-teacher-video-actions">
                                <button
                                    className="ai-teacher-qa-btn"
                                    onClick={() => generateLesson(selectedTopic)}
                                >
                                    🎙️ {t('alsoViewConversation') || 'Also View as Conversation'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== VIDEO PLAYER VIEW (HeyGen fallback) ===== */}
                    {view === 'video' && videoUrl && (
                        <div className="ai-teacher-lesson">
                            <button className="ai-teacher-back-btn" onClick={() => setView('mode-select')}>
                                ← {t('backToModes') || 'Back to Learning Modes'}
                            </button>

                            <div className="ai-teacher-lesson-title">
                                🎬 {selectedTopic}
                            </div>
                            <div className="ai-teacher-lesson-source">
                                📄 {t('sourceDoc') || 'Source'}: {selectedDoc}
                            </div>

                            <div className="ai-teacher-video-container">
                                <video
                                    className="ai-teacher-video-player"
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    playsInline
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            <div className="ai-teacher-video-actions">
                                <button
                                    className="ai-teacher-qa-btn"
                                    onClick={() => generateLesson(selectedTopic)}
                                >
                                    🎙️ {t('alsoViewConversation') || 'Also View as Conversation'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== LESSON VIEW ===== */}
                    {view === 'lesson' && lesson && (
                        <div className="ai-teacher-lesson">
                            <button className="ai-teacher-back-btn" onClick={() => setView('mode-select')}>
                                ← {t('backToModes') || 'Back to Learning Modes'}
                            </button>

                            <div className="ai-teacher-lesson-title">
                                🎬 {lesson.title || selectedTopic}
                            </div>
                            <div className="ai-teacher-lesson-source">
                                📄 {t('sourceDoc') || 'Source'}: {selectedDoc}
                            </div>

                            {/* Teachers */}
                            {lesson.teachers && (
                                <div className="ai-teacher-teachers">
                                    {lesson.teachers.map((teacher, idx) => (
                                        <div key={idx} className="ai-teacher-avatar">
                                            <span className="ai-teacher-avatar-emoji">{teacher.emoji}</span>
                                            <div>
                                                <div className="ai-teacher-avatar-name">{teacher.name}</div>
                                                <div className="ai-teacher-avatar-role">{teacher.role}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Dialogue Bubbles */}
                            <div className="ai-teacher-dialogue">
                                {lesson.dialogue && lesson.dialogue.slice(0, visibleBubbles).map((msg, idx) => {
                                    const speakerIdx = getTeacherIndex(msg.speaker);
                                    return (
                                        <div key={idx} className={`ai-teacher-bubble speaker-${speakerIdx}`}>
                                            <div className="ai-teacher-bubble-avatar">
                                                {getTeacherEmoji(msg.speaker)}
                                            </div>
                                            <div className="ai-teacher-bubble-content">
                                                <div className="ai-teacher-bubble-name">
                                                    {msg.speaker}
                                                    {lesson.audio_urls?.[idx] && (
                                                        <button
                                                            className="ai-teacher-bubble-speaker-btn"
                                                            onClick={() => playDialogueAudio(lesson.audio_urls[idx])}
                                                            title="Replay audio"
                                                        >
                                                            🔊
                                                        </button>
                                                    )}
                                                </div>
                                                {msg.type && (
                                                    <span className={`ai-teacher-bubble-type ${msg.type}`}>
                                                        {msg.type === 'aha_moment' ? '💡 Aha!' : msg.type}
                                                    </span>
                                                )}
                                                <div>{msg.text}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={dialogueEndRef} />
                            </div>

                            {/* Show quiz + takeaways only after all bubbles visible */}
                            {visibleBubbles >= (lesson.dialogue?.length || 0) && (
                                <>
                                    {/* Key Takeaways */}
                                    {lesson.key_takeaways && lesson.key_takeaways.length > 0 && (
                                        <div className="ai-teacher-takeaways">
                                            <div className="ai-teacher-takeaways-title">
                                                ✨ {t('keyTakeaways') || 'Key Takeaways'}
                                            </div>
                                            {lesson.key_takeaways.map((takeaway, idx) => (
                                                <div key={idx} className="ai-teacher-takeaway-item">
                                                    <span className="ai-teacher-takeaway-icon">✅</span>
                                                    <span>{takeaway}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Quiz — supports both array (new) and single object (legacy) */}
                                    {lesson.quiz && (
                                        <div className="ai-teacher-quiz">
                                            <div className="ai-teacher-quiz-title">
                                                🧠 {t('quickQuiz') || 'Quick Quiz'}
                                            </div>
                                            {(Array.isArray(lesson.quiz) ? lesson.quiz : [lesson.quiz]).map((q, qIdx) => (
                                                <div key={qIdx} className="ai-teacher-quiz-block">
                                                    <div className="ai-teacher-quiz-question">
                                                        <span className="ai-teacher-quiz-number">Q{qIdx + 1}.</span> {q.question}
                                                    </div>
                                                    <div className="ai-teacher-quiz-options">
                                                        {q.options?.map((option, idx) => {
                                                            let className = 'ai-teacher-quiz-option';
                                                            if (quizAnswers[qIdx] !== undefined) {
                                                                className += ' disabled';
                                                                if (idx === q.correct) className += ' correct';
                                                                else if (idx === quizAnswers[qIdx]) className += ' wrong';
                                                            }
                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    className={className}
                                                                    onClick={() => handleQuizAnswer(qIdx, idx)}
                                                                    disabled={quizAnswers[qIdx] !== undefined}
                                                                >
                                                                    {option}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {showExplanations[qIdx] && (
                                                        <div className="ai-teacher-quiz-explanation">
                                                            {quizAnswers[qIdx] === q.correct ? '🎉 ' : '💡 '}
                                                            {q.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Q&A Section */}
                                    <div className="ai-teacher-qa">
                                        <div className="ai-teacher-qa-title">
                                            💬 {t('askQuestion') || 'Ask a Question'}
                                        </div>
                                        <div className="ai-teacher-qa-input-row">
                                            <input
                                                type="text"
                                                className="ai-teacher-qa-input"
                                                placeholder={t('typeYourQuestion') || 'Type your question about this topic...'}
                                                value={qaQuestion}
                                                onChange={(e) => setQaQuestion(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                                            />
                                            <button
                                                className="ai-teacher-qa-btn"
                                                onClick={handleAskQuestion}
                                                disabled={qaLoading || !qaQuestion.trim()}
                                            >
                                                {qaLoading ? '...' : (t('askBtn') || 'Ask')}
                                            </button>
                                        </div>
                                        {qaAnswer && (
                                            <div className="ai-teacher-qa-answer">
                                                {qaAnswer}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AITeacher;
