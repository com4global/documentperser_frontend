import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { APP_CONFIG } from '../utils/constants';
import '../Styles/AITeacher.css';

const AITeacher = ({ onClose, initialDoc = '', initialTopic = '', onActivityComplete = null }) => {
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
    const [prewarmStatus, setPrewarmStatus] = useState(null); // { status, label, is_ready, lessons_ready }

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
    const [showTtsScript, setShowTtsScript] = useState(false);
    const audioRef = useRef(null);
    const sentenceTimerRef = useRef(null);
    const dialogueAudioRef = useRef(null);

    // ── Video generation step tracker (for animated progress UI) ──
    const [loadingStep, setLoadingStep] = useState(0);
    // 0=idle, 1=searching content, 2=writing script, 3=generating audio

    // ── D-ID realistic avatar video state ──
    const [didVideoUrl, setDidVideoUrl] = useState('');
    const [didVideoPresenter, setDidVideoPresenter] = useState('');
    const [didScript, setDidScript] = useState('');
    const [didLoadingStep, setDidLoadingStep] = useState(0);
    const [didPresenters, setDidPresenters] = useState(null);
    const [selectedDIDPresenter, setSelectedDIDPresenter] = useState(null);
    const [didPresentersLoading, setDidPresentersLoading] = useState(false);
    // 0=idle, 1=reading content, 2=writing script, 3=rendering video

    // ── HeyGen professional avatar video state ──
    const [heygenVideoUrl, setHeygenVideoUrl] = useState('');
    const [heygenScript, setHeygenScript] = useState('');
    const [heygenLoadingStep, setHeygenLoadingStep] = useState(0);
    const [heygenLanguage, setHeygenLanguage] = useState('en');
    const [heygenAvatarType, setHeygenAvatarType] = useState('public');   // 'public' | 'talking_photo'
    const [heygenAvatarId, setHeygenAvatarId] = useState('');             // specific avatar/photo ID
    const [availableAvatars, setAvailableAvatars] = useState(null);       // { public_avatars, talking_photos }
    const [avatarsLoading, setAvatarsLoading] = useState(false);
    const [showHeygenOptions, setShowHeygenOptions] = useState(false);    // expand/collapse



    // ── Interactive Voice Q&A ("Raise Hand") state ──
    const [isAskingDoubt, setIsAskingDoubt] = useState(false);   // mic is listening
    const [doubtTranscript, setDoubtTranscript] = useState('');  // what user said
    const [doubtAnswer, setDoubtAnswer] = useState('');          // LLM answer
    const [doubtLoading, setDoubtLoading] = useState(false);     // waiting for LLM
    const [doubtTtsPlaying, setDoubtTtsPlaying] = useState(false); // answer audio playing
    const [doubtTypedText, setDoubtTypedText] = useState('');    // fallback typed input
    const recognitionRef = useRef(null);
    const preDoubtStateRef = useRef(null);  // { currentTime, sentenceIdx, wasPlaying, view }
    const doubtAudioRef = useRef(null);     // answer TTS audio
    const isAskingDoubtRef = useRef(false); // live ref — readable inside async closures

    // ── End-of-Session Q&A prompt state ──
    const [endSessionQA, setEndSessionQA] = useState(false);       // are we in end-of-session Q&A phase?
    const [endSessionPhase, setEndSessionPhase] = useState('');    // 'prompting' | 'listening' | 'answering' | 'thanking'
    const [endSessionAnswer, setEndSessionAnswer] = useState('');

    // Store onActivityComplete in a ref so async/audio handlers always see the latest value
    const onActivityCompleteRef = useRef(onActivityComplete);
    useEffect(() => { onActivityCompleteRef.current = onActivityComplete; }, [onActivityComplete]);
    const [endSessionQuestion, setEndSessionQuestion] = useState('');

    // ── Client-side cache helpers (stale-while-revalidate) ──────────────
    const readCache = (key) => {
        try {
            const raw = sessionStorage.getItem(key);
            if (!raw) return null;
            const { data, ts } = JSON.parse(raw);
            return { data, stale: Date.now() - ts > 120_000 }; // 2 min TTL
        } catch { return null; }
    };
    const writeCache = (key, data) => {
        try { sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); }
        catch { /* full */ }
    };
    const [endSessionTyped, setEndSessionTyped] = useState('');
    const endSessionAudioRef = useRef(null); // for prompt and thank-you TTS
    const endSessionTimeoutRef = useRef(null);
    const endSessionRecRef = useRef(null);

    const dialogueEndRef = useRef(null);

    const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    // ── End-of-Session Q&A: trigger after lesson finishes ──
    const triggerEndOfSessionQA = () => {
        setEndSessionQA(true);
        setEndSessionPhase('prompt');  // just show the panel; wait for user to ask
        setEndSessionAnswer('');
        setEndSessionQuestion('');
        setEndSessionTyped('');
        // NOTE: Do NOT auto-start speech recognition or set any timeout here.
        // The user must explicitly click the mic button or type a question.
        // Auto-listening was picking up Tamil audio from the lesson as a "question".
    };

    const startEndSessionListening = () => {
        // Start a timeout — if user doesn't ask within 15s, say thanks
        endSessionTimeoutRef.current = setTimeout(() => {
            handleEndSessionNoQuestion();
        }, 15000);

        // Start speech recognition if available
        if (hasSpeechRecognition) {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SR();
            recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.continuous = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (endSessionTimeoutRef.current) clearTimeout(endSessionTimeoutRef.current);
                setEndSessionQuestion(transcript);
                handleEndSessionQuestion(transcript);
            };
            recognition.onerror = () => { /* user can still type */ };
            recognition.onend = () => { /* timeout or type will handle it */ };

            endSessionRecRef.current = recognition;
            recognition.start();
        }
    };

    const handleEndSessionQuestion = async (question) => {
        if (!question.trim()) return;
        setEndSessionPhase('answering');

        // Stop recognition if running
        if (endSessionRecRef.current) try { endSessionRecRef.current.stop(); } catch (e) { /* ignore */ }

        try {
            const result = await apiService.askDoubt(question, selectedTopic, language);
            const answer = result.success ? result.answer : 'Sorry, I could not answer that.';
            setEndSessionAnswer(answer);

            // Speak the answer
            try {
                const ttsRes = await apiService.speakAnswer(answer, language);
                if (ttsRes.success && ttsRes.audio_url) {
                    const url = ttsRes.audio_url.startsWith('http')
                        ? ttsRes.audio_url
                        : `${process.env.REACT_APP_API_URL || ''}${ttsRes.audio_url}`;
                    const audio = new Audio(url);
                    endSessionAudioRef.current = audio;
                    audio.play().catch(() => { });
                }
            } catch (e) { /* non-fatal */ }
        } catch (e) {
            setEndSessionAnswer('Sorry, something went wrong.');
        }
    };

    const handleEndSessionAskAnother = () => {
        setEndSessionAnswer('');
        setEndSessionQuestion('');
        setEndSessionTyped('');
        if (endSessionAudioRef.current) { endSessionAudioRef.current.pause(); endSessionAudioRef.current = null; }
        setEndSessionPhase('prompt'); // go back to prompt — user must explicitly ask again
    };

    const handleEndSessionNoQuestion = async () => {
        if (endSessionTimeoutRef.current) clearTimeout(endSessionTimeoutRef.current);
        if (endSessionRecRef.current) try { endSessionRecRef.current.stop(); } catch (e) { /* ignore */ }
        if (endSessionAudioRef.current) { endSessionAudioRef.current.pause(); endSessionAudioRef.current = null; }

        setEndSessionPhase('thanking');

        try {
            const thanks = language === 'ta'
                ? 'நன்றி! கற்றலை தொடருங்கள்!'
                : 'Thank you for attending! Keep learning and stay curious!';
            const ttsRes = await apiService.speakAnswer(thanks, language);
            if (ttsRes.success && ttsRes.audio_url) {
                const url = ttsRes.audio_url.startsWith('http')
                    ? ttsRes.audio_url
                    : `${process.env.REACT_APP_API_URL || ''}${ttsRes.audio_url}`;
                const audio = new Audio(url);
                endSessionAudioRef.current = audio;
                audio.onended = () => { setEndSessionQA(false); setEndSessionPhase(''); };
                audio.play().catch(() => {
                    setTimeout(() => { setEndSessionQA(false); setEndSessionPhase(''); }, 3000);
                });
            } else {
                setTimeout(() => { setEndSessionQA(false); setEndSessionPhase(''); }, 3000);
            }
        } catch (e) {
            setTimeout(() => { setEndSessionQA(false); setEndSessionPhase(''); }, 3000);
        }
    };

    const handleEndSessionDismiss = () => {
        if (endSessionTimeoutRef.current) clearTimeout(endSessionTimeoutRef.current);
        if (endSessionRecRef.current) try { endSessionRecRef.current.stop(); } catch (e) { /* ignore */ }
        if (endSessionAudioRef.current) { endSessionAudioRef.current.pause(); endSessionAudioRef.current = null; }
        setEndSessionQA(false);
        setEndSessionPhase('');
    };

    // ── Universal audio cleanup helper ──
    const stopAllAudio = () => {
        if (dialogueAudioRef.current) {
            dialogueAudioRef.current.pause();
            dialogueAudioRef.current.src = '';
            dialogueAudioRef.current = null;
        }
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (sentenceTimerRef.current) {
            clearInterval(sentenceTimerRef.current);
            sentenceTimerRef.current = null;
        }
        if (videoPollingRef.current) {
            clearInterval(videoPollingRef.current);
            videoPollingRef.current = null;
        }
        // End-session cleanup
        if (endSessionAudioRef.current) {
            endSessionAudioRef.current.pause();
            endSessionAudioRef.current = null;
        }
        if (endSessionTimeoutRef.current) {
            clearTimeout(endSessionTimeoutRef.current);
            endSessionTimeoutRef.current = null;
        }
        if (endSessionRecRef.current) {
            try { endSessionRecRef.current.stop(); } catch (e) { /* ignore */ }
            endSessionRecRef.current = null;
        }
        setIsTtsPlaying(false);
    };

    // Load documents on mount; jump ahead if initialDoc / initialTopic provided
    useEffect(() => {
        if (initialDoc) {
            setSelectedDoc(initialDoc);
            if (initialTopic) {
                setSelectedTopic(initialTopic);
                setView('mode-select');
            } else {
                // Pre-selected doc, but no topic — show chapters
                selectDocument(initialDoc);
            }
        } else {
            loadDocuments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

                // All dialogue bubbles finished — trigger end-of-session Q&A
                if (!cancelled && !isAskingDoubtRef.current) {
                    triggerEndOfSessionQA();
                    if (onActivityCompleteRef.current) onActivityCompleteRef.current('conversation', 0);
                }
            };

            playSequence();
            return () => {
                cancelled = true;
                if (dialogueAudioRef.current) {
                    dialogueAudioRef.current.pause();
                    dialogueAudioRef.current.src = '';
                    dialogueAudioRef.current = null;
                }
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, lesson]);

    // Scroll to latest bubble
    useEffect(() => {
        if (dialogueEndRef.current) {
            dialogueEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [visibleBubbles]);

    // Cleanup ALL audio + timers on unmount
    useEffect(() => {
        return () => {
            stopAllAudio();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadDocuments = async () => {
        // Instantly hydrate from cache
        const cached = readCache('aiteacher_docs');
        if (cached?.data) {
            setDocuments(cached.data);
            setLoadingDocs(false); // show cached docs immediately
        } else {
            setLoadingDocs(true);
        }
        // Always revalidate from network
        try {
            const result = await apiService.getEdtechDocuments();
            if (result.success && result.documents) {
                setDocuments(result.documents);
                writeCache('aiteacher_docs', result.documents);
            }
        } catch (err) {
            console.error('Failed to load documents:', err);
        }
        setLoadingDocs(false);
    };

    const selectDocument = async (docName) => {
        setSelectedDoc(docName);
        setView('chapters');
        setSelectedChapter(null);
        setTopics([]);
        setError('');

        // Instantly hydrate chapters from cache
        const cacheKey = `aiteacher_chapters_${docName}`;
        const cached = readCache(cacheKey);
        if (cached?.data?.length) {
            setChapters(cached.data);
            setLoadingChapters(false);
        } else {
            setLoadingChapters(true);
            setChapters([]);
        }

        try {
            const result = await apiService.getEdtechChapters(docName);
            if (result.success && result.chapters && result.chapters.length > 0) {
                setChapters(result.chapters);
                writeCache(cacheKey, result.chapters);
            } else if (!cached?.data?.length) {
                setError(result.message || 'No chapters found in this document.');
            }
        } catch (err) {
            console.error('Failed to load chapters:', err);
            if (!cached?.data?.length) {
                setError(`Error loading chapters: ${err.message || 'Unknown error'}`);
            }
        }
        setLoadingChapters(false);
    };

    const selectChapter = async (chapter) => {
        setSelectedChapter(chapter);
        setView('topics');
        setLoadingTopics(true);
        setTopics([]);
        setError('');
        setPrewarmStatus(null);

        // Fetch topics AND prewarm status concurrently — no extra latency
        const [topicsResult, prewarmResult] = await Promise.allSettled([
            apiService.getEdtechTopics(selectedDoc, language, chapter.name),
            apiService.getPrewarmStatus(selectedDoc)
        ]);

        // Handle topics
        try {
            const result = topicsResult.status === 'fulfilled' ? topicsResult.value : null;
            if (result && result.success && result.topics && result.topics.length > 0) {
                setTopics(result.topics);
            } else if (result && result.success && (!result.topics || result.topics.length === 0)) {
                // Sparse chapter — synthesize a single topic from chapter name so user can still learn
                const syntheticTopic = {
                    title: chapter.name === 'Untitled Section' ? selectedDoc.replace(/\.[^.]+$/, '') : chapter.name,
                    description: `Content from this section of ${selectedDoc}. Only a small amount of text was found, but you can still get a lesson on it.`,
                    key_concepts: [],
                    difficulty: 'beginner',
                    source_document: selectedDoc,
                    _synthetic: true  // marker so we can show a hint
                };
                setTopics([syntheticTopic]);
            } else {
                setError(result?.message || 'No topics could be extracted from this chapter.');
            }
        } catch (err) {
            const msg = err.message || 'Failed to extract topics';
            setError(`Error: ${msg}`);
        }

        // Handle prewarm status (non-blocking — silently set banner)
        if (prewarmResult.status === 'fulfilled' && prewarmResult.value?.success) {
            const ps = prewarmResult.value;
            // Only show banner if processing or completed (not if not_found/unknown)
            if (ps.status !== 'not_found' && ps.status !== 'unknown') {
                setPrewarmStatus(ps);
            }
        }

        setLoadingTopics(false);
    };

    // ── Silent Pre-fetch: when topics appear, fire-and-forget TTS requests ──
    // By the time the user clicks a topic, the video is already cached server-side.
    useEffect(() => {
        if (topics.length === 0 || !selectedDoc) return;
        const controller = new AbortController();
        // Stagger requests to avoid hammering the server
        topics.slice(0, 5).forEach((topic, i) => {
            setTimeout(() => {
                if (controller.signal.aborted) return;
                apiService.generateTTSVideo(topic.title || topic, selectedDoc, language)
                    .catch(() => { }); // fire-and-forget — result gets cached server-side
            }, i * 3000); // 3s apart to respect OpenAI rate limits
        });
        return () => controller.abort(); // cancel on unmount / chapter change
    }, [topics, selectedDoc, language]);

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
            const result = await apiService.generateLesson(topicTitle, language, selectedDoc);
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
        setLoadingStep(1); // Step 1: searching content

        try {
            // Simulate step progression for UX feedback
            const stepTimer = setTimeout(() => setLoadingStep(2), 3000);  // Step 2: writing script
            const stepTimer2 = setTimeout(() => setLoadingStep(3), 8000); // Step 3: generating audio

            const result = await apiService.generateTTSVideo(selectedTopic, selectedDoc, language);

            clearTimeout(stepTimer);
            clearTimeout(stepTimer2);
            setLoadingStep(0);

            if (result.success && result.status === 'completed') {
                setTtsSentences(result.sentences || []);
                setTtsScript(result.script || '');
                if (result.audio_url) {
                    const audioUrl = result.audio_url.startsWith('http') ? result.audio_url : `${APP_CONFIG.API_URL}${result.audio_url}`;
                    setTtsAudioUrl(audioUrl);
                }
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

    // ── D-ID Professional Avatar Video ──
    const loadDIDPresenters = async () => {
        if (didPresenters || didPresentersLoading) return;
        setDidPresentersLoading(true);
        try {
            const result = await apiService.getDIDPresenters();
            if (result.success && result.presenters) {
                setDidPresenters(result.presenters);
            }
        } catch (err) {
            console.error('Failed to load D-ID presenters:', err);
        } finally {
            setDidPresentersLoading(false);
        }
    };

    const openDIDSelection = () => {
        loadDIDPresenters();
        setSelectedDIDPresenter(null);
        setView('did-select');
    };

    const startDIDVideoGeneration = async (presenter = null) => {
        const pid = presenter?.id || selectedDIDPresenter?.id || '';
        console.log('🎬 D-ID generating with presenter:', pid);
        setView('did-loading');
        setDidVideoUrl('');
        setDidScript('');
        setDidLoadingStep(1);
        setVideoError('');
        setVideoStatus('');

        // Animated step progression UI
        const t2 = setTimeout(() => setDidLoadingStep(2), 4000);
        const t3 = setTimeout(() => setDidLoadingStep(3), 9000);

        try {
            const result = await apiService.generateDIDVideo(selectedTopic, language, selectedDoc, pid);
            clearTimeout(t2); clearTimeout(t3);
            setDidLoadingStep(0);

            if (result.success && result.video_url) {
                setDidVideoUrl(result.video_url);
                setDidVideoPresenter(result.presenter || presenter?.name || 'AI Presenter');
                setDidScript(result.script || '');
                setView('did-video');
                if (onActivityCompleteRef.current) onActivityCompleteRef.current('video', 0);
            } else {
                setDidLoadingStep(0);
                setVideoError(result.detail || 'D-ID video generation failed');
                setView('did-loading');
                setVideoStatus('failed');
            }
        } catch (err) {
            clearTimeout(t2); clearTimeout(t3);
            setDidLoadingStep(0);
            setVideoError(err.message || 'D-ID video generation failed');
            setVideoStatus('failed');
        }
    };

    // ── HeyGen Professional Avatar Video ──
    const loadHeyGenAvatars = async () => {
        if (availableAvatars || avatarsLoading) return;
        setAvatarsLoading(true);
        try {
            const result = await apiService.getHeyGenAvatars();
            if (result.success) {
                setAvailableAvatars({
                    public_avatars: result.public_avatars || [],
                    talking_photos: result.talking_photos || [],
                });
            }
        } catch (err) {
            console.warn('Failed to load avatars:', err);
        } finally {
            setAvatarsLoading(false);
        }
    };




    const startHeyGenVideoGeneration = async () => {
        setView('heygen-loading');
        setHeygenVideoUrl('');
        setHeygenScript('');
        setHeygenLoadingStep(1);
        setVideoStatus('generating');
        setVideoError('');

        // Animated step progression UI
        const t2 = setTimeout(() => setHeygenLoadingStep(2), 5000);
        const t3 = setTimeout(() => setHeygenLoadingStep(3), 12000);
        const t4 = setTimeout(() => setHeygenLoadingStep(4), 25000);

        try {
            const result = await apiService.generateHeyGenVideo(
                selectedTopic, heygenLanguage, selectedDoc, heygenAvatarType, heygenAvatarId
            );
            clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
            setHeygenLoadingStep(0);

            if (result.success && result.video_url) {
                setHeygenVideoUrl(result.video_url);
                setHeygenScript(result.script || '');
                setView('heygen-video');
                setVideoStatus('completed');
                if (onActivityCompleteRef.current) onActivityCompleteRef.current('video', 0);
            } else {
                setHeygenLoadingStep(0);
                setVideoError(result.detail || 'HeyGen video generation failed');
                setVideoStatus('failed');
            }
        } catch (err) {
            clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
            setHeygenLoadingStep(0);
            setVideoError(err.message || 'HeyGen video generation failed');
            setVideoStatus('failed');
        }
    };

    // TTS playback controls
    const handleTtsPlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
            // NOTE: do NOT call startSentenceSync() here.
            // The <audio onPlay={...}> handler calls it, ensuring it starts
            // exactly once per play session. Calling it here too would create
            // TWO setInterval loops, making subtitles advance at 2x speed.
            setIsTtsPlaying(true);
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
            // NOTE: do NOT call startSentenceSync() here.
            // audio.play() → onPlay event → startSentenceSync() (single call).
            // Calling it here too = two intervals = 2× speed.
        }
    };

    // ── Subtitle sync engine ──
    // Uses audio.currentTime mapped against √(wordCount)-weighted offsets.
    //
    // The original "wall-clock" approach was a workaround for the backend bug
    // where Sarvam only generated ~3 sentences of audio (CHUNK_SIZE=1800 was too
    // big for the API). Now that chunking is fixed at 400 chars, the backend
    // generates COMPLETE audio for all sentences, so audio.duration is accurate
    // and audio.currentTime is the best possible sync source.
    //
    // Design:
    //   • Wait for audio.duration to be a sensible value (≥ n sentences × 0.5s)
    //     before building offsets — avoids reacting to stale NaN / 0 values.
    //   • Use √(wordCount) weighting so short sentences get a proportionally
    //     larger slice, preventing them from flashing by.
    //   • Rebuild offsets on every tick if audio.duration changes (e.g. Chrome
    //     sometimes updates it as it reads more of the file).
    const startSentenceSync = () => {
        if (sentenceTimerRef.current) clearInterval(sentenceTimerRef.current);
        if (!audioRef.current || ttsSentences.length === 0) return;

        const audio = audioRef.current;
        const n = ttsSentences.length;

        // Word count per sentence – proxy for how long the TTS will speak it
        const sentenceText = (s) => (s && typeof s === 'object' ? s.text || '' : s || '');
        const wordCounts = ttsSentences.map(s =>
            Math.max(sentenceText(s).trim().split(/\s+/).filter(Boolean).length, 1)
        );

        // Build √(wordCount)-weighted cumulative offsets scaled to totalDuration.
        const buildOffsets = (totalDuration) => {
            const sqrtW = wordCounts.map(w => Math.sqrt(w));
            const sumSqrt = sqrtW.reduce((a, b) => a + b, 0);
            let cum = 0;
            const offs = wordCounts.map((_, i) => {
                const o = cum;
                cum += (sqrtW[i] / sumSqrt) * totalDuration;
                return o;
            });
            offs.push(totalDuration); // sentinel
            return offs;
        };

        let offsets = null;
        let lastBuiltDuration = 0;

        // Fallback wall-clock (used only before audio.duration is available)
        let wallStart = null;
        const FALLBACK_PER_SENTENCE = 4; // seconds per sentence if no duration yet

        sentenceTimerRef.current = setInterval(() => {
            if (!audio || audio.paused) return;

            const dur = audio.duration;
            const durReady = dur && isFinite(dur) && dur >= n * 0.5; // at least 0.5s/sentence

            // (Re-)build offsets when we get a reliable duration or duration changes
            if (durReady && Math.abs(dur - lastBuiltDuration) > 0.5) {
                offsets = buildOffsets(dur);
                lastBuiltDuration = dur;
                wallStart = null; // switch from wall-clock to currentTime mode
                console.log('[TTS Sync] audio.duration:', dur.toFixed(1) + 's',
                    '| sentences:', n, '| secs/sentence:', (dur / n).toFixed(1),
                    '| offsets:', offsets.map(o => o.toFixed(1)));
            }

            // If still no reliable duration, use wall-clock as rough guide
            if (!offsets) {
                if (!wallStart) wallStart = Date.now();
                const roughDur = n * FALLBACK_PER_SENTENCE;
                offsets = buildOffsets(roughDur);
                lastBuiltDuration = roughDur;
            }

            // Map currentTime (or wall-clock) to a sentence index
            const ct = durReady ? audio.currentTime
                : Math.min((Date.now() - (wallStart || Date.now())) / 1000,
                    lastBuiltDuration * 0.9999);

            let idx = n - 1; // default: stay on last sentence
            for (let i = 0; i < offsets.length - 1; i++) {
                if (ct >= offsets[i] && ct < offsets[i + 1]) { idx = i; break; }
            }
            setCurrentSentenceIdx(Math.min(idx, n - 1));
        }, 150); // 150 ms — responsive but not excessive
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
        const newAnswers = { ...quizAnswers, [quizIndex]: optionIndex };
        setQuizAnswers(newAnswers);
        setShowExplanations(prev => ({ ...prev, [quizIndex]: true }));

        // Check if all questions answered → report quiz completion
        const quiz = lesson?.quiz || [];
        if (quiz.length > 0 && Object.keys(newAnswers).length === quiz.length) {
            const correct = quiz.filter((q, i) => newAnswers[i] === q.correct).length;
            const score = Math.round((correct / quiz.length) * 100);
            // Pass newAnswers so the parent can store them (proves quiz was taken)
            if (onActivityCompleteRef.current) onActivityCompleteRef.current('quiz', score, newAnswers);
        }
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

    // ── Interactive Voice Q&A: "Raise Hand" ──

    const handleRaiseHand = () => {
        // 1. Pause current audio and save position
        const state = { wasPlaying: false, currentTime: 0, sentenceIdx: currentSentenceIdx, view };

        if (view === 'tts-video' && audioRef.current) {
            state.wasPlaying = !audioRef.current.paused;
            state.currentTime = audioRef.current.currentTime;
            handleTtsPause();
        } else if (view === 'lesson' && dialogueAudioRef.current) {
            state.wasPlaying = !dialogueAudioRef.current.paused;
            dialogueAudioRef.current.pause();
        }

        preDoubtStateRef.current = state;
        setDoubtTranscript('');
        setDoubtAnswer('');
        setDoubtTypedText('');
        setDoubtLoading(false);
        isAskingDoubtRef.current = true;   // set ref BEFORE state so async loops see it
        setIsAskingDoubt(true);

        // 2. Start speech recognition if available
        if (hasSpeechRecognition) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.continuous = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setDoubtTranscript(transcript);
                submitDoubt(transcript);
            };

            recognition.onerror = (event) => {
                console.log('Speech recognition error:', event.error);
                // On error, user can still type
            };

            recognition.onend = () => {
                // Recognition ended — don't close panel, let user type if no result
            };

            recognitionRef.current = recognition;
            recognition.start();
        }
    };

    const submitDoubt = async (question) => {
        if (!question.trim()) return;
        setDoubtLoading(true);
        try {
            // Stop listening if still active
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
            }

            // Ask the LLM
            const result = await apiService.askDoubt(question, selectedTopic, language);
            const answer = result.success ? result.answer : 'Sorry, I could not find an answer.';
            setDoubtAnswer(answer);

            // Speak the answer via TTS
            try {
                const ttsResult = await apiService.speakAnswer(answer, language);
                if (ttsResult.success && ttsResult.audio_url) {
                    const url = ttsResult.audio_url.startsWith('http')
                        ? ttsResult.audio_url
                        : `${process.env.REACT_APP_API_URL || ''}${ttsResult.audio_url}`;
                    const answerAudio = new Audio(url);
                    doubtAudioRef.current = answerAudio;
                    setDoubtTtsPlaying(true);
                    answerAudio.onended = () => setDoubtTtsPlaying(false);
                    answerAudio.onerror = () => setDoubtTtsPlaying(false);
                    answerAudio.play().catch(() => setDoubtTtsPlaying(false));
                }
            } catch (ttsErr) {
                console.log('Answer TTS failed (non-fatal):', ttsErr);
            }
        } catch (err) {
            console.error('Doubt Q&A failed:', err);
            setDoubtAnswer('Sorry, something went wrong. Please try again.');
        }
        setDoubtLoading(false);
    };

    const handleDismissDoubt = () => {
        // Stop any playing answer audio
        if (doubtAudioRef.current) {
            doubtAudioRef.current.pause();
            doubtAudioRef.current = null;
        }
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
        }
        isAskingDoubtRef.current = false;  // clear ref in sync with state
        setIsAskingDoubt(false);
        setDoubtTranscript('');
        setDoubtAnswer('');
        setDoubtLoading(false);
        setDoubtTtsPlaying(false);
    };

    const handleResumeLesson = () => {
        const saved = preDoubtStateRef.current;

        // Stop doubt answer audio FIRST
        if (doubtAudioRef.current) {
            doubtAudioRef.current.pause();
            doubtAudioRef.current.src = '';
            doubtAudioRef.current = null;
        }

        handleDismissDoubt();

        if (!saved) return;

        // Resume lesson audio from saved position
        if (saved.view === 'tts-video' && audioRef.current) {
            // Ensure the audio element still points at the lesson audio
            if (ttsAudioUrl && audioRef.current.src !== ttsAudioUrl) {
                audioRef.current.src = ttsAudioUrl;
            }
            audioRef.current.currentTime = saved.currentTime;
            if (saved.wasPlaying) {
                // Small delay to let the audio element settle
                setTimeout(() => handleTtsPlay(), 100);
            }
        } else if (saved.view === 'lesson' && dialogueAudioRef.current) {
            if (saved.wasPlaying) {
                dialogueAudioRef.current.play().catch(() => { });
            }
        }
    };

    // ── Dialogue audio playback ──
    const playDialogueAudio = (audioUrl) => {
        if (!audioUrl) return;
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
        <div className="ai-teacher-overlay" onClick={(e) => e.stopPropagation()}>
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
                        <button className="ai-teacher-close" onClick={() => { stopAllAudio(); onClose(); }}>✕</button>
                    </div>
                </div>

                <div className="ai-teacher-content">

                    {/* ===== STEP 1: DOCUMENTS VIEW ===== */}
                    {view === 'documents' && (
                        <div>
                            {/* Individual Learning Mode Badge */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                                padding: '0.4rem 1rem', borderRadius: '50px', marginBottom: '1rem',
                                fontSize: '0.85rem', color: '#10b981', fontWeight: 600
                            }}>
                                <span>🧑‍💻</span> Individual Learning Mode — Self-Paced
                            </div>

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
                                    {/* Prewarm readiness banner */}
                                    {prewarmStatus && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '8px 14px', borderRadius: '20px',
                                            marginBottom: '12px', gridColumn: '1 / -1',
                                            fontSize: '13px', fontWeight: 500,
                                            background: prewarmStatus.is_ready
                                                ? 'rgba(34,197,94,0.12)' : 'rgba(139,92,246,0.12)',
                                            border: `1px solid ${prewarmStatus.is_ready
                                                ? 'rgba(34,197,94,0.3)' : 'rgba(139,92,246,0.3)'}`,
                                            color: prewarmStatus.is_ready ? '#4ade80' : '#a78bfa',
                                        }}>
                                            {prewarmStatus.is_ready ? '⚡' : '⏳'}
                                            <span>{prewarmStatus.label}</span>
                                            {prewarmStatus.lessons_ready > 0 && (
                                                <span style={{ opacity: 0.7 }}>
                                                    ({prewarmStatus.lessons_ready} lesson{prewarmStatus.lessons_ready !== 1 ? 's' : ''} cached)
                                                </span>
                                            )}
                                        </div>
                                    )}
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

                                {/* Option 2: Interactive Video (TTS) */}
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
                                                : (t('videoDesc') || 'AI avatar explains the topic with animated subtitles')}
                                        </div>
                                    </div>
                                    <div className="ai-teacher-doc-arrow">→</div>
                                </div>

                                {/* Option 3: D-ID Lip-Sync Video */}
                                <div
                                    className="ai-teacher-mode-card"
                                    onClick={openDIDSelection}
                                    style={{
                                        border: '1px solid rgba(16,185,129,0.4)',
                                        background: 'rgba(16,185,129,0.08)',
                                    }}
                                >
                                    <div className="ai-teacher-mode-icon">🤖</div>
                                    <div className="ai-teacher-mode-info">
                                        <div className="ai-teacher-mode-title">
                                            AI Presenter Video
                                            <span style={{
                                                fontSize: '10px', padding: '2px 8px', borderRadius: '8px',
                                                background: 'rgba(16,185,129,0.2)', color: '#10b981',
                                                marginLeft: '8px', fontWeight: 700, letterSpacing: '0.5px'
                                            }}>D-ID</span>
                                        </div>
                                        <div className="ai-teacher-mode-desc">
                                            Professional AI presenter with lip-synced narration
                                        </div>
                                    </div>
                                    <div className="ai-teacher-doc-arrow">→</div>
                                </div>

                                {/* Option 4: Professional HeyGen Video — Expanded */}
                                <div
                                    style={{
                                        border: '1px solid rgba(245,158,11,0.4)',
                                        background: showHeygenOptions
                                            ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(234,179,8,0.06))'
                                            : 'rgba(245,158,11,0.08)',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {/* Header card (click to expand) */}
                                    <div
                                        className="ai-teacher-mode-card"
                                        style={{ border: 'none', borderRadius: showHeygenOptions ? '16px 16px 0 0' : '16px', margin: 0 }}
                                        onClick={() => {
                                            setShowHeygenOptions(!showHeygenOptions);
                                            if (!availableAvatars) loadHeyGenAvatars();
                                        }}
                                    >
                                        <div className="ai-teacher-mode-icon">⭐</div>
                                        <div className="ai-teacher-mode-info">
                                            <div className="ai-teacher-mode-title">
                                                Professional AI Video
                                                <span style={{
                                                    fontSize: '10px', padding: '2px 8px', borderRadius: '8px',
                                                    background: 'rgba(245,158,11,0.2)', color: '#f59e0b',
                                                    marginLeft: '8px', fontWeight: 700, letterSpacing: '0.5px'
                                                }}>HEYGEN</span>
                                            </div>
                                            <div className="ai-teacher-mode-desc">
                                                {showHeygenOptions ? 'Choose your avatar type below' : 'Realistic AI avatar with lip-sync & subtitles'}
                                            </div>
                                        </div>
                                        <div className="ai-teacher-doc-arrow" style={{
                                            transform: showHeygenOptions ? 'rotate(90deg)' : 'none',
                                            transition: 'transform 0.3s ease'
                                        }}>→</div>
                                    </div>

                                    {/* Expanded Options Panel */}
                                    {showHeygenOptions && (
                                        <div style={{ padding: '0 16px 16px' }} onClick={(e) => e.stopPropagation()}>

                                            {/* Language selector */}
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                marginBottom: '12px', paddingBottom: '12px',
                                                borderBottom: '1px solid rgba(245,158,11,0.15)'
                                            }}>
                                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>🌐 Language:</span>
                                                <select
                                                    value={heygenLanguage}
                                                    onChange={(e) => setHeygenLanguage(e.target.value)}
                                                    style={{
                                                        padding: '4px 8px', borderRadius: '8px', fontSize: '12px',
                                                        background: 'rgba(30,30,60,0.9)', color: '#e2e8f0',
                                                        border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer',
                                                        outline: 'none',
                                                    }}
                                                >
                                                    <option value="en">English</option>
                                                    <option value="ta">Tamil (Thanglish)</option>
                                                </select>
                                            </div>

                                            {/* Avatar Type Cards */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                                                {/* 1. Public Studio Avatar */}
                                                <div
                                                    onClick={() => { setHeygenAvatarType('public'); setHeygenAvatarId(''); }}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '12px',
                                                        padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                                        border: heygenAvatarType === 'public'
                                                            ? '2px solid #f59e0b'
                                                            : '1px solid rgba(148,163,184,0.2)',
                                                        background: heygenAvatarType === 'public'
                                                            ? 'rgba(245,158,11,0.1)'
                                                            : 'rgba(30,30,60,0.4)',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '24px' }}>🎭</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px' }}>
                                                            Studio Avatar
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                                            Professional animated avatar with full body movement
                                                        </div>
                                                    </div>
                                                    {heygenAvatarType === 'public' && (
                                                        <span style={{ color: '#f59e0b', fontSize: '18px' }}>✓</span>
                                                    )}
                                                </div>

                                                {/* Public Avatar Selector (when selected) */}
                                                {heygenAvatarType === 'public' && availableAvatars?.public_avatars?.length > 0 && (
                                                    <div style={{
                                                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                                                        gap: '8px', padding: '8px 4px',
                                                    }}>
                                                        {availableAvatars.public_avatars.map((av) => (
                                                            <div
                                                                key={av.id}
                                                                onClick={() => setHeygenAvatarId(av.id)}
                                                                style={{
                                                                    textAlign: 'center', cursor: 'pointer',
                                                                    padding: '6px', borderRadius: '10px',
                                                                    border: heygenAvatarId === av.id
                                                                        ? '2px solid #f59e0b'
                                                                        : '1px solid rgba(148,163,184,0.15)',
                                                                    background: heygenAvatarId === av.id
                                                                        ? 'rgba(245,158,11,0.1)'
                                                                        : 'rgba(30,30,60,0.3)',
                                                                    transition: 'all 0.2s ease',
                                                                }}
                                                            >
                                                                <img
                                                                    src={av.preview_url}
                                                                    alt={av.name}
                                                                    style={{
                                                                        width: '48px', height: '48px',
                                                                        borderRadius: '50%', objectFit: 'cover',
                                                                        border: '2px solid rgba(245,158,11,0.2)',
                                                                    }}
                                                                />
                                                                <div style={{
                                                                    fontSize: '10px', color: '#94a3b8',
                                                                    marginTop: '4px', overflow: 'hidden',
                                                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                                                }}>
                                                                    {av.name}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* 2. Talking Photo */}
                                                <div
                                                    onClick={() => { setHeygenAvatarType('talking_photo'); setHeygenAvatarId(''); }}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '12px',
                                                        padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                                        border: heygenAvatarType === 'talking_photo'
                                                            ? '2px solid #8b5cf6'
                                                            : '1px solid rgba(148,163,184,0.2)',
                                                        background: heygenAvatarType === 'talking_photo'
                                                            ? 'rgba(139,92,246,0.1)'
                                                            : 'rgba(30,30,60,0.4)',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '24px' }}>📸</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px' }}>
                                                            Talking Photo
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                                            Your uploaded photo speaks with realistic lip-sync
                                                        </div>
                                                    </div>
                                                    {heygenAvatarType === 'talking_photo' && (
                                                        <span style={{ color: '#8b5cf6', fontSize: '18px' }}>✓</span>
                                                    )}
                                                </div>

                                                {/* Talking Photo Selector (when selected) */}
                                                {heygenAvatarType === 'talking_photo' && availableAvatars?.talking_photos?.length > 0 && (
                                                    <div style={{
                                                        display: 'flex', gap: '10px', padding: '8px 4px',
                                                        flexWrap: 'wrap',
                                                    }}>
                                                        {availableAvatars.talking_photos.map((tp) => (
                                                            <div
                                                                key={tp.id}
                                                                onClick={() => setHeygenAvatarId(tp.id)}
                                                                style={{
                                                                    cursor: 'pointer', borderRadius: '12px',
                                                                    border: heygenAvatarId === tp.id
                                                                        ? '2px solid #8b5cf6'
                                                                        : '1px solid rgba(148,163,184,0.15)',
                                                                    overflow: 'hidden',
                                                                    transition: 'all 0.2s ease',
                                                                    boxShadow: heygenAvatarId === tp.id
                                                                        ? '0 0 12px rgba(139,92,246,0.3)'
                                                                        : 'none',
                                                                }}
                                                            >
                                                                <img
                                                                    src={tp.image_url}
                                                                    alt="Avatar preview"
                                                                    style={{
                                                                        width: '72px', height: '72px',
                                                                        objectFit: 'cover', display: 'block',
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Upload on HeyGen + Refresh */}
                                                {heygenAvatarType === 'talking_photo' && (
                                                    <div style={{ display: 'flex', gap: '8px', padding: '4px 4px 8px' }}>
                                                        <a
                                                            href="https://app.heygen.com/avatars"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                                flex: 1, padding: '10px 14px',
                                                                borderRadius: '10px', cursor: 'pointer',
                                                                border: '1px dashed rgba(139,92,246,0.4)',
                                                                background: 'rgba(139,92,246,0.06)',
                                                                color: '#a78bfa', fontSize: '13px',
                                                                fontWeight: 600, textDecoration: 'none',
                                                                transition: 'all 0.2s ease',
                                                            }}
                                                        >
                                                            <span style={{ fontSize: '16px' }}>➕</span>
                                                            Upload on HeyGen
                                                        </a>
                                                        <button
                                                            onClick={() => { setAvailableAvatars(null); loadHeyGenAvatars(); }}
                                                            disabled={avatarsLoading}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                                padding: '10px 14px',
                                                                borderRadius: '10px', cursor: avatarsLoading ? 'wait' : 'pointer',
                                                                border: '1px solid rgba(139,92,246,0.3)',
                                                                background: 'rgba(139,92,246,0.06)',
                                                                color: '#a78bfa', fontSize: '13px',
                                                                fontWeight: 600, transition: 'all 0.2s ease',
                                                            }}
                                                        >
                                                            <span style={{ fontSize: '16px' }}>{avatarsLoading ? '⏳' : '🔄'}</span>
                                                            {avatarsLoading ? 'Loading...' : 'Refresh'}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* 3. Digital Twin (Coming Soon) */}
                                                <div
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '12px',
                                                        padding: '12px', borderRadius: '12px',
                                                        border: '1px solid rgba(148,163,184,0.1)',
                                                        background: 'rgba(30,30,60,0.25)',
                                                        opacity: 0.5, cursor: 'not-allowed',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '24px' }}>🤖</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px' }}>
                                                            Digital Twin
                                                            <span style={{
                                                                fontSize: '9px', padding: '2px 6px', borderRadius: '6px',
                                                                background: 'rgba(100,116,139,0.3)', color: '#94a3b8',
                                                                marginLeft: '8px', fontWeight: 600, letterSpacing: '0.5px'
                                                            }}>COMING SOON</span>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                                            Create a fully animated clone of yourself
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Generate Button */}
                                            <button
                                                onClick={startHeyGenVideoGeneration}
                                                disabled={!selectedTopic}
                                                style={{
                                                    width: '100%', marginTop: '12px',
                                                    padding: '12px 20px', borderRadius: '12px',
                                                    border: 'none', cursor: selectedTopic ? 'pointer' : 'not-allowed',
                                                    background: selectedTopic
                                                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                                        : 'rgba(100,116,139,0.3)',
                                                    color: '#fff', fontWeight: 700, fontSize: '14px',
                                                    letterSpacing: '0.5px',
                                                    boxShadow: selectedTopic ? '0 4px 16px rgba(245,158,11,0.3)' : 'none',
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                🎬 Generate {heygenAvatarType === 'talking_photo' ? 'Talking Photo' : 'Studio Avatar'} Video
                                            </button>

                                            {avatarsLoading && (
                                                <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                                    Loading avatar options...
                                                </div>
                                            )}
                                        </div>
                                    )}
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

                    {/* ===== D-ID AVATAR SELECTION VIEW ===== */}
                    {view === 'did-select' && (
                        <div className="ai-teacher-lesson" style={{ maxWidth: '720px', margin: '0 auto' }}>
                            <button className="ai-teacher-back-btn" onClick={() => setView('mode-select')}>
                                ← Back to Learning Modes
                            </button>

                            <h2 style={{ color: '#34d399', marginBottom: '8px', textAlign: 'center' }}>
                                🤖 Choose Your AI Presenter
                            </h2>
                            <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '28px', fontSize: '0.9rem' }}>
                                Select a presenter for <strong style={{ color: '#67e8f9' }}>{selectedTopic}</strong>
                            </p>

                            {didPresentersLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <div className="ai-teacher-loading-spinner" />
                                    <p style={{ color: '#94a3b8', marginTop: '16px' }}>Loading presenters...</p>
                                </div>
                            ) : didPresenters && didPresenters.length > 0 ? (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                    gap: '16px',
                                    marginBottom: '24px'
                                }}>
                                    {didPresenters.map(p => {
                                        const isSelected = selectedDIDPresenter?.id === p.id;
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => setSelectedDIDPresenter(p)}
                                                style={{
                                                    cursor: 'pointer',
                                                    borderRadius: '16px',
                                                    padding: '20px 16px',
                                                    textAlign: 'center',
                                                    background: isSelected
                                                        ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15))'
                                                        : 'rgba(255,255,255,0.04)',
                                                    border: `2px solid ${isSelected ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                                                    transition: 'all 0.3s ease',
                                                    transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                                                    boxShadow: isSelected ? '0 4px 20px rgba(16,185,129,0.25)' : 'none',
                                                }}
                                            >
                                                {/* Avatar image */}
                                                <div style={{
                                                    width: '100px', height: '100px',
                                                    borderRadius: '50%',
                                                    margin: '0 auto 12px',
                                                    overflow: 'hidden',
                                                    border: `3px solid ${isSelected ? '#10b981' : 'rgba(255,255,255,0.15)'}`,
                                                    transition: 'border-color 0.3s ease',
                                                }}>
                                                    <img
                                                        src={p.source_url}
                                                        alt={p.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                                <div style={{
                                                    fontWeight: 600, fontSize: '1rem',
                                                    color: isSelected ? '#34d399' : '#e2e8f0',
                                                    marginBottom: '4px'
                                                }}>{p.name}</div>
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: '#94a3b8',
                                                }}>{p.description || p.gender}</div>
                                                {isSelected && (
                                                    <div style={{
                                                        marginTop: '8px',
                                                        fontSize: '0.75rem',
                                                        color: '#10b981',
                                                        fontWeight: 700,
                                                    }}>✓ Selected</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p style={{ color: '#f87171', textAlign: 'center' }}>Failed to load presenters</p>
                            )}

                            {/* Generate button */}
                            <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                <button
                                    className="ai-teacher-qa-btn"
                                    disabled={!selectedDIDPresenter}
                                    onClick={() => startDIDVideoGeneration(selectedDIDPresenter)}
                                    style={{
                                        background: selectedDIDPresenter
                                            ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                                            : 'rgba(255,255,255,0.08)',
                                        color: selectedDIDPresenter ? '#fff' : '#64748b',
                                        padding: '14px 40px',
                                        fontSize: '1.05rem',
                                        fontWeight: 700,
                                        borderRadius: '14px',
                                        border: 'none',
                                        cursor: selectedDIDPresenter ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.3s ease',
                                        boxShadow: selectedDIDPresenter
                                            ? '0 4px 16px rgba(16,185,129,0.3)'
                                            : 'none',
                                    }}
                                >
                                    🎬 Generate Presenter Video
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== D-ID LOADING VIEW ===== */}
                    {view === 'video-loading' && (
                        <div className="ai-teacher-loading">
                            <button className="ai-teacher-back-btn" onClick={() => {
                                if (videoPollingRef.current) clearInterval(videoPollingRef.current);
                                setLoadingStep(0);
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
                                    <h3 style={{ marginBottom: '24px' }}>🎬 Preparing Your AI Lesson...</h3>
                                    {/* Animated step indicators */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
                                        {[
                                            { step: 1, icon: '🔍', label: 'Finding relevant content' },
                                            { step: 2, icon: '✍️', label: 'Writing teaching script' },
                                            { step: 3, icon: '🔊', label: 'Generating audio narration' },
                                        ].map(({ step, icon, label }) => {
                                            const done = loadingStep > step;
                                            const active = loadingStep === step;
                                            const pending = loadingStep < step;
                                            return (
                                                <div key={step} style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    padding: '10px 16px', borderRadius: '12px',
                                                    background: done ? 'rgba(34,197,94,0.15)'
                                                        : active ? 'rgba(139,92,246,0.2)'
                                                            : 'rgba(255,255,255,0.05)',
                                                    border: `1px solid ${done ? 'rgba(34,197,94,0.4)'
                                                        : active ? 'rgba(139,92,246,0.5)'
                                                            : 'rgba(255,255,255,0.08)'}`,
                                                    transition: 'all 0.4s ease',
                                                    opacity: pending ? 0.45 : 1,
                                                }}>
                                                    <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>
                                                        {done ? '✅' : active ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⌛</span> : icon}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.9rem', fontWeight: active ? 600 : 400,
                                                        color: done ? '#4ade80' : active ? '#c4b5fd' : '#94a3b8'
                                                    }}>{label}</span>
                                                    {active && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#8b5cf6' }}>In progress...</span>}
                                                    {done && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#4ade80' }}>Done ✓</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#64748b' }}>
                                        {loadingStep === 0 ? 'Starting...' :
                                            loadingStep === 1 ? 'Searching your document for relevant content…' :
                                                loadingStep === 2 ? 'Writing an engaging teaching script…' :
                                                    'Almost there! Converting script to audio…'}
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* ===== TTS AVATAR VIDEO PLAYER ===== */}
                    {view === 'tts-video' && ttsAudioUrl && (
                        <div className="ai-teacher-lesson">
                            <button className="ai-teacher-back-btn" onClick={() => {
                                stopAllAudio();
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

                                {/* Wikipedia concept image — changes with each sentence */}
                                {(() => {
                                    const sent = ttsSentences[currentSentenceIdx];
                                    const imgUrl = sent && typeof sent === 'object' ? sent.image_url : '';
                                    const imgCaption = sent && typeof sent === 'object' ? sent.image_caption : '';
                                    return imgUrl ? (
                                        <div className="tts-concept-image-panel" key={imgUrl}>
                                            <img
                                                src={imgUrl}
                                                alt={imgCaption || 'concept image'}
                                                className="tts-concept-image"
                                                loading="lazy"
                                                decoding="async"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                            {imgCaption && (
                                                <div className="tts-concept-image-caption">{imgCaption}</div>
                                            )}
                                        </div>
                                    ) : null;
                                })()}

                                {/* Subtitle Display */}
                                <div className="tts-subtitle-card">
                                    <div className="tts-subtitle-text">
                                        {(() => {
                                            const sent = ttsSentences[currentSentenceIdx];
                                            return typeof sent === 'object' && sent !== null ? sent.text : (sent || '...');
                                        })()}
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
                                crossOrigin="anonymous"
                                onEnded={() => {
                                    setIsTtsPlaying(false);
                                    if (sentenceTimerRef.current) clearInterval(sentenceTimerRef.current);
                                    setCurrentSentenceIdx(ttsSentences.length - 1);
                                    // ── Progress: mark video completed (use ref to avoid stale closure) ──
                                    if (onActivityCompleteRef.current) onActivityCompleteRef.current('video', 0);
                                    // Start Q&A immediately — no delay
                                    if (!isAskingDoubtRef.current) {
                                        triggerEndOfSessionQA();
                                    }
                                }}
                                onPlay={() => {
                                    setIsTtsPlaying(true);
                                    startSentenceSync();
                                    // Mark video as watched as soon as student presses play
                                    if (onActivityCompleteRef.current) onActivityCompleteRef.current('video', 0);
                                }}
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
                                <button
                                    className={`tts-control-btn doubt-mic-btn ${isAskingDoubt ? 'listening' : ''}`}
                                    onClick={handleRaiseHand}
                                    title="Raise hand — Ask a doubt"
                                    disabled={isAskingDoubt}
                                >
                                    🎤
                                </button>
                            </div>

                            {/* Full script / conversation toggle + mark watched */}
                            <div className="ai-teacher-video-actions">
                                <button
                                    className="ai-teacher-qa-btn"
                                    onClick={() => setShowTtsScript(prev => !prev)}
                                >
                                    {showTtsScript ? '🎬' : '🎙️'} {showTtsScript
                                        ? (t('hideScript') || 'Hide Script')
                                        : (t('alsoViewConversation') || 'View Full Script as Text')}
                                </button>
                                <button
                                    className="ai-teacher-qa-btn"
                                    style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', borderColor: 'rgba(52,211,153,0.3)' }}
                                    onClick={() => {
                                        if (onActivityCompleteRef.current) onActivityCompleteRef.current('video', 0);
                                    }}
                                >
                                    ✅ Mark as Watched
                                </button>
                                <button
                                    className="ai-teacher-qa-btn"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(52,211,153,0.25), rgba(16,185,129,0.15))',
                                        color: '#34d399',
                                        borderColor: 'rgba(52,211,153,0.4)',
                                        fontWeight: 600
                                    }}
                                    onClick={() => {
                                        if (onActivityCompleteRef.current) onActivityCompleteRef.current('video', 0);
                                        stopAllAudio();
                                        onClose();
                                    }}
                                >
                                    ✅ Complete &amp; Close
                                </button>
                            </div>

                            {showTtsScript && (
                                <div className="tts-script-panel">
                                    <div className="tts-script-panel-header">
                                        📝 {t('fullScript') || 'Full Script'}
                                    </div>
                                    <div className="tts-script-panel-body">
                                        {ttsSentences.length > 0 ? ttsSentences.map((sentence, idx) => (
                                            <div
                                                key={idx}
                                                className={`tts-script-sentence ${idx === currentSentenceIdx ? 'active' : ''}`}
                                                onClick={() => {
                                                    setCurrentSentenceIdx(idx);
                                                    if (audioRef.current && audioRef.current.duration) {
                                                        audioRef.current.currentTime = (idx / ttsSentences.length) * audioRef.current.duration;
                                                    }
                                                }}
                                            >
                                                <span className="tts-script-sentence-num">{idx + 1}</span>
                                                <span className="tts-script-sentence-text">
                                                    {typeof sentence === 'object' && sentence !== null ? sentence.text : sentence}
                                                </span>
                                            </div>
                                        )) : (
                                            <div className="tts-script-text">{ttsScript}</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== D-ID PROFESSIONAL PRESENTER LOADING VIEW ===== */}
                    {view === 'did-loading' && (
                        <div className="ai-teacher-loading">
                            <button className="ai-teacher-back-btn" onClick={() => {
                                setDidLoadingStep(0);
                                setView('mode-select');
                            }}>
                                ← Back
                            </button>
                            {videoStatus === 'failed' ? (
                                <>
                                    <div className="ai-teacher-empty-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                                    <h3 style={{ color: '#f87171' }}>Video Generation Failed</h3>
                                    <p style={{ color: '#94a3b8', marginBottom: '16px' }}>{videoError}</p>
                                    <button className="ai-teacher-qa-btn" onClick={startDIDVideoGeneration}>🔄 Try Again</button>
                                </>
                            ) : (
                                <>
                                    <div className="ai-teacher-loading-spinner" />
                                    <h3 style={{ marginBottom: '24px' }}>🎥 Creating Your Professional Presenter Video...</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '340px' }}>
                                        {[
                                            { step: 1, icon: '📚', label: 'Reading your document content' },
                                            { step: 2, icon: '✍️', label: 'Writing professional narration script' },
                                            { step: 3, icon: '🎥', label: 'Rendering AI presenter video' },
                                        ].map(({ step, icon, label }) => {
                                            const done = didLoadingStep > step;
                                            const active = didLoadingStep === step;
                                            const pending = didLoadingStep < step;
                                            return (
                                                <div key={step} style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    padding: '10px 16px', borderRadius: '12px',
                                                    background: done ? 'rgba(16,185,129,0.15)'
                                                        : active ? 'rgba(6,182,212,0.2)'
                                                            : 'rgba(255,255,255,0.05)',
                                                    border: `1px solid ${done ? 'rgba(16,185,129,0.4)'
                                                        : active ? 'rgba(6,182,212,0.5)'
                                                            : 'rgba(255,255,255,0.08)'}`,
                                                    transition: 'all 0.4s ease', opacity: pending ? 0.45 : 1,
                                                }}>
                                                    <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>
                                                        {done ? '✅' : active ? '⌛' : icon}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.9rem', fontWeight: active ? 600 : 400,
                                                        color: done ? '#4ade80' : active ? '#67e8f9' : '#94a3b8'
                                                    }}>{label}</span>
                                                    {active && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#06b6d4' }}>In progress...</span>}
                                                    {done && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#4ade80' }}>Done ✓</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#64748b' }}>
                                        {didLoadingStep === 3 ? 'D-ID rendering your presenter video — usually 30-90 seconds…' :
                                            didLoadingStep === 2 ? 'GPT writing a professional narration script…' :
                                                'Searching your document for the best content…'}
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* ===== D-ID PROFESSIONAL PRESENTER VIDEO PLAYER ===== */}
                    {view === 'did-video' && didVideoUrl && (
                        <div className="ai-teacher-lesson">
                            <button className="ai-teacher-back-btn" onClick={() => setView('mode-select')}>
                                ← Back to Learning Modes
                            </button>

                            {/* Header */}
                            <div style={{ marginBottom: '8px' }}>
                                <div className="ai-teacher-lesson-title" style={{ color: '#34d399' }}>
                                    🎥 {selectedTopic}
                                </div>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))',
                                    border: '1px solid rgba(16,185,129,0.3)',
                                    padding: '4px 12px', borderRadius: '20px',
                                    fontSize: '0.8rem', color: '#34d399', fontWeight: 600
                                }}>
                                    <span>🤖</span>
                                    Presented by {didVideoPresenter} · Professional AI Presenter
                                </div>
                            </div>

                            {/* Video Player — full width */}
                            <div style={{
                                borderRadius: '16px', overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(16,185,129,0.2)',
                                border: '1px solid rgba(16,185,129,0.25)',
                                background: '#000', marginBottom: '16px'
                            }}>
                                <video
                                    style={{ width: '100%', display: 'block' }}
                                    src={didVideoUrl}
                                    controls
                                    autoPlay
                                    playsInline
                                    onEnded={() => {
                                        if (onActivityCompleteRef.current) onActivityCompleteRef.current('video', 0);
                                    }}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            {/* Actions */}
                            <div className="ai-teacher-video-actions">
                                <button
                                    className="ai-teacher-qa-btn"
                                    onClick={() => setDidScript(prev => prev ? '' : didScript)}
                                    style={{ background: 'rgba(6,182,212,0.15)', color: '#67e8f9', borderColor: 'rgba(6,182,212,0.3)' }}
                                    title="Toggle script"
                                >
                                    📄 {didScript ? 'Hide Script' : 'View Script'}
                                </button>
                                <button
                                    className="ai-teacher-qa-btn"
                                    onClick={() => generateLesson(selectedTopic)}
                                >
                                    🎙️ View as Dialogue
                                </button>
                                <button
                                    className="ai-teacher-qa-btn"
                                    style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', borderColor: 'rgba(52,211,153,0.3)', fontWeight: 600 }}
                                    onClick={() => {
                                        if (onActivityCompleteRef.current) onActivityCompleteRef.current('video', 0);
                                        stopAllAudio();
                                        onClose();
                                    }}
                                >
                                    ✅ Complete & Close
                                </button>
                            </div>

                            {/* Script panel */}
                            {didScript && (
                                <div className="tts-script-panel" style={{ marginTop: '16px' }}>
                                    <div className="tts-script-panel-header">📝 Narration Script</div>
                                    <div className="tts-script-panel-body" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                        {didScript}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== HEYGEN LOADING VIEW ===== */}
                    {view === 'heygen-loading' && (
                        <div className="ai-teacher-loading">
                            <button className="ai-teacher-back-btn" onClick={() => {
                                setHeygenLoadingStep(0);
                                setView('mode-select');
                            }}>
                                ← Back
                            </button>
                            {videoStatus === 'failed' ? (
                                <>
                                    <div className="ai-teacher-empty-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                                    <h3 style={{ color: '#f87171' }}>HeyGen Video Failed</h3>
                                    <p style={{ color: '#94a3b8', marginBottom: '16px' }}>{videoError}</p>
                                    <button className="ai-teacher-qa-btn" onClick={startHeyGenVideoGeneration}>
                                        🔄 Try Again
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="ai-teacher-loading-spinner"></div>
                                    <h3 style={{ marginBottom: '24px' }}>⭐ Generating Professional AI Video...</h3>
                                    <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
                                        HeyGen is creating a realistic AI avatar video. This may take 1-3 minutes.
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '340px' }}>
                                        {[
                                            { step: 1, icon: '🔍', label: 'Finding relevant content' },
                                            { step: 2, icon: '✍️', label: 'Writing teaching script' },
                                            { step: 3, icon: '🎭', label: 'Rendering AI avatar' },
                                            { step: 4, icon: '🎬', label: 'Adding subtitles & finalizing' },
                                        ].map(({ step, icon, label }) => {
                                            const done = heygenLoadingStep > step;
                                            const active = heygenLoadingStep === step;
                                            const pending = heygenLoadingStep < step;
                                            return (
                                                <div key={step} style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    padding: '10px 16px', borderRadius: '12px',
                                                    background: done ? 'rgba(34,197,94,0.15)'
                                                        : active ? 'rgba(245,158,11,0.2)'
                                                            : 'rgba(255,255,255,0.05)',
                                                    border: `1px solid ${done ? 'rgba(34,197,94,0.4)'
                                                        : active ? 'rgba(245,158,11,0.5)'
                                                            : 'rgba(255,255,255,0.08)'}`,
                                                    transition: 'all 0.4s ease',
                                                    opacity: pending ? 0.45 : 1,
                                                }}>
                                                    <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>
                                                        {done ? '✅' : active ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⌛</span> : icon}
                                                    </span>
                                                    <span style={{ color: done ? '#4ade80' : active ? '#fbbf24' : '#64748b', fontSize: '14px', fontWeight: active ? 600 : 400 }}>
                                                        {label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#f59e0b' }}>
                                        <span>🌐</span>
                                        <span>Language: {heygenLanguage === 'ta' ? 'Tamil (Thanglish)' : 'English'}</span>
                                        <span style={{ color: '#64748b' }}>•</span>
                                        <span>📝 English subtitles</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ===== HEYGEN PROFESSIONAL VIDEO PLAYER ===== */}
                    {view === 'heygen-video' && heygenVideoUrl && (
                        <div className="ai-teacher-lesson">
                            <button className="ai-teacher-back-btn" onClick={() => setView('mode-select')}>
                                ← Back to Learning Modes
                            </button>

                            {/* Header */}
                            <div style={{ marginBottom: '8px' }}>
                                <div className="ai-teacher-lesson-title" style={{ color: '#f59e0b' }}>
                                    ⭐ {selectedTopic}
                                </div>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(234,179,8,0.1))',
                                    border: '1px solid rgba(245,158,11,0.3)',
                                    padding: '4px 12px', borderRadius: '20px',
                                    fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600
                                }}>
                                    <span>🎭</span>
                                    HeyGen Professional AI Presenter · {heygenLanguage === 'ta' ? 'Tamil (Thanglish)' : 'English'}
                                </div>
                            </div>

                            {/* Video Player */}
                            <div style={{
                                borderRadius: '16px', overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(245,158,11,0.2)',
                                border: '1px solid rgba(245,158,11,0.25)',
                                background: '#000', marginBottom: '16px'
                            }}>
                                <video
                                    style={{ width: '100%', maxHeight: '480px', display: 'block' }}
                                    src={heygenVideoUrl}
                                    controls
                                    autoPlay
                                    playsInline
                                    onEnded={() => {
                                        if (onActivityCompleteRef.current) onActivityCompleteRef.current('video', 0);
                                    }}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            {/* Actions */}
                            <div className="ai-teacher-video-actions">
                                <button
                                    className="ai-teacher-qa-btn"
                                    onClick={() => setHeygenScript(prev => prev ? '' : heygenScript)}
                                    style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.3)' }}
                                >
                                    📄 {heygenScript ? 'Hide Script' : 'View Script'}
                                </button>
                                <button
                                    className="ai-teacher-qa-btn"
                                    onClick={() => generateLesson(selectedTopic)}
                                >
                                    🎙️ View as Dialogue
                                </button>
                                <button
                                    className="ai-teacher-qa-btn"
                                    style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', borderColor: 'rgba(52,211,153,0.3)', fontWeight: 600 }}
                                    onClick={() => {
                                        if (onActivityCompleteRef.current) onActivityCompleteRef.current('video', 0);
                                        stopAllAudio();
                                        onClose();
                                    }}
                                >
                                    ✅ Complete & Close
                                </button>
                            </div>

                            {/* Script panel */}
                            {heygenScript && (
                                <div className="tts-script-panel" style={{ marginTop: '16px' }}>
                                    <div className="tts-script-panel-header">📝 Narration Script ({heygenLanguage === 'ta' ? 'Thanglish' : 'English'})</div>
                                    <div className="tts-script-panel-body" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                        {heygenScript}
                                    </div>
                                </div>
                            )}
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
                            <button className="ai-teacher-back-btn" onClick={() => { stopAllAudio(); setView('mode-select'); }}>
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
                                                {/* Wikipedia concept image for this bubble */}
                                                {msg.image_url && (
                                                    <div className="bubble-concept-image-wrap">
                                                        <img
                                                            src={msg.image_url}
                                                            alt={msg.image_caption || ''}
                                                            className="bubble-concept-image"
                                                            loading="lazy"
                                                            decoding="async"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                        {msg.image_caption && (
                                                            <div className="bubble-concept-caption">{msg.image_caption}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={dialogueEndRef} />
                            </div>

                            {/* Floating Mic Button for Dialogue Lesson */}
                            <button
                                className={`doubt-floating-mic ${isAskingDoubt ? 'listening' : ''}`}
                                onClick={handleRaiseHand}
                                title="Raise hand — Ask a doubt"
                                disabled={isAskingDoubt}
                            >
                                🎤 {isAskingDoubt ? 'Listening...' : 'Ask a Doubt'}
                            </button>

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

                                    {/* Complete Session button — shows after all quiz answered */}
                                    {lesson.quiz && Object.keys(quizAnswers).length >= (Array.isArray(lesson.quiz) ? lesson.quiz.length : 1) && (
                                        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                            <button
                                                className="ai-teacher-qa-btn"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(52,211,153,0.25), rgba(16,185,129,0.15))',
                                                    color: '#34d399',
                                                    borderColor: 'rgba(52,211,153,0.4)',
                                                    padding: '12px 32px',
                                                    fontSize: '15px',
                                                    fontWeight: 600
                                                }}
                                                onClick={() => { stopAllAudio(); onClose(); }}
                                            >
                                                ✅ Complete &amp; Close
                                            </button>
                                            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>Progress will update automatically</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                </div>

                {/* ===== DOUBT / VOICE Q&A PANEL OVERLAY ===== */}
                {isAskingDoubt && (
                    <div className="doubt-panel-overlay">
                        <div className="doubt-panel">
                            <div className="doubt-panel-header">
                                <span>🎤 Ask Your Doubt</span>
                                <button className="doubt-panel-close" onClick={handleDismissDoubt}>✕</button>
                            </div>

                            <div className="doubt-panel-body">
                                {/* Listening indicator */}
                                {!doubtTranscript && !doubtAnswer && !doubtLoading && (
                                    <div className="doubt-listening">
                                        <div className="doubt-listening-waves">
                                            <span></span><span></span><span></span><span></span><span></span>
                                        </div>
                                        <p>{hasSpeechRecognition ? 'Listening... speak your question' : 'Type your question below'}</p>
                                    </div>
                                )}

                                {/* Transcript */}
                                {doubtTranscript && (
                                    <div className="doubt-transcript">
                                        <strong>You asked:</strong>
                                        <p>{doubtTranscript}</p>
                                    </div>
                                )}

                                {/* Type fallback: always available */}
                                {!doubtAnswer && !doubtLoading && (
                                    <div className="doubt-type-fallback">
                                        <input
                                            type="text"
                                            className="doubt-type-input"
                                            placeholder="Or type your question here..."
                                            value={doubtTypedText}
                                            onChange={(e) => setDoubtTypedText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && doubtTypedText.trim()) {
                                                    setDoubtTranscript(doubtTypedText);
                                                    submitDoubt(doubtTypedText);
                                                }
                                            }}
                                        />
                                        <button
                                            className="doubt-send-btn"
                                            onClick={() => {
                                                if (doubtTypedText.trim()) {
                                                    setDoubtTranscript(doubtTypedText);
                                                    submitDoubt(doubtTypedText);
                                                }
                                            }}
                                            disabled={!doubtTypedText.trim()}
                                        >
                                            Ask
                                        </button>
                                    </div>
                                )}

                                {/* Loading */}
                                {doubtLoading && (
                                    <div className="doubt-loading">
                                        <div className="doubt-loading-spinner"></div>
                                        <p>Finding the answer...</p>
                                    </div>
                                )}

                                {/* Answer */}
                                {doubtAnswer && (
                                    <div className="doubt-answer">
                                        <strong>Answer {doubtTtsPlaying ? '🔊' : ''}:</strong>
                                        <p>{doubtAnswer}</p>
                                    </div>
                                )}
                            </div>

                            {/* Resume button (only after answer) */}
                            {doubtAnswer && !doubtLoading && (
                                <div className="doubt-panel-footer">
                                    <button className="doubt-resume-btn" onClick={handleResumeLesson}>
                                        ▶️ Resume Lesson
                                    </button>
                                    <button className="doubt-ask-another" onClick={() => {
                                        setDoubtTranscript('');
                                        setDoubtAnswer('');
                                        setDoubtTypedText('');
                                        if (hasSpeechRecognition) {
                                            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                                            const r = new SR();
                                            r.lang = language === 'ta' ? 'ta-IN' : 'en-US';
                                            r.interimResults = false;
                                            r.onresult = (ev) => {
                                                const t = ev.results[0][0].transcript;
                                                setDoubtTranscript(t);
                                                submitDoubt(t);
                                            };
                                            recognitionRef.current = r;
                                            r.start();
                                        }
                                    }}>
                                        🎤 Ask Another
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== END-OF-SESSION Q&A OVERLAY ===== */}
                {endSessionQA && (
                    <div className="doubt-panel-overlay">
                        <div className="doubt-panel end-session-panel">
                            <div className="doubt-panel-header" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(99,102,241,0.1))' }}>
                                <span>🎓 Session Complete</span>
                                <button className="doubt-panel-close" onClick={handleEndSessionDismiss}>✕</button>
                            </div>

                            <div className="doubt-panel-body">
                                {/* Prompt phase — show teacher, wait for user to type or click mic */}
                                {(endSessionPhase === 'prompt' || endSessionPhase === 'prompting') && (
                                    <>
                                        <div className="doubt-listening" style={{ padding: '16px 0' }}>
                                            <div style={{ fontSize: '42px', marginBottom: '10px' }}>👩‍🏫</div>
                                            <p style={{ color: '#e2e8f0', fontWeight: 600 }}>
                                                {language === 'ta'
                                                    ? 'இந்த தலைப்பில் கேள்விகள் இருந்தால் கேளுங்கள்!'
                                                    : 'Session complete! Type a question below or click the mic.'}
                                            </p>
                                        </div>
                                        {/* Text input — always visible in prompt phase */}
                                        <div className="doubt-type-fallback">
                                            <input
                                                type="text"
                                                className="doubt-type-input"
                                                placeholder={language === 'ta' ? 'உங்கள் கேள்வியை தட்டச்சு செய்யவும்...' : 'Type your question here...'}
                                                value={endSessionTyped}
                                                onChange={(e) => setEndSessionTyped(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && endSessionTyped.trim()) {
                                                        setEndSessionQuestion(endSessionTyped);
                                                        handleEndSessionQuestion(endSessionTyped);
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                className="doubt-send-btn"
                                                onClick={() => {
                                                    if (endSessionTyped.trim()) {
                                                        setEndSessionQuestion(endSessionTyped);
                                                        handleEndSessionQuestion(endSessionTyped);
                                                    }
                                                }}
                                                disabled={!endSessionTyped.trim()}
                                            >
                                                Ask
                                            </button>
                                        </div>
                                        {/* Mic button — only if speech recognition available */}
                                        {hasSpeechRecognition && (
                                            <button
                                                style={{
                                                    margin: '12px auto 0', display: 'block',
                                                    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                                                    color: '#fff', border: 'none', borderRadius: '12px',
                                                    padding: '10px 24px', cursor: 'pointer', fontSize: '0.95rem'
                                                }}
                                                onClick={() => {
                                                    setEndSessionPhase('listening');
                                                    startEndSessionListening();
                                                }}
                                            >
                                                🎤 {language === 'ta' ? 'பேசி கேளுங்கள்' : 'Ask by Voice'}
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* Listening phase */}
                                {endSessionPhase === 'listening' && (
                                    <>
                                        <div className="doubt-listening">
                                            <div className="doubt-listening-waves">
                                                <span></span><span></span><span></span><span></span><span></span>
                                            </div>
                                            <p>{hasSpeechRecognition ? '🎤 Listening... ask your question now!' : 'Type your question below'}</p>
                                            <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '8px' }}>
                                                (Will close automatically if no question is asked)
                                            </p>
                                        </div>

                                        <div className="doubt-type-fallback">
                                            <input
                                                type="text"
                                                className="doubt-type-input"
                                                placeholder="Type your question here..."
                                                value={endSessionTyped}
                                                onChange={(e) => setEndSessionTyped(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && endSessionTyped.trim()) {
                                                        if (endSessionTimeoutRef.current) clearTimeout(endSessionTimeoutRef.current);
                                                        setEndSessionQuestion(endSessionTyped);
                                                        handleEndSessionQuestion(endSessionTyped);
                                                    }
                                                }}
                                            />
                                            <button
                                                className="doubt-send-btn"
                                                onClick={() => {
                                                    if (endSessionTyped.trim()) {
                                                        if (endSessionTimeoutRef.current) clearTimeout(endSessionTimeoutRef.current);
                                                        setEndSessionQuestion(endSessionTyped);
                                                        handleEndSessionQuestion(endSessionTyped);
                                                    }
                                                }}
                                                disabled={!endSessionTyped.trim()}
                                            >
                                                Ask
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Asked question display */}
                                {endSessionQuestion && (
                                    <div className="doubt-transcript">
                                        <strong>Your question:</strong>
                                        <p>{endSessionQuestion}</p>
                                    </div>
                                )}

                                {/* Answering phase — loading */}
                                {endSessionPhase === 'answering' && !endSessionAnswer && (
                                    <div className="doubt-loading">
                                        <div className="doubt-loading-spinner"></div>
                                        <p>Finding the answer...</p>
                                    </div>
                                )}

                                {/* Answer display */}
                                {endSessionAnswer && (
                                    <div className="doubt-answer">
                                        <strong>Answer:</strong>
                                        <p>{endSessionAnswer}</p>
                                    </div>
                                )}

                                {/* Thanking phase */}
                                {endSessionPhase === 'thanking' && (
                                    <div className="doubt-listening" style={{ padding: '24px 0' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🙏</div>
                                        <p style={{ color: '#4ade80', fontWeight: 700, fontSize: '1.1rem' }}>
                                            {language === 'ta' ? 'நன்றி! கற்றலை தொடருங்கள்!' : 'Thank you! Keep learning!'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer buttons */}
                            <div className="doubt-panel-footer">
                                {(endSessionPhase === 'prompt' || endSessionPhase === 'listening') && (
                                    <button className="doubt-resume-btn" onClick={handleEndSessionNoQuestion}
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                                        👋 {language === 'ta' ? 'கேள்வி இல்லை' : 'No More Questions'}
                                    </button>
                                )}
                                {endSessionAnswer && (
                                    <>
                                        <button className="doubt-ask-another" onClick={handleEndSessionAskAnother}>
                                            🎤 Ask Another
                                        </button>
                                        <button className="doubt-resume-btn" onClick={handleEndSessionNoQuestion}
                                            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                                            👋 No More Questions
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AITeacher;
