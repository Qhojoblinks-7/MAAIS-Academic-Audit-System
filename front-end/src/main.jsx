import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { RoleProvider } from './context/RoleContext';
import { SplashScreen } from './components/SplashScreen';

function Root() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <StrictMode>
      <RoleProvider>
        {showSplash ? (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        ) : (
          <App />
        )}
      </RoleProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />);