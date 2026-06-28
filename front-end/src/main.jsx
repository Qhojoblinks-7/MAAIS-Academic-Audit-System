import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';
import { RoleProvider } from './context/RoleContext';
import { SplashScreen } from './components/SplashScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
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