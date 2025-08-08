import React from 'react';
import { createRoot } from 'react-dom/client';

function MinimalApp() {
  return (
    <div style={{
      background: 'black',
      color: 'white',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace'
    }}>
      <div>
        <h1>Minimal React Test</h1>
        <p>If you can see this, React is working.</p>
        <button onClick={() => alert('React is working!')}>
          Test Button
        </button>
      </div>
    </div>
  );
}

// Only render if we're in test mode
if (window.location.search.includes('test=minimal')) {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(<MinimalApp />);
  }
}

export default MinimalApp;