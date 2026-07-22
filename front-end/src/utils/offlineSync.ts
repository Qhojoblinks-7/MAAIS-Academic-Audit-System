import { openDB, DBSchema } from 'idb'

interface OfflineAction {
  id?: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  endpoint: string
  payload: any
  timestamp: number
  retries: number
}

class OfflineSyncQueue {
  private db: any
  private queueName = 'offline-sync-queue'
  private isOnline: boolean

  constructor() {
    this.isOnline = navigator.onLine
    this.setupListeners()
  }

  private setupListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processQueue()
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  private async getDB() {
    if (!this.db) {
      const queueName = this.queueName
      this.db = await openDB('MAAIS-OfflineDB', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(queueName)) {
            db.createObjectStore(queueName, { keyPath: 'id', autoIncrement: true })
          }
        },
      })
    }
    return this.db
  }

  async enqueue(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) {
    const db = await this.getDB()
    const entry: OfflineAction = {
      ...action,
      timestamp: Date.now(),
      retries: 0,
    }
    await db.add(this.queueName, entry)
    
    if (this.isOnline) {
      this.processQueue()
    }
  }

  async processQueue() {
    if (!this.isOnline) return

    const db = await this.getDB()
    const all = await db.getAll(this.queueName)

    for (const action of all) {
      try {
        const response = await fetch(action.endpoint, {
          method: action.type,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(action.payload),
        })

        if (response.ok) {
          await db.delete(this.queueName, action.id)
        } else {
          await this.incrementRetry(action.id!)
        }
      } catch (error) {
        await this.incrementRetry(action.id!)
      }
    }
  }

  private async incrementRetry(id: number) {
    const db = await this.getDB()
    const action = await db.get(this.queueName, id)
    if (action) {
      action.retries += 1
      if (action.retries >= 3) {
        await db.delete(this.queueName, id)
      } else {
        await db.put(this.queueName, action)
      }
    }
  }

  async getQueueLength() {
    const db = await this.getDB()
    return db.count(this.queueName)
  }

  async clearQueue() {
    const db = await this.getDB()
    await db.clear(this.queueName)
  }
}

export const offlineSyncQueue = new OfflineSyncQueue()

export function useOfflineSync() {
  const queue = offlineSyncQueue

  const syncAction = async (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => {
    if (navigator.onLine) {
      try {
        const response = await fetch(action.endpoint, {
          method: action.type,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(action.payload),
        })
        if (!response.ok) throw new Error('Network response was not ok')
        return { success: true }
      } catch (error) {
        await queue.enqueue(action)
        return { success: false, queued: true }
      }
    } else {
      await queue.enqueue(action)
      return { success: false, queued: true }
    }
  }

  const getPendingCount = async () => {
    return queue.getQueueLength()
  }

  return { syncAction, getPendingCount }
}
