import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { RoleProvider } from './context/RoleContext';
import { SplashScreen } from './components/SplashScreen';

function Root() {
  const [showSplash, setShowSplash] = useState(() => {
    return sessionStorage.getItem('splashShown') !== 'true';
  });

  return (
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
  );
}

createRoot(document.getElementById('root')).render(<Root />);