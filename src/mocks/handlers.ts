import { delay, http, HttpResponse } from 'msw';
import { mockConfig } from './config';
import { slides, type SlideRecord, type SlideStatus } from './data';

const STATUSES: SlideStatus[] = ['completed', 'processing', 'failed'];

const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

async function simulateLatency(ms: number) {
  if (mockConfig.latency) await delay(ms);
}

function maybeServerError() {
  if (Math.random() < mockConfig.errorRate) {
    return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
  return null;
}

function patientField(r: SlideRecord) {
  return mockConfig.apiVersion === 2 ? { patient: { name: r.patientName } } : { patientName: r.patientName };
}

function toSummary(r: SlideRecord) {
  return {
    id: r.id,
    ...patientField(r),
    examinedAt: r.examinedAt,
    status: r.status,
    thumbnailUrl: `/slides/slide-${r.imageKey}-thumb.jpg`,
  };
}

function toDetail(r: SlideRecord) {
  return {
    ...toSummary(r),
    imageUrl: `/slides/slide-${r.imageKey}.jpg`,
    heatmapUrl: r.status === 'completed' ? `/slides/slide-${r.imageKey}-heatmap.png` : null,
    analysis: r.analysis,
  };
}

export const handlers = [
  http.get('/api/slides', async ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim();
    const status = url.searchParams.get('status');
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') ?? 20) || 20));

    await simulateLatency(randomBetween(200, 600) + (q.length === 1 ? 900 : 0));

    const err = maybeServerError();
    if (err) return err;

    if (status && !STATUSES.includes(status as SlideStatus)) {
      return HttpResponse.json({ message: `Invalid status: ${status}` }, { status: 400 });
    }

    const keyword = q.toLowerCase();
    const filtered = slides.filter(
      (s) =>
        (!keyword || s.id.toLowerCase().includes(keyword) || s.patientName.includes(q)) &&
        (!status || s.status === status),
    );

    const start = (page - 1) * pageSize;
    return HttpResponse.json({
      items: filtered.slice(start, start + pageSize).map(toSummary),
      page,
      pageSize,
      total: filtered.length,
    });
  }),

  http.get('/api/slides/:id', async ({ params }) => {
    await simulateLatency(randomBetween(200, 1200));

    const err = maybeServerError();
    if (err) return err;

    const found = slides.find((s) => s.id === params.id);
    if (!found) return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
    return HttpResponse.json(toDetail(found));
  }),
];
