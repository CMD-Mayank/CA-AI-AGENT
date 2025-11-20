import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures process.env.API_KEY is replaced by the actual value 
    // from Netlify environment variables during the build process.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});