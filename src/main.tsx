import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely trap cross-origin or third-party iframe errors ("Script error.") to prevent them from breaking the sandbox
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message && (event.message.includes('Script error.') || event.message.includes('Script error'))) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('Suppressed third-party cross-origin iframe script error.');
    }
  });

  window.onerror = function (message, url, line, col, error) {
    const msgStr = String(message || '');
    if (msgStr.includes('Script error') || msgStr.includes('Script error.')) {
      console.warn('Suppressed window.onerror Script error.');
      return true; // Prevents the fire of default browser handler
    }
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason || '');
    if (reasonStr.includes('Script error') || reasonStr.includes('Script error.')) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('Suppressed third-party unhandled promise rejection.');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
