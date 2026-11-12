# RomeWithMe Svelte Frontend
A list of items needed to be done.

## Bug Fixes

### Accessibility / Navigation

- [ ] Fix footer navigation links
    - [ ] incorrect relative linking on nested pages
    - [ ] privacy & cookie policy links don't link to page
    - [ ] unconfigured social links
    - [ ] social links need accessible names
- [ ] Make keyboard focus visible for News & Updates field
- [ ] The News & Updates filter controls need labels for them
- [ ] Fix the newsletter fields not having a persistent label, and feedback isn't announced
- [ ] Fix the About page subscription link pointing to a missing signup anchor
- [ ] Add a skip-to-main link and remove nested main landmarks on landing and article pages
- [ ] Fix low-contrast text on home, About, community, postcards, and resource previews
- [ ] Keep navigation and account controls visible when text size is increased to 200%
- [ ] Confirm dark-mode support and fix theme activation and contrast if supported
- [ ] Match accessible names to visible labels on Like buttons and postcard photo links
- [ ] Label program and scholarship bookmark/share buttons and saved-item removal buttons
- [ ] Make the avatar picker keyboard accessible with a label and visible focus
- [ ] Give the resource preview dialog an accessible title and description

### Authentication / Onboarding

- [ ] Keep access tokens out of page data and refresh JSON
    - [ ] return only required refresh status and expiry information
    - [ ] stop passing extra upstream response fields to the browser
- [ ] Fix concurrent refresh requests clearing a valid rotated session
    - [ ] coordinate refreshes across tabs and server requests
    - [ ] verify backend rotation rules and both response orders
- [ ] Preserve the requested destination after a failed login and successful retry
- [ ] Return users to the page after logging in from an expired like/comment session
- [ ] Make the Forgot your password link open a working recovery flow
- [ ] Handle role-service failures without sending existing members back to onboarding
    - [ ] show a retryable error, add request timeouts, and avoid unnecessary role lookups
- [ ] Handle failed backend logout/revocation with feedback and retry support
- [ ] Allow users who answer No to previous study abroad to finish onboarding
- [ ] Keep onboarding usable when session storage is blocked or full
    - [ ] handle storage read/write failures and continue with in-memory data

### Newsletter

- [ ] Preserve the entered email after failed submissions, including without JavaScript
- [ ] Show readable feedback instead of internal error codes
- [ ] Add required email validation, email autocomplete, and a pending/disabled submit state

### Community / Posts

- [ ] Preserve publication, topic, and other selected values after failed post validation
- [ ] Load the actual viewer-like state and authoritative like count after liking or reloading
- [ ] Confirm draft support and fix unpublished posts redirecting to inaccessible pages
    - [ ] provide draft viewing/publishing or remove the draft option until supported
- [ ] Prevent duplicate posts when creation succeeds but the follow-up ID lookup fails
    - [ ] retain the created identifier and make retries safe
- [ ] Fix post and comment sort values and make Newer/Older labels match the selected order
- [ ] Apply News & Updates search, categories, and sorting across the full archive
    - [ ] use archive-wide category options and counts
    - [ ] keep filters in the URL and pagination links
- [ ] Make full-feed search include tags and authors consistently with the recent feed
- [ ] Show post-specific missing/error messages on detail pages
- [ ] Show comment validation errors after interaction or submission
- [ ] Investigate comment pagination during inserts, deletions, and concurrent updates
    - [ ] check repeated or missing records and use stable cursors if needed

### Postcards / Articles

- [ ] Confirm CMS gallery behavior and display supplied gallery assets when intended
    - [ ] deduplicate images, preserve alt text, and remove unused gallery queries if unnecessary
- [ ] Remove conflicting generic and article-specific Open Graph metadata

### Programs / Scholarships

- [ ] Make program search include destinations and subjects, or correct the search prompt
- [ ] Fix unavailable program actions and sharing
    - [ ] hide or disable Apply Now, Request Info, and contact links when their URLs are missing
    - [ ] make the share button share or copy the program link
- [ ] Keep a selected program view when clicking the active Grid/List/Map control
- [ ] Use the supplied total program cost and keep displayed costs consistent with sorting
    - [ ] preserve unknown costs instead of showing them as free

### Resources / Profiles

- [ ] Make resource saves and program/scholarship bookmarks persist
    - [ ] load saved state, handle save/unsave failures, and update the saved-items page
- [ ] Make Follow persist and handle authentication, self-follow, and errors
- [ ] Make saved items openable and removable with persisted changes and error feedback
- [ ] Show all applications or paginate them, and make Detail buttons open the application
- [ ] Keep empty resource categories selected so their empty state can be viewed
- [ ] Connect Contribute to Our Resources to a working flow or mark it unavailable

## Performance

- [ ] Debounce and cache username availability checks and ignore stale responses
    - [ ] keep final uniqueness checks on registration
- [ ] Cache or separately load program and scholarship filter metadata
    - [ ] avoid scanning every metadata page on each search, filter, sort, or page change

## Testing / Verification

- [ ] Fix the 21 type/Svelte errors caused by missing Node declarations for crypto, Buffer, and process
- [ ] Resolve the failing PostcardContentPreview margin test
- [ ] Verify flows with a running backend and test accounts
    - [ ] signup, login retries, password recovery, logout/revocation failures, cookie security, and full token expiry/rotation
    - [ ] onboarding, account/password/profile/education updates, and remote avatar storage
    - [ ] post creation/drafts, likes, comments, cross-session state, REST/CMS identifiers, permissions, and view counts
    - [ ] directory search, filters, sorting, pagination, external applications, downloads, and resource previews
    - [ ] all article content blocks, galleries, sharing, and postcard like/comment count behavior
    - [ ] newsletter subscriptions and delivery
    - [ ] authenticated analytics and live service integration
- [ ] Finish screen-reader, keyboard, browser zoom, responsive, reduced-motion, and supported-theme checks
    - [ ] include protected News & Updates controls, remaining filters, and mobile preview states
