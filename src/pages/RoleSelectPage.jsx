/**
 * RoleSelectPage
 * Shown after first login when no role has been set yet.
 * Allows the user to pick their role, saves it via the backend, then navigates.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../Styles/AuthModal.css'; // re-use the role card styles

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
    const navigate = useNavigate();
    const { fetchUserRole, user } = useAuth();
    const [selected, setSelected] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSelect = async (roleId) => {
        setSelected(roleId);
        setSaving(true);
        try {
            await apiService.updateUserRole(roleId);
            // refresh role in context
            if (user) await fetchUserRole(user.id);
        } catch (e) {
            console.warn('Role update failed (non-fatal):', e);
        }
        navigate(destFor(roleId), { replace: true });
        setSaving(false);
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
                            onClick={() => !saving && handleSelect(r.id)}
                            disabled={saving}
                        >
                            <span className="role-card-icon">{r.icon}</span>
                            <span className="role-card-label">{r.label}</span>
                            <span className="role-card-desc">{r.desc}</span>
                            {selected === r.id && saving && (
                                <span style={{ fontSize: '0.75rem', color: '#a78bfa', marginTop: 4 }}>Saving…</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
