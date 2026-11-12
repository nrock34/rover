/** @param {import('$domains/community/types.js').CommunityPostCard[]} posts
 * @param {{query?: string, topic?: string, type?: string}} filters */
export function matchRecentPosts(posts, { query = '', topic = 'all', type = 'all' } = {}) {
 const needle = query.trim().toLocaleLowerCase();
 return posts.filter(post => (topic === 'all' || post.category === topic) &&
  (type === 'all' || post.type === type) &&
  (!needle || [post.title, post.content, post.author.name, post.categoryLabel, ...post.tags]
   .some(text => text.toLocaleLowerCase().includes(needle))));
}
/** @param {{query?: string, topic?: string, type?: string}} filters */
export function communityPostsHref({ query = '', topic = 'all', type = 'all' } = {}) {
 const params = new URLSearchParams();
 if (query.trim()) params.set('q', query.trim());
 if (topic !== 'all') params.set('category', topic);
 if (type !== 'all') params.set('type', type);
 return `/community/posts${params.size ? `?${params}` : ''}`;
}
