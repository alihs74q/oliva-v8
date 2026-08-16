import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initServiceWorkerUpdater } from './utils/serviceWorkerUpdater';
import { ContentProvider } from './contexts/ContentContext';

// Check for Service Worker updates on page load
initServiceWorkerUpdater();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider>
      <App />
    </ContentProvider>
  </StrictMode>
);
