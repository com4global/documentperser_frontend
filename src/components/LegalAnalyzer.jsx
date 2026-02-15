import React, { useState, useRef } from 'react';
import apiService from '../services/api';
import '../Styles/LegalAnalyzer.css';

const LegalAnalyzer = ({ onClose }) => {
    const [state, setState] = useState('upload'); // upload | loading | results | error
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('upload'); // upload | link | youtube
    const [urlInput, setUrlInput] = useState('');

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

        // Animate loading steps
        const stepTimer1 = setTimeout(() => setLoadingStep(1), 1500);
        const stepTimer2 = setTimeout(() => setLoadingStep(2), 3500);
        const stepTimer3 = setTimeout(() => setLoadingStep(3), 6000);

        try {
            const result = await apiService.analyzeLegalDocument(payload);
            clearTimeout(stepTimer1);
            clearTimeout(stepTimer2);
            clearTimeout(stepTimer3);

            if (result.success && result.analysis) {
                setAnalysis(result.analysis);
                setState('results');
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
        // Keep active tab
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
                            <h2>Legal Document Analyzer</h2>
                            <p>AI-powered analysis for legal, banking, real estate, and multimedia content</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {state === 'results' && (
                            <button className="legal-new-analysis-btn" onClick={resetAnalyzer}>
                                📄 New Analysis
                            </button>
                        )}
                        <button className="legal-close-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                <div className="legal-content">

                    {/* ===== UPLOAD STATE ===== */}
                    {state === 'upload' && (
                        <div>
                            <div className="legal-tabs">
                                <button
                                    className={`legal-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('upload')}
                                >
                                    Upload File
                                </button>
                                <button
                                    className={`legal-tab-btn ${activeTab === 'link' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('link')}
                                >
                                    Web Link
                                </button>
                                <button
                                    className={`legal-tab-btn ${activeTab === 'youtube' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('youtube')}
                                >
                                    YouTube Video
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
                                    <h3>Upload Your Content</h3>
                                    <p>Drag & drop Document, Image, Audio, or Video files</p>
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
                                    <h3>{activeTab === 'youtube' ? 'Analyze YouTube Video' : 'Analyze Web Page'}</h3>
                                    <p style={{ color: '#64748b' }}>
                                        {activeTab === 'youtube'
                                            ? 'Paste a YouTube URL to analyze its transcript/captions.'
                                            : 'Paste a website URL to extract and analyze its content.'}
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
                                            Analyze
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
                            <h3>Analyzing "{selectedFile?.name}"</h3>
                            <p>Our AI is reviewing the document for issues, risks, and conflicts...</p>
                            <div className="legal-loading-steps">
                                {['Extracting Text', 'Identifying Issues', 'Assessing Risks', 'Generating Report'].map((step, i) => (
                                    <span key={step} className={`legal-loading-step ${loadingStep >= i ? 'active' : ''}`}>
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
                            <h3>Analysis Failed</h3>
                            <p>{error}</p>
                            <button className="legal-retry-btn" onClick={resetAnalyzer}>Try Again</button>
                        </div>
                    )}

                    {/* ===== RESULTS DASHBOARD ===== */}
                    {state === 'results' && analysis && (
                        <div className="legal-dashboard">

                            {/* Row 1: Risk Gauge + Summary */}
                            <div className="legal-top-row">
                                <div className="legal-card">
                                    <div className="legal-card-title">🎯 Overall Risk</div>
                                    <RiskGauge score={analysis.risk_score || 0} />
                                </div>
                                <div className="legal-card">
                                    <div className="legal-card-title">📋 Document Summary</div>
                                    <p className="legal-summary-text">{analysis.summary}</p>
                                </div>
                            </div>

                            {/* Row 2: Risk Breakdown */}
                            {analysis.risk_breakdown && (
                                <div className="legal-card">
                                    <div className="legal-card-title">📊 Risk Breakdown by Category</div>
                                    <div className="legal-breakdown-grid">
                                        {Object.entries(analysis.risk_breakdown).map(([key, val]) => (
                                            <div key={key} className="legal-breakdown-item">
                                                <span className="legal-breakdown-label">{key}</span>
                                                <div className="legal-breakdown-bar-bg">
                                                    <div
                                                        className="legal-breakdown-bar-fill"
                                                        style={{ width: `${val}%`, background: getBarColor(val) }}
                                                    />
                                                </div>
                                                <span className="legal-breakdown-value">{val}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Row 3: Issues + Actions side by side */}
                            <div className="legal-two-col">
                                {/* Issues */}
                                <div className="legal-card">
                                    <div className="legal-card-title">
                                        🔍 Issues Found ({analysis.issues?.length || 0})
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
                                            No significant issues found
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="legal-card">
                                    <div className="legal-card-title">
                                        ✅ Recommended Actions ({analysis.actions?.length || 0})
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
                                            No actions required
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 4: Conflicts */}
                            <div className="legal-card">
                                <div className="legal-card-title">
                                    ⚠️ Conflicts & Contradictions ({analysis.conflicts?.length || 0})
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
                                        No conflicts detected between document sections
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LegalAnalyzer;
