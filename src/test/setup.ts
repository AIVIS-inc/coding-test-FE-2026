import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '../mocks/node';
import { mockConfig } from '../mocks/config';

beforeAll(() => {
  // 테스트에서는 지연·랜덤 에러를 끈다 (필요하면 테스트 안에서 다시 켜도 됨)
  mockConfig.latency = false;
  mockConfig.errorRate = 0;
  server.listen({ onUnhandledRequest: 'error' });

  // Node의 fetch는 상대 경로('/api/...')를 해석하지 못하므로 jsdom origin 기준으로 보정
  const mswFetch = globalThis.fetch;
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) =>
    mswFetch(typeof input === 'string' && input.startsWith('/') ? new URL(input, window.location.origin) : input, init);
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
