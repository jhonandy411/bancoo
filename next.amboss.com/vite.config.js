import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        qbankIntegration: './qbank-integration.jsx',
      },
      output: {
        entryFileNames: '[name].bundle.js',
        chunkFileNames: '[name].chunk.js',
      },
    },
  },
});
