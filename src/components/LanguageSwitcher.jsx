import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ta' : 'en');
    };

    return (
        <button
            onClick={toggleLanguage}
            style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative',
                width: '100px',
                height: '32px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                overflow: 'hidden'
            }}
            title="Switch Language / மொழியை மாற்றவும்"
        >
            {/* Sliding background */}
            <div style={{
                position: 'absolute',
                top: '2px',
                left: language === 'en' ? '2px' : '50px',
                width: '46px',
                height: '26px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '16px',
                transition: 'left 0.3s ease',
                zIndex: 0
            }} />

            {/* EN Label */}
            <span style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: '600',
                color: language === 'en' ? '#fff' : '#64748b',
                zIndex: 1,
                transition: 'color 0.3s',
                lineHeight: '1'
            }}>
                EN
            </span>

            {/* Tamil Label */}
            <span style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: '600',
                color: language === 'ta' ? '#fff' : '#64748b',
                zIndex: 1,
                transition: 'color 0.3s',
                lineHeight: '1',
                paddingTop: '2px'
            }}>
                தமிழ்
            </span>
        </button>
    );
};

export default LanguageSwitcher;
