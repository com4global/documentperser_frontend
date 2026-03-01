// src/components/SuperAdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminVideoBatchPanel from './AdminVideoBatchPanel';

import { APP_CONFIG } from '../utils/constants';

const API_URL = APP_CONFIG.API_URL || 'http://localhost:10001';

const PLAN_COLORS = {
    free: '#6b7280',
    pro: '#8b5cf6',
    plus: '#f59e0b',
    corporate: '#10b981',
};

const PLAN_LABELS = {
    free: 'Free',
    pro: 'Pro',
    plus: 'Plus',
    corporate: 'Corporate',
};

const ROLE_ICONS = {
    student: '🎓',
    teacher: '👨‍🏫',
    admin: '🔑',
    individual: '👤',
    other: '🔹',
};

const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
};

const formatCost = (cost) => {
    if (!cost || cost === 0) return '$0.00';
    return '$' + cost.toFixed(4);
};

export default function SuperAdminPanel() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [replicateUsage, setReplicateUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [expandedUser, setExpandedUser] = useState(null);
    const [userDetail, setUserDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [showVideoPanel, setShowVideoPanel] = useState(true);

    const getToken = useCallback(async () => {
        const { data: { session: s } } = await (await import('../supabaseClient')).supabase.auth.getSession();
        return s?.access_token;
    }, []);

    const authFetch = useCallback(async (url, options = {}) => {
        const token = await getToken();
        const res = await fetch(`${API_URL}${url}`, {
            ...options,
            headers: {
                ...options.headers,
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (res.status === 403) {
            setError('Access denied — you are not a super admin.');
            throw new Error('Forbidden');
        }
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Request failed (${res.status})`);
        }
        return res.json();
    }, [getToken]);

    // Fetch users + stats
    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [usersData, statsData, repData] = await Promise.allSettled([
                authFetch('/api/admin/users'),
                authFetch('/api/admin/stats'),
                authFetch('/api/admin/replicate-usage'),
            ]);

            if (usersData.status === 'fulfilled') setUsers(usersData.value.users || []);
            if (statsData.status === 'fulfilled') setStats(statsData.value.stats || null);
            if (repData.status === 'fulfilled') setReplicateUsage(repData.value.replicate || null);

            // Check for access denied
            if (usersData.status === 'rejected' && usersData.reason?.message === 'Forbidden') return;
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Fetch user detail
    const handleExpandUser = async (userId) => {
        if (expandedUser === userId) {
            setExpandedUser(null);
            setUserDetail(null);
            return;
        }
        setExpandedUser(userId);
        setUserDetail(null);
        setDetailLoading(true);
        try {
            const data = await authFetch(`/api/admin/users/${userId}`);
            setUserDetail(data.user);
        } catch (e) {
            showToast('❌ ' + e.message, 'error');
        } finally {
            setDetailLoading(false);
        }
    };

    // Toggle restrict
    const handleRestrict = async (userId, currentlyActive) => {
        setActionLoading(userId + '_restrict');
        try {
            const form = new FormData();
            form.append('active', currentlyActive ? 'false' : 'true');
            await authFetch(`/api/admin/users/${userId}/restrict`, {
                method: 'PATCH',
                body: form
            });
            showToast(currentlyActive ? '🔒 User restricted' : '✅ User activated', 'success');
            fetchAll();
        } catch (e) {
            showToast('❌ ' + e.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // Change role
    const handleRoleChange = async (userId, newRole) => {
        setActionLoading(userId + '_role');
        try {
            const form = new FormData();
            form.append('role', newRole);
            await authFetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                body: form
            });
            showToast(`✅ Role changed to ${newRole}`, 'success');
            fetchAll();
        } catch (e) {
            showToast('❌ ' + e.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // Change plan
    const handlePlanChange = async (userId, newPlan) => {
        setActionLoading(userId + '_plan');
        try {
            const form = new FormData();
            form.append('plan', newPlan);
            await authFetch(`/api/admin/users/${userId}/plan`, {
                method: 'PATCH',
                body: form
            });
            showToast(`✅ Plan changed to ${PLAN_LABELS[newPlan] || newPlan}`, 'success');
            fetchAll();
        } catch (e) {
            showToast('❌ ' + e.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Filter users
    const filteredUsers = users.filter(u => {
        const q = search.toLowerCase();
        return !q || u.email?.toLowerCase().includes(q) ||
            u.full_name?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q) ||
            u.plan?.toLowerCase().includes(q);
    });

    if (error === 'Access denied — you are not a super admin.') {
        return (
            <div style={s.container}>
                <div style={{ ...s.card, textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
                    <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Access Denied</h2>
                    <p style={{ color: '#94a3b8' }}>You don't have super admin privileges.</p>
                    <button style={{ ...s.btn, ...s.btnPrimary, marginTop: '20px' }}
                        onClick={() => navigate('/chat')}>← Back to App</button>
                </div>
            </div>
        );
    }

    return (
        <div style={s.container}>
            {/* Toast */}
            {toast && (
                <div style={{
                    ...s.toast,
                    borderColor: toast.type === 'error' ? '#ef4444' : '#10b981',
                    background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                }}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div style={s.header}>
                <div>
                    <h1 style={s.title}>
                        <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>🛡️</span>
                        Super Admin Panel
                    </h1>
                    <p style={s.subtitle}>Manage users, subscriptions, and platform usage</p>
                </div>
                <button style={{ ...s.btn, ...s.btnGhost }}
                    onClick={() => navigate('/chat')}>← Back to App</button>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#8b5cf6' }}>
                    <div style={{
                        width: '40px', height: '40px',
                        border: '3px solid rgba(139,92,246,0.2)',
                        borderTop: '3px solid #8b5cf6',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p>Loading admin data...</p>
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Stats Cards */}
                    {stats && (
                        <div style={s.statsGrid}>
                            <StatCard icon="👥" label="Total Users" value={stats.total_users}
                                sub={`${stats.active_users} active · ${stats.restricted_users} restricted`} />
                            <StatCard icon="📄" label="Total Files" value={stats.total_files}
                                sub={formatBytes(stats.total_storage_bytes)} />
                            <StatCard icon="🧩" label="Total Chunks" value={stats.total_chunks?.toLocaleString()} />
                            <StatCard icon="💰" label="Replicate Cost" value={formatCost(stats.total_replicate_cost_usd)}
                                accent="#f59e0b" />
                        </div>
                    )}

                    {/* Replicate API Usage */}
                    {replicateUsage && (
                        <div style={{ ...s.card, marginBottom: '24px' }}>
                            <h3 style={s.sectionTitle}>
                                <span style={{ marginRight: '8px' }}>⚡</span>
                                Replicate Account Usage (Last 50 Predictions)
                            </h3>
                            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                                <MiniStat label="Predictions" value={replicateUsage.recent_predictions} />
                                <MiniStat label="Succeeded" value={replicateUsage.succeeded} color="#10b981" />
                                <MiniStat label="Failed" value={replicateUsage.failed} color="#ef4444" />
                                <MiniStat label="GPU Time" value={`${replicateUsage.total_predict_time_seconds}s`} />
                                <MiniStat label="Est. Cost" value={formatCost(replicateUsage.estimated_cost_usd)} color="#f59e0b" />
                            </div>
                        </div>
                    )}

                    {/* Subscription Breakdown */}
                    {stats?.subscription_breakdown && Object.keys(stats.subscription_breakdown).length > 0 && (
                        <div style={{ ...s.card, marginBottom: '24px' }}>
                            <h3 style={s.sectionTitle}>
                                <span style={{ marginRight: '8px' }}>📊</span>
                                Subscription Breakdown
                            </h3>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                {Object.entries(stats.subscription_breakdown).map(([plan, count]) => (
                                    <div key={plan} style={{
                                        padding: '12px 20px',
                                        background: `${PLAN_COLORS[plan] || '#6b7280'}15`,
                                        borderRadius: '12px',
                                        border: `1px solid ${PLAN_COLORS[plan] || '#6b7280'}30`,
                                    }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: PLAN_COLORS[plan] || '#fff' }}>{count}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>{PLAN_LABELS[plan] || plan}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Presentation / Video Control */}
                    <div style={{ ...s.card, marginBottom: '24px' }}>
                        <h3
                            style={{ ...s.sectionTitle, cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => setShowVideoPanel(!showVideoPanel)}
                        >
                            <span style={{ marginRight: '8px' }}>🎬</span>
                            Presentation Video Control
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#7c7c9a' }}>
                                {showVideoPanel ? '▲ Collapse' : '▼ Expand'}
                            </span>
                        </h3>
                        {showVideoPanel && <AdminVideoBatchPanel />}
                    </div>

                    {/* Search */}
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="🔍  Search users by name, email, role, or plan..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={s.searchInput}
                        />
                    </div>

                    {/* Users Table */}
                    <div style={s.card}>
                        <h3 style={{ ...s.sectionTitle, marginBottom: '16px' }}>
                            <span style={{ marginRight: '8px' }}>👥</span>
                            All Users ({filteredUsers.length})
                        </h3>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={s.table}>
                                <thead>
                                    <tr>
                                        <th style={s.th}>User</th>
                                        <th style={s.th}>Role</th>
                                        <th style={s.th}>Plan</th>
                                        <th style={s.th}>Files</th>
                                        <th style={s.th}>Chunks</th>
                                        <th style={s.th}>Storage</th>
                                        <th style={s.th}>Replicate $</th>
                                        <th style={s.th}>Status</th>
                                        <th style={s.th}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <React.Fragment key={user.id}>
                                            <tr style={{
                                                ...s.tr,
                                                opacity: user.is_active ? 1 : 0.5,
                                                cursor: 'pointer',
                                            }}
                                                onClick={() => handleExpandUser(user.id)}
                                            >
                                                <td style={s.td}>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>
                                                            {user.full_name || 'No name'}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={s.td}>
                                                    <span style={s.badge}>
                                                        {ROLE_ICONS[user.role] || '🔹'} {user.role}
                                                    </span>
                                                </td>
                                                <td style={s.td}>
                                                    <span style={{
                                                        ...s.planBadge,
                                                        background: `${PLAN_COLORS[user.plan] || '#6b7280'}20`,
                                                        color: PLAN_COLORS[user.plan] || '#6b7280',
                                                        border: `1px solid ${PLAN_COLORS[user.plan] || '#6b7280'}40`,
                                                    }}>
                                                        {PLAN_LABELS[user.plan] || user.plan || 'Free'}
                                                    </span>
                                                </td>
                                                <td style={s.td}>{user.total_files}</td>
                                                <td style={s.td}>{user.total_chunks?.toLocaleString()}</td>
                                                <td style={s.td}>{formatBytes(user.total_size)}</td>
                                                <td style={{ ...s.td, color: '#f59e0b', fontWeight: 600 }}>
                                                    {formatCost(user.replicate_cost)}
                                                </td>
                                                <td style={s.td}>
                                                    <span style={{
                                                        ...s.statusDot,
                                                        background: user.is_active ? '#10b981' : '#ef4444',
                                                    }} />
                                                    {user.is_active ? 'Active' : 'Restricted'}
                                                </td>
                                                <td style={s.td} onClick={e => e.stopPropagation()}>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        <button
                                                            style={{
                                                                ...s.actionBtn,
                                                                background: user.is_active ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                                                                color: user.is_active ? '#ef4444' : '#10b981',
                                                                border: `1px solid ${user.is_active ? '#ef444440' : '#10b98140'}`,
                                                            }}
                                                            disabled={actionLoading === user.id + '_restrict'}
                                                            onClick={() => handleRestrict(user.id, user.is_active)}
                                                        >
                                                            {user.is_active ? '🔒' : '🔓'}
                                                        </button>
                                                        <select
                                                            value={user.role}
                                                            onChange={e => handleRoleChange(user.id, e.target.value)}
                                                            style={s.selectSmall}
                                                            disabled={actionLoading === user.id + '_role'}
                                                        >
                                                            <option value="student">Student</option>
                                                            <option value="teacher">Teacher</option>
                                                            <option value="individual">Individual</option>
                                                            <option value="admin">Admin</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                        <select
                                                            value={user.plan}
                                                            onChange={e => handlePlanChange(user.id, e.target.value)}
                                                            style={s.selectSmall}
                                                            disabled={actionLoading === user.id + '_plan'}
                                                        >
                                                            <option value="free">Free</option>
                                                            <option value="pro">Pro</option>
                                                            <option value="plus">Plus</option>
                                                            <option value="corporate">Corporate</option>
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded detail */}
                                            {expandedUser === user.id && (
                                                <tr>
                                                    <td colSpan={9} style={{ padding: 0 }}>
                                                        <div style={s.expandedRow}>
                                                            {detailLoading ? (
                                                                <p style={{ color: '#8b5cf6' }}>Loading details...</p>
                                                            ) : userDetail ? (
                                                                <div>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                                                                        <DetailItem label="User ID" value={userDetail.id} mono />
                                                                        <DetailItem label="Email" value={userDetail.email} />
                                                                        <DetailItem label="Joined" value={formatDate(userDetail.created_at)} />
                                                                        <DetailItem label="Plan" value={userDetail.subscription?.plan || 'free'} />
                                                                        <DetailItem label="Total Files" value={userDetail.total_files} />
                                                                        <DetailItem label="Total Chunks" value={userDetail.total_chunks?.toLocaleString()} />
                                                                        <DetailItem label="Storage Used" value={formatBytes(userDetail.total_storage)} />
                                                                        <DetailItem label="Replicate Cost" value={formatCost(userDetail.replicate_cost)} accent="#f59e0b" />
                                                                        <DetailItem label="Total API Cost" value={formatCost(userDetail.total_api_cost)} accent="#8b5cf6" />
                                                                    </div>

                                                                    {/* Usage Logs */}
                                                                    {userDetail.usage_logs?.length > 0 && (
                                                                        <div style={{ marginTop: '16px' }}>
                                                                            <h4 style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '8px' }}>
                                                                                📋 Recent Usage Logs ({userDetail.usage_logs.length})
                                                                            </h4>
                                                                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                                                <table style={{ ...s.table, fontSize: '0.75rem' }}>
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th style={s.th}>Date</th>
                                                                                            <th style={s.th}>Service</th>
                                                                                            <th style={s.th}>Action</th>
                                                                                            <th style={s.th}>Cost</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {userDetail.usage_logs.map((log, i) => (
                                                                                            <tr key={i} style={s.tr}>
                                                                                                <td style={s.td}>{formatDate(log.created_at)}</td>
                                                                                                <td style={s.td}>
                                                                                                    <span style={{ ...s.badge, fontSize: '0.7rem' }}>{log.service}</span>
                                                                                                </td>
                                                                                                <td style={s.td}>{log.action}</td>
                                                                                                <td style={{ ...s.td, color: '#f59e0b' }}>{formatCost(log.cost_usd)}</td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Files */}
                                                                    {userDetail.files?.length > 0 && (
                                                                        <div style={{ marginTop: '16px' }}>
                                                                            <h4 style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '8px' }}>
                                                                                📁 Files ({userDetail.files.length})
                                                                            </h4>
                                                                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                                                <table style={{ ...s.table, fontSize: '0.75rem' }}>
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th style={s.th}>Filename</th>
                                                                                            <th style={s.th}>Size</th>
                                                                                            <th style={s.th}>Chunks</th>
                                                                                            <th style={s.th}>Processed</th>
                                                                                            <th style={s.th}>Date</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {userDetail.files.map((f, i) => (
                                                                                            <tr key={i} style={s.tr}>
                                                                                                <td style={{ ...s.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                                    {f.filename}
                                                                                                </td>
                                                                                                <td style={s.td}>{formatBytes(f.file_size)}</td>
                                                                                                <td style={s.td}>{f.chunks_created}</td>
                                                                                                <td style={s.td}>{f.processed ? '✅' : '⏳'}</td>
                                                                                                <td style={s.td}>{formatDate(f.created_at)}</td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p style={{ color: '#94a3b8' }}>No details available</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>

                            {filteredUsers.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    {search ? 'No users match your search.' : 'No users found.'}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Spin keyframes */}
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

// Sub-components
function StatCard({ icon, label, value, sub, accent }) {
    return (
        <div style={{
            background: 'rgba(30, 30, 50, 0.8)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            backdropFilter: 'blur(12px)',
        }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
            <div style={{
                fontSize: '1.8rem', fontWeight: 700,
                color: accent || '#e2e8f0',
                marginBottom: '4px'
            }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</div>
            {sub && <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '4px' }}>{sub}</div>}
        </div>
    );
}

function MiniStat({ label, value, color }) {
    return (
        <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: color || '#e2e8f0' }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{label}</div>
        </div>
    );
}

function DetailItem({ label, value, mono, accent }) {
    return (
        <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>{label}</div>
            <div style={{
                fontSize: '0.85rem',
                color: accent || '#e2e8f0',
                fontFamily: mono ? 'monospace' : 'inherit',
                wordBreak: 'break-all'
            }}>{value || '—'}</div>
        </div>
    );
}

// Styles
const s = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f23 100%)',
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: '24px 32px',
        color: '#e2e8f0',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
    },
    title: {
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#f1f5f9',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: '0.85rem',
        color: '#64748b',
        margin: '4px 0 0 0',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
    },
    card: {
        background: 'rgba(30, 30, 50, 0.6)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(139, 92, 246, 0.1)',
        backdropFilter: 'blur(12px)',
    },
    sectionTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        color: '#e2e8f0',
        margin: '0 0 16px 0',
        display: 'flex',
        alignItems: 'center',
    },
    searchInput: {
        width: '100%',
        padding: '14px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        background: 'rgba(30, 30, 50, 0.5)',
        color: '#e2e8f0',
        fontSize: '0.9rem',
        outline: 'none',
        boxSizing: 'border-box',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.85rem',
    },
    th: {
        padding: '10px 12px',
        textAlign: 'left',
        color: '#8b5cf6',
        fontWeight: 600,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
        whiteSpace: 'nowrap',
    },
    tr: {
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'background 0.15s',
    },
    td: {
        padding: '12px',
        color: '#cbd5e1',
        whiteSpace: 'nowrap',
    },
    badge: {
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '8px',
        fontSize: '0.75rem',
        background: 'rgba(139, 92, 246, 0.12)',
        color: '#a78bfa',
        fontWeight: 500,
    },
    planBadge: {
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontWeight: 600,
    },
    statusDot: {
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        marginRight: '6px',
    },
    actionBtn: {
        padding: '5px 10px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: 600,
        transition: 'all 0.15s',
    },
    selectSmall: {
        padding: '4px 6px',
        borderRadius: '8px',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        background: 'rgba(30, 30, 50, 0.8)',
        color: '#e2e8f0',
        fontSize: '0.75rem',
        cursor: 'pointer',
        outline: 'none',
    },
    expandedRow: {
        padding: '20px 24px',
        background: 'rgba(20, 20, 40, 0.8)',
        borderTop: '1px solid rgba(139, 92, 246, 0.1)',
        borderBottom: '2px solid rgba(139, 92, 246, 0.15)',
    },
    btn: {
        padding: '10px 20px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600,
        transition: 'all 0.2s',
    },
    btnPrimary: {
        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        color: '#fff',
    },
    btnGhost: {
        background: 'rgba(139, 92, 246, 0.1)',
        color: '#a78bfa',
        border: '1px solid rgba(139, 92, 246, 0.2)',
    },
    toast: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '14px 24px',
        borderRadius: '12px',
        border: '1px solid',
        backdropFilter: 'blur(12px)',
        color: '#e2e8f0',
        fontSize: '0.85rem',
        fontWeight: 500,
        zIndex: 9999,
        animation: 'slideIn 0.3s ease',
    },
};
