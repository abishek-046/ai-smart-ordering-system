import { useState, useEffect, useCallback, useRef } from 'react';
import { orderApi } from '../services/api';

/**
 * Polls an order by token at a given interval.
 * Automatically stops polling once order reaches a terminal status.
 */
export function useOrderPolling(token, intervalMs = 15000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const TERMINAL_STATUSES = ['COLLECTED', 'CANCELLED'];

  const fetchOrder = useCallback(async () => {
    if (!token) return;
    try {
      const res = await orderApi.trackByToken(token);
      setData(res.data);
      setError(null);
      // Stop polling when order reaches terminal state
      if (TERMINAL_STATUSES.includes(res.data.order?.status)) {
        clearInterval(intervalRef.current);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrder();
    intervalRef.current = setInterval(fetchOrder, intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [fetchOrder, intervalMs]);

  return { data, loading, error, refresh: fetchOrder };
}
