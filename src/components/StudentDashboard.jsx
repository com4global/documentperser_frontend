import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { supabase } from '../supabaseClient';
import AITeacher from './AITeacher';
import '../Styles/TeacherDashboard.css'; // shared styles

export default function StudentDashboard() {
    const navigate = useNavigate();
    const handleSignOut = async () => { await supabase.auth.signOut(); navigate('/'); };
    const [view, setView] = useState('classrooms'); // 'classrooms' | 'classroom'
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [myProgress, setMyProgress] = useState([]);
    const [loading, setLoading] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinMsg, setJoinMsg] = useState('');

    // AI Teacher modal
    const [aiTeacherOpen, setAiTeacherOpen] = useState(false);
    const [aiTeacherDoc, setAiTeacherDoc] = useState('');
    const [aiTeacherTopic, setAiTeacherTopic] = useState('');
    // Track which classroom+topic is open so we can save progress
    // useRef so handleActivityComplete callback always reads the live value (avoids stale closure)
    const aiTeacherClassroomIdRef = React.useRef('');
    const aiTeacherActiveTopicRef = React.useRef('');

    const loadClassrooms = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiService.listClassrooms();
            if (res.success) setClassrooms(res.classrooms || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    }, []);

    useEffect(() => { loadClassrooms(); }, [loadClassrooms]);

    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        setJoinMsg('');
        try {
            const res = await apiService.joinClassroom(joinCode);
            if (res.success) {
                setJoinMsg(res.message || 'Joined!');
                setJoinCode('');
                loadClassrooms();
            }
        } catch (e) {
            setJoinMsg('Invalid join code');
        }
    };

    const openClassroom = async (classroom) => {
        setLoading(true);
        try {
            const [detailRes, progressRes] = await Promise.all([
                apiService.getClassroomDetail(classroom.id),
                apiService.getMyProgress(classroom.id)
            ]);
            if (detailRes.success) {
                setSelectedClassroom(detailRes.classroom);
                setAssignments(detailRes.classroom.assignments || []);
            }
            if (progressRes.success) {
                setMyProgress(progressRes.progress || []);
            }
            setView('classroom');
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const openAITeacher = (docName, topic) => {
        setAiTeacherDoc(docName || '');
        setAiTeacherTopic(topic || '');
        aiTeacherClassroomIdRef.current = selectedClassroom?.id || '';
        aiTeacherActiveTopicRef.current = topic || '';
        setAiTeacherOpen(true);
    };

    // Called by AITeacher when a lesson / video / quiz completes
    const handleActivityComplete = async (activityType, quizScore = 0, quizAnswers = {}) => {
        const classroomId = aiTeacherClassroomIdRef.current;
        const topic = aiTeacherActiveTopicRef.current;
        console.log('[Progress] activity complete:', activityType, quizScore, 'classroom:', classroomId, 'topic:', topic);
        if (!classroomId || !topic) {
            console.warn('[Progress] Missing classroomId or topic - progress NOT saved');
            return;
        }
        try {
            const res = await apiService.updateProgress(classroomId, topic, activityType, quizScore, quizAnswers);
            console.log('[Progress] save result:', res);
        } catch (e) {
            console.warn('[Progress] save failed:', e);
        }
    };

    // Reload progress after AITeacher closes
    const handleAITeacherClose = async () => {
        setAiTeacherOpen(false);
        if (selectedClassroom?.id) {
            try {
                const progressRes = await apiService.getMyProgress(selectedClassroom.id);
                if (progressRes.success) setMyProgress(progressRes.progress || []);
            } catch (e) { /* silent */ }
        }
    };

    // Returns 0-100% score for a single topic based on completed activities
    const getTopicProgressPct = (topic) => {
        const p = myProgress.find(row => row.topic === topic);
        if (!p) return 0;
        // quiz is "done" if a score was explicitly saved (even 0), vs null default
        const quizDone = p.quiz_score !== null && p.quiz_score !== undefined;
        const done = [p.conversation_completed, p.video_completed, quizDone].filter(Boolean).length;
        return Math.round((done / 3) * 100);
    };

    const getAssignmentProgress = (assignment) => {
        const topics = assignment.topics || [];
        if (topics.length === 0) return 0;
        const total = topics.reduce((sum, t) => sum + getTopicProgressPct(t), 0);
        return Math.round(total / topics.length);
    };

    const getOverallProgress = () => {
        const allTopics = assignments.flatMap(a => a.topics || []);
        if (allTopics.length === 0) return 0;
        const total = allTopics.reduce((sum, t) => sum + getTopicProgressPct(t), 0);
        return Math.round(total / allTopics.length);
    };

    // Color class based on % for progress bars
    const pctColor = (pct) => pct >= 67 ? 'high' : pct >= 34 ? 'mid' : 'low';

    const renderClassroomsList = () => (
        <div className="sd-section">
            {/* Join section */}
            <div className="sd-join-section">
                <input
                    className="sd-join-input"
                    placeholder="JOIN CODE"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                />
                <button className="sd-btn sd-btn-primary" onClick={handleJoin}>Join Classroom</button>
                {joinMsg && <span className="sd-muted" style={{ color: '#00cec9' }}>{joinMsg}</span>}
            </div>

            <h2>📚 My Classrooms</h2>
            {loading ? (
                <div className="sd-loading">Loading...</div>
            ) : classrooms.length === 0 ? (
                <div className="sd-empty">
                    <p>You haven't joined any classrooms yet.</p>
                    <p className="sd-muted">Ask your teacher for a join code.</p>
                </div>
            ) : (
                <div className="sd-grid">
                    {classrooms.map(c => (
                        <div key={c.id} className="sd-card" onClick={() => openClassroom(c)} style={{ cursor: 'pointer' }}>
                            <div className="sd-card-header">
                                <h3>{c.name}</h3>
                            </div>
                            {c.description && <p className="td-card-desc">{c.description}</p>}
                            <div className="sd-card-meta">
                                <span>👨‍🏫 {c.teacher_name || 'Teacher'}</span>
                                {c.doc_name && <span>📖 {c.doc_name}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderClassroomView = () => {
        if (!selectedClassroom) return null;
        const overall = getOverallProgress();

        return (
            <div className="sd-section">
                <button className="sd-back" onClick={() => setView('classrooms')}>← Back to Classrooms</button>

                <h2>{selectedClassroom.name}</h2>
                {selectedClassroom.doc_name && (
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: 8, padding: '6px 14px', marginBottom: 20, fontSize: '0.875rem', color: '#a5b4fc'
                    }}>
                        📖 Assigned book: <strong style={{ color: '#c7d2fe' }}>{selectedClassroom.doc_name}</strong>
                        <button
                            className="sd-btn sd-btn-primary"
                            style={{ padding: '3px 12px', fontSize: '0.78rem', marginLeft: 6 }}
                            onClick={() => openAITeacher(selectedClassroom.doc_name, '')}
                        >
                            📚 Open Document
                        </button>
                    </div>
                )}

                {/* Overall progress */}
                <div className="sd-stats-row">
                    <div className="sd-stat-card">
                        <span className="sd-stat-value">{overall}%</span>
                        <span className="sd-stat-label">Overall Progress</span>
                    </div>
                    <div className="sd-stat-card">
                        <span className="sd-stat-value">{assignments.length}</span>
                        <span className="sd-stat-label">Chapters</span>
                    </div>
                    <div className="sd-stat-card">
                        <span className="sd-stat-value">
                            {assignments.flatMap(a => a.topics || []).length}
                        </span>
                        <span className="sd-stat-label">Topics</span>
                    </div>
                </div>

                {/* Overall progress bar */}
                <div className="sd-progress-bar-outer">
                    <div className={`sd-progress-bar-inner ${pctColor(overall)}`} style={{ width: `${overall}%` }}></div>
                </div>
                <div className="sd-progress-label">
                    <span>0%</span>
                    <span className={`pct ${pctColor(overall)}`}>{overall}% Complete</span>
                    <span>100%</span>
                </div>

                {/* Assignments / Chapters */}
                {assignments.length === 0 ? (
                    <p className="sd-muted">No assignments yet. Your teacher will add them soon.</p>
                ) : (
                    assignments.map(a => {
                        const pct = getAssignmentProgress(a);
                        const docName = a.doc_name || selectedClassroom?.doc_name || '';
                        return (
                            <div key={a.id} className="sd-progress-card">
                                <div className="sd-progress-header">
                                    <h3>📖 {a.chapter_title}</h3>
                                    <span className="sd-progress-pct">{pct}%</span>
                                </div>

                                {/* Show assigned document name */}
                                {docName && (
                                    <div style={{
                                        fontSize: '0.78rem', color: '#94a3b8',
                                        marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6
                                    }}>
                                        📄 <span style={{ color: '#a5b4fc' }}>{docName}</span>
                                        <button
                                            className="sd-btn sd-btn-ghost"
                                            style={{ padding: '1px 8px', fontSize: '0.72rem' }}
                                            onClick={() => openAITeacher(docName, '')}
                                        >
                                            Open in AI Teacher
                                        </button>
                                    </div>
                                )}

                                {a.due_date && (
                                    <span className="td-due" style={{ marginBottom: 12 }}>
                                        Due: {new Date(a.due_date).toLocaleDateString()}
                                    </span>
                                )}
                                <div className="sd-progress-bar-outer" style={{ marginBottom: 4 }}>
                                    <div className={`sd-progress-bar-inner ${pctColor(pct)}`} style={{ width: `${pct}%` }}></div>
                                </div>
                                <div className="sd-progress-label" style={{ marginBottom: 12 }}>
                                    <span>0%</span>
                                    <span className={`pct ${pctColor(pct)}`}>{pct}% Complete</span>
                                    <span>100%</span>
                                </div>

                                {/* Topics with Study Now buttons */}
                                {(a.topics || []).map((topic, ti) => {
                                    const p = myProgress.find(row => row.topic === topic) || null;
                                    return (
                                        <div key={ti} className="sd-topic-row">
                                            <span className="sd-topic-name">{topic}</span>
                                            <div className="sd-activity-badges">
                                                <span className={`sd-activity-badge ${p?.conversation_completed ? 'done' : 'pending'}`}>
                                                    💬 {p?.conversation_completed ? 'Done' : 'Pending'}
                                                </span>
                                                <span className={`sd-activity-badge ${p?.video_completed ? 'done' : 'pending'}`}>
                                                    🎬 {p?.video_completed ? 'Done' : 'Pending'}
                                                </span>
                                                <span className={`sd-activity-badge ${p?.quiz_score !== null && p?.quiz_score !== undefined ? 'done' : 'pending'}`}>
                                                    📝 {p?.quiz_score !== null && p?.quiz_score !== undefined ? `${p.quiz_score}%` : 'Pending'}
                                                </span>
                                                {/* Study Now button */}
                                                <button
                                                    className="sd-btn sd-btn-primary"
                                                    style={{ padding: '3px 12px', fontSize: '0.75rem' }}
                                                    onClick={() => openAITeacher(docName, topic)}
                                                >
                                                    🎓 Study Now
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    return (
        <div className="student-dashboard">
            <div className="sd-topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1>📖 My Learning</h1>
                    {view !== 'classrooms' && (
                        <button className="sd-btn sd-btn-ghost" onClick={() => setView('classrooms')}>
                            ← All Classrooms
                        </button>
                    )}
                </div>
                <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="sd-btn sd-btn-ghost" onClick={() => navigate('/chat')}>💬 Chat</button>
                    <button className="sd-btn sd-btn-ghost" style={{ color: '#ff8888' }} onClick={handleSignOut}>⎋ Sign Out</button>
                </nav>
            </div>
            <div className="sd-content">
                {view === 'classrooms' && renderClassroomsList()}
                {view === 'classroom' && renderClassroomView()}
            </div>

            {/* AI Teacher Modal */}
            {aiTeacherOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.7)', display: 'flex',
                    alignItems: 'stretch', justifyContent: 'center'
                }}>
                    <div style={{ width: '100%', maxWidth: 1100, position: 'relative', overflow: 'auto' }}>
                        <AITeacher
                            onClose={handleAITeacherClose}
                            initialDoc={aiTeacherDoc}
                            initialTopic={aiTeacherTopic}
                            onActivityComplete={handleActivityComplete}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
