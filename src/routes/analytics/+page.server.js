import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { canViewAnalytics } from '$lib/server/analytics.js';
/** @type {import('./$types').PageServerLoad} */
export const load = (event) => {
  if (!canViewAnalytics(event)) throw error(403, 'Analytics access is required.');
  return { umamiUrl: env.UMAMI_URL ?? null };
};
