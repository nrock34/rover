import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
export function load({url}) {
 if (!dev) error(404,'Not found');
 const titles=['A slower Sunday in Trastevere','Finding my way through Venice','The little bakery that became my morning ritual','What my first week abroad really felt like','An afternoon by the lake','The streets I took on the way home','Learning to cook, one shared dinner at a time','A weekend away from the usual route'];
 const images=['rome-street','venice-canal','pastry-case','campus-hallway','lake-view','florence-street','pizza-table','beach-sunset'];
 const all=titles.map((title,i)=>({id:`sample-${i}`,title,description:i===2?'I went in for a coffee and left with a new routine. These are the small places that make an unfamiliar city feel like home.':'Between classes and weekend trips, the best discoveries were often the ones I had not planned. A few notes from life abroad.',image:`/landing-test/${images[i]}.webp`,author:{name:['Amara Okafor','Mateo Rossi','Linh Nguyen'][i%3],avatar:null},location:{city:['Rome','Venice','Florence'][i%3],country:'Italy'},region:'Europe',category:{name:['Everyday life','Travel','Food'][i%3]},tags:['italy',i%2?'travel':'studentlife'],featured:i===0,likes:18+i*7,views:100+i*43,datePublished:`2026-09-0${8-i}T12:00:00Z`,href:`/postcards/sample-${i}`}));
 const filters={q:url.searchParams.get('q')||'',category:url.searchParams.get('category')||'',tag:url.searchParams.get('tag')||'',sortBy:url.searchParams.get('sort_by')||''};
 let results=all.filter(p=>(!filters.q || `${p.title} ${p.description} ${p.author.name}`.toLowerCase().includes(filters.q.toLowerCase())) && (!filters.category || p.category.name.toLowerCase()===filters.category.toLowerCase()) && (!filters.tag || p.tags.includes(filters.tag)));
 if(['-like_count','-views'].includes(filters.sortBy)) results.sort((a,b)=>b.likes-a.likes);
 if(url.searchParams.get('scenario')==='empty') results=[];
 const count=results.length;const totalPages=Math.max(1,Math.ceil(count/6));const page=Math.min(totalPages,Math.max(1,Number(url.searchParams.get('page'))||1));
 return {directory:{results:results.slice((page-1)*6,page*6),count,page,totalPages,filters,availableCategories:['Everyday life','Travel','Food'],availableTags:['italy','travel','studentlife']},previewPath:'/develop-preview/postcards',canonicalUrl:new URL('/postcards',url).toString()};
}
