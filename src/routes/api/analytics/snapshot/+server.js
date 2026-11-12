import { canViewAnalytics, presenceBackend } from '$lib/server/analytics.js';

/** @type {import('./$types').RequestHandler} */
export const GET = async (event) => {
  const headers = { 'Cache-Control': 'private, no-store', 'Content-Type': 'application/json' };
  if (!canViewAnalytics(event)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers });
  const query = new URLSearchParams();
  for (const key of ['role', 'authState', 'onboardingStatus', 'contentType', 'path']) {
    const value = event.url.searchParams.get(key); if (value) query.set(key, value.slice(0, 1000));
  }
  try {
    const result = await presenceBackend(event, `snapshot?${query}`);
    if (!result.ok) throw new Error('Presence unavailable');
    return new Response(JSON.stringify(await result.json()), { headers });
  } catch { return new Response(JSON.stringify({ error: 'Presence is temporarily unavailable.' }), { status: 503, headers }); }
};
