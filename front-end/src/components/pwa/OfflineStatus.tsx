import { useState, useEffect } from 'react'
import { WifiOff, Wifi, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export function OfflineBanner() {
  const isOnline = useNetworkStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-warning text-primary-foreground px-4 py-3 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff size={18} />
            <span className="text-sm font-bold">You are offline. Some features may be limited.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function OfflineFallback({ onRetry }: { onRetry?: () => void }) {
  const isOnline = useNetworkStatus()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="p-6 bg-surface rounded-3xl border border-border shadow-xl">
          <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {isOnline ? (
              <RefreshCw size={40} className="text-warning animate-spin" />
            ) : (
              <WifiOff size={40} className="text-warning" />
            )}
          </div>

          <h1 className="text-2xl font-black italic font-display text-text-primary mb-2">
            {isOnline ? 'Loading...' : 'You are offline'}
          </h1>

          <p className="text-sm text-text-secondary mb-6">
            {isOnline
              ? 'Please wait while we reconnect to the server.'
              : 'Check your internet connection and try again. Some content may be cached.'}
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl',
                'bg-brand-primary text-white font-bold',
                'hover:bg-brand-dark transition-all',
                'shadow-lg shadow-brand-primary/20'
              )}
            >
              <RefreshCw size={18} />
              Retry
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
          {isOnline ? (
            <>
              <Wifi size={14} className="text-success" />
              <span>Connection restored</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-warning" />
              <span>No internet connection</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
