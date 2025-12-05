import { useEffect, useState } from 'react';
import { Router } from "./components/Router";
import { Toaster } from "./components/ui/sonner";
import { UserProvider } from "./components/contexts/UserContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { debugEnvironment, isDevelopment } from "./utils/env";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Only run debug in development
        if (isDevelopment()) {
          try {
            debugEnvironment();
          } catch (err) {
            // Silently ignore debug errors
            console.warn('Debug skipped:', err);
          }
        }

        // Quick initialization without delay
        setIsLoading(false);
      } catch (err) {
        console.warn('App initialization warning:', err);
        // Always continue even with errors
        setIsLoading(false);
      }
    };

    // Use requestAnimationFrame for better performance
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        initializeApp();
      });
    } else {
      initializeApp();
    }
  }, []);

  // Show minimal loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <UserProvider>
        <Router />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '10px',
            },
            className: 'font-medium',
            duration: 4000,
          }}
          richColors
          closeButton
          expand={true}
          visibleToasts={5}
        />
      </UserProvider>
    </ErrorBoundary>
  );
}
