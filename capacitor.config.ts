import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.luminanotebook.app',
  appName: 'Lumina Notebook',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
