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
        weekend: resolve(__dirname, 'weekend.html'),
        weekendNeuroplasticity: resolve(__dirname, 'weekend/neuroplasticity.html'),
        weekendFalsifiability: resolve(__dirname, 'weekend/falsifiability.html'),
        weekendOpportunityCost: resolve(__dirname, 'weekend/opportunity-cost.html'),
        weekendDunningKruger: resolve(__dirname, 'weekend/dunning-kruger.html'),
        weekendDopamineMotivation: resolve(__dirname, 'weekend/dopamine-motivation.html'),
        weekendConfirmationBias: resolve(__dirname, 'weekend/confirmation-bias.html'),
        weekendHowResearchWorks: resolve(__dirname, 'weekend/how-research-works.html'),
        weekendCorrelationCausation: resolve(__dirname, 'weekend/correlation-causation.html'),
        weekendGameTheory: resolve(__dirname, 'weekend/game-theory.html'),
        weekendScientificMethod: resolve(__dirname, 'weekend/scientific-method.html'),
        weekendParetoPrinciple: resolve(__dirname, 'weekend/pareto-principle.html'),
        weekendMentalToolkit: resolve(__dirname, 'weekend/mental-toolkit.html'),
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
