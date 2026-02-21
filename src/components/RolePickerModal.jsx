/**
 * RolePickerModal
 * Shown automatically when the user is signed in but has no role set.
 * Disappears permanently once a role is chosen and saved.
 */
import React, { useState } from 'react';
import { apiService } from '../services/api';
import './RolePickerModal.css';

const ROLES = [
    {
        id: 'teacher',
        emoji: '👩‍🏫',
        label: 'Teacher',
        desc: 'Create classrooms, assign lessons, and track student progress.',
    },
    {
        id: 'student',
        emoji: '🎒',
        label: 'Student',
        desc: 'Join your classroom, access assignments, and learn at your pace.',
    },
    {
        id: 'individual',
        emoji: '💡',
        label: 'Individual',
        desc: 'Personal learning — explore documents and chat with the AI.',
    },
    {
        id: 'other',
        emoji: '🌐',
        label: 'Other',
        desc: 'General access to the platform.',
    },
];

export default function RolePickerModal() {
    const [selected, setSelected] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        setError('');
        try {
            await apiService.updateUserRole(selected);
            // Hard reload — AuthContext re-reads role from Supabase on startup,
            // so the modal won't appear again once the role is saved.
            window.location.reload();
        } catch (e) {
            setError(e.message || 'Failed to save role. Please try again.');
            setSaving(false);
        }
    };

    return (
        <div className="rpm-overlay">
            <div className="rpm-card">
                <div className="rpm-header">
                    <div className="rpm-logo">🎓</div>
                    <h2>Welcome! What's your role?</h2>
                    <p className="rpm-sub">Choose how you'll be using the platform. You can change this later in settings.</p>
                </div>

                <div className="rpm-grid">
                    {ROLES.map(r => (
                        <button
                            key={r.id}
                            className={`rpm-role-btn${selected === r.id ? ' selected' : ''}`}
                            onClick={() => setSelected(r.id)}
                        >
                            <span className="rpm-emoji">{r.emoji}</span>
                            <strong>{r.label}</strong>
                            <span className="rpm-desc">{r.desc}</span>
                        </button>
                    ))}
                </div>

                {error && <p className="rpm-error">{error}</p>}

                <button
                    className="rpm-confirm-btn"
                    disabled={!selected || saving}
                    onClick={handleSave}
                >
                    {saving ? '⏳ Saving…' : 'Continue →'}
                </button>
            </div>
        </div>
    );
}
