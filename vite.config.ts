import {defineConfig} from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        books: resolve(__dirname, 'books.html'),
        contact: resolve(__dirname, 'contact.html'),
        projects: resolve(__dirname, 'projects.html'),
        research: resolve(__dirname, 'research.html'),
        androidWebview: resolve(__dirname, 'blog/android-webview-vulnerability.html'),
        androidOauth: resolve(__dirname, 'blog/android-news-app-vulnerability.html'),
        smartContracts: resolve(__dirname, 'blog/smart-contract-vulnerabilities.html'),
        sqlInjection: resolve(__dirname, 'blog/sql-injection-writeup.html'),
        unrestrictedMinting: resolve(__dirname, 'blog/unrestricted-minting-exploit.html'),
        philosophy: resolve(__dirname, 'blog/philosophy-good-bad-bias.html'),
        instagramRelationship: resolve(__dirname, 'blog/instagram-algorithm-relationship.html'),
      },
    },
  },
});
