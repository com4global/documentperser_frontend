import React, { useState } from 'react';
import '../Styles/MacDock.css';

// ── Right-side dock items ─────────────────────────────────────────────────
const DOCK_ITEMS = [
    { id: 'newchat', emoji: '✨', label: 'New Chat', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { id: 'chat', emoji: '💬', label: 'Chat', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { id: 'upload', emoji: '📤', label: 'Upload', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
    { id: 'admin', emoji: '⚙️', label: 'Admin', gradient: 'linear-gradient(135deg,#3b82f6,#0ea5e9)' },
    { id: 'legal', emoji: '⚖️', label: 'Legal', gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
    { id: 'teacher', emoji: '🎓', label: 'AI Teacher', gradient: 'linear-gradient(135deg,#f97316,#ef4444)' },
    { id: 'logout', emoji: '🚪', label: 'Logout', gradient: 'linear-gradient(135deg,#6b7280,#4b5563)' },
];

/**
 * MacDock — macOS-style right-side vertical dock.
 *
 * Props:
 *   activeView       – 'chat' | 'admin' | 'legal' | 'teacher'
 *   onNewChat        – () => void
 *   onNavigate       – (view: string) => void
 *   onUploadClick    – () => void
 *   onLogout         – () => void
 *   uploadedCount    – number
 */
export default function MacDock({
    activeView = 'chat',
    onNewChat,
    onNavigate,
    onUploadClick,
    onLogout,
    uploadedCount = 0,
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [bouncingId, setBouncingId] = useState(null);

    const getScale = (index) => {
        if (hoveredIndex === null) return 1;
        const diff = Math.abs(index - hoveredIndex);
        if (diff === 0) return 1.55;
        if (diff === 1) return 1.25;
        if (diff === 2) return 1.08;
        return 1;
    };

    const handleClick = (item) => {
        setBouncingId(item.id);
        setTimeout(() => setBouncingId(null), 450);
        switch (item.id) {
            case 'newchat': onNewChat?.(); break;
            case 'chat': onNavigate?.('chat'); break;
            case 'upload': onUploadClick?.(); break;
            case 'admin': onNavigate?.('admin'); break;
            case 'legal': onNavigate?.('legal'); break;
            case 'teacher': onNavigate?.('teacher'); break;
            case 'logout': onLogout?.(); break;
            default: break;
        }
    };

    const isActive = (id) => (
        id === 'chat' ? activeView === 'chat' :
            id === 'admin' ? activeView === 'admin' :
                id === 'legal' ? activeView === 'legal' :
                    id === 'teacher' ? activeView === 'teacher' : false
    );

    return (
        <div className="mac-dock-wrapper">
            <div className="mac-dock">
                {DOCK_ITEMS.map((item, index) => {
                    const scale = getScale(index);
                    const active = isActive(item.id);
                    const bouncing = bouncingId === item.id;
                    const tx = scale > 1 ? -((scale - 1) * 16) : 0;

                    return (
                        <div
                            key={item.id}
                            className="dock-item-wrapper"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Tooltip — to the left */}
                            <div className={`dock-tooltip ${hoveredIndex === index ? 'dock-tooltip--visible' : ''}`}>
                                {item.label}
                            </div>

                            <button
                                className={`dock-item ${bouncing ? 'dock-item--bounce' : ''}`}
                                style={{ transform: `scale(${scale}) translateX(${tx}px)`, background: item.gradient }}
                                onClick={() => handleClick(item)}
                                aria-label={item.label}
                            >
                                <span className="dock-item-emoji" role="img" aria-hidden="true">{item.emoji}</span>
                                {item.id === 'upload' && uploadedCount > 0 && (
                                    <span className="dock-badge">{uploadedCount > 9 ? '9+' : uploadedCount}</span>
                                )}
                            </button>

                            {/* Active dot — to the right */}
                            {active && <div className="dock-active-dot" />}
                        </div>
                    );
                })}
            </div>
            <div className="mac-dock-reflection" />
        </div>
    );
}

// ── Teacher Dock — left-side, teacher-only ────────────────────────────────
const TEACHER_DOCK_ITEMS = [
    { id: 'classroom', emoji: '🏫', label: 'My Classroom', gradient: 'linear-gradient(135deg,#10b981,#065f46)' },
];

/**
 * TeacherDock — left-side vertical dock, teacher-only.
 * Same glassmorphism as MacDock but pinned to the left.
 * Tooltip appears to the RIGHT of the icon.
 *
 * Props:
 *   onClassroom — () => void  navigate to /teacher
 */
export function TeacherDock({ onClassroom }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [bouncingId, setBouncingId] = useState(null);

    const getScale = (index) => {
        if (hoveredIndex === null) return 1;
        return Math.abs(index - hoveredIndex) === 0 ? 1.55 : 1;
    };

    const handleClick = (item) => {
        setBouncingId(item.id);
        setTimeout(() => setBouncingId(null), 450);
        if (item.id === 'classroom') onClassroom?.();
    };

    return (
        <div className="mac-dock-wrapper teacher-dock-wrapper">
            {/* reflection sits to the LEFT of the shelf */}
            <div className="mac-dock-reflection teacher-dock-reflection" />
            <div className="mac-dock">
                {TEACHER_DOCK_ITEMS.map((item, index) => {
                    const scale = getScale(index);
                    const bouncing = bouncingId === item.id;
                    /* magnify toward right (into the screen) */
                    const tx = scale > 1 ? ((scale - 1) * 16) : 0;

                    return (
                        <div
                            key={item.id}
                            className="dock-item-wrapper"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <button
                                className={`dock-item ${bouncing ? 'dock-item--bounce-left' : ''}`}
                                style={{
                                    transform: `scale(${scale}) translateX(${tx}px)`,
                                    background: item.gradient,
                                    transformOrigin: 'left center',
                                }}
                                onClick={() => handleClick(item)}
                                aria-label={item.label}
                            >
                                <span className="dock-item-emoji" role="img" aria-hidden="true">{item.emoji}</span>
                            </button>

                            {/* Tooltip — to the RIGHT for left dock */}
                            <div className={`dock-tooltip teacher-dock-tooltip ${hoveredIndex === index ? 'dock-tooltip--visible' : ''}`}>
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
