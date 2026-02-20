import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { supabase } from '../supabaseClient';
import '../Styles/TeacherDashboard.css';

export default function TeacherDashboard() {
    const navigate = useNavigate();
    const handleSignOut = async () => { await supabase.auth.signOut(); navigate('/'); };
    const [view, setView] = useState('classrooms'); // 'classrooms' | 'detail' | 'progress'
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState([]);

    // Create classroom form
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newDoc, setNewDoc] = useState('');
    const [createError, setCreateError] = useState('');

    // Create assignment form
    const [showAssign, setShowAssign] = useState(false);
    const [assignChapter, setAssignChapter] = useState('');
    const [assignTopics, setAssignTopics] = useState('');
    const [assignDue, setAssignDue] = useState('');

    const [listError, setListError] = useState('');

    const loadClassrooms = useCallback(async () => {
        setLoading(true);
        setListError('');
        try {
            const res = await apiService.listClassrooms();
            if (res.success) {
                setClassrooms(res.classrooms || []);
            } else {
                setListError(res.detail || res.message || 'Failed to load classrooms');
            }
        } catch (e) {
            console.error('loadClassrooms error:', e);
            setListError(e.message || 'Failed to load classrooms — check console');
        }
        setLoading(false);
    }, []);

    const loadDocuments = useCallback(async () => {
        try {
            const res = await apiService.getEdtechDocuments();
            // Handle multiple possible response shapes
            const docs = res.documents || res.files || res.data || [];
            setDocuments(docs);
        } catch (e) { console.error('loadDocuments:', e); }
    }, []);

    useEffect(() => { loadClassrooms(); loadDocuments(); }, [loadClassrooms, loadDocuments]);

    const handleCreateClassroom = async () => {
        if (!newName.trim()) return;
        setCreateError('');
        try {
            const res = await apiService.createClassroom(newName, newDesc, newDoc);
            if (res.success) {
                setShowCreate(false);
                setNewName(''); setNewDesc(''); setNewDoc('');
                loadClassrooms();
            } else {
                setCreateError(res.detail || res.message || 'Failed to create classroom');
            }
        } catch (e) {
            console.error('createClassroom error:', e);
            setCreateError(e.message || 'An error occurred — check console for details');
        }
    };

    const handleDeleteClassroom = async (cls) => {
        if (!window.confirm(`Delete "${cls.name}"? This cannot be undone.`)) return;
        // Optimistic remove — no page flash
        setClassrooms(prev => prev.filter(c => c.id !== cls.id));
        try {
            await apiService.deleteClassroom(cls.id);
        } catch (e) {
            console.error('deleteClassroom error:', e);
            alert('Failed to delete: ' + e.message);
            loadClassrooms(); // restore on failure
        }
    };

    const openClassroomDetail = async (classroom) => {
        setLoading(true);
        try {
            const res = await apiService.getClassroomDetail(classroom.id);
            if (res.success) {
                setSelectedClassroom(res.classroom);
                setView('detail');
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const openProgress = async (classroom) => {
        setLoading(true);
        try {
            const res = await apiService.getClassroomProgress(classroom.id);
            if (res.success) {
                setProgressData(res);
                setSelectedClassroom(classroom);
                setView('progress');
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleCreateAssignment = async () => {
        if (!assignChapter.trim() || !selectedClassroom) return;
        try {
            const topicsArr = assignTopics.split(',').map(t => t.trim()).filter(Boolean);
            const res = await apiService.createAssignment(
                selectedClassroom.id, assignChapter, topicsArr, assignDue
            );
            if (res.success) {
                setShowAssign(false);
                setAssignChapter(''); setAssignTopics(''); setAssignDue('');
                openClassroomDetail(selectedClassroom);
            }
        } catch (e) { console.error(e); }
    };

    // ── Render helpers ──

    const renderClassroomsList = () => (
        <div className="td-section">
            <div className="td-header-row">
                <h2>📚 My Classrooms</h2>
                <button className="td-btn td-btn-primary" onClick={() => setShowCreate(true)}>
                    + Create Classroom
                </button>
            </div>

            {showCreate && (
                <div className="td-create-form">
                    <h3>Create New Classroom</h3>
                    <input placeholder="Classroom name (e.g. Class 10-A Science)"
                        value={newName} onChange={e => setNewName(e.target.value)} />
                    <input placeholder="Description (optional)"
                        value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                    <select value={newDoc} onChange={e => setNewDoc(e.target.value)}>
                        <option value="">-- Select textbook --</option>
                        {documents.map(d => {
                            const name = d.filename || d.file_name || d;
                            return <option key={name} value={name}>{name}</option>;
                        })}
                    </select>
                    <div className="td-form-actions">
                        <button className="td-btn td-btn-primary" onClick={handleCreateClassroom}>Create</button>
                        <button className="td-btn td-btn-ghost" onClick={() => { setShowCreate(false); setCreateError(''); }}>Cancel</button>
                    </div>
                    {createError && (
                        <div style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: 8, padding: '6px 10px', background: 'rgba(255,107,107,0.1)', borderRadius: 6 }}>
                            ⚠️ {createError}
                        </div>
                    )}
                </div>
            )}

            {loading ? (
                <div className="td-loading">Loading...</div>
            ) : listError ? (
                <div style={{ color: '#ff6b6b', padding: '16px', background: 'rgba(255,107,107,0.08)', borderRadius: 8, margin: '8px 0' }}>
                    ⚠️ {listError}
                </div>
            ) : classrooms.length === 0 ? (
                <div className="td-empty">
                    <p>No classrooms yet. Create one to get started!</p>
                </div>
            ) : (
                <div className="td-grid">
                    {classrooms.map(c => (
                        <div key={c.id} className="td-card">
                            <div className="td-card-header">
                                <h3>{c.name}</h3>
                                <span className="td-badge">{c.student_count || 0} students</span>
                            </div>
                            {c.description && <p className="td-card-desc">{c.description}</p>}
                            <div className="td-card-meta">
                                <span>📖 {c.doc_name || 'No textbook'}</span>
                                <span className="td-join-code">Code: <strong>{c.join_code}</strong></span>
                            </div>
                            <div className="td-card-actions">
                                <button className="td-btn td-btn-sm" onClick={() => openClassroomDetail(c)}>
                                    👥 Manage
                                </button>
                                <button className="td-btn td-btn-sm td-btn-accent" onClick={() => openProgress(c)}>
                                    📊 Progress
                                </button>
                                <button
                                    className="td-btn td-btn-sm"
                                    style={{ background: 'rgba(255,80,80,0.15)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.3)' }}
                                    onClick={() => handleDeleteClassroom(c)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderClassroomDetail = () => {
        if (!selectedClassroom) return null;
        const cls = selectedClassroom;
        return (
            <div className="td-section">
                <button className="td-back" onClick={() => setView('classrooms')}>← Back to Classrooms</button>
                <div className="td-detail-header">
                    <h2>{cls.name}</h2>
                    <span className="td-join-code-lg">Join Code: <strong>{cls.join_code}</strong></span>
                </div>

                {/* Students */}
                <div className="td-subsection">
                    <h3>👥 Students ({(cls.students || []).length})</h3>
                    {(cls.students || []).length === 0 ? (
                        <p className="td-muted">No students yet. Share the join code with your class.</p>
                    ) : (
                        <div className="td-student-list">
                            {cls.students.map(s => (
                                <div key={s.id} className="td-student-row">
                                    <span className="td-avatar">{(s.full_name || s.email || '?')[0].toUpperCase()}</span>
                                    <span>{s.full_name || s.email}</span>
                                    <span className="td-muted">{new Date(s.joined_at).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Assignments */}
                <div className="td-subsection">
                    <div className="td-header-row">
                        <h3>📋 Assignments</h3>
                        <button className="td-btn td-btn-sm td-btn-primary" onClick={() => setShowAssign(true)}>
                            + Add Assignment
                        </button>
                    </div>

                    {showAssign && (
                        <div className="td-create-form">
                            <input placeholder="Chapter title (e.g. Chapter 3: Atoms and Molecules)"
                                value={assignChapter} onChange={e => setAssignChapter(e.target.value)} />
                            <input placeholder="Topics (comma-separated)"
                                value={assignTopics} onChange={e => setAssignTopics(e.target.value)} />
                            <input type="date" placeholder="Due date (optional)"
                                value={assignDue} onChange={e => setAssignDue(e.target.value)} />
                            <div className="td-form-actions">
                                <button className="td-btn td-btn-primary" onClick={handleCreateAssignment}>Create</button>
                                <button className="td-btn td-btn-ghost" onClick={() => setShowAssign(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {(cls.assignments || []).length === 0 ? (
                        <p className="td-muted">No assignments yet.</p>
                    ) : (
                        cls.assignments.map(a => (
                            <div key={a.id} className="td-assignment-card">
                                <h4>{a.chapter_title}</h4>
                                <div className="td-topics-list">
                                    {(a.topics || []).map((t, i) => (
                                        <span key={i} className="td-topic-chip">{t}</span>
                                    ))}
                                </div>
                                {a.due_date && (
                                    <span className="td-due">Due: {new Date(a.due_date).toLocaleDateString()}</span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <button className="td-btn td-btn-accent td-btn-lg" onClick={() => openProgress(cls)}>
                    📊 View Full Progress Report
                </button>
            </div>
        );
    };

    const renderProgressGrid = () => {
        if (!progressData || !selectedClassroom) return null;
        const { students: studentSummaries, assignments } = progressData;
        const allTopics = (assignments || []).flatMap(a => a.topics || []);

        return (
            <div className="td-section">
                <button className="td-back" onClick={() => setView('detail')}>← Back to Classroom</button>
                <h2>📊 Progress — {selectedClassroom.name}</h2>

                {/* Summary cards */}
                <div className="td-stats-row">
                    <div className="td-stat-card">
                        <span className="td-stat-value">{studentSummaries?.length || 0}</span>
                        <span className="td-stat-label">Students</span>
                    </div>
                    <div className="td-stat-card">
                        <span className="td-stat-value">{allTopics.length}</span>
                        <span className="td-stat-label">Topics</span>
                    </div>
                    <div className="td-stat-card">
                        <span className="td-stat-value">
                            {studentSummaries?.length > 0
                                ? Math.round(studentSummaries.reduce((s, st) => s + st.progress_percent, 0) / studentSummaries.length)
                                : 0}%
                        </span>
                        <span className="td-stat-label">Avg Progress</span>
                    </div>
                </div>

                {/* Progress table */}
                {(studentSummaries || []).length > 0 && allTopics.length > 0 ? (
                    <div className="td-progress-table-wrap">
                        <table className="td-progress-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Overall</th>
                                    {allTopics.map((t, i) => (
                                        <th key={i} className="td-topic-header" title={t}>
                                            {t.length > 20 ? t.slice(0, 18) + '…' : t}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {studentSummaries.map(student => (
                                    <tr key={student.id}>
                                        <td className="td-student-cell">
                                            <span className="td-avatar-sm">{(student.full_name || '?')[0].toUpperCase()}</span>
                                            {student.full_name || student.email}
                                        </td>
                                        <td>
                                            <div className="td-progress-bar-wrap">
                                                <div className="td-progress-bar" style={{ width: `${student.progress_percent}%` }}></div>
                                                <span>{student.progress_percent}%</span>
                                            </div>
                                        </td>
                                        {allTopics.map((topic, ti) => {
                                            const detail = (student.details || []).find(d => d.topic === topic);
                                            return (
                                                <td key={ti} className="td-status-cell">
                                                    {detail ? (
                                                        <div className="td-status-icons">
                                                            <span title="Conversation" className={detail.conversation_completed ? 'done' : 'pending'}>💬</span>
                                                            <span title="Video" className={detail.video_completed ? 'done' : 'pending'}>🎬</span>
                                                            <span title="Quiz" className={detail.quiz_score > 0 ? 'done' : 'pending'}>
                                                                {detail.quiz_score > 0 ? `${detail.quiz_score}%` : '📝'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="td-not-started">—</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="td-muted">No progress data yet.</p>
                )}
            </div>
        );
    };

    return (
        <div className="teacher-dashboard">
            <div className="td-topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1>🎓 Teacher Dashboard</h1>
                    {view !== 'classrooms' && (
                        <button className="td-btn td-btn-ghost" onClick={() => setView('classrooms')}>
                            ← All Classrooms
                        </button>
                    )}
                </div>
                <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="td-btn td-btn-ghost" onClick={() => navigate('/')}>🏠 Home</button>
                    <button className="td-btn td-btn-ghost" onClick={() => navigate('/chat')}>💬 Chat</button>
                    <button className="td-btn td-btn-ghost" style={{ color: '#ff8888' }} onClick={handleSignOut}>⎋ Sign Out</button>
                </nav>
            </div>
            <div className="td-content">
                {view === 'classrooms' && renderClassroomsList()}
                {view === 'detail' && renderClassroomDetail()}
                {view === 'progress' && renderProgressGrid()}
            </div>
        </div>
    );
}
