import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { supabase } from '../supabaseClient';
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

    const getTopicProgress = (topic) => {
        return myProgress.find(p => p.topic === topic) || null;
    };

    const getAssignmentProgress = (assignment) => {
        const topics = assignment.topics || [];
        if (topics.length === 0) return 0;
        let completed = 0;
        topics.forEach(t => {
            const p = getTopicProgress(t);
            if (p && p.completed_at) completed++;
        });
        return Math.round((completed / topics.length) * 100);
    };

    const getOverallProgress = () => {
        const allTopics = assignments.flatMap(a => a.topics || []);
        if (allTopics.length === 0) return 0;
        let completed = 0;
        allTopics.forEach(t => {
            const p = getTopicProgress(t);
            if (p && p.completed_at) completed++;
        });
        return Math.round((completed / allTopics.length) * 100);
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
                                <span>📖 {c.doc_name || ''}</span>
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
                        return (
                            <div key={a.id} className="sd-progress-card">
                                <div className="sd-progress-header">
                                    <h3>📖 {a.chapter_title}</h3>
                                    <span className="sd-progress-pct">{pct}%</span>
                                </div>
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

                                {/* Topics */}
                                {(a.topics || []).map((topic, ti) => {
                                    const p = getTopicProgress(topic);
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
                                                <span className={`sd-activity-badge ${p?.quiz_score > 0 ? 'done' : 'pending'}`}>
                                                    📝 {p?.quiz_score > 0 ? `${p.quiz_score}%` : 'Pending'}
                                                </span>
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
        </div>
    );
}
