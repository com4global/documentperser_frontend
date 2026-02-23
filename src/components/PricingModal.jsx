import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONFIG } from '../utils/constants';
import './PricingModal.css';

const API_URL = APP_CONFIG.API_URL || 'http://localhost:10001';

const PLAN_ORDER = ['free', 'pro', 'plus', 'corporate'];

const PLAN_COLORS = {
    free: { accent: '#64748b', gradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)', ring: 'rgba(100,116,139,0.4)' },
    pro: { accent: '#6366f1', gradient: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)', ring: 'rgba(99,102,241,0.4)' },
    plus: { accent: '#8b5cf6', gradient: 'linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)', ring: 'rgba(139,92,246,0.4)' },
    corporate: { accent: '#f59e0b', gradient: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)', ring: 'rgba(245,158,11,0.4)' },
};

const PLAN_ICONS = { free: '🆓', pro: '⚡', plus: '🚀', corporate: '🏢' };
const PLAN_POPULAR = { pro: true };

export default function PricingModal({ onClose, forceShow = false }) {
    const { session } = useAuth();
    const [plans, setPlans] = useState({});
    const [currency, setCurrency] = useState('usd');
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [currentPlan, setCurrentPlan] = useState('free');
    const [fetchError, setFetchError] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState('');

    // Fetch plans + current subscription
    useEffect(() => {
        const token = session?.access_token;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        fetch(`${API_URL}/api/billing/plans`)
            .then((r) => r.json())
            .then((d) => { if (d.plans) setPlans(d.plans); })
            .catch(() => setFetchError('Could not load plans'));

        if (token) {
            fetch(`${API_URL}/api/billing/status`, { headers })
                .then((r) => r.json())
                .then((d) => { if (d.plan) setCurrentPlan(d.plan); })
                .catch(() => { });
        }
    }, [session]);

    // After returning from Stripe Checkout, verify the session and update the plan
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        const token = session?.access_token;
        if (!sessionId || !token) return;

        // Remove the param from the URL immediately so we don't re-trigger
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);

        fetch(`${API_URL}/api/billing/verify-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ session_id: sessionId }),
        })
            .then((r) => r.json())
            .then((d) => { if (d.plan) setCurrentPlan(d.plan); })
            .catch(() => { });
    }, [session]);


    const handleSelect = async (planKey) => {
        if (planKey === currentPlan) { onClose?.(); return; }
        setSelectedPlan(planKey);
        setLoading(true);

        const token = session?.access_token;
        const appUrl = window.location.origin;

        try {
            const res = await fetch(`${API_URL}/api/billing/create-checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    plan: planKey,
                    currency,
                    success_url: `${appUrl}/chat?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${appUrl}/chat`,
                }),
            });
            const data = await res.json();
            if (data.url) {
                if (planKey === 'free') {
                    setCurrentPlan('free');
                    onClose?.();
                } else {
                    window.location.href = data.url;
                }
            } else {
                throw new Error(data.detail || 'Could not start checkout');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
            setSelectedPlan(null);
        }
    };

    const syncPlan = async () => {
        const token = session?.access_token;
        if (!token) return;
        setSyncing(true);
        setSyncMsg('');
        try {
            const res = await fetch(`${API_URL}/api/billing/sync-subscription`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const d = await res.json();
            if (d.ok && d.plan) {
                setCurrentPlan(d.plan);
                setSyncMsg(`✅ Plan synced: ${d.plan.toUpperCase()}`);
            } else {
                setSyncMsg(d.reason || 'No active subscription found');
            }
        } catch {
            setSyncMsg('Sync failed — check backend logs');
        } finally {
            setSyncing(false);
        }
    };

    const formatPrice = (plan, key) => {
        if (!plan) return '';
        if (currency === 'usd') {
            return plan.price_usd === 0 ? 'Free' : `$${plan.price_usd}`;
        }
        return plan.price_inr === 0 ? 'Free' : `₹${plan.price_inr.toLocaleString('en-IN')}`;
    };

    const formatLimit = (val) => (val === -1 ? 'Unlimited' : val?.toLocaleString());

    return (
        <AnimatePresence>
            <motion.div
                className="pricing-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => { if (e.target === e.currentTarget && !forceShow) onClose?.(); }}
            >
                <motion.div
                    className="pricing-modal"
                    initial={{ scale: 0.92, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: 30 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                >
                    {/* Header */}
                    <div className="pricing-header">
                        <div className="pricing-header-text">
                            <h2 className="pricing-title">Choose Your Plan</h2>
                            <p className="pricing-subtitle">Unlock more power as you grow</p>
                        </div>

                        <div className="pricing-controls">
                            {/* Currency Toggle */}
                            <div className="currency-toggle">
                                <button
                                    className={`currency-btn ${currency === 'usd' ? 'active' : ''}`}
                                    onClick={() => setCurrency('usd')}
                                >
                                    🇺🇸 USD
                                </button>
                                <button
                                    className={`currency-btn ${currency === 'inr' ? 'active' : ''}`}
                                    onClick={() => setCurrency('inr')}
                                >
                                    🇮🇳 INR
                                </button>
                            </div>

                            {/* Sync Plan button — fixes plan for existing paid subscriptions */}
                            {session?.access_token && currentPlan === 'free' && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                    <button
                                        onClick={syncPlan}
                                        disabled={syncing}
                                        style={{
                                            background: 'rgba(99,102,241,0.15)',
                                            border: '1px solid rgba(99,102,241,0.4)',
                                            borderRadius: '8px',
                                            color: '#a5b4fc',
                                            padding: '6px 14px',
                                            fontSize: '12px',
                                            cursor: syncing ? 'wait' : 'pointer',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {syncing ? '⏳ Syncing…' : '🔄 Already paid? Sync Plan'}
                                    </button>
                                    {syncMsg && (
                                        <span style={{ fontSize: '11px', color: syncMsg.startsWith('✅') ? '#4ade80' : '#f87171' }}>
                                            {syncMsg}
                                        </span>
                                    )}
                                </div>
                            )}

                            {!forceShow && (
                                <button className="pricing-close-btn" onClick={onClose} aria-label="Close">✕</button>
                            )}
                        </div>
                    </div>

                    {fetchError && (
                        <div className="pricing-error">{fetchError}</div>
                    )}

                    {/* Plan Cards */}
                    <div className="pricing-cards">
                        {PLAN_ORDER.map((key) => {
                            const plan = plans[key];
                            const colors = PLAN_COLORS[key];
                            const isPopular = PLAN_POPULAR[key];
                            const isCurrent = currentPlan === key;
                            const isLoading = loading && selectedPlan === key;

                            return (
                                <motion.div
                                    key={key}
                                    className={`pricing-card ${isCurrent ? 'current' : ''} ${isPopular ? 'popular' : ''}`}
                                    style={{ background: colors.gradient, '--accent': colors.accent, '--ring': colors.ring }}
                                    whileHover={{ y: -6, boxShadow: `0 20px 60px ${colors.ring}` }}
                                    transition={{ type: 'spring', damping: 20 }}
                                >
                                    {isPopular && <div className="popular-badge">MOST POPULAR</div>}
                                    {isCurrent && <div className="current-badge">CURRENT PLAN</div>}

                                    <div className="card-icon">{PLAN_ICONS[key]}</div>
                                    <div className="card-name">{plan?.name || key}</div>

                                    <div className="card-price">
                                        <span className="price-amount">{formatPrice(plan, key)}</span>
                                        {plan?.price_usd > 0 && <span className="price-period">/mo</span>}
                                    </div>

                                    <p className="card-desc">{plan?.description || ''}</p>

                                    <div className="card-limits">
                                        <div className="limit-row">
                                            <span>📤</span>
                                            <span>{plan ? formatLimit(plan.upload_limit_mb) : '—'} MB uploads</span>
                                        </div>
                                        <div className="limit-row">
                                            <span>🧩</span>
                                            <span>{plan ? formatLimit(plan.chunk_limit) : '—'} chunks</span>
                                        </div>
                                    </div>

                                    <ul className="card-features">
                                        {(plan?.features || []).map((f, i) => (
                                            <li key={i}><span className="feature-check">✓</span> {f}</li>
                                        ))}
                                    </ul>

                                    <motion.button
                                        className={`card-cta ${isCurrent ? 'current-cta' : ''}`}
                                        style={{ background: isCurrent ? 'rgba(255,255,255,0.1)' : colors.accent }}
                                        onClick={() => handleSelect(key)}
                                        disabled={isLoading}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        {isLoading ? (
                                            <span className="btn-spinner" />
                                        ) : isCurrent ? (
                                            'Current Plan'
                                        ) : key === 'free' ? (
                                            'Get Started Free'
                                        ) : (
                                            `Upgrade to ${plan?.name}`
                                        )}
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="pricing-footer">
                        <p>🔒 Secure payments via Stripe · Cancel anytime · Prices shown are monthly</p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
