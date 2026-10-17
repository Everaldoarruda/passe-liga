import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFetch } from './useFetch';

describe('useFetch', () => {
  it('começa carregando e depois devolve os dados', async () => {
    const load = () => Promise.resolve(42);
    const { result } = renderHook(() => useFetch(load));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it('devolve a mensagem do erro', async () => {
    const load = () => Promise.reject(new Error('A API está fora do ar.'));
    const { result } = renderHook(() => useFetch(load));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('A API está fora do ar.');
    expect(result.current.data).toBeNull();
  });
});
