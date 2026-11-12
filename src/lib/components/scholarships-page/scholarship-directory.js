export const SCHOLARSHIP_AMOUNT_OPTIONS = [
    { id: "all", name: "Any award amount" },
    { id: "under-5000", name: "Under $5,000" },
    { id: "5000-15000", name: "$5,000–$15,000" },
    { id: "over-15000", name: "$15,000+" }
];

export const SCHOLARSHIP_DEADLINE_OPTIONS = [
    { id: "all", name: "Any deadline" },
    { id: "30-days", name: "Within 30 days" },
    { id: "90-days", name: "Within 90 days" },
    { id: "open-ended", name: "Open or undated" }
];

export const SCHOLARSHIP_SORT_OPTIONS = [
    { id: "featured", name: "Featured first" },
    { id: "deadline", name: "Deadline soonest" },
    { id: "amount", name: "Award highest" },
    { id: "title", name: "Title A–Z" }
];

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const deadlineTime = (item) => {
    if (!item?.deadline) return Number.POSITIVE_INFINITY;
    const value = new Date(item.deadline).getTime();
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
};

export { buildScholarshipOptions } from "../../../domains/scholarships/filter-options.js";

export function filterScholarships(items = [], filters = {}, now = new Date()) {
    const query = normalize(filters.search);
    const nowTime = now instanceof Date ? now.getTime() : new Date(now).getTime();

    return items.filter((item) => {
        const searchable = normalize([
            item.title,
            item.provider,
            item.location,
            item.country,
            item.description,
            item.level,
            item.field,
            ...(Array.isArray(item.eligibility) ? item.eligibility : [])
        ].join(" "));
        const categories = (Array.isArray(item.categories) && item.categories.length ? item.categories : [item.category]).map(normalize);
        const country = normalize(item.country || item.location);
        const amount = Number(item.amountValue ?? 0);
        const due = deadlineTime(item);
        const daysUntil = Number.isFinite(due) && Number.isFinite(nowTime)
            ? Math.ceil((due - nowTime) / 86_400_000)
            : Number.POSITIVE_INFINITY;

        const matchesSearch = !query || searchable.includes(query);
        const matchesCategory = !filters.category || filters.category === "all" || categories.includes(normalize(filters.category));
        const matchesCountry = !filters.country || filters.country === "all" || country === normalize(filters.country);
        const matchesProvider = !filters.provider || filters.provider === "all" || normalize(item.provider) === normalize(filters.provider);
        const matchesLevel = !filters.level || filters.level === "all" || normalize(item.level) === normalize(filters.level);
        const matchesField = !filters.field || filters.field === "all" || normalize(item.field) === normalize(filters.field);
        const matchesAmount = !filters.amount || filters.amount === "all" ||
            (filters.amount === "under-5000" && amount < 5000) ||
            (filters.amount === "5000-15000" && amount >= 5000 && amount <= 15000) ||
            (filters.amount === "over-15000" && amount > 15000);
        const matchesDeadline = !filters.deadline || filters.deadline === "all" ||
            (filters.deadline === "30-days" && daysUntil >= 0 && daysUntil <= 30) ||
            (filters.deadline === "90-days" && daysUntil >= 0 && daysUntil <= 90) ||
            (filters.deadline === "open-ended" && !Number.isFinite(due));

        return matchesSearch && matchesCategory && matchesCountry && matchesProvider && matchesLevel && matchesField && matchesAmount && matchesDeadline;
    });
}

export function sortScholarships(items = [], sort = "featured") {
    return [...items].sort((a, b) => {
        if (sort === "deadline") return deadlineTime(a) - deadlineTime(b);
        if (sort === "amount") return Number(b.amountValue ?? 0) - Number(a.amountValue ?? 0);
        if (sort === "title") return String(a.title ?? "").localeCompare(String(b.title ?? ""));

        const featuredDifference = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        if (featuredDifference !== 0) return featuredDifference;
        return Number(b.rating ?? 0) - Number(a.rating ?? 0);
    });
}

export function clampScholarshipPage(page, itemCount, perPage) {
    const totalPages = Math.max(1, Math.ceil(itemCount / perPage));
    return Math.min(Math.max(1, Number(page) || 1), totalPages);
}

export function paginateScholarships(items = [], page = 1, perPage = 6) {
    const currentPage = clampScholarshipPage(page, items.length, perPage);
    const start = (currentPage - 1) * perPage;
    return {
        currentPage,
        totalPages: Math.max(1, Math.ceil(items.length / perPage)),
        results: items.slice(start, start + perPage)
    };
}
