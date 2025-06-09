// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { persistor } from './redux/store'; // ⬅️ import persistor

// Clear Redux state on tab close
window.addEventListener('beforeunload', () => {
  const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const isReload = navEntries.length > 0 && navEntries[0].type === 'reload';

  if (!isReload) {
    persistor.purge();         // Clear Redux Persist storage
    sessionStorage.clear();    // Clear sessionStorage as backup
  }
});


function Main() {
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<Main />);
