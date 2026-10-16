export const API_PORT = 3999;

const BASE_URL = `http://localhost:${API_PORT}/api/v1`;

export interface ApiResponse {
  status: number;
  headers: Headers;
  text: string;
  body: any;
}

async function send(method: string, path: string, rawBody?: string): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: rawBody === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: rawBody,
  });
  const text = await response.text();
  const isJson = response.headers.get('content-type')?.includes('application/json') ?? false;
  return { status: response.status, headers: response.headers, text, body: isJson ? JSON.parse(text) : null };
}

export const api = {
  get: (path: string) => send('GET', path),
  post: (path: string, body?: unknown) =>
    send('POST', path, body === undefined ? undefined : JSON.stringify(body)),
  put: (path: string, body: unknown) => send('PUT', path, JSON.stringify(body)),
  patch: (path: string, body: unknown) => send('PATCH', path, JSON.stringify(body)),
  delete: (path: string) => send('DELETE', path),
  raw: (method: string, path: string, rawBody: string) => send(method, path, rawBody),
};

export async function waitForApi(timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await api.get('/standings')).status === 200) return;
    } catch {
      // a API ainda está subindo
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`A API não respondeu na porta ${API_PORT}.`);
}
