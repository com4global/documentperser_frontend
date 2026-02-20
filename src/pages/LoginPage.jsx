import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import '../Styles/Auth.css';

const LoginPage = () => {
    const { t } = useLanguage();
    const { login, signUp, signInWithGoogle, fetchUserRole, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifyMsg, setVerifyMsg] = useState('');

    const from = location.state?.from?.pathname || '/chat';

    // After successful login, check role and redirect appropriately
    const afterLogin = async (sessionUser) => {
        try {
            const uid = sessionUser?.id || user?.id;
            const role = (uid && typeof fetchUserRole === 'function')
                ? await fetchUserRole(uid)
                : null;
            if (!role) {
                navigate('/select-role', { replace: true });
            } else {
                const dest = role === 'teacher' ? '/teacher' : role === 'student' ? '/student' : from;
                navigate(dest, { replace: true });
            }
        } catch {
            navigate('/select-role', { replace: true });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setVerifyMsg('');
        setLoading(true);

        try {
            if (isLogin) {
                const { data, error: err } = await login(email, password);
                if (err) throw err;
                await afterLogin(data?.user);
            } else {
                const { data, error: err } = await signUp(email, password, fullName);
                if (err) throw err;
                if (data?.session) {
                    // Email confirmation disabled — go to role selector
                    await afterLogin(data.user);
                } else {
                    // Email confirmation enabled — tell user to check inbox
                    setVerifyMsg(`We sent a verification link to ${email}. Please check your inbox then sign in.`);
                    setIsLogin(true);
                }
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-glass-card">
                <div className="auth-header">
                    <h1>{isLogin ? t('welcomeBack') : t('getStarted')}</h1>
                    <p>{isLogin ? t('signInDesc') : t('signUpDesc')}</p>
                </div>

                {error && <div className="error-banner">{error}</div>}
                {verifyMsg && (
                    <div className="error-banner" style={{ background: 'rgba(0,184,148,0.15)', borderColor: '#00b894', color: '#00b894' }}>
                        📧 {verifyMsg}
                    </div>
                )}

                <button
                    type="button"
                    className="google-btn"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="google-icon"
                    />
                    {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                </button>

                <div className="auth-divider">
                    <span>{t('or')}</span>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="auth-input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="auth-input"
                            />
                        </div>
                    )}

                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="auth-input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-primary-btn"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin ? t('noAccount') : t('haveAccount')}
                    <span
                        className="auth-link"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                    >
                        {isLogin ? t('createAccount') : t('signIn')}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
