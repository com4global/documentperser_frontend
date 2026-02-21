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
                // (skip if user is currently in the doubt panel)
                // Use the ref (not state) — state is a stale closure here
                if (!cancelled && !isAskingDoubtRef.current) {
                    triggerEndOfSessionQA();
                    // ── Progress: mark conversation completed ──
                    if (onActivityCompleteRef.current) onActivityCompleteRef.current('conversation', 0);
                }
            };

            playSequence();
            return () => {
                cancelled = true;
                // Stop any currently-playing dialogue audio immediately
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
        <div className="ai-teacher-overlay" onClick={() => { stopAllAudio(); onClose(); }}>
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
                                    <p>⏳ Creating script and generating audio… (may take 10–20 seconds)</p>
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
