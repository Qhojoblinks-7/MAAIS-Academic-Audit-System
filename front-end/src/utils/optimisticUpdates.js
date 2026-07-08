import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { get, set, del } from "idb-keyval";
import { generateUUID } from "./crypto.js";

/**
 * Wraps TanStack Query's useMutation with automatic cache updates for an
 * optimistic UI experience.
 *
 * options:
 *  - queryKey:   the cache key (array) to optimistically update / invalidate
 *  - onUpdate:   (data, previous) => nextValue  compute the optimistic value
 *  - mutationFn: the mutation function (passed straight to useMutation)
 *  - any other useMutation option (onSuccess, onError, onSettled overrides...)
 *
 * Returns the mutation object produced by useMutation.
 */
export function createOptimisticMutation(options = {}) {
  const {
    queryKey,
    onUpdate,
    mutationFn,
    onError: userOnError,
    onSettled: userOnSettled,
    ...rest
  } = options;

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...rest,
    onMutate: async (data) => {
      if (queryKey) {
        await queryClient.cancelQueries({ queryKey });
      }

      const previous = queryKey
        ? queryClient.getQueryData(queryKey)
        : undefined;

      if (queryKey && typeof onUpdate === "function") {
        queryClient.setQueryData(queryKey, (cached) =>
          onUpdate(data, cached ?? previous)
        );
      }

      return { previous };
    },
    onError: (error, variables, context) => {
      if (queryKey && context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      if (typeof userOnError === "function") {
        userOnError(error, variables, context);
      }
    },
    onSettled: (data, error, variables, context) => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      if (typeof userOnSettled === "function") {
        userOnSettled(data, error, variables, context);
      }
    },
  });
}

const OFFLINE_QUEUE_KEY = "maais-offline-queue";

/**
 * Hook for tracking and replaying mutations performed while the user is
 * offline. Queued mutations are persisted in IndexedDB (via idb-keyval) so
 * they survive page reloads, and are automatically replayed when the browser
 * regains connectivity.
 *
 * Returns:
 *  - pendingCount: number of mutations waiting in the queue
 *  - enqueue(mutation): store a mutation for later replay
 *  - processQueue(): replay all queued mutations when online
 *  - isOnline: current navigator.onLine status
 */
export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  const readQueue = useCallback(async () => {
    const queue = await get(OFFLINE_QUEUE_KEY);
    return Array.isArray(queue) ? queue : [];
  }, []);

  const processQueue = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    const queue = await readQueue();
    if (queue.length === 0) return;

    for (const entry of queue) {
      try {
        if (typeof entry?.mutationFn === "function") {
          await entry.mutationFn(entry.variables);
        }
      } catch {
        // Leave the entry in the queue so it can be retried later.
        return;
      }
    }

    await del(OFFLINE_QUEUE_KEY);
    setPendingCount(0);
  }, [readQueue]);

  const enqueue = useCallback(
    async (mutation) => {
      const entry = {
        id: generateUUID(),
        mutationFn: mutation?.mutationFn,
        variables: mutation?.variables,
        enqueuedAt: Date.now(),
      };

      const queue = await readQueue();
      queue.push(entry);
      await set(OFFLINE_QUEUE_KEY, queue);
      setPendingCount(queue.length);

      if (typeof navigator !== "undefined" && navigator.onLine) {
        await processQueue();
      }
    },
    [readQueue, processQueue]
  );

  useEffect(() => {
    let mounted = true;

    const updateOnline = () => {
      if (!mounted) return;
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        processQueue();
      }
    };

    const restore = async () => {
      const queue = await readQueue();
      if (mounted) setPendingCount(queue.length);
    };

    restore();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    return () => {
      mounted = false;
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, [readQueue, processQueue]);

  return { pendingCount, enqueue, processQueue, isOnline };
}
