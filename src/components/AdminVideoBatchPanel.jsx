/**
 * AdminVideoBatchPanel.jsx — Admin Presentation Control Dashboard
 * Shows ALL users' video generation progress with Start/Stop/Resume controls.
 * This is a standalone component added to SuperAdminPanel — no existing code modified.
 */
import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

const STATUS_COLORS = {
    queued: '#f59e0b',
    processing: '#3b82f6',
    extracting_topics: '#6366f1',
    generating_lessons: '#8b5cf6',
    generating_videos: '#a855f7',
    completed: '#22c55e',
    failed: '#ef4444',
};

const STATUS_LABELS = {
    queued: '⏳ Queued',
    processing: '📄 Processing',
    extracting_topics: '🔍 Extracting Topics',
    generating_lessons: '📝 Generating Lessons',
    generating_videos: '🎬 Generating Videos',
    completed: '✅ Completed',
    failed: '❌ Failed',
};

export default function AdminVideoBatchPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedUser, setExpandedUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // userId being acted on

    const fetchData = useCallback(async () => {
        try {
            const data = await apiService.adminGetAllUsersBatchStatus();
            if (data.success) {
                // Sort: users with active jobs first, then by email
                const sorted = (data.users || []).sort((a, b) => {
                    if (a.active_jobs > 0 && b.active_jobs === 0) return -1;
                    if (a.active_jobs === 0 && b.active_jobs > 0) return 1;
                    return (a.email || '').localeCompare(b.email || '');
                });
                setUsers(sorted);
            }
        } catch (e) {
            console.error('Failed to fetch video batch data:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000); // Refresh every 15s
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleToggle = async (userId, currentEnabled) => {
        setActionLoading(userId);
        try {
            await apiService.adminToggleUserVideoGen(userId, !currentEnabled);
            await fetchData();
        } catch (e) {
            console.error('Toggle failed:', e);
        } finally {
            setActionLoading(null);
        }
    };

    const handleControl = async (userId, action) => {
        setActionLoading(userId);
        try {
            await apiService.adminControlUserBatch(userId, action);
            await fetchData();
        } catch (e) {
            console.error('Control action failed:', e);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingText}>Loading video batch data...</div>
            </div>
        );
    }

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.video_generation_enabled).length;
    const totalJobs = users.reduce((sum, u) => sum + u.total_jobs, 0);
    const activeJobs = users.reduce((sum, u) => sum + u.active_jobs, 0);
    const totalCredits = users.reduce((sum, u) => sum + (u.replicate_credits || 0), 0);

    return (
        <div style={styles.container}>
            {/* Summary Cards */}
            <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryValue}>{totalUsers}</div>
                    <div style={styles.summaryLabel}>Total Users</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={{ ...styles.summaryValue, color: '#22c55e' }}>{activeUsers}</div>
                    <div style={styles.summaryLabel}>Video Gen Enabled</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={{ ...styles.summaryValue, color: '#8b5cf6' }}>{activeJobs}</div>
                    <div style={styles.summaryLabel}>Active Jobs</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={{ ...styles.summaryValue, color: '#f59e0b' }}>{totalJobs}</div>
                    <div style={styles.summaryLabel}>Total Jobs</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={{ ...styles.summaryValue, color: '#ec4899' }}>{totalCredits.toFixed(2)}</div>
                    <div style={styles.summaryLabel}>Replicate Credits</div>
                </div>
            </div>

            {/* Users Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>User</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Video Gen</th>
                            <th style={styles.th}>Jobs</th>
                            <th style={styles.th}>Credits</th>
                            <th style={styles.th}>Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <React.Fragment key={user.user_id}>
                                <tr
                                    style={{
                                        ...styles.tr,
                                        background: user.active_jobs > 0 ? 'rgba(139,92,246,0.08)' : 'transparent',
                                        cursor: user.total_jobs > 0 ? 'pointer' : 'default',
                                    }}
                                    onClick={() => user.total_jobs > 0 && setExpandedUser(
                                        expandedUser === user.user_id ? null : user.user_id
                                    )}
                                >
                                    <td style={styles.td}>
                                        <div style={styles.userInfo}>
                                            <div style={styles.userName}>{user.full_name || 'No name'}</div>
                                            <div style={styles.userEmail}>{user.email}</div>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.roleBadge,
                                            background: user.role === 'teacher' ? 'rgba(34,197,94,0.15)' :
                                                user.role === 'student' ? 'rgba(59,130,246,0.15)' : 'rgba(156,163,175,0.15)',
                                            color: user.role === 'teacher' ? '#22c55e' :
                                                user.role === 'student' ? '#3b82f6' : '#9ca3af',
                                        }}>
                                            {user.role || 'unset'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggle(user.user_id, user.video_generation_enabled); }}
                                            disabled={actionLoading === user.user_id}
                                            style={{
                                                ...styles.toggleBtn,
                                                background: user.video_generation_enabled
                                                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                                    : 'rgba(255,255,255,0.08)',
                                                color: user.video_generation_enabled ? '#fff' : '#9ca3af',
                                                border: user.video_generation_enabled
                                                    ? 'none'
                                                    : '1px solid rgba(255,255,255,0.15)',
                                            }}
                                        >
                                            {user.video_generation_enabled ? '✅ ON' : '⏸️ OFF'}
                                        </button>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.jobCounts}>
                                            {user.active_jobs > 0 && (
                                                <span style={styles.activeBadge}>
                                                    {user.active_jobs} active
                                                </span>
                                            )}
                                            <span style={styles.completedCount}>
                                                {user.completed_jobs} / {user.total_jobs}
                                            </span>
                                            {user.failed_jobs > 0 && (
                                                <span style={styles.failedBadge}>{user.failed_jobs} failed</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.creditValue}>{(user.replicate_credits || 0).toFixed(2)}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.controlBtns} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                style={styles.startBtn}
                                                onClick={() => handleControl(user.user_id, 'start')}
                                                disabled={actionLoading === user.user_id}
                                                title="Start video generation"
                                            >
                                                ▶ Start
                                            </button>
                                            <button
                                                style={styles.stopBtn}
                                                onClick={() => handleControl(user.user_id, 'stop')}
                                                disabled={actionLoading === user.user_id}
                                                title="Stop video generation"
                                            >
                                                ⏹ Stop
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Expanded: show batch jobs */}
                                {expandedUser === user.user_id && user.jobs.length > 0 && (
                                    <tr>
                                        <td colSpan="6" style={styles.expandedTd}>
                                            <div style={styles.jobsListHeader}>
                                                Batch Jobs for {user.email}
                                            </div>
                                            {user.jobs.map(job => (
                                                <div key={job.id} style={styles.jobRow}>
                                                    <div style={styles.jobDoc}>📄 {job.doc_name}</div>
                                                    <div style={{
                                                        ...styles.jobStatus,
                                                        color: STATUS_COLORS[job.status] || '#9ca3af',
                                                    }}>
                                                        {STATUS_LABELS[job.status] || job.status}
                                                    </div>
                                                    <div style={styles.jobProgress}>
                                                        <div style={styles.progressTrack}>
                                                            <div style={{
                                                                ...styles.progressBar,
                                                                width: `${job.progress || 0}%`,
                                                                background: STATUS_COLORS[job.status] || '#6366f1',
                                                            }} />
                                                        </div>
                                                        <span style={styles.progressText}>{job.progress || 0}%</span>
                                                    </div>
                                                    <div style={styles.jobDate}>
                                                        {new Date(job.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div style={styles.emptyState}>
                        No users found. Users will appear here after they sign up.
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = {
    container: {
        padding: '0',
    },
    loadingText: {
        padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem',
    },
    summaryGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 20,
    },
    summaryCard: {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '16px 12px', textAlign: 'center',
    },
    summaryValue: {
        fontSize: '1.5rem', fontWeight: 700, color: '#e0e0f0',
    },
    summaryLabel: {
        fontSize: '0.7rem', color: '#7c7c9a', marginTop: 4, textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    tableContainer: {
        borderRadius: 12, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
    },
    table: {
        width: '100%', borderCollapse: 'collapse',
    },
    th: {
        padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem',
        fontWeight: 600, color: '#7c7c9a', textTransform: 'uppercase',
        letterSpacing: '0.05em', background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    tr: {
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'background 0.2s',
    },
    td: {
        padding: '12px 16px', fontSize: '0.85rem', verticalAlign: 'middle',
    },
    userInfo: {},
    userName: { fontWeight: 600, color: '#e0e0f0', fontSize: '0.85rem' },
    userEmail: { fontSize: '0.75rem', color: '#7c7c9a' },
    roleBadge: {
        padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600,
    },
    toggleBtn: {
        padding: '4px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
        cursor: 'pointer', transition: 'all 0.2s',
    },
    jobCounts: {
        display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
    },
    activeBadge: {
        padding: '2px 8px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700,
        background: 'rgba(139,92,246,0.2)', color: '#a78bfa',
        animation: 'pulse 1.5s infinite',
    },
    completedCount: {
        fontSize: '0.8rem', color: '#9ca3af',
    },
    failedBadge: {
        padding: '2px 8px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700,
        background: 'rgba(239,68,68,0.2)', color: '#fca5a5',
    },
    creditValue: {
        fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b',
    },
    controlBtns: {
        display: 'flex', gap: 6,
    },
    startBtn: {
        padding: '5px 12px', borderRadius: 6, border: 'none',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
        fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
    },
    stopBtn: {
        padding: '5px 12px', borderRadius: 6, border: 'none',
        background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
        fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
    },
    expandedTd: {
        padding: '12px 24px', background: 'rgba(139,92,246,0.04)',
    },
    jobsListHeader: {
        fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa', marginBottom: 8,
    },
    jobRow: {
        display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    jobDoc: {
        flex: 1, fontSize: '0.8rem', color: '#e0e0f0', fontWeight: 500,
    },
    jobStatus: {
        fontSize: '0.75rem', fontWeight: 600, minWidth: 140,
    },
    jobProgress: {
        display: 'flex', alignItems: 'center', gap: 8, minWidth: 100,
    },
    progressTrack: {
        width: 60, height: 6, background: 'rgba(255,255,255,0.08)',
        borderRadius: 3, overflow: 'hidden',
    },
    progressBar: {
        height: '100%', borderRadius: 3, transition: 'width 0.5s ease-out',
    },
    progressText: {
        fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600,
    },
    jobDate: {
        fontSize: '0.7rem', color: '#7c7c9a', minWidth: 80,
    },
    emptyState: {
        padding: '40px', textAlign: 'center', color: '#7c7c9a', fontSize: '0.85rem',
    },
};
