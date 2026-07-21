import { useState, useEffect } from 'react'
import { Bell, BellOff, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type NotificationPermission = 'default' | 'granted' | 'denied'

interface PushNotificationState {
  permission: NotificationPermission
  isSupported: boolean
  isLoading: boolean
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    permission: 'default',
    isSupported: typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator,
    isLoading: false,
  })

  useEffect(() => {
    if (state.isSupported) {
      setState(prev => ({
        ...prev,
        permission: Notification.permission as NotificationPermission,
      }))
    }
  }, [state.isSupported])

  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast.error('Push notifications are not supported in this browser')
      return false
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const permission = await Notification.requestPermission()
      setState(prev => ({
        ...prev,
        permission: permission as NotificationPermission,
        isLoading: false,
      }))

      if (permission === 'granted') {
        toast.success('Notifications enabled successfully')
        return true
      } else if (permission === 'denied') {
        toast.error('Notification permission denied. Please enable in browser settings.')
        return false
      }

      return false
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      toast.error('Failed to request notification permission')
      return false
    }
  }

  const sendTestNotification = () => {
    if (state.permission !== 'granted') {
      toast.error('Please enable notifications first')
      return
    }

    try {
      const registration = (navigator as any).serviceWorker?.ready
      if (registration) {
        registration.showNotification('MAAIS Academic Audit System', {
          body: 'MAAIS Academic Audit System - Mando Senior High Technical School',
          icon: '/pwa-192x192.png',
          badge: '/pwa-72x72.png',
          vibrate: [200, 100, 200],
          tag: 'test-notification',
          renotify: false,
        })
      } else {
        new Notification('MAAIS Academic Audit System', {
          body: 'MAAIS Academic Audit System - Mando Senior High Technical School',
          icon: '/pwa-192x192.png',
        })
      }
      toast.success('Test notification sent')
    } catch (error) {
      toast.error('Failed to send notification')
    }
  }

  return {
    ...state,
    requestPermission,
    sendTestNotification,
  }
}

export function PushNotificationManager() {
  const { permission, isSupported, isLoading, requestPermission, sendTestNotification } = usePushNotifications()
  const [showManager, setShowManager] = useState(false)

  if (!isSupported) return null

  return (
    <div className="relative">
      <button
        onClick={() => setShowManager(!showManager)}
        className={cn(
          'p-2 rounded-xl transition-all',
          permission === 'granted'
            ? 'bg-success/10 text-success'
            : 'bg-muted text-text-secondary hover:text-text-primary'
        )}
      >
        {permission === 'granted' ? <Bell size={18} /> : <BellOff size={18} />}
      </button>

      {showManager && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-2xl shadow-2xl p-5 z-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-primary/10 rounded-xl">
              <Settings className="text-brand-primary" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-text-primary">Notifications</h3>
              <p className="text-xs text-text-secondary">
                {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not enabled'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {permission !== 'granted' ? (
              <button
                onClick={requestPermission}
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition-all disabled:opacity-50"
              >
                {isLoading ? 'Requesting...' : 'Enable Notifications'}
              </button>
            ) : (
              <button
                onClick={sendTestNotification}
                className="w-full px-4 py-2.5 bg-surface border border-border text-text-primary rounded-xl text-sm font-bold hover:bg-muted transition-all"
              >
                Send Test Notification
              </button>
            )}

            <div className="bg-muted rounded-xl p-3">
              <p className="text-xs text-text-secondary leading-relaxed">
                {permission === 'granted'
                  ? 'You will receive notifications for grading deadlines, messages, and important alerts.'
                  : 'Enable notifications to stay updated with grading deadlines, messages, and system alerts.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
