import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'site.stepupedu.app',
  appName: 'Step Up Education',
  webDir: 'public', // still required but won't be used
  server: {
    url: 'https://stepupeduapplication.netlify.app', // your live URL
    cleartext: true, // only needed for HTTP (not required for HTTPS)
  },
};

export default config;
