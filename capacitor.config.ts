import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zenzee.edtech',
  appName: 'EdTech AI Learning',
  webDir: 'build',
  server: {
    // For production: leave 'url' commented out so the app uses the bundled build
    // For development: uncomment the line below and point to your local IP
    // url: 'http://YOUR_LOCAL_IP:3000',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'large',
      spinnerColor: '#667eea'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#6366f1'     // matches the header gradient
    },
    Haptics: {
      // No config needed — available by default
    },
    Network: {
      // Automatically monitors online/offline
    }
  }
};

export default config;
