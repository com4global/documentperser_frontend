import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations, t as translate } from '../translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    // Try to get language from localStorage, default to 'en'
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('app_language') || 'en';
    });

    // Update localStorage when language changes
    useEffect(() => {
        localStorage.setItem('app_language', language);
        // Optional: Update html lang attribute
        document.documentElement.lang = language;
    }, [language]);

    // Helper function to get translation
    const t = (key) => translate(translations, key, language);

    const value = {
        language,
        setLanguage,
        t,
        translations: translations[language]
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
