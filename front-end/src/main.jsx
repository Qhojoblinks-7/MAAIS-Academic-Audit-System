import { StrictMode, useState, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { get, set, del } from 'idb-keyval';
import App from './App.jsx';
import './index.css';
import 'sonner/dist/styles.css';
import { RoleProvider } from './context/RoleContext';
import { SplashScreen } from './components/SplashScreen';
import { cacheLayer } from './services/cacheLayer';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#fff', color: '#000' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Application Error</h1>
          <pre style={{ background: '#fee2e2', padding: '16px', borderRadius: '8px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

 const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * attempt, 3000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      networkMode: 'offlineFirst',
    },
  },
});

// IndexedDB persister so the React Query cache survives reloads (offline-first)
const idbPersister = {
  persistClient: async (client) => {
    await set('maais-query-cache', client);
  },
  restoreClient: async () => {
    return await get('maais-query-cache');
  },
  removeClient: async () => {
    await del('maais-query-cache');
  },
};

function Root() {
  const [showSplash, setShowSplash] = useState(() => {
    return sessionStorage.getItem('splashShown') !== 'true';
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: idbPersister, maxAge: 1000 * 60 * 60 * 24 * 7 }}
    >
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
    </PersistQueryClientProvider>
  );
}

// Hydrate the persistent cache from IndexedDB before the app mounts.
cacheLayer.init().catch(() => {});

// Register the offline-first service worker (production only).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Force a hard reload when the page is restored from the Back/Forward Cache (bfcache).
// This prevents stale authenticated state from persisting across sessions when a user
// logs out and then navigates back via the browser back button.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Root />
  </ErrorBoundary>
);