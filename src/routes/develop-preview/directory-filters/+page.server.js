import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { buildScholarshipOptions, filterScholarships, sortScholarships, paginateScholarships } from '$lib/components/scholarships-page/scholarship-directory.js';

export function load({ url }) {
    if (!dev) error(404,'Not found');
    const scholarshipItems = [
        {id:'filter-test-1',title:'Rome Arts Award',category:'Arts',country:'italy',location:'Italy',amountValue:4000,level:'Undergraduate',field:'Design'},
        {id:'filter-test-2',title:'Paris Research Award',category:'Research',country:'france',location:'France',amountValue:20000,level:'Graduate',field:'Engineering'},
        {id:'filter-test-3',title:'Global Travel Grant',category:'Travel',country:'worldwide',location:'Worldwide',amountValue:9000,level:'Undergraduate',field:'Languages'}
    ].flatMap((item, index) => Array.from({ length: 7 }, (_, award) => ({
        ...item, id: `${item.id}-${award}`, title: `${item.title} ${award + 1}`,
        categories: [item.category], provider: ['Arts Foundation', 'Research Council', 'Travel Foundation'][index],
        description: 'Sample funding for filter verification.', eligibility: [item.level],
        amount: `$${item.amountValue.toLocaleString('en-US')}`, deadline: null, featured: false, rating: 4, href: '#'
    })));
    const filters = Object.fromEntries(url.searchParams);
    const matches = sortScholarships(filterScholarships(scholarshipItems, { ...filters, search: filters.q }), filters.sort_by);
    const result = paginateScholarships(matches, filters.page, 8);
    return {
        scholarshipItems: result.results,
        filterOptions: buildScholarshipOptions(scholarshipItems),
        filters,
        pageInfo: { total: matches.length, page: result.currentPage, pageSize: 8, pageCount: Math.ceil(matches.length / 8) }
    };
}
