/**
 * RoleSelectPage
 * Shown after first login when no role has been set yet.
 * Uses optimistic navigation: updates AuthContext & navigates immediately,
 * then persists to the backend in the background.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import '../Styles/AuthModal.css';

const ROLES = [
    { id: 'student', icon: '🎒', label: 'Student', desc: 'Learn from assigned topics' },
    { id: 'teacher', icon: '👩‍🏫', label: 'Teacher', desc: 'Create classrooms & assign goals' },
    { id: 'individual', icon: '📖', label: 'Individual Learner', desc: 'Self-paced learning' },
    { id: 'other', icon: '🌐', label: 'Other', desc: 'Explore freely' },
];

function destFor(role) {
    if (role === 'teacher') return '/teacher';
    if (role === 'student') return '/student';
    return '/chat';
}

export default function RoleSelectPage() {
    const [selected, setSelected] = useState(null);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const { setUserRole } = useAuth();

    const handleSelect = (roleId) => {
        if (saving) return;
        setSelected(roleId);
        setSaving(true);

        // ── Step 1: Optimistic update ──────────────────────────────────────
        // Update AuthContext immediately so the route guard (needsRole) is
        // satisfied BEFORE we navigate. Navigation won't bounce back to /select-role.
        setUserRole(roleId);

        // ── Step 2: Navigate immediately ───────────────────────────────────
        navigate(destFor(roleId), { replace: true });

        // ── Step 3: Persist in background ─────────────────────────────────
        // Fire-and-forget — failure is non-fatal because the role is already
        // set in context for this session. On next login AuthContext will
        // re-read from Supabase (which the backend updates using service key).
        apiService.updateUserRole(roleId).catch((err) => {
            console.warn('Background role save failed (non-fatal):', err.message);
        });
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
            }}
        >
            <div
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    padding: '48px 40px',
                    maxWidth: '520px',
                    width: '100%',
                    textAlign: 'center',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
                <h1 style={{ color: '#fff', margin: '0 0 8px', fontSize: '1.7rem' }}>Welcome aboard!</h1>
                <p style={{ color: '#aaa', marginBottom: 32 }}>How will you be using Zenzee?</p>

                <div className="role-cards">
                    {ROLES.map(r => (
                        <button
                            key={r.id}
                            className={`role-card ${selected === r.id ? 'selected' : ''} ${saving ? 'disabled' : ''}`}
                            onClick={() => handleSelect(r.id)}
                            disabled={saving}
                        >
                            <span className="role-card-icon">{r.icon}</span>
                            <span className="role-card-label">{r.label}</span>
                            <span className="role-card-desc">{r.desc}</span>
                            {selected === r.id && saving && (
                                <span style={{ fontSize: '0.75rem', color: '#a78bfa', marginTop: 4 }}>
                                    Saving…
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
