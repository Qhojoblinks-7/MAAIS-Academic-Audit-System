import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { RoleProvider } from './context/RoleContext';
import { SplashScreen } from './components/SplashScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Root() {
  const [showSplash, setShowSplash] = useState(() => {
    return sessionStorage.getItem('splashShown') !== 'true';
  });

  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        {showSplash ? (
          <SplashScreen onComplete={() => {
            setShowSplash(false);
            sessionStorage.setItem('splashShown', 'true');
          }} />
        ) : (
          <App />
        )}
      </RoleProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')).render(<Root />);