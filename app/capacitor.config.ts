import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ArveleaWriter',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Keyboard: {
      resize: "ionic",
    },
    SplashScreen: {
      launchAutoHide: false,
    }
  }
};

export default config;
