import { dev } from '$app/environment';
import { error, fail } from '@sveltejs/kit';
import { communityPreview } from '$lib/server/fixtures/community-preview.js';

export function load({ url }) {
 if (!dev) error(404, 'Not found');
 if (url.searchParams.get('scenario') === 'error') error(503, 'Community updates are temporarily unavailable.');
 return {...communityPreview(url.searchParams.get('scenario') ?? 'populated'), interactionMode: url.searchParams.get('interactions') ?? 'signed-in', previewMode: url.searchParams.get('view') ?? 'page'};
}
export const actions = {
 newsletterSignup: async ({ request }) => {
  if (!dev) error(404, 'Not found');
  const email = String((await request.formData()).get('email') ?? '');
  if (email.startsWith('fail')) return fail(503, {error: 'newsletter_unavailable', description: 'Newsletter signup is temporarily unavailable. Please try again later.'});
  return {status: 'success', id: 'preview-only'};
 }
};
