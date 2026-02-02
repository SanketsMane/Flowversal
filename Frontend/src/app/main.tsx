import { createRoot } from 'react-dom/client';
import App from './App';
import '../index.css';

const rootEl = document.getElementById('root');

if (rootEl) {
  createRoot(rootEl).render(<App />);
} else {
  console.error('[app/main] Root element "#root" not found');
}

// Register service worker for PWA (only in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker
    .register('/sw.js')
    .catch((err) => console.warn('[app/main] SW registration failed', err));
}

