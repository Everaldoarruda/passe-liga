import { useEffect, useState } from 'react';

interface FetchResult<T> {
  load: () => Promise<T>;
  version: number;
  data: T | null;
  error: string | null;
}

export function useFetch<T>(load: () => Promise<T>) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<FetchResult<T>>();

  useEffect(() => {
    let ignore = false;
    load()
      .then((data) => {
        if (!ignore) setResult({ load, version, data, error: null });
      })
      .catch((err: Error) => {
        if (!ignore) setResult({ load, version, data: null, error: err.message });
      });
    return () => {
      ignore = true;
    };
  }, [load, version]);

  const loading = result?.load !== load || result.version !== version;
  return {
    data: result?.data ?? null,
    error: loading ? null : (result?.error ?? null),
    loading,
    reload: () => setVersion((current) => current + 1),
  };
}
