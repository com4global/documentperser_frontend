import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ── Capacitor Mobile Plugins ──────────────────────────────
// These only activate when running inside the native app wrapper.
// In a browser they safely do nothing (Capacitor is a no-op on web).
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Network } from '@capacitor/network';

async function initMobilePlugins() {
  try {
    // Hide splash screen after React renders
    await SplashScreen.hide({ fadeOutDuration: 400 });

    // Match the purple gradient header
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#6366f1' });

    // Log network connectivity (useful for debugging)
    const status = await Network.getStatus();
    console.log('[Mobile] Network:', status.connectionType, status.connected ? '✅' : '❌');

    // Listen for connectivity changes
    Network.addListener('networkStatusChange', (s) => {
      console.log('[Mobile] Connection changed:', s.connectionType);
    });
  } catch {
    // Not running in a native wrapper — silently ignore
  }
}

initMobilePlugins();

// ── React App ──────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
