import { defineConfig } from 'vite';

export default defineConfig({
  // Base URL for production (important for Vercel deployment)
  base: './',
  
  // Server configuration for development
  server: {
    port: 5173,
    host: true, // Allow external connections
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // Enable source maps for debugging
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
        user: 'user-portal.html',
        login: 'login.html'
      }
    }
  },
  
  // Environment variables
  define: {
    'process.env': process.env
  },
  
  // Resolve aliases (optional)
  resolve: {
    alias: {
      '@': '/src' // If you move files to a src folder
    }
  }
});