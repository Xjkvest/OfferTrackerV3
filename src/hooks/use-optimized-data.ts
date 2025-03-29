import { useState, useEffect, useCallback } from 'react';

interface CacheOptions {
  expiryTime?: number; // Time in milliseconds
  storageKey?: string;
}

export function useOptimizedData<T>(
  fetcher: () => Promise<T> | T,
  options: CacheOptions = {}
) {
  const { expiryTime = 5 * 60 * 1000, storageKey } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Try loading from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      const cachedData = localStorage.getItem(storageKey);
      if (cachedData) {
        try {
          const { data: storedData, timestamp } = JSON.parse(cachedData);
          const now = Date.now();
          // Check if cache is still valid
          if (now - timestamp < expiryTime) {
            setData(storedData);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing cached data:', e);
          // Continue with fresh fetch if cache parsing fails
        }
      }
    }

    // Fetch fresh data
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await fetcher();
        setData(result);
        
        // Cache the result if storageKey provided
        if (storageKey) {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              data: result,
              timestamp: Date.now()
            })
          );
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [fetcher, expiryTime, storageKey]);

  // Refresh function for manually triggering a refresh
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetcher();
      setData(result);
      
      // Update cache
      if (storageKey) {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            data: result,
            timestamp: Date.now()
          })
        );
      }
      
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, storageKey]);

  return { data, isLoading, error, refresh };
} 