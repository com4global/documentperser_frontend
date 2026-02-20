import React, { useState } from 'react';
import '../Styles/MacDock.css';

/**
 * macOS-style right-side vertical dock.
 *
 * Props:
 *   activeView       – 'chat' | 'admin' | 'legal' | 'teacher'
 *   onNewChat        – () => void
 *   onNavigate       – (view: string) => void
 *   onUploadClick    – () => void
 *   onLogout         – () => void
 *   uploadedCount    – number
 */

const DOCK_ITEMS = [
    { id: 'newchat', emoji: '✨', label: 'New Chat', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { id: 'chat', emoji: '💬', label: 'Chat', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { id: 'upload', emoji: '📤', label: 'Upload', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
    { id: 'admin', emoji: '⚙️', label: 'Admin', gradient: 'linear-gradient(135deg,#3b82f6,#0ea5e9)' },
    { id: 'legal', emoji: '⚖️', label: 'Legal', gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
    { id: 'teacher', emoji: '🎓', label: 'AI Teacher', gradient: 'linear-gradient(135deg,#f97316,#ef4444)' },
    { id: 'logout', emoji: '🚪', label: 'Logout', gradient: 'linear-gradient(135deg,#6b7280,#4b5563)' },
];

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

    /* Vertical dock — magnify toward left (away from right edge) */
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

    const isActive = (id) => {
        if (id === 'chat') return activeView === 'chat';
        if (id === 'admin') return activeView === 'admin';
        if (id === 'legal') return activeView === 'legal';
        if (id === 'teacher') return activeView === 'teacher';
        return false;
    };

    return (
        <div className="mac-dock-wrapper">
            <div className="mac-dock">
                {DOCK_ITEMS.map((item, index) => {
                    const scale = getScale(index);
                    const active = isActive(item.id);
                    const bouncing = bouncingId === item.id;
                    /* push icon left when magnified so it expands toward the screen */
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

                            {/* Icon button */}
                            <button
                                className={`dock-item ${bouncing ? 'dock-item--bounce' : ''}`}
                                style={{
                                    transform: `scale(${scale}) translateX(${tx}px)`,
                                    background: item.gradient,
                                }}
                                onClick={() => handleClick(item)}
                                aria-label={item.label}
                            >
                                <span className="dock-item-emoji" role="img" aria-hidden="true">
                                    {item.emoji}
                                </span>
                                {item.id === 'upload' && uploadedCount > 0 && (
                                    <span className="dock-badge">{uploadedCount > 9 ? '9+' : uploadedCount}</span>
                                )}
                            </button>

                            {/* Active dot — indigo, to the right */}
                            {active && <div className="dock-active-dot" />}
                        </div>
                    );
                })}
            </div>

            {/* Subtle light reflection bead to the right of the shelf */}
            <div className="mac-dock-reflection" />
        </div>
    );
}
