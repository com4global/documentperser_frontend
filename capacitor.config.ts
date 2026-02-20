import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zenzee.edtech',
  appName: 'EdTech AI Learning',
  webDir: 'build',
  server: {
    // For development: point to your local dev server
    // Uncomment the line below during development, comment it for production builds
    // url: 'http://10.5.0.2:3001',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      showSpinner: true,
      spinnerColor: '#667eea'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a'
    }
  }
};

export default config;
