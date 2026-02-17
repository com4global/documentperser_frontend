import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import '../Styles/Auth.css';

const LoginPage = () => {
    const { t } = useLanguage();
    const { login, signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // isLogin toggles between 'Sign In' and 'Create Account'
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || "/chat";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await login(email, password);
                if (error) throw error;
                navigate(from, { replace: true });
            } else {
                const { error } = await signUp(email, password, fullName);
                if (error) throw error;
                alert('Account created! Please check your email for verification (if enabled) or log in.');
                setIsLogin(true); // Switch to login view after signup
            }
        } catch (err) {
            setError(err.message);
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
