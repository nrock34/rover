/**
 * @typedef {{
 *   fetch: typeof fetch;
 * }} ProgramFetchDeps
 */

/**
 * @typedef {"missing_env" | "network_error" | "invalid_response" | "not_found" | "upstream_error" | "not_ready"} ProgramErrorCode
 */

/**
 * @typedef {{
 *   code: ProgramErrorCode;
 *   status: number;
 *   message: string;
 *   details?: unknown;
 * }} ProgramDomainError
 */

/**
 * @typedef {{
 *   gpa: string;
 *   prerequisites: string;
 *   active_credits_needed: string;
 *   language: string;
 *   level: string;
 * }} ProgramRequirements
 */

/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   provider: string;
 *   location: string;
 *   country: string;
 *   duration: string;
 *   cost: number;
 *   costRange: string;
 *   fields: string[];
 *   language: string;
 *   rating: number;
 *   participants: number;
 *   description: string;
 *   highlights: string[];
 *   image: string;
 *   featured: boolean;
 *   requirements: ProgramRequirements;
 *   href: string;
 * }} ProgramCard
 */

/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   provider: { name: string; universityId: string | null };
 *   location: { city: string; country: string };
 *   duration: string;
 *   cost: {
 *     program_fee: number;
 *     accommodation_fee: number;
 *     extra_fee: number;
 *     additional: string;
 *   };
 *   image: string;
 *   participants: number;
 *   description: string;
 *   fullDescription: string;
 *   highlights: string[];
 *   gallery: string[];
 *   featured: boolean;
 *   requirements: ProgramRequirements;
 *   fields: string[];
 *   academics: {
 *     courses: string[];
 *     fieldTrips: string[];
 *     faculty: string;
 *     classSize: string;
 *   };
 *   housing: {
 *     description: string;
 *     type: string;
 *     location: string;
 *     amenities: string[];
 *     cost: string;
 *   };
 *   applicationProcess: Array<{
 *     step: number;
 *     title: string;
 *     description: string;
 *     deadline: string;
 *   }>;
 *   testimonials: Array<{
 *     name: string;
 *     program: string;
 *     rating: number;
 *     text: string;
 *     avatar: string;
 *   }>;
 *   contact: {
 *     email: string | null;
 *     phone: string | null;
 *     website: string | null;
 *     address: { state: string };
 *   };
 *   appDeadline: string | null;
 *   applicationLink: string | null;
 *   infoLink: string | null;
 *   university: {
 *     name: string;
 *     ranking: string;
 *     accreditation: string;
 *     founded: string;
 *     students: string;
 *     description: string;
 *   };
 *   href: string;
 * }} ProgramDetail
 */

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   count: number;
 * }} ProgramCountryOption
 */

/**
 * @typedef {{
 *   countries: ProgramCountryOption[];
 *   providers: Array<{ id: string; name: string }>;
 *   subjects: Array<{ id: string; name: string }>;
 *   languages: Array<{ id: string; name: string }>;
 * }} ProgramFilterOptions
 */

/**
 * @typedef {{
 *   next: string | null;
 *   prev: string | null;
 *   results: ProgramCard[];
 *   pageInfo: { total: number; page: number; pageSize: number; pageCount: number };
 * }} ProgramDirectoryPage
 */

/**
 * @template T
 * @typedef {{
 *   ok: true;
 *   data: T;
 *   status: number;
 *   headers: Headers;
 * }} ProgramSuccess
 */

/**
 * @typedef {{
 *   ok: false;
 *   error: ProgramDomainError;
 * }} ProgramFailure
 */

/**
 * @template T
 * @typedef {ProgramSuccess<T> | ProgramFailure} ProgramResult
 */

export {};
