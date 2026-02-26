import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import '../Styles/PdfEditor.css';

// PDF.js worker — use CDN matching the exact installed version (3.11.174)
pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export default function PdfEditor() {
    const navigate = useNavigate();

    // File state
    const [file, setFile] = useState(null);        // raw File object
    const [fileType, setFileType] = useState('');   // 'pdf' | 'image'
    const [fileName, setFileName] = useState('');
    const [pdfBytes, setPdfBytes] = useState(null); // ArrayBuffer of loaded PDF

    // PDF rendering
    const [pdfDoc, setPdfDoc] = useState(null);     // pdfjs document proxy
    const [pageNum, setPageNum] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale] = useState(1.5);
    const canvasRef = useRef(null);

    // Image rendering
    const [imageDataUrl, setImageDataUrl] = useState('');

    // Text overlays: [{ id, x, y, text, fontSize, color, pageNum }]
    const [overlays, setOverlays] = useState([]);
    const [editMode, setEditMode] = useState(false);  // false = view-only by default
    const [fontSize, setFontSize] = useState(16);
    const [fontColor, setFontColor] = useState('#000000');
    const [dragover, setDragover] = useState(false);
    const [saving, setSaving] = useState(false);

    const canvasAreaRef = useRef(null);
    const fileInputRef = useRef(null);

    // ── File Loading ──────────────────────────────────────

    const loadPdf = useCallback(async (arrayBuf) => {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setPageNum(1);
    }, []);

    const handleFile = useCallback(async (f) => {
        if (!f) return;
        setFile(f);
        setFileName(f.name);
        setOverlays([]);

        const ext = f.name.split('.').pop().toLowerCase();
        if (ext === 'pdf') {
            setFileType('pdf');
            setImageDataUrl('');
            const buf = await f.arrayBuffer();
            setPdfBytes(buf);
            await loadPdf(buf);
        } else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) {
            setFileType('image');
            setPdfDoc(null);
            setPdfBytes(null);
            setTotalPages(0);
            const reader = new FileReader();
            reader.onload = (e) => setImageDataUrl(e.target.result);
            reader.readAsDataURL(f);
        }
    }, [loadPdf]);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragover(false);
        const f = e.dataTransfer?.files?.[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const onDragOver = useCallback((e) => {
        e.preventDefault();
        setDragover(true);
    }, []);

    const onDragLeave = useCallback(() => setDragover(false), []);

    // ── PDF Page Rendering ────────────────────────────────

    const renderPage = useCallback(async (num) => {
        if (!pdfDoc || !canvasRef.current) return;
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
    }, [pdfDoc, scale]);

    useEffect(() => {
        if (pdfDoc && pageNum) renderPage(pageNum);
    }, [pdfDoc, pageNum, renderPage]);

    // ── Render image on canvas ────────────────────────────

    useEffect(() => {
        if (fileType !== 'image' || !imageDataUrl || !canvasRef.current) return;
        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            // Cap to reasonable dimensions
            const maxW = 900;
            const ratio = img.width > maxW ? maxW / img.width : 1;
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = imageDataUrl;
    }, [fileType, imageDataUrl]);

    // ── Canvas click → add text overlay ───────────────────

    const handleCanvasClick = useCallback((e) => {
        if (!editMode) return;
        // Don't create new overlay if clicking on an existing one
        if (e.target.closest('.pe-text-overlay')) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newId = Date.now() + Math.random();
        const newOverlay = {
            id: newId,
            x,
            y,
            text: '',
            fontSize,
            color: fontColor,
            pageNum: fileType === 'pdf' ? pageNum : 1,
        };
        setOverlays((prev) => [...prev, newOverlay]);
        // Auto-focus the new overlay's editable span after render
        requestAnimationFrame(() => {
            const el = document.querySelector(`[data-overlay-id="${newId}"] .pe-text-editable`);
            if (el) el.focus();
        });
    }, [editMode, fontSize, fontColor, pageNum, fileType]);

    // ── Overlay updates ───────────────────────────────────

    const updateOverlay = (id, changes) => {
        setOverlays((prev) =>
            prev.map((o) => (o.id === id ? { ...o, ...changes } : o))
        );
    };

    const deleteOverlay = (id) => {
        setOverlays((prev) => prev.filter((o) => o.id !== id));
    };

    // ── Dragging overlays ─────────────────────────────────

    const handleOverlayMouseDown = (e, id) => {
        e.stopPropagation();
        if (e.target.tagName === 'BUTTON') return; // don't drag on delete btn
        const startX = e.clientX;
        const startY = e.clientY;
        const overlay = overlays.find((o) => o.id === id);
        if (!overlay) return;
        const origX = overlay.x;
        const origY = overlay.y;

        const onMove = (ev) => {
            updateOverlay(id, {
                x: origX + (ev.clientX - startX),
                y: origY + (ev.clientY - startY),
            });
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    // ── Download / Save ───────────────────────────────────

    const handleDownload = async () => {
        setSaving(true);
        try {
            if (fileType === 'pdf') {
                await downloadPdf();
            } else {
                await downloadImage();
            }
        } catch (err) {
            console.error('Download failed:', err);
            alert('Download failed: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const downloadPdf = async () => {
        // Load original PDF with pdf-lib
        const doc = await PDFDocument.load(pdfBytes);
        const helvetica = await doc.embedFont(StandardFonts.Helvetica);
        const pages = doc.getPages();

        for (const overlay of overlays) {
            if (!overlay.text.trim()) continue;
            const pgIdx = (overlay.pageNum || 1) - 1;
            if (pgIdx < 0 || pgIdx >= pages.length) continue;
            const page = pages[pgIdx];
            const { height } = page.getSize();

            // Convert screen coords to PDF coords
            const canvas = canvasRef.current;
            const scaleX = page.getWidth() / canvas.width;
            const scaleY = height / canvas.height;

            // Parse hex color
            const hex = overlay.color || '#000000';
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;

            const pdfFontSize = overlay.fontSize * scaleX;

            // PDF origin is bottom-left, canvas origin is top-left
            page.drawText(overlay.text, {
                x: overlay.x * scaleX,
                y: height - overlay.y * scaleY - pdfFontSize,
                size: pdfFontSize,
                font: helvetica,
                color: rgb(r, g, b),
            });
        }

        const modifiedBytes = await doc.save();
        triggerDownload(modifiedBytes, fileName.replace(/\.pdf$/i, '') + '_edited.pdf', 'application/pdf');
    };

    const downloadImage = async () => {
        // Draw everything onto a temp canvas
        const canvas = canvasRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const ctx = tempCanvas.getContext('2d');

        // Draw original image
        ctx.drawImage(canvas, 0, 0);

        // Draw text overlays
        for (const overlay of overlays) {
            if (!overlay.text.trim()) continue;
            ctx.font = `${overlay.fontSize}px Inter, sans-serif`;
            ctx.fillStyle = overlay.color || '#000000';
            ctx.fillText(overlay.text, overlay.x, overlay.y + overlay.fontSize);
        }

        tempCanvas.toBlob((blob) => {
            if (!blob) return;
            const ext = fileName.split('.').pop().toLowerCase();
            triggerDownload(
                blob,
                fileName.replace(/\.\w+$/, '') + '_edited.' + ext,
                blob.type
            );
        });
    };

    const triggerDownload = (data, name, mime) => {
        const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ── Page-specific overlays ────────────────────────────

    const currentOverlays = overlays.filter(
        (o) => fileType !== 'pdf' || o.pageNum === pageNum
    );

    // ── Close / reset ─────────────────────────────────────

    const closeFile = () => {
        setFile(null);
        setFileType('');
        setFileName('');
        setPdfBytes(null);
        setPdfDoc(null);
        setTotalPages(0);
        setPageNum(1);
        setImageDataUrl('');
        setOverlays([]);
    };

    // ── Render ────────────────────────────────────────────

    const hasFile = file && (fileType === 'pdf' || fileType === 'image');

    return (
        <div className="pdf-editor">
            {/* Top bar */}
            <div className="pe-topbar">
                <h1>📝 PDF Editor</h1>
                <nav>
                    <button className="pe-btn" onClick={() => navigate('/chat')}>💬 Chat</button>
                    <button className="pe-btn" onClick={() => navigate(-1)}>← Back</button>
                </nav>
            </div>

            <div className="pe-content">
                {/* ── Upload zone ── */}
                {!hasFile && (
                    <div
                        className={`pe-dropzone ${dragover ? 'dragover' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                    >
                        <span className="pe-dropzone-icon">📄</span>
                        <div className="pe-dropzone-title">Drop a PDF or Image here</div>
                        <div className="pe-dropzone-subtitle">
                            or click to browse — supports PDF, PNG, JPG, GIF, BMP, WebP
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFile(e.target.files?.[0])}
                        />
                    </div>
                )}

                {/* ── Toolbar ── */}
                {hasFile && (
                    <div className="pe-toolbar">
                        <span className="pe-filename" title={fileName}>📄 {fileName}</span>
                        <div className="pe-toolbar-divider" />

                        {/* Page nav (PDF only) */}
                        {fileType === 'pdf' && (
                            <>
                                <button
                                    className="pe-btn pe-btn-sm"
                                    disabled={pageNum <= 1}
                                    onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                                >
                                    ◀ Prev
                                </button>
                                <span className="pe-page-info">
                                    {pageNum} / {totalPages}
                                </span>
                                <button
                                    className="pe-btn pe-btn-sm"
                                    disabled={pageNum >= totalPages}
                                    onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
                                >
                                    Next ▶
                                </button>
                                <div className="pe-toolbar-divider" />
                            </>
                        )}

                        {/* Edit mode toggle */}
                        <button
                            className={`pe-btn pe-btn-sm ${editMode ? 'pe-btn-primary' : ''}`}
                            onClick={() => setEditMode(!editMode)}
                            title={editMode ? 'Click on page to add text' : 'View-only mode'}
                        >
                            {editMode ? '✏️ Edit Mode' : '👁️ View Mode'}
                        </button>

                        {/* Font size */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: '#94a3b8' }}>
                            Size:
                            <input
                                type="number"
                                className="pe-font-size-input"
                                value={fontSize}
                                min={8}
                                max={72}
                                onChange={(e) => setFontSize(Number(e.target.value) || 16)}
                            />
                        </label>

                        {/* Color picker */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: '#94a3b8' }}>
                            Color:
                            <input
                                type="color"
                                className="pe-color-input"
                                value={fontColor}
                                onChange={(e) => setFontColor(e.target.value)}
                            />
                        </label>

                        <div className="pe-toolbar-divider" />

                        {/* Download */}
                        <button
                            className="pe-btn pe-btn-primary"
                            onClick={handleDownload}
                            disabled={saving}
                        >
                            {saving ? '⏳ Saving…' : '💾 Download'}
                        </button>

                        {/* Close */}
                        <button className="pe-btn pe-btn-danger pe-btn-sm" onClick={closeFile}>
                            ✕ Close
                        </button>
                    </div>
                )}

                {/* ── Canvas ── */}
                {hasFile && (
                    <div className="pe-canvas-scroll">
                        <div
                            className="pe-canvas-area"
                            ref={canvasAreaRef}
                            onClick={handleCanvasClick}
                            style={{ cursor: editMode ? 'crosshair' : 'default' }}
                        >
                            <canvas ref={canvasRef} />

                            {/* Text overlays for current page */}
                            {currentOverlays.map((overlay) => (
                                <div
                                    key={overlay.id}
                                    data-overlay-id={overlay.id}
                                    className={`pe-text-overlay${overlay.text ? '' : ' pe-text-overlay--empty'}`}
                                    style={{
                                        left: overlay.x,
                                        top: overlay.y,
                                        fontSize: overlay.fontSize + 'px',
                                        color: overlay.color,
                                    }}
                                    onMouseDown={(e) => handleOverlayMouseDown(e, overlay.id)}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span
                                        className="pe-text-editable"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => {
                                            const text = e.target.innerText.trim();
                                            if (!text) {
                                                deleteOverlay(overlay.id);
                                            } else {
                                                updateOverlay(overlay.id, { text });
                                            }
                                        }}
                                        onInput={(e) =>
                                            updateOverlay(overlay.id, { text: e.target.innerText })
                                        }
                                        onMouseDown={(e) => e.stopPropagation()}
                                    >
                                        {overlay.text || ''}
                                    </span>
                                    <button
                                        className="pe-text-delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteOverlay(overlay.id);
                                        }}
                                        title="Remove"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hint */}
                {hasFile && editMode && (
                    <div style={{
                        fontSize: '0.82rem', color: '#64748b', textAlign: 'center', marginTop: 4
                    }}>
                        💡 Click anywhere on the page to add text. Drag to reposition. Type to edit.
                    </div>
                )}
            </div>
        </div>
    );
}
