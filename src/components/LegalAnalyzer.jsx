import React, { useState, useRef, useEffect } from 'react';
import apiService from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { generateLegalPdf } from '../utils/pdfGenerator';
import '../Styles/LegalAnalyzer.css';

const HISTORY_KEY = 'legalAnalysisHistory';

const LegalAnalyzer = ({ onClose }) => {
    const { t, language } = useLanguage();
    const [state, setState] = useState('upload'); // upload | loading | results | error
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('upload'); // upload | link | youtube
    const [urlInput, setUrlInput] = useState('');

    // New: History & View states
    const [viewMode, setViewMode] = useState('analyzer'); // analyzer | history
    const [history, setHistory] = useState([]);
    const [viewingRecord, setViewingRecord] = useState(null);

    // Load history from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            if (saved) setHistory(JSON.parse(saved));
        } catch (e) { console.warn('Failed to load history', e); }
    }, []);

    const SUPPORTED_TYPES = ['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.xls', '.csv', '.jpg', '.jpeg', '.png', '.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];

    const handleFileSelect = (file) => {
        if (!file) return;
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!SUPPORTED_TYPES.includes(ext)) {
            setError(`Unsupported file type: ${ext}. Please upload a supported document, image, or audio file.`);
            setState('error');
            return;
        }
        setSelectedFile(file);
        startAnalysis({ file });
    };

    const handleUrlAnalysis = () => {
        if (!urlInput.trim()) return;
        setState('loading');
        // Simple heuristic for type
        const type = activeTab === 'youtube' ? 'YouTube Video' : 'Website';
        setSelectedFile({ name: `${type}: ${urlInput}` }); // Mock file object for display
        startAnalysis({ url: urlInput });
    };

    const startAnalysis = async (payload) => {
        setState('loading');
        setLoadingStep(0);

        const stepTimer1 = setTimeout(() => setLoadingStep(1), 1500);
        const stepTimer2 = setTimeout(() => setLoadingStep(2), 3500);
        const stepTimer3 = setTimeout(() => setLoadingStep(3), 6000);

        try {
            const result = await apiService.analyzeLegalDocument({ ...payload, language });
            clearTimeout(stepTimer1);
            clearTimeout(stepTimer2);
            clearTimeout(stepTimer3);

            if (result.success && result.analysis) {
                setAnalysis(result.analysis);
                setState('results');
                // Save to history
                saveToHistory(selectedFile?.name || 'Unknown', result.analysis);
            } else {
                throw new Error(result.detail || 'Analysis failed');
            }
        } catch (err) {
            clearTimeout(stepTimer1);
            clearTimeout(stepTimer2);
            clearTimeout(stepTimer3);
            setError(err.message || 'Failed to analyze content. Please try again.');
            setState('error');
        }
    };

    // ---- History helpers ----
    const saveToHistory = (fileName, analysisData) => {
        const record = {
            id: Date.now().toString(),
            fileName,
            date: new Date().toISOString(),
            riskScore: analysisData.risk_score || 0,
            issueCount: analysisData.issues?.length || 0,
            documentType: analysisData.document_type || '',
            totalPages: analysisData.total_pages || null,
            analysis: analysisData
        };
        const updated = [record, ...history].slice(0, 50); // Keep last 50
        setHistory(updated);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch (e) { /* quota */ }
    };

    const handleDownloadPdf = (analysisData, fileName) => {
        generateLegalPdf(analysisData, fileName, language);
    };

    const handleViewRecord = (record) => {
        setViewingRecord(record);
        setAnalysis(record.analysis);
        setSelectedFile({ name: record.fileName });
        setState('results');
        setViewMode('analyzer');
    };

    const handleDeleteRecord = (recordId) => {
        const updated = history.filter(h => h.id !== recordId);
        setHistory(updated);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch (e) { /* quota */ }
    };

    const clearAllHistory = () => {
        setHistory([]);
        try { localStorage.removeItem(HISTORY_KEY); } catch (e) { /* */ }
    };

    const formatHistoryDate = (isoStr) => {
        try {
            return new Date(isoStr).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        } catch { return isoStr; }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const resetAnalyzer = () => {
        setState('upload');
        setAnalysis(null);
        setError('');
        setSelectedFile(null);
        setLoadingStep(0);
        setUrlInput('');
        setViewingRecord(null);
    };

    // Helper to get risk color
    const getRiskColor = (score) => {
        if (score >= 70) return '#ef4444';
        if (score >= 40) return '#f59e0b';
        return '#22c55e';
    };

    // Risk gauge SVG
    const RiskGauge = ({ score }) => {
        const radius = 65;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;
        const color = getRiskColor(score);

        return (
            <div className="legal-risk-gauge">
                <div className="legal-gauge-circle">
                    <svg width="160" height="160" viewBox="0 0 160 160">
                        <circle className="legal-gauge-bg" cx="80" cy="80" r={radius} />
                        <circle
                            className="legal-gauge-fill"
                            cx="80" cy="80" r={radius}
                            stroke={color}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                        />
                    </svg>
                    <div className="legal-gauge-text">
                        <span className="legal-gauge-value" style={{ color }}>{score}</span>
                        <span className="legal-gauge-label">Risk Score</span>
                    </div>
                </div>
                {analysis?.document_type && (
                    <span className="legal-doc-type">{analysis.document_type}</span>
                )}
                {analysis?.total_pages && (
                    <span className="legal-doc-meta">{analysis.total_pages} pages analyzed</span>
                )}
            </div>
        );
    };

    // Breakdown bar color
    const getBarColor = (val) => {
        if (val >= 70) return '#ef4444';
        if (val >= 40) return '#f59e0b';
        return '#22c55e';
    };

    return (
        <div className="legal-analyzer-overlay" onClick={onClose}>
            <div className="legal-analyzer-modal" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="legal-header">
                    <div className="legal-header-left">
                        <div className="legal-header-icon">⚖️</div>
                        <div>
                            <h2>{t('legalTitle')}</h2>
                            <p>{t('legalSubtitle')}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {state === 'results' && (
                            <>
                                <button className="legal-download-btn" onClick={() => handleDownloadPdf(analysis, selectedFile?.name || 'document')}>
                                    📥 {t('downloadPdf')}
                                </button>
                                <button className="legal-new-analysis-btn" onClick={resetAnalyzer}>
                                    📄 {t('newAnalysis')}
                                </button>
                            </>
                        )}
                        <button className="legal-close-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                {/* View Mode Tabs: Analyzer | History */}
                <div className="legal-view-tabs">
                    <button
                        className={`legal-view-tab ${viewMode === 'analyzer' ? 'active' : ''}`}
                        onClick={() => setViewMode('analyzer')}
                    >
                        ⚖️ {t('legalTitle')}
                    </button>
                    <button
                        className={`legal-view-tab ${viewMode === 'history' ? 'active' : ''}`}
                        onClick={() => setViewMode('history')}
                    >
                        📋 {t('analysisHistory')} {history.length > 0 && <span className="legal-history-badge">{history.length}</span>}
                    </button>
                </div>

                <div className="legal-content">

                    {/* ===== HISTORY VIEW ===== */}
                    {viewMode === 'history' && (
                        <div className="legal-history-section">
                            <div className="legal-history-header">
                                <div>
                                    <h3>📋 {t('analysisHistory')}</h3>
                                    <p className="legal-history-subtitle">{t('analysisHistoryDesc')}</p>
                                </div>
                                {history.length > 0 && (
                                    <button className="legal-clear-history-btn" onClick={clearAllHistory}>
                                        🗑️ {t('clearHistory')}
                                    </button>
                                )}
                            </div>

                            {history.length === 0 ? (
                                <div className="legal-history-empty">
                                    <div className="legal-history-empty-icon">📭</div>
                                    <h4>{t('noHistory')}</h4>
                                    <p>{t('noHistoryDesc')}</p>
                                </div>
                            ) : (
                                <div className="legal-history-table-wrapper">
                                    <table className="legal-history-table">
                                        <thead>
                                            <tr>
                                                <th>{t('historyFileName')}</th>
                                                <th>{t('historyDate')}</th>
                                                <th>{t('historyRisk')}</th>
                                                <th>{t('historyIssues')}</th>
                                                <th>{t('thActions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map((record) => (
                                                <tr key={record.id} className="legal-history-row">
                                                    <td className="legal-history-filename">
                                                        <span className="legal-history-file-icon">📄</span>
                                                        <div>
                                                            <div className="legal-history-name">{record.fileName}</div>
                                                            {record.documentType && <div className="legal-history-type">{record.documentType}</div>}
                                                        </div>
                                                    </td>
                                                    <td className="legal-history-date">{formatHistoryDate(record.date)}</td>
                                                    <td>
                                                        <span className={`legal-history-risk-badge ${record.riskScore >= 70 ? 'high' : record.riskScore >= 40 ? 'medium' : 'low'}`}>
                                                            {record.riskScore}
                                                        </span>
                                                    </td>
                                                    <td className="legal-history-issues">{record.issueCount}</td>
                                                    <td className="legal-history-actions">
                                                        <button className="legal-history-action-btn view" onClick={() => handleViewRecord(record)} title={t('viewReport')}>
                                                            👁️
                                                        </button>
                                                        <button className="legal-history-action-btn download" onClick={() => handleDownloadPdf(record.analysis, record.fileName)} title={t('downloadPdf')}>
                                                            📥
                                                        </button>
                                                        <button className="legal-history-action-btn delete" onClick={() => handleDeleteRecord(record.id)} title={t('deleteBtn')}>
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== ANALYZER VIEW ===== */}
                    {viewMode === 'analyzer' && (<>

                        {/* ===== UPLOAD STATE ===== */}
                        {state === 'upload' && (
                            <div>
                                <div className="legal-tabs">
                                    <button
                                        className={`legal-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('upload')}
                                    >
                                        {t('uploadTab')}
                                    </button>
                                    <button
                                        className={`legal-tab-btn ${activeTab === 'link' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('link')}
                                    >
                                        {t('linkTab')}
                                    </button>
                                    <button
                                        className={`legal-tab-btn ${activeTab === 'youtube' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('youtube')}
                                    >
                                        {t('youtubeTab')}
                                    </button>
                                </div>

                                {activeTab === 'upload' && (
                                    <div
                                        className={`legal-upload-area ${dragOver ? 'drag-over' : ''}`}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <span className="legal-upload-icon">📋</span>
                                        <h3>{t('uploadTitle')}</h3>
                                        <p>{t('uploadDesc')}</p>
                                        <div className="legal-upload-formats">
                                            {['PDF', 'DOCX', 'IMG', 'MP3', 'MP4', 'WAV'].map(f => (
                                                <span key={f} className="legal-format-tag">{f}</span>
                                            ))}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileSelect(e.target.files[0])}
                                        />
                                    </div>
                                )}

                                {(activeTab === 'link' || activeTab === 'youtube') && (
                                    <div style={{ padding: '40px 0' }}>
                                        <h3>{activeTab === 'youtube' ? t('analyzeYoutube') : t('analyzeUrl')}</h3>
                                        <p style={{ color: '#64748b' }}>
                                            {activeTab === 'youtube'
                                                ? t('pasteYoutube')
                                                : t('pasteUrl')}
                                        </p>
                                        <div className="legal-url-input-container">
                                            <input
                                                type="text"
                                                className="legal-url-input"
                                                placeholder={activeTab === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com/contract'}
                                                value={urlInput}
                                                onChange={(e) => setUrlInput(e.target.value)}
                                            />
                                            <button
                                                className="legal-url-submit-btn"
                                                disabled={!urlInput.trim()}
                                                onClick={handleUrlAnalysis}
                                            >
                                                {t('analyzeBtn')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== LOADING STATE ===== */}
                        {state === 'loading' && (
                            <div className="legal-loading">
                                <div className="legal-loading-spinner" />
                                <h3>{t('analyzing')} "{selectedFile?.name}"</h3>
                                <p>{t('analyzingDesc')}</p>
                                <div className="legal-loading-steps">
                                    {[t('stepExtract'), t('stepIssues'), t('stepRisks'), t('stepReport')].map((step, i) => (
                                        <span key={i} className={`legal-loading-step ${loadingStep >= i ? 'active' : ''}`}>
                                            {loadingStep > i ? '✅' : loadingStep === i ? '⏳' : '⬜'} {step}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ===== ERROR STATE ===== */}
                        {state === 'error' && (
                            <div className="legal-error">
                                <div className="legal-error-icon">❌</div>
                                <h3>{t('analysisFailed')}</h3>
                                <p>{error}</p>
                                <button className="legal-retry-btn" onClick={resetAnalyzer}>{t('tryAgain')}</button>
                            </div>
                        )}

                        {/* ===== RESULTS DASHBOARD ===== */}
                        {state === 'results' && analysis && (
                            <div className="legal-dashboard">

                                {/* Row 1: Risk Gauge + Summary */}
                                <div className="legal-top-row">
                                    <div className="legal-card">
                                        <div className="legal-card-title">🎯 {t('overallRisk')}</div>
                                        <RiskGauge score={analysis.risk_score || 0} />
                                    </div>
                                    <div className="legal-card">
                                        <div className="legal-card-title">📋 {t('docSummary')}</div>
                                        <p className="legal-summary-text">{analysis.summary}</p>
                                        {analysis.entities?.length > 0 && (
                                            <div className="legal-entities-bar">
                                                {analysis.entities.map((ent, i) => (
                                                    <span key={i} className="legal-entity-chip">
                                                        {ent.name} <small>({ent.role})</small>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* NEW: Critical Findings */}
                                {analysis.critical_findings?.length > 0 && (
                                    <div className="legal-card legal-critical-card">
                                        <div className="legal-card-title">⚡ {t('criticalFindings')} ({analysis.critical_findings.length})</div>
                                        <div className="legal-critical-grid">
                                            {analysis.critical_findings.map((cf) => (
                                                <div key={cf.id} className={`legal-critical-item severity-${cf.severity}`}>
                                                    <div className="legal-critical-badge">
                                                        {cf.severity === 'high' ? '🚨' : cf.severity === 'medium' ? '⚠️' : 'ℹ️'}
                                                    </div>
                                                    <div className="legal-critical-body">
                                                        <div className="legal-critical-finding">{cf.finding}</div>
                                                        <div className="legal-critical-impact">{cf.impact}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Row 2: Risk Breakdown */}
                                {analysis.risk_breakdown && (
                                    <div className="legal-card">
                                        <div className="legal-card-title">📊 {t('riskBreakdown')}</div>
                                        <div className="legal-breakdown-grid">
                                            {Object.entries(analysis.risk_breakdown).map(([key, val]) => {
                                                const categoryMap = {
                                                    Financial: t('riskCatFinancial'), Legal: t('riskCatLegal'),
                                                    Compliance: t('riskCatCompliance'), Operational: t('riskCatOperational'),
                                                    'நிதி': t('riskCatFinancial'), 'சட்டம்': t('riskCatLegal'),
                                                    'இணக்கம்': t('riskCatCompliance'), 'செயல்பாட்டு': t('riskCatOperational')
                                                };
                                                return (<div key={key} className="legal-breakdown-item">
                                                    <span className="legal-breakdown-label">{categoryMap[key] || key}</span>
                                                    <div className="legal-breakdown-bar-bg">
                                                        <div
                                                            className="legal-breakdown-bar-fill"
                                                            style={{ width: `${val}%`, background: getBarColor(val) }}
                                                        />
                                                    </div>
                                                    <span className="legal-breakdown-value">{val}%</span>
                                                </div>);
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Row 3: Issues + Actions side by side */}
                                <div className="legal-two-col">
                                    {/* Issues */}
                                    <div className="legal-card">
                                        <div className="legal-card-title">
                                            🔍 {t('issuesFound')} ({analysis.issues?.length || 0})
                                        </div>
                                        {analysis.issues?.length > 0 ? (
                                            <div className="legal-issues-list">
                                                {analysis.issues.map((issue) => (
                                                    <div key={issue.id} className={`legal-issue-item severity-${issue.severity}`}>
                                                        <div className={`legal-issue-severity ${issue.severity}`}>
                                                            {issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢'}
                                                        </div>
                                                        <div className="legal-issue-body">
                                                            <div className="legal-issue-title">{issue.title}</div>
                                                            <p className="legal-issue-desc">{issue.description}</p>
                                                            <div className="legal-issue-meta">
                                                                {issue.category && (
                                                                    <span className="legal-meta-tag category">{issue.category}</span>
                                                                )}
                                                                {issue.page_reference && (
                                                                    <span className="legal-meta-tag page">{issue.page_reference}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="legal-empty-state">
                                                <span>✅</span>
                                                {t('noIssues')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="legal-card">
                                        <div className="legal-card-title">
                                            ✅ {t('recActions')} ({analysis.actions?.length || 0})
                                        </div>
                                        {analysis.actions?.length > 0 ? (
                                            <div className="legal-actions-list">
                                                {analysis.actions.map((action) => (
                                                    <div key={action.id} className="legal-action-item">
                                                        <span className={`legal-action-priority ${action.priority}`}>
                                                            {action.priority}
                                                        </span>
                                                        <div className="legal-action-body">
                                                            <div className="legal-action-title">{action.title}</div>
                                                            <p className="legal-action-desc">{action.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="legal-empty-state">
                                                <span>👍</span>
                                                {t('noActions')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* NEW: Key Clauses */}
                                {analysis.key_clauses?.length > 0 && (
                                    <div className="legal-card">
                                        <div className="legal-card-title">📑 {t('keyClauses')} ({analysis.key_clauses.length})</div>
                                        <div className="legal-clauses-list">
                                            {analysis.key_clauses.map((clause) => (
                                                <div key={clause.id} className={`legal-clause-item risk-${clause.risk_level}`}>
                                                    <div className="legal-clause-header">
                                                        <span className="legal-clause-name">{clause.clause_name}</span>
                                                        <span className={`legal-clause-risk ${clause.risk_level}`}>
                                                            {clause.risk_level}
                                                        </span>
                                                    </div>
                                                    {clause.original_text && (
                                                        <div className="legal-clause-quote">"{clause.original_text}"</div>
                                                    )}
                                                    <div className="legal-clause-plain">
                                                        <strong>{t('inPlainEnglish')}</strong> {clause.plain_english}
                                                    </div>
                                                    {clause.notes && (
                                                        <div className="legal-clause-notes">⚠️ {clause.notes}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* NEW: Financial & Cost Issues */}
                                {analysis.financial_issues?.length > 0 && (
                                    <div className="legal-card">
                                        <div className="legal-card-title">💰 {t('financialIssues')} ({analysis.financial_issues.length})</div>
                                        <div className="legal-financial-list">
                                            {analysis.financial_issues.map((fi) => (
                                                <div key={fi.id} className={`legal-financial-item risk-${fi.risk_level}`}>
                                                    <div className="legal-financial-header">
                                                        <span className="legal-financial-title">{fi.title}</span>
                                                        <span className={`legal-financial-amount risk-${fi.risk_level}`}>
                                                            {fi.amount}
                                                        </span>
                                                    </div>
                                                    <p className="legal-financial-desc">{fi.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Row 4: Conflicts */}
                                <div className="legal-card">
                                    <div className="legal-card-title">
                                        ⚠️ {t('conflicts')} ({analysis.conflicts?.length || 0})
                                    </div>
                                    {analysis.conflicts?.length > 0 ? (
                                        <div className="legal-conflicts-list">
                                            {analysis.conflicts.map((conflict) => (
                                                <div key={conflict.id} className="legal-conflict-item">
                                                    <div className="legal-conflict-title">
                                                        <span>⚡</span> {conflict.title}
                                                    </div>
                                                    <p className="legal-conflict-desc">{conflict.description}</p>
                                                    {conflict.sections?.length > 0 && (
                                                        <div className="legal-conflict-sections">
                                                            {conflict.sections.map((sec, i) => (
                                                                <span key={i} className="legal-section-tag">{sec}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="legal-empty-state">
                                            <span>✅</span>
                                            {t('noConflicts')}
                                        </div>
                                    )}
                                </div>

                                {/* NEW: Spelling & Grammar */}
                                {analysis.spelling_grammar_issues?.length > 0 && (
                                    <div className="legal-card">
                                        <div className="legal-card-title">✏️ {t('spellingGrammar')} ({analysis.spelling_grammar_issues.length})</div>
                                        <div className="legal-spelling-list">
                                            {analysis.spelling_grammar_issues.map((sg) => (
                                                <div key={sg.id} className="legal-spelling-item">
                                                    <div className="legal-spelling-text">
                                                        <span className="legal-spelling-wrong">{sg.text}</span>
                                                        {sg.suggestion && (
                                                            <>
                                                                <span className="legal-spelling-arrow">→</span>
                                                                <span className="legal-spelling-fix">{sg.suggestion}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="legal-spelling-issue">{sg.issue}</div>
                                                    {sg.location && (
                                                        <span className="legal-meta-tag page">{sg.location}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}
                    </>)}
                </div>
            </div>
        </div>
    );
};

export default LegalAnalyzer;
