import { analyticsIdentity, analyticsSettings, presenceBackend, readPresenceBody } from '$lib/server/analytics.js';
import { parsePresence } from '@nrock/umami-svelte/server';

/** @type {import('./$types').RequestHandler} */
export const POST = async (event) => {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (!analyticsSettings(event).enabled) return new Response(null, { status: 204, headers });
  if (event.request.headers.get('origin') !== event.url.origin || event.request.headers.get('sec-fetch-site') === 'cross-site') {
    return new Response(null, { status: 403, headers });
  }
  let message;
  try { message = parsePresence(await readPresenceBody(event.request)); }
  catch { return new Response(null, { status: 400, headers }); }
  try {
    const identity = await analyticsIdentity(event);
    const response = await presenceBackend(event, 'presence', { message, identity });
    return new Response(null, { status: response.ok ? 204 : response.status === 429 ? 429 : 503, headers });
  } catch { return new Response(null, { status: 503, headers }); }
};
