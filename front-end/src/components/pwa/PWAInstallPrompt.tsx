import { useEffect, useState } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://')
    )

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      console.log('PWA installed')
    }
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDeferredPrompt(null)
  }

  if (isStandalone || !showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl shrink-0">
            <Smartphone className="text-brand-primary" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-text-primary mb-1">
              Install MAAIS Academic Audit System
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Add to home screen for offline access, faster loading, and app-like experience.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {isIOS ? (
          <div className="bg-muted rounded-xl p-3 space-y-2">
            <p className="text-xs font-bold text-text-primary">To install on iOS:</p>
            <ol className="text-xs text-text-secondary space-y-1 list-decimal list-inside">
              <li>Tap the Share button</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right</li>
            </ol>
          </div>
        ) : (
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand-primary/20"
          >
            <Download size={16} />
            Install App
          </button>
        )}
      </div>
    </div>
  )
}
