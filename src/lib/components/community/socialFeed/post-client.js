export const POST_CLIENT_CONTEXT = 'community-post-client';

export class PostRequestError extends Error {
 /** @param {string} message @param {string | null} [loginHref] */
 constructor(message, loginHref = null) { super(message); this.loginHref = loginHref; }
}
/** JSON enhancement for existing same-origin post endpoints. No automatic mutation retries.
 * @param {string} url @param {RequestInit} [options] */
export async function requestPost(url, options = {}) {
 let response;
 try {
  response = await fetch(url, {...options, credentials:'same-origin', headers:{...options.headers, Accept:'application/json'}});
 } catch (error) {
  if (error instanceof Error && error.name === 'AbortError') throw error;
  throw new PostRequestError('Connection lost. Open the post to check its latest state before trying again.');
 }
 let data;
 try { data = await response.json(); }
 catch { throw new PostRequestError('The response could not be confirmed. Open the post to check its latest state.'); }
 if (!response.ok) throw new PostRequestError(data.error || 'This action could not be completed.', data.loginHref || null);
 return data;
}
