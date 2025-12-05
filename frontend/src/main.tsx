import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App'  // Remove .tsx extension
import '../styles/globals.css'

// Hide the initial loading screen once React is ready
const hideInitialLoader = () => {
  try {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        if (loadingScreen) {
          loadingScreen.style.display = 'none';
        }
      }, 500);
    }
  } catch (error) {
    console.error('Error hiding loading screen:', error);
  }
};

// Create root and render app with error handling
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Hide loader after React app is fully mounted
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    setTimeout(hideInitialLoader, 500);
  });

} catch (error) {
  console.error('Failed to initialize React app:', error);

  // Show error message and hide loading screen
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; font-family: system-ui;">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">Application Error</h1>
          <p style="color: #6b7280; margin-bottom: 1rem;">Failed to load RemotCyberHelp. Please check the console for details.</p>
          <button onclick="window.location.reload()" style="background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }

  hideInitialLoader();
}
