import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../services/api';

const VideoGenerationDashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const requestedTopic = searchParams.get('topic') || '';
    const requestedDoc = searchParams.get('doc') || '';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedDocs, setExpandedDocs] = useState({});
    const [batchStarting, setBatchStarting] = useState(false);
    const [dismissedBanner, setDismissedBanner] = useState(false);
    const pollRef = useRef(null);
    const highlightRef = useRef(null);

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await apiService.getVideoDashboard();
            if (res && res.success) {
                setData(res);
                setError(null);
                // Auto-expand all documents on first load
                if (!Object.keys(expandedDocs).length && res.documents) {
                    const expanded = {};
                    res.documents.forEach(d => { expanded[d.doc_name] = true; });
                    setExpandedDocs(expanded);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Auto-refresh every 5 seconds when batch is running
    useEffect(() => {
        const isRunning = data?.batch_status?.running;
        if (isRunning) {
            pollRef.current = setInterval(fetchDashboard, 5000);
        } else {
            if (pollRef.current) clearInterval(pollRef.current);
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [data?.batch_status?.running, fetchDashboard]);

    // Scroll to highlighted topic — only ONCE on first load
    const hasScrolledRef = useRef(false);
    useEffect(() => {
        if (requestedTopic && highlightRef.current && !loading && !hasScrolledRef.current) {
            hasScrolledRef.current = true;
            setTimeout(() => {
                highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, [requestedTopic, loading, data]);

    // Find the requested topic info
    const findRequestedTopic = () => {
        if (!requestedTopic || !data?.documents) return null;
        for (const doc of data.documents) {
            for (const t of (doc.topics || [])) {
                if (t.title?.toLowerCase() === requestedTopic.toLowerCase()) {
                    return { ...t, doc_name: doc.doc_name };
                }
            }
        }
        return null;
    };

    const requestedTopicInfo = data ? findRequestedTopic() : null;

    const handleStartBatch = async () => {
        setBatchStarting(true);
        try {
            await apiService.startBatchGeneration();
            setTimeout(fetchDashboard, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setBatchStarting(false);
        }
    };

    const handleCancelBatch = async () => {
        try {
            await apiService.cancelBatchGeneration();
            setTimeout(fetchDashboard, 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleDoc = (docName) => {
        setExpandedDocs(prev => ({ ...prev, [docName]: !prev[docName] }));
    };

    const handlePlayVideo = (topic) => {
        navigate(`/avatar-studio?topic=${encodeURIComponent(topic)}`);
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner} />
                    <p style={styles.loadingText}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const summary = data?.summary || {};
    const documents = data?.documents || [];
    const batchStatus = data?.batch_status || {};
    const isRunning = batchStatus.running;

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
                    <h1 style={styles.title}>🎬 Video Generation Dashboard</h1>
                </div>
                <div style={styles.headerRight}>
                    {isRunning ? (
                        <button style={styles.cancelBtn} onClick={handleCancelBatch}>
                            ⏹ Cancel Batch
                        </button>
                    ) : (
                        <button
                            style={{
                                ...styles.generateBtn,
                                ...(batchStarting || summary.topics_without_video === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                            }}
                            onClick={handleStartBatch}
                            disabled={batchStarting || summary.topics_without_video === 0}
                        >
                            {batchStarting ? '⏳ Starting...' : summary.topics_without_video === 0 ? '✅ All Done!' : '🚀 Generate All Missing'}
                        </button>
                    )}
                    <button style={styles.refreshBtn} onClick={fetchDashboard}>🔄</button>
                </div>
            </header>

            {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

            {/* Requested Topic Banner — shown when user came from AITeacher */}
            {requestedTopic && !dismissedBanner && requestedTopicInfo && (
                <div style={requestedTopicInfo.has_video ? styles.topicBannerSuccess : styles.topicBannerWait}>
                    <div style={styles.bannerContent}>
                        <div style={styles.bannerIcon}>
                            {requestedTopicInfo.has_video ? '🎬' : '⏳'}
                        </div>
                        <div style={styles.bannerText}>
                            {requestedTopicInfo.has_video ? (
                                <>
                                    <strong>Video ready!</strong> The video for <strong>"{requestedTopic}"</strong> is available.
                                </>
                            ) : (
                                <>
                                    <strong>Video not ready yet</strong> — The video for <strong>"{requestedTopic}"</strong> is still being processed.
                                    Please wait some time for it to complete. Meanwhile, you can <strong>watch other videos</strong> that are already ready below! 🎥
                                </>
                            )}
                        </div>
                        <div style={styles.bannerActions}>
                            {requestedTopicInfo.has_video && (
                                <button
                                    style={styles.bannerPlayBtn}
                                    onClick={() => handlePlayVideo(requestedTopic)}
                                >
                                    ▶ Watch Now
                                </button>
                            )}
                            <button
                                style={styles.bannerDismissBtn}
                                onClick={() => setDismissedBanner(true)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Requested topic not found banner */}
            {requestedTopic && !dismissedBanner && !requestedTopicInfo && data && (
                <div style={styles.topicBannerWait}>
                    <div style={styles.bannerContent}>
                        <div style={styles.bannerIcon}>⏳</div>
                        <div style={styles.bannerText}>
                            <strong>Topic "{requestedTopic}" not found yet.</strong> It may still be processing.
                            Meanwhile, browse and watch other available videos below! 🎥
                        </div>
                        <button style={styles.bannerDismissBtn} onClick={() => setDismissedBanner(true)}>✕</button>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryIcon}>📄</div>
                    <div style={styles.summaryValue}>{summary.total_documents || 0}</div>
                    <div style={styles.summaryLabel}>Documents</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryIcon}>📋</div>
                    <div style={styles.summaryValue}>{summary.total_topics || 0}</div>
                    <div style={styles.summaryLabel}>Total Topics</div>
                </div>
                <div style={{ ...styles.summaryCard, borderColor: '#22c55e44' }}>
                    <div style={styles.summaryIcon}>✅</div>
                    <div style={{ ...styles.summaryValue, color: '#22c55e' }}>{summary.topics_with_video || 0}</div>
                    <div style={styles.summaryLabel}>Videos Ready</div>
                </div>
                <div style={{ ...styles.summaryCard, borderColor: '#f59e0b44' }}>
                    <div style={styles.summaryIcon}>⏳</div>
                    <div style={{ ...styles.summaryValue, color: '#f59e0b' }}>{summary.topics_without_video || 0}</div>
                    <div style={styles.summaryLabel}>Pending</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressContainer}>
                <div style={styles.progressHeader}>
                    <span style={styles.progressLabel}>
                        Overall Progress
                        {isRunning && <span style={styles.liveIndicator}> ● LIVE</span>}
                    </span>
                    <span style={styles.progressPercent}>{summary.completion_percent || 0}%</span>
                </div>
                <div style={styles.progressTrack}>
                    <div style={{
                        ...styles.progressBar,
                        width: `${summary.completion_percent || 0}%`,
                        background: (summary.completion_percent || 0) === 100
                            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                            : 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                    }} />
                </div>
                {isRunning && batchStatus.current_topic && (
                    <div style={styles.currentTopic}>
                        🎬 Now generating: <strong>{batchStatus.current_topic}</strong>
                        <span style={styles.batchProgress}>
                            ({batchStatus.completed || 0}/{batchStatus.total || 0} done)
                        </span>
                    </div>
                )}
            </div>

            {/* Documents */}
            <div style={styles.documentsContainer}>
                {documents.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📄</div>
                        <p style={{ color: '#7c7c9a' }}>No documents found. Upload documents to get started.</p>
                    </div>
                ) : (
                    documents.map((doc) => {
                        const docTopics = doc.topics || [];
                        const withVideo = docTopics.filter(t => t.has_video).length;
                        const total = docTopics.length;
                        const pct = total > 0 ? Math.round((withVideo / total) * 100) : 0;
                        const isExpanded = expandedDocs[doc.doc_name];

                        return (
                            <div key={doc.doc_name} style={styles.docCard}>
                                <div style={styles.docHeader} onClick={() => toggleDoc(doc.doc_name)}>
                                    <div style={styles.docLeft}>
                                        <span style={styles.docIcon}>{pct === 100 ? '✅' : '📄'}</span>
                                        <div>
                                            <div style={styles.docName}>{doc.doc_name}</div>
                                            <div style={styles.docMeta}>
                                                {withVideo}/{total} topics with videos · {pct}% complete
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.docRight}>
                                        <div style={styles.miniProgressTrack}>
                                            <div style={{
                                                ...styles.miniProgressBar,
                                                width: `${pct}%`,
                                                background: pct === 100 ? '#22c55e' : '#8b5cf6',
                                            }} />
                                        </div>
                                        <span style={styles.expandArrow}>{isExpanded ? '▼' : '▶'}</span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={styles.topicsList}>
                                        {docTopics.map((topic, idx) => {
                                            const isCurrentlyGenerating = isRunning &&
                                                batchStatus.current_topic?.toLowerCase() === topic.title?.toLowerCase();
                                            const isHighlighted = requestedTopic &&
                                                topic.title?.toLowerCase() === requestedTopic.toLowerCase();

                                            return (
                                                <div
                                                    key={idx}
                                                    ref={isHighlighted ? highlightRef : null}
                                                    style={{
                                                        ...styles.topicRow,
                                                        ...(isCurrentlyGenerating ? styles.topicRowActive : {}),
                                                        ...(topic.has_video ? styles.topicRowDone : {}),
                                                        ...(isHighlighted ? styles.topicRowHighlighted : {}),
                                                    }}
                                                >
                                                    <div style={styles.topicLeft}>
                                                        <span style={styles.topicStatus}>
                                                            {topic.has_video ? '✅' : isCurrentlyGenerating ? (
                                                                <span style={styles.spinnerSmall} />
                                                            ) : '⏳'}
                                                        </span>
                                                        <div>
                                                            <div style={{
                                                                ...styles.topicTitle,
                                                                ...(isHighlighted ? { color: '#fff', fontWeight: 700 } : {}),
                                                            }}>
                                                                {topic.title}
                                                                {isHighlighted && (
                                                                    <span style={styles.selectedBadge}>SELECTED</span>
                                                                )}
                                                            </div>
                                                            {topic.description && (
                                                                <div style={styles.topicDesc}>{topic.description}</div>
                                                            )}
                                                            {topic.key_concepts?.length > 0 && (
                                                                <div style={styles.tagRow}>
                                                                    {topic.key_concepts.slice(0, 4).map((c, i) => (
                                                                        <span key={i} style={styles.tag}>{c}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={styles.topicRight}>
                                                        {topic.difficulty && (
                                                            <span style={{
                                                                ...styles.difficultyBadge,
                                                                background: topic.difficulty === 'beginner' ? '#22c55e22' :
                                                                    topic.difficulty === 'intermediate' ? '#f59e0b22' : '#ef444422',
                                                                color: topic.difficulty === 'beginner' ? '#22c55e' :
                                                                    topic.difficulty === 'intermediate' ? '#f59e0b' : '#ef4444',
                                                            }}>
                                                                {topic.difficulty}
                                                            </span>
                                                        )}
                                                        {topic.has_video ? (
                                                            <button
                                                                style={isHighlighted ? styles.playBtnHighlighted : styles.playBtn}
                                                                onClick={(e) => { e.stopPropagation(); handlePlayVideo(topic.title); }}
                                                            >
                                                                ▶ {isHighlighted ? 'Watch Now' : 'Play'}
                                                            </button>
                                                        ) : (
                                                            <span style={styles.pendingLabel}>
                                                                {isCurrentlyGenerating ? 'Generating...' : 'Pending'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// ── Styles ──
const styles = {
    container: {
        minHeight: '100vh',
        background: '#0a0a14',
        color: '#e0e0f0',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: '24px 32px',
    },
    loadingContainer: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '60vh',
    },
    spinner: {
        width: 40, height: 40,
        border: '3px solid rgba(139,92,246,0.3)',
        borderTop: '3px solid #8b5cf6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    spinnerSmall: {
        display: 'inline-block', width: 16, height: 16,
        border: '2px solid rgba(139,92,246,0.3)',
        borderTop: '2px solid #8b5cf6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    loadingText: { color: '#64748b', fontSize: '0.85rem', marginTop: 12 },

    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    headerRight: { display: 'flex', alignItems: 'center', gap: 8 },
    backBtn: {
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#a0a0c0', padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
        fontSize: '0.85rem', transition: 'all 0.2s',
    },
    title: {
        fontSize: '1.5rem', fontWeight: 700,
        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        margin: 0,
    },
    generateBtn: {
        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
        color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10,
        fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
        transition: 'all 0.2s', opacity: 1,
    },
    cancelBtn: {
        background: 'rgba(239,68,68,0.15)', color: '#ef4444',
        border: '1px solid rgba(239,68,68,0.3)', padding: '10px 20px',
        borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
    },
    refreshBtn: {
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#a0a0c0', padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
        fontSize: '1rem',
    },

    errorBanner: {
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
        color: '#fca5a5', padding: '12px 16px', borderRadius: 10, marginBottom: 16,
        fontSize: '0.85rem',
    },

    // ── Topic Banner (when user comes from AITeacher) ──
    topicBannerSuccess: {
        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 16,
        animation: 'slideDown 0.3s ease-out',
    },
    topicBannerWait: {
        background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 16,
        animation: 'slideDown 0.3s ease-out',
    },
    bannerContent: {
        display: 'flex', alignItems: 'center', gap: 14,
    },
    bannerIcon: { fontSize: '2rem', flexShrink: 0 },
    bannerText: {
        flex: 1, fontSize: '0.88rem', color: '#e0e0f0', lineHeight: 1.5,
    },
    bannerActions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
    bannerPlayBtn: {
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 10,
        fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
        boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
        transition: 'all 0.2s',
    },
    bannerDismissBtn: {
        background: 'rgba(255,255,255,0.1)', border: 'none',
        color: '#a0a0c0', padding: '6px 10px', borderRadius: 6,
        cursor: 'pointer', fontSize: '0.85rem',
    },

    summaryGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12, marginBottom: 20,
    },
    summaryCard: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '18px 16px', textAlign: 'center',
        transition: 'transform 0.2s',
    },
    summaryIcon: { fontSize: '1.5rem', marginBottom: 6 },
    summaryValue: { fontSize: '1.8rem', fontWeight: 700, color: '#e0e0f0' },
    summaryLabel: { fontSize: '0.75rem', color: '#7c7c9a', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },

    progressContainer: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '18px 20px', marginBottom: 20,
    },
    progressHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
    },
    progressLabel: { fontSize: '0.85rem', color: '#a0a0c0', fontWeight: 500 },
    progressPercent: { fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6' },
    liveIndicator: { color: '#22c55e', fontSize: '0.75rem', animation: 'pulse 1.5s infinite' },
    progressTrack: {
        width: '100%', height: 10, background: 'rgba(255,255,255,0.06)',
        borderRadius: 5, overflow: 'hidden',
    },
    progressBar: {
        height: '100%', borderRadius: 5,
        transition: 'width 0.5s ease-out',
    },
    currentTopic: {
        marginTop: 10, fontSize: '0.8rem', color: '#a0a0c0',
        paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)',
    },
    batchProgress: { color: '#7c7c9a', marginLeft: 8 },

    documentsContainer: { display: 'flex', flexDirection: 'column', gap: 12 },
    emptyState: {
        textAlign: 'center', padding: 60,
        background: 'rgba(255,255,255,0.04)', borderRadius: 14,
    },

    docCard: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, overflow: 'hidden', transition: 'all 0.2s',
    },
    docHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', cursor: 'pointer',
        transition: 'background 0.2s',
    },
    docLeft: { display: 'flex', alignItems: 'center', gap: 12 },
    docIcon: { fontSize: '1.3rem' },
    docName: { fontSize: '0.95rem', fontWeight: 600, color: '#e0e0f0' },
    docMeta: { fontSize: '0.75rem', color: '#7c7c9a', marginTop: 2 },
    docRight: { display: 'flex', alignItems: 'center', gap: 12 },
    miniProgressTrack: {
        width: 80, height: 6, background: 'rgba(255,255,255,0.08)',
        borderRadius: 3, overflow: 'hidden',
    },
    miniProgressBar: {
        height: '100%', borderRadius: 3, transition: 'width 0.5s ease-out',
    },
    expandArrow: { color: '#7c7c9a', fontSize: '0.75rem' },

    topicsList: {
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '4px 0',
    },
    topicRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)',
        transition: 'all 0.2s',
    },
    topicRowDone: {
        background: 'rgba(34,197,94,0.04)',
    },
    topicRowActive: {
        background: 'rgba(139,92,246,0.08)',
        borderLeft: '3px solid #8b5cf6',
    },
    topicRowHighlighted: {
        background: 'rgba(139,92,246,0.15)',
        borderLeft: '4px solid #8b5cf6',
        boxShadow: 'inset 0 0 20px rgba(139,92,246,0.1)',
    },
    topicLeft: { display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 },
    topicStatus: { fontSize: '1.1rem', minWidth: 24, textAlign: 'center', marginTop: 2 },
    topicTitle: { fontSize: '0.85rem', fontWeight: 500, color: '#d0d0e8' },
    topicDesc: { fontSize: '0.75rem', color: '#7c7c9a', marginTop: 3, lineHeight: 1.4 },
    tagRow: { display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 },
    tag: {
        fontSize: '0.65rem', padding: '2px 8px',
        background: 'rgba(139,92,246,0.12)', color: '#a78bfa',
        borderRadius: 4, whiteSpace: 'nowrap',
    },
    selectedBadge: {
        display: 'inline-block', marginLeft: 8,
        fontSize: '0.6rem', padding: '2px 8px',
        background: 'rgba(139,92,246,0.3)', color: '#c4b5fd',
        borderRadius: 4, fontWeight: 700, letterSpacing: '0.5px',
        verticalAlign: 'middle',
    },
    topicRight: { display: 'flex', alignItems: 'center', gap: 8 },
    difficultyBadge: {
        fontSize: '0.65rem', padding: '3px 8px', borderRadius: 6,
        fontWeight: 500, textTransform: 'capitalize',
    },
    playBtn: {
        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
        color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8,
        fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem',
        transition: 'all 0.2s',
    },
    playBtnHighlighted: {
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8,
        fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
        boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
        transition: 'all 0.2s',
        animation: 'pulse 2s infinite',
    },
    pendingLabel: {
        fontSize: '0.7rem', padding: '3px 10px',
        background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
        borderRadius: 6, fontWeight: 500,
    },
    generatingBadge: {
        fontSize: '0.7rem', padding: '3px 10px',
        background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
        borderRadius: 6, fontWeight: 500,
        animation: 'pulse 1.5s infinite',
    },
};

// Inject keyframes
if (typeof document !== 'undefined') {
    const styleTag = document.getElementById('vgd-keyframes') || (() => {
        const s = document.createElement('style');
        s.id = 'vgd-keyframes';
        document.head.appendChild(s);
        return s;
    })();
    styleTag.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
  `;
}

export default VideoGenerationDashboard;
