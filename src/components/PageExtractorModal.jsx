/* PageExtractorModal.jsx — Split PDF into page ranges or batch chunks */
import React, { useState, useRef } from 'react';
import { APP_CONFIG } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

const API_URL = APP_CONFIG.API_URL || 'http://localhost:10001';

const PageExtractorModal = ({ onClose, onUploadExtracted }) => {
    const { session } = useAuth();
    const fileRef = useRef(null);

    const [file, setFile] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Mode: 'range' for custom page range, 'batch' for auto-split into chunks
    const [mode, setMode] = useState('batch');

    // Range mode state
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState('');

    // Batch mode state
    const [pagesPerChunk, setPagesPerChunk] = useState(10);
    const [batchResults, setBatchResults] = useState([]); // [{name, blob}]
    const [batchProgress, setBatchProgress] = useState('');

    // Pick file & get page count
    const handleFileSelect = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setError('');
        setTotalPages(null);
        setBatchResults([]);
        setBatchProgress('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', f);
            formData.append('info_only', 'true');

            const token = session?.access_token;
            const res = await fetch(`${API_URL}/api/extract-pages`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || `Server error ${res.status}`);
            }

            const data = await res.json();
            if (data.success) {
                setTotalPages(data.total_pages);
                setEndPage(data.total_pages);
            } else {
                setError('Could not read PDF. Make sure it is a valid PDF file.');
            }
        } catch (err) {
            setError(`Failed to read file: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Single range extraction
    const handleExtractRange = async (uploadAfter = false) => {
        if (!file || !totalPages) return;
        setLoading(true);
        setError('');

        const s = Math.max(1, parseInt(startPage) || 1);
        const eVal = Math.min(totalPages, parseInt(endPage) || totalPages);
        if (s > eVal) { setError(`Start page (${s}) > end page (${eVal})`); setLoading(false); return; }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('start_page', s);
            formData.append('end_page', eVal);

            const token = session?.access_token;
            const res = await fetch(`${API_URL}/api/extract-pages`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || `Server error ${res.status}`);
            }

            const blob = await res.blob();
            const baseName = file.name.replace(/\.pdf$/i, '');
            const outName = `${baseName}_pages_${s}-${eVal}.pdf`;

            if (uploadAfter && onUploadExtracted) {
                const extractedFile = new File([blob], outName, { type: 'application/pdf' });
                onUploadExtracted(extractedFile);
                onClose();
            } else {
                downloadBlob(blob, outName);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Batch extraction — split PDF into chunks of N pages each
    const handleBatchExtract = async (uploadAfter = false) => {
        if (!file || !totalPages) return;
        setLoading(true);
        setError('');
        setBatchResults([]);

        const chunkSize = Math.max(1, parseInt(pagesPerChunk) || 10);
        const totalChunks = Math.ceil(totalPages / chunkSize);
        const results = [];

        try {
            for (let i = 0; i < totalChunks; i++) {
                const s = i * chunkSize + 1;
                const eVal = Math.min((i + 1) * chunkSize, totalPages);
                setBatchProgress(`Extracting part ${i + 1} of ${totalChunks} (pages ${s}–${eVal})...`);

                const formData = new FormData();
                formData.append('file', file);
                formData.append('start_page', s);
                formData.append('end_page', eVal);

                const token = session?.access_token;
                const res = await fetch(`${API_URL}/api/extract-pages`, {
                    method: 'POST',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    body: formData,
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.detail || `Part ${i + 1} failed (${res.status})`);
                }

                const blob = await res.blob();
                const baseName = file.name.replace(/\.pdf$/i, '');
                const outName = `${baseName}_part${i + 1}_pages_${s}-${eVal}.pdf`;
                results.push({ name: outName, blob, start: s, end: eVal });
            }

            if (uploadAfter && onUploadExtracted) {
                for (const r of results) {
                    const extractedFile = new File([r.blob], r.name, { type: 'application/pdf' });
                    onUploadExtracted(extractedFile);
                }
                onClose();
            } else {
                setBatchResults(results);
                setBatchProgress(`✅ Split into ${results.length} files!`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadBlob = (blob, name) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const totalChunksPreview = totalPages ? Math.ceil(totalPages / (parseInt(pagesPerChunk) || 10)) : 0;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseDown={(e) => {
                // Only close when clicking directly on the backdrop, not on modal content
                if (e.target === e.currentTarget) e.preventDefault();
            }}
        >
            <div
                style={{
                    background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                    borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 560,
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5)', color: '#fff',
                    border: '1px solid rgba(255,255,255,0.08)',
                    maxHeight: '90vh', overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
                        ✂️ Extract PDF Pages
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                        borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: '1.1rem',
                    }}>✕</button>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.2rem', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Split a large PDF into smaller parts for targeted vectorization.
                </p>

                {/* File Picker */}
                <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                        border: '2px dashed rgba(108,92,231,0.5)', borderRadius: 14, padding: '1.2rem',
                        textAlign: 'center', cursor: 'pointer', marginBottom: '1.2rem',
                        background: file ? 'rgba(108,92,231,0.08)' : 'rgba(255,255,255,0.03)',
                        transition: 'all 0.2s',
                    }}
                >
                    <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
                    {file ? (
                        <div>
                            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>📄</div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{file.name}</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                                {totalPages && ` · ${totalPages} pages`}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>📎</div>
                            <div style={{ fontWeight: 500, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Click to select a PDF</div>
                        </div>
                    )}
                </div>

                {loading && !totalPages && (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '1rem' }}>
                        ⏳ Reading PDF...
                    </div>
                )}

                {/* Mode Toggle */}
                {totalPages && (
                    <>
                        <div style={{
                            display: 'flex', borderRadius: 10, overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.12)', marginBottom: '1.2rem',
                        }}>
                            {[
                                { key: 'batch', label: '📦 Batch Split' },
                                { key: 'range', label: '📐 Custom Range' },
                            ].map(({ key, label }) => (
                                <button key={key} onClick={() => setMode(key)} style={{
                                    flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontSize: '0.88rem',
                                    fontWeight: 600, transition: 'all 0.2s',
                                    background: mode === key ? 'rgba(108,92,231,0.25)' : 'rgba(255,255,255,0.04)',
                                    color: mode === key ? '#a29bfe' : 'rgba(255,255,255,0.5)',
                                }}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Batch Mode */}
                        {mode === 'batch' && (
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>
                                    Pages per file
                                </label>
                                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                    <input
                                        type="number" min={1} max={totalPages} value={pagesPerChunk}
                                        onChange={(e) => setPagesPerChunk(e.target.value)}
                                        style={{
                                            width: 90, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                                            background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '1rem', outline: 'none',
                                        }}
                                    />
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                        → {totalChunksPreview} file{totalChunksPreview !== 1 ? 's' : ''} from {totalPages} pages
                                    </span>
                                </div>
                                {/* Preview chunks */}
                                {totalChunksPreview > 0 && totalChunksPreview <= 20 && (
                                    <div style={{
                                        marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6,
                                    }}>
                                        {Array.from({ length: totalChunksPreview }, (_, i) => {
                                            const cs = parseInt(pagesPerChunk) || 10;
                                            const s = i * cs + 1;
                                            const eVal = Math.min((i + 1) * cs, totalPages);
                                            return (
                                                <span key={i} style={{
                                                    background: 'rgba(108,92,231,0.12)', color: '#a29bfe',
                                                    padding: '4px 10px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 500,
                                                }}>
                                                    Part {i + 1}: {s}–{eVal}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Range Mode */}
                        {mode === 'range' && (
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>
                                        Start Page
                                    </label>
                                    <input
                                        type="number" min={1} max={totalPages} value={startPage}
                                        onChange={(e) => setStartPage(e.target.value)}
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                                            background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '1rem', outline: 'none',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>
                                        End Page
                                    </label>
                                    <input
                                        type="number" min={1} max={totalPages} value={endPage}
                                        onChange={(e) => setEndPage(e.target.value)}
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                                            background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '1rem', outline: 'none',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        of {totalPages}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div style={{
                                background: 'rgba(255,71,87,0.12)', color: '#ff4757', padding: '10px 14px',
                                borderRadius: 10, marginBottom: '1rem', fontSize: '0.9rem',
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Batch progress */}
                        {batchProgress && (
                            <div style={{
                                background: 'rgba(108,92,231,0.1)', color: '#a29bfe', padding: '10px 14px',
                                borderRadius: 10, marginBottom: '1rem', fontSize: '0.88rem',
                            }}>
                                {batchProgress}
                            </div>
                        )}

                        {/* Batch download results */}
                        {batchResults.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                                    Click to download individual files:
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {batchResults.map((r, i) => (
                                        <button key={i} onClick={() => downloadBlob(r.blob, r.name)} style={{
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#00cec9', padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                                            fontSize: '0.85rem', textAlign: 'left', fontWeight: 500,
                                        }}>
                                            ⬇️ {r.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <button
                                disabled={loading}
                                onClick={() => mode === 'batch' ? handleBatchExtract(false) : handleExtractRange(false)}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(108,92,231,0.5)',
                                    background: 'rgba(108,92,231,0.15)', color: '#a29bfe', fontWeight: 600,
                                    cursor: loading ? 'wait' : 'pointer', fontSize: '0.92rem',
                                    opacity: loading ? 0.6 : 1,
                                }}
                            >
                                {loading ? '⏳ Extracting...' : '⬇️ Download'}
                            </button>
                            <button
                                disabled={loading}
                                onClick={() => mode === 'batch' ? handleBatchExtract(true) : handleExtractRange(true)}
                                style={{
                                    flex: 1.3, padding: '12px', borderRadius: 12, border: 'none',
                                    background: 'linear-gradient(135deg, #6c5ce7, #00cec9)', color: '#fff', fontWeight: 700,
                                    cursor: loading ? 'wait' : 'pointer', fontSize: '0.92rem',
                                    boxShadow: '0 4px 15px rgba(108,92,231,0.3)',
                                    opacity: loading ? 0.6 : 1,
                                }}
                            >
                                {loading ? '⏳ Extracting...' : '🚀 Upload & Vectorize'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PageExtractorModal;
