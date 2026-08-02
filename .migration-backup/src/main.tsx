import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadImage } from './utils/imageOptimization';

// Preload critical hero images for fast first paint
preloadImage('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Style_of_cub_cold_drink_202607240431-TrhRjFxd4wxoAx2gsQCFMQNxRLCWI3.jpeg');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
