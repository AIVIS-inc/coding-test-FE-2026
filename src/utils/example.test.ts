import { clamp } from './example';

describe('clamp (테스트 작성 예시)', () => {
  it('범위를 벗어나면 경계값을 반환한다', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
  });
});

describe('Mock API (MSW) 동작 예시', () => {
  it('/api/slides 를 호출할 수 있다', async () => {
    const res = await fetch('/api/slides?page=1&pageSize=5');
    const body = await res.json();
    expect(body.items).toHaveLength(5);
    expect(body.total).toBeGreaterThan(0);
  });
});
