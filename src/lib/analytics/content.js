/** @param {string} path */
export function analyticsContent(path) {
  const match = path.match(/^\/(postcards|programs|scholarships|resources|community\/posts|community\/news-and-updates)\/([^/]+)\/?$/);
  if (!match || match[2] === 'new') return undefined;
  const types = { postcards: 'postcard', programs: 'program', scholarships: 'scholarship', resources: 'resource', 'community/posts': 'community-post', 'community/news-and-updates': 'update' };
  const type = types[/** @type {keyof typeof types} */ (match[1])];
  let id;
  try { id = decodeURIComponent(match[2]); } catch { return undefined; }
  return type && /^[a-zA-Z0-9_-]{1,128}$/.test(id) ? { type, id } : undefined;
}
