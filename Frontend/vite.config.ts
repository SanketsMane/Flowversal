
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, PluginOption } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "stats.html"
    }) as PluginOption
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/docs': path.resolve(__dirname, './src/docs'),
      '@app': path.resolve(__dirname, './src/app'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),

      // Restoring aliases for versioned imports found in source code

      
      // Asset aliases
      'figma:asset/a343b12e588be649c0fd15261a16aac9163083d0.png': path.resolve(__dirname, './src/assets/a343b12e588be649c0fd15261a16aac9163083d0.png'),
      'figma:asset/6002bc04b2fb15d40304d81c459c74499954d9ad.png': path.resolve(__dirname, './src/assets/6002bc04b2fb15d40304d81c459c74499954d9ad.png'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      output: {
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      port: 24678,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('[Vite Proxy] Backend connection error:', err.message);
            if (res && !res.headersSent) {
              res.writeHead(503, {
                'Content-Type': 'application/json',
              });
              res.end(JSON.stringify({
                error: 'Backend server is not available',
                message: 'Please ensure the backend server is running on port 4000',
              }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
             // console.log(`[Vite Proxy] ${req.method} ${req.url} -> http://localhost:8000${req.url}`);
          });
        },
      },
    },
  },
});