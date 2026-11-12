import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { decodeAccessTokenClaims } from '$domains/auth/index.js';
import { sendServerEvent } from '@nrock/umami-svelte/server';

const COOKIE = 'rwm_analytics';
/** @param {import('@sveltejs/kit').RequestEvent} event */
export function analyticsSettings(event) {
  const hosts = (env.ANALYTICS_HOSTS ?? '').split(',').map((host) => host.trim()).filter(Boolean);
  const enabled = env.ANALYTICS_ENABLED === 'true' && (!dev || env.ANALYTICS_LOCAL_ENABLED === 'true') &&
    hosts.includes(event.url.hostname) && !event.url.pathname.startsWith('/develop-preview') && !event.url.pathname.startsWith('/analytics') &&
    event.request.headers?.get('dnt') !== '1' && event.request.headers?.get('sec-gpc') !== '1' &&
    Boolean(env.UMAMI_URL && env.UMAMI_WEBSITE_ID && (env.ANALYTICS_ID_SECRET?.length ?? 0) >= 32 && (env.ANALYTICS_SERVICE_SECRET?.length ?? 0) >= 32);
  return { enabled, config: { enabled, performance: enabled, scriptUrl: enabled ? `${env.UMAMI_URL?.replace(/\/$/, '')}/script.js` : undefined,
    websiteId: enabled ? env.UMAMI_WEBSITE_ID : undefined, presenceUrl: enabled ? '/api/analytics/presence' : undefined } };
}

/** @param {string} value */
async function pseudonym(value) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(env.ANALYTICS_ID_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
  return `v_${Array.from(digest.slice(0, 24), (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

/** @param {import('@sveltejs/kit').RequestEvent} event
 * @returns {Promise<import('@nrock/umami-svelte/server').PresenceIdentity>}
 */
export async function analyticsIdentity(event) {
  let guest = event.cookies.get(COOKIE);
  if (!guest || !/^[a-f0-9-]{36}$/.test(guest)) {
    guest = crypto.randomUUID();
    event.cookies.set(COOKIE, guest, { path: '/', httpOnly: true, sameSite: 'lax', secure: event.url.protocol === 'https:', maxAge: 60 * 60 * 24 * 30 });
  }
  const token = event.locals?.token;
  const claims = token ? decodeAccessTokenClaims(token) : null;
  const account = claims?.id ?? claims?.userId ?? claims?.sub;
  const authenticated = account !== undefined && account !== null;
  const roles = authenticated ? [...new Set(['member', ...(event.locals?.roles ?? []).filter((role) => /^[a-z][a-z0-9_-]{0,63}$/i.test(role))])] : [];
  return { id: await pseudonym(authenticated ? `account:${String(account)}` : `guest:${guest}`), auth_state: authenticated ? 'authenticated' : 'anonymous',
    roles, onboarding_status: authenticated ? (roles.includes('onboarded-member') ? 'completed' : 'pending') : 'unknown' };
}

/** @param {import('@sveltejs/kit').RequestEvent} event */
export async function analyticsLayout(event) {
  const settings = analyticsSettings(event);
  if (!settings.enabled) return { config: settings.config };
  return { config: settings.config, identity: await analyticsIdentity(event) };
}

/** @param {import('@sveltejs/kit').RequestEvent} event */
export function canViewAnalytics(event) {
  const allowed = (env.ANALYTICS_VIEWER_ROLES ?? 'analytics-admin,super-admin').split(',').map((role) => role.trim()).filter(Boolean);
  return Boolean(event.locals?.token) && (event.locals.roles ?? []).some((role) => allowed.includes(role));
}

/** @param {import('@sveltejs/kit').RequestEvent} event
 * @param {string} path
 * @param {Record<string, unknown> | undefined} [body]
 */
export async function presenceBackend(event, path, body) {
  if (!env.ANALYTICS_SERVICE_SECRET) throw new Error('Analytics service secret is not configured.');
  const base = env.API_URL;
  if (!base) throw new Error('API_URL is not configured.');
  const endpoint = new URL(`analytics/${path}`, `${base.replace(/\/$/, '')}/`);
  return (event.fetch ?? fetch)(endpoint, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${env.ANALYTICS_SERVICE_SECRET}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(3000) });
}

/** @param {import('@sveltejs/kit').RequestEvent} event
 * @param {string} name
 * @param {import('@nrock/umami-svelte').Properties} [properties]
 */
export async function recordOutcome(event, name, properties = {}) {
  if (!analyticsSettings(event).enabled) return;
  try {
    const identity = await analyticsIdentity(event);
    const send = sendServerEvent({ enabled: true, endpoint: env.UMAMI_URL, websiteId: env.UMAMI_WEBSITE_ID, id: identity.id,
      hostname: event.url.hostname, path: event.url.pathname, event: name,
      properties: { auth_state: identity.auth_state, roles: identity.roles.join(','), onboarding_status: identity.onboarding_status, ...properties },
      userAgent: event.request.headers?.get('user-agent') ?? undefined, fetch: event.fetch,
      // getClientAddress uses the adapter's trusted client address, rather than arbitrary forwarded headers.
      // Local browser and server requests share Docker's collector-facing address.
      // Overriding it with loopback would split Umami's IP+UA sessions and funnels.
      ip: !dev && typeof event.getClientAddress === 'function' ? event.getClientAddress() : undefined });
    // Cloudflare can finish the analytics request after returning the successful action.
    const context = /** @type {{ context?: { waitUntil(promise: Promise<unknown>): void } } | undefined} */ (event.platform)?.context;
    if (context && typeof context.waitUntil === 'function') context.waitUntil(send);
    else await send;
  } catch { /* Analytics outages cannot undo a successful application operation. */ }
}

/** @param {Request} request */
export async function readPresenceBody(request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new Error('Expected JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body.');
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 8192) { await reader.cancel(); throw new Error('Body too large.'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
