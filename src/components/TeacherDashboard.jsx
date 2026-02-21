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
    const [newChapter, setNewChapter] = useState('');
    const [chaptersForDoc, setChaptersForDoc] = useState([]);
    const [chaptersLoading, setChaptersLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Create assignment — wizard state
    const [showAssign, setShowAssign] = useState(false);
    const [wizStep, setWizStep] = useState(1); // 1=book, 2=chapter, 3=topics, 4=schedule
    const [wizDoc, setWizDoc] = useState('');          // selected filename
    const [docStructure, setDocStructure] = useState(null); // { chapters: [{title, topics}] }
    const [structureLoading, setStructureLoading] = useState(false);
    const [wizChapter, setWizChapter] = useState('');  // selected chapter title
    const [wizTopics, setWizTopics] = useState([]);    // checked topics (string[])
    const [wizDue, setWizDue] = useState('');
    const [wizStudent, setWizStudent] = useState(''); // '' = whole class
    const [wizSaving, setWizSaving] = useState(false);

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
            // Use new dedicated documents endpoint
            const res = await apiService.getDocuments();
            const docs = res.documents || res.files || res.data || [];
            setDocuments(docs);
        } catch (e) {
            // Fallback to edtech documents if available
            try {
                const res2 = await apiService.getEdtechDocuments();
                setDocuments(res2.documents || res2.files || []);
            } catch { console.error('loadDocuments:', e); }
        }
    }, []);

    useEffect(() => { loadClassrooms(); loadDocuments(); }, [loadClassrooms, loadDocuments]);

    const handleNewDocChange = async (filename) => {
        setNewDoc(filename);
        setNewChapter('');
        setChaptersForDoc([]);
        if (!filename) return;
        setChaptersLoading(true);
        try {
            const res = await apiService.getEdtechChapters(filename);
            if (res.success && res.chapters && res.chapters.length > 0) {
                setChaptersForDoc(res.chapters);
            }
        } catch (e) {
            console.warn('Could not load chapters for create form:', e);
        }
        setChaptersLoading(false);
    };

    const handleCreateClassroom = async () => {
        if (!newName.trim()) return;
        setCreateError('');
        try {
            const res = await apiService.createClassroom(newName, newDesc, newDoc, newChapter);
            if (res.success) {
                setShowCreate(false);
                setNewName(''); setNewDesc(''); setNewDoc(''); setNewChapter(''); setChaptersForDoc([]);
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

    // ── Wizard helpers ──
    const openWizard = () => {
        setWizStep(1); setWizDoc(''); setDocStructure(null);
        setWizChapter(''); setWizTopics([]); setWizDue(''); setWizStudent('');
        setShowAssign(true);
    };
    const closeWizard = () => setShowAssign(false);

    const handleWizDocChange = async (filename) => {
        setWizDoc(filename);
        setDocStructure(null); setWizChapter(''); setWizTopics([]);
        if (!filename) return;
        setStructureLoading(true);
        try {
            const res = await apiService.getDocumentStructure(filename);
            setDocStructure(res);
        } catch (e) { console.error('structure fetch:', e); }
        setStructureLoading(false);
    };

    const toggleTopic = (t) => setWizTopics(prev =>
        prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );

    const selectAllTopics = (topics) => setWizTopics(topics);
    const clearTopics = () => setWizTopics([]);

    const handleCreateAssignment = async () => {
        if (!wizChapter.trim() || !selectedClassroom) return;
        setWizSaving(true);
        try {
            const res = await apiService.createAssignment(
                selectedClassroom.id,
                wizChapter,
                wizTopics,
                wizDue,
                wizDoc,
                wizStudent
            );
            if (res.success) {
                closeWizard();
                openClassroomDetail(selectedClassroom);
            }
        } catch (e) { console.error(e); }
        setWizSaving(false);
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

                    {/* Step 1: Pick document */}
                    <select value={newDoc} onChange={e => handleNewDocChange(e.target.value)}>
                        <option value="">-- Select textbook --</option>
                        {documents.map(d => {
                            const name = d.filename || d.file_name || d;
                            return <option key={name} value={name}>{name}</option>;
                        })}
                    </select>

                    {/* Step 2: Pick chapter (shown once chapters are loaded) */}
                    {chaptersLoading && (
                        <p style={{ color: '#a0a0c0', fontSize: '0.85rem', margin: '6px 0' }}>⏳ Loading chapters…</p>
                    )}
                    {!chaptersLoading && chaptersForDoc.length > 0 && (
                        <select value={newChapter} onChange={e => setNewChapter(e.target.value)}
                            style={{ marginTop: 6 }}>
                            <option value="">-- Whole document (all chapters) --</option>
                            {chaptersForDoc.map(ch => (
                                <option key={ch.name} value={ch.name}>
                                    {ch.name}{ch.page_start ? ` (p.${ch.page_start}–${ch.page_end})` : ''}
                                </option>
                            ))}
                        </select>
                    )}
                    {!chaptersLoading && newDoc && chaptersForDoc.length === 0 && (
                        <p style={{ color: '#a0a0c0', fontSize: '0.82rem', margin: '6px 0' }}>📄 No chapters detected — whole document will be assigned.</p>
                    )}

                    <div className="td-form-actions">
                        <button className="td-btn td-btn-primary" onClick={handleCreateClassroom}>Create</button>
                        <button className="td-btn td-btn-ghost" onClick={() => { setShowCreate(false); setCreateError(''); setChaptersForDoc([]); setNewChapter(''); }}>Cancel</button>
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
                        <button className="td-btn td-btn-sm td-btn-primary" onClick={openWizard}>
                            + Add Assignment
                        </button>
                    </div>

                    {showAssign && (
                        <div className="td-create-form td-wizard">
                            {/* ── Step tabs ── */}
                            <div className="td-wiz-tabs">
                                {[['1', '📚 Book'], ['2', '📖 Chapter'], ['3', '🏷️ Topics'], ['4', '📅 Schedule']].map(([n, label]) => (
                                    <span key={n}
                                        className={`td-wiz-tab${wizStep === +n ? ' active' : wizStep > +n ? ' done' : ''}`}
                                        onClick={() => wizStep > +n && setWizStep(+n)}
                                    >{label}</span>
                                ))}
                            </div>

                            {/* ── Step 1: Book ── */}
                            {wizStep === 1 && (
                                <div className="td-wiz-body">
                                    <h4>Select the textbook / document</h4>
                                    <select value={wizDoc} onChange={e => handleWizDocChange(e.target.value)} className="td-wiz-select">
                                        <option value="">-- Choose a processed document --</option>
                                        {documents.map(d => {
                                            const name = d.filename || d.file_name || d;
                                            return <option key={name} value={name}>{name}</option>;
                                        })}
                                    </select>
                                    {structureLoading && <p className="td-muted" style={{ marginTop: 8 }}>⏳ Extracting chapters…</p>}
                                    <div className="td-wiz-nav">
                                        <button className="td-btn td-btn-ghost" onClick={closeWizard}>Cancel</button>
                                        <button className="td-btn td-btn-primary" disabled={!wizDoc || structureLoading}
                                            onClick={() => setWizStep(2)}>Next →</button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 2: Chapter ── */}
                            {wizStep === 2 && (
                                <div className="td-wiz-body">
                                    <h4>Select a chapter <span className="td-muted">({wizDoc})</span></h4>
                                    {docStructure && docStructure.chapters && docStructure.chapters.length > 0 ? (
                                        <div className="td-wiz-chapter-list">
                                            {docStructure.chapters.map(ch => (
                                                <label key={ch.title} className={`td-wiz-chapter-item${wizChapter === ch.title ? ' selected' : ''}`}>
                                                    <input type="radio" name="chapter" value={ch.title}
                                                        checked={wizChapter === ch.title}
                                                        onChange={() => { setWizChapter(ch.title); setWizTopics([]); }} />
                                                    {ch.title}
                                                    {ch.topics && ch.topics.length > 0 &&
                                                        <span className="td-badge" style={{ marginLeft: 8 }}>{ch.topics.length} topics</span>}
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="td-muted" style={{ marginBottom: 8 }}>No chapters detected — enter manually:</p>
                                            <input placeholder="e.g. Chapter 3: Atoms and Molecules"
                                                value={wizChapter} onChange={e => setWizChapter(e.target.value)} />
                                        </div>
                                    )}
                                    <div className="td-wiz-nav">
                                        <button className="td-btn td-btn-ghost" onClick={() => setWizStep(1)}>← Back</button>
                                        <button className="td-btn td-btn-primary" disabled={!wizChapter}
                                            onClick={() => setWizStep(3)}>Next →</button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 3: Topics ── */}
                            {wizStep === 3 && (() => {
                                const chapter = docStructure?.chapters?.find(c => c.title === wizChapter);
                                const topics = chapter?.topics || [];
                                return (
                                    <div className="td-wiz-body">
                                        <h4>Select topics <span className="td-muted">from {wizChapter}</span></h4>
                                        {topics.length > 0 ? (
                                            <>
                                                <div className="td-wiz-topic-actions">
                                                    <button className="td-btn td-btn-ghost" style={{ fontSize: '12px', padding: '2px 8px' }} onClick={() => selectAllTopics(topics)}>Select all</button>
                                                    <button className="td-btn td-btn-ghost" style={{ fontSize: '12px', padding: '2px 8px' }} onClick={clearTopics}>Clear</button>
                                                    <span className="td-muted" style={{ fontSize: '12px' }}>{wizTopics.length} selected</span>
                                                </div>
                                                <div className="td-wiz-topic-list">
                                                    {topics.map(t => (
                                                        <label key={t} className={`td-wiz-topic-item${wizTopics.includes(t) ? ' selected' : ''}`}>
                                                            <input type="checkbox" checked={wizTopics.includes(t)}
                                                                onChange={() => toggleTopic(t)} />
                                                            {t}
                                                        </label>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div>
                                                <p className="td-muted" style={{ marginBottom: 8 }}>No topics detected — enter manually (comma-separated):</p>
                                                <input placeholder="e.g. Photosynthesis, Cell Division"
                                                    value={wizTopics.join(', ')}
                                                    onChange={e => setWizTopics(e.target.value.split(',').map(t => t.trim()).filter(Boolean))} />
                                            </div>
                                        )}
                                        <div className="td-wiz-nav">
                                            <button className="td-btn td-btn-ghost" onClick={() => setWizStep(2)}>← Back</button>
                                            <button className="td-btn td-btn-primary" onClick={() => setWizStep(4)}>Next →</button>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* ── Step 4: Schedule & Assign ── */}
                            {wizStep === 4 && (
                                <div className="td-wiz-body">
                                    <h4>Schedule &amp; Assign</h4>
                                    <label className="td-wiz-label">Due date (optional)</label>
                                    <input type="date" value={wizDue} onChange={e => setWizDue(e.target.value)} />

                                    <label className="td-wiz-label" style={{ marginTop: 12 }}>Assign to</label>
                                    <select value={wizStudent} onChange={e => setWizStudent(e.target.value)} className="td-wiz-select">
                                        <option value="">🏫 Entire class</option>
                                        {(selectedClassroom?.students || []).map(s => (
                                            <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
                                        ))}
                                    </select>

                                    {/* Summary */}
                                    <div className="td-wiz-summary">
                                        <div><strong>📚 Book:</strong> {wizDoc}</div>
                                        <div><strong>📖 Chapter:</strong> {wizChapter}</div>
                                        <div><strong>🏷️ Topics:</strong> {wizTopics.length > 0 ? wizTopics.join(', ') : '(none selected)'}</div>
                                        <div><strong>👤 Assign to:</strong> {wizStudent ? (selectedClassroom?.students?.find(s => s.id === wizStudent)?.full_name || 'Student') : 'Entire class'}</div>
                                    </div>

                                    <div className="td-wiz-nav">
                                        <button className="td-btn td-btn-ghost" onClick={() => setWizStep(3)}>← Back</button>
                                        <button className="td-btn td-btn-primary" disabled={wizSaving || !wizChapter}
                                            onClick={handleCreateAssignment}>
                                            {wizSaving ? '⏳ Saving…' : '✅ Create Assignment'}
                                        </button>
                                    </div>
                                </div>
                            )}
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
                    <button className="td-btn td-btn-ghost" onClick={() => navigate('/chat')}>🏠 Home</button>
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
