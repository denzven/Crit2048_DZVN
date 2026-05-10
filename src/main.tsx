import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import { GameStorage } from './engine/storage';

// Initialize storage migration
GameStorage.migrateFromLegacy().catch(console.error);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename="/Crit2048-DZVN/">
      <App />
    </BrowserRouter>
  </StrictMode>,
);
