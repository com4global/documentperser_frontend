import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import '../Styles/AITeacher.css';

const AITeacher = ({ onClose }) => {
    const { t, language } = useLanguage();
    const [view, setView] = useState('documents'); // documents | chapters | topics | loading | lesson
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

    // Quiz state
    const [quizAnswer, setQuizAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);

    // Q&A state
    const [qaQuestion, setQaQuestion] = useState('');
    const [qaAnswer, setQaAnswer] = useState('');
    const [qaLoading, setQaLoading] = useState(false);

    const dialogueEndRef = useRef(null);

    // Load documents on mount
    useEffect(() => {
        loadDocuments();
    }, []);

    // Animate dialogue bubbles
    useEffect(() => {
        if (view === 'lesson' && lesson?.dialogue) {
            setVisibleBubbles(0);
            const total = lesson.dialogue.length;
            let count = 0;
            const timer = setInterval(() => {
                count++;
                setVisibleBubbles(count);
                if (count >= total) clearInterval(timer);
            }, 600);
            return () => clearInterval(timer);
        }
    }, [view, lesson]);

    // Scroll to latest bubble
    useEffect(() => {
        if (dialogueEndRef.current) {
            dialogueEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [visibleBubbles]);

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

    const generateLesson = async (topicTitle) => {
        setSelectedTopic(topicTitle);
        setView('loading');
        setQuizAnswer(null);
        setShowExplanation(false);
        setQaAnswer('');

        try {
            const result = await apiService.generateLesson(topicTitle, language);
            if (result.success && result.lesson) {
                setLesson(result.lesson);
                setView('lesson');
            } else {
                alert(result.detail || 'Failed to generate lesson');
                setView('topics');
            }
        } catch (err) {
            console.error('Lesson generation failed:', err);
            alert('Failed to generate lesson. Please try again.');
            setView('topics');
        }
    };

    const handleQuizAnswer = (optionIndex) => {
        if (quizAnswer !== null) return;
        setQuizAnswer(optionIndex);
        setShowExplanation(true);
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
            <div className="ai-teacher-modal" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="ai-teacher-header">
                    <div className="ai-teacher-header-left">
                        <div className="ai-teacher-header-icon">🎓</div>
                        <div>
                            <h2>{t('aiTeacherTitle') || 'AI Teacher'}</h2>
                            <p>{t('aiTeacherSubtitle') || 'Interactive Learning from Your Documents'}</p>
                        </div>
                    </div>
                    <button className="ai-teacher-close" onClick={onClose}>✕</button>
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
                                            onClick={() => generateLesson(topic.title)}
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

                    {/* ===== LOADING VIEW ===== */}
                    {view === 'loading' && (
                        <div className="ai-teacher-loading">
                            <div className="ai-teacher-loading-spinner"></div>
                            <h3>🎬 {t('generatingLesson') || 'Generating AI Lesson...'}</h3>
                            <p>{t('creatingDialogue') || 'Creating an engaging dialogue between AI teachers'}</p>
                        </div>
                    )}

                    {/* ===== STEP 3: LESSON VIEW ===== */}
                    {view === 'lesson' && lesson && (
                        <div className="ai-teacher-lesson">
                            <button className="ai-teacher-back-btn" onClick={() => setView('topics')}>
                                ← {t('backToTopics') || 'Back to Topics'}
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
                                                <div className="ai-teacher-bubble-name">{msg.speaker}</div>
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

                                    {/* Quiz */}
                                    {lesson.quiz && (
                                        <div className="ai-teacher-quiz">
                                            <div className="ai-teacher-quiz-title">
                                                🧠 {t('quickQuiz') || 'Quick Quiz'}
                                            </div>
                                            <div className="ai-teacher-quiz-question">{lesson.quiz.question}</div>
                                            <div className="ai-teacher-quiz-options">
                                                {lesson.quiz.options?.map((option, idx) => {
                                                    let className = 'ai-teacher-quiz-option';
                                                    if (quizAnswer !== null) {
                                                        className += ' disabled';
                                                        if (idx === lesson.quiz.correct) className += ' correct';
                                                        else if (idx === quizAnswer) className += ' wrong';
                                                    }
                                                    return (
                                                        <button
                                                            key={idx}
                                                            className={className}
                                                            onClick={() => handleQuizAnswer(idx)}
                                                            disabled={quizAnswer !== null}
                                                        >
                                                            {option}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {showExplanation && (
                                                <div className="ai-teacher-quiz-explanation">
                                                    {quizAnswer === lesson.quiz.correct ? '🎉 ' : '💡 '}
                                                    {lesson.quiz.explanation}
                                                </div>
                                            )}
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
