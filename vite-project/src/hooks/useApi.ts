import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T, Args extends unknown[]> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for managing API call state
 * @param apiFunction - The async function to execute
 * @returns Object containing data, loading state, error, and execute function
 */
export function useApi<T, Args extends unknown[]>(
  apiFunction: (...args: Args) => Promise<T>
): UseApiReturn<T, Args> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback((): void => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset
  };
}
