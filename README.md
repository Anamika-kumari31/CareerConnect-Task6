
# CareerConnect - Jobs & Internship Management System

A front-end web application to explore job and internship listings, save the ones you like, add your own, and track your application status. This is the final capstone project (Task 6) of the Yuva Intern Frontend Development Internship.

**Live demo:** https://anamika-kumari31.github.io/CareerConnect-Task6/
**Automated tests (live):** https://anamika-kumari31.github.io/CareerConnect-Task6/tests.html
**Repository:** https://github.com/Anamika-kumari31/CareerConnect-Task6

## Features
- Browse 6 sample opportunities (internships and full-time roles)
- Search by job title, company, skill or location. Search matches whole words, so "Java" does not match "JavaScript"
- Filter by job type and work mode, and sort by title, company or newest
- "Clear filters" button, live result count and an empty-state message
- Save and unsave opportunities (Saved Opportunities section)
- Application tracker with 5 statuses: Interested, Applied, Interview, Offer, Rejected
- Add your own opportunity through a validated form, and delete it later (stored in this browser only)
- Data persists across page refreshes using browser Local Storage
- Responsive layout for mobile, tablet and desktop
- Accessibility: labelled form controls, skip link, visible keyboard focus, aria-live result count, descriptive button labels

## Tech Stack
HTML5, CSS3, JavaScript (ES6), browser Local Storage, Git and GitHub, GitHub Pages.
No frameworks, no backend and no build step.

## Project Structure
```
index.html        Page structure, navigation and the Add Opportunity form
style.css         Layout, responsive rules, focus and form styles
logic.js          Pure logic: search, filter, sort, validation, HTML escaping (no DOM access)
script.js         UI layer: rendering, event handling, Local Storage
tests.html        Runs the automated tests in the browser
tests/tests.js    27 automated tests (also runnable with Node.js)
```

The logic is kept separate from the user interface (`logic.js` and `script.js`), so the core rules can be tested without a browser page.

## Run Locally
1. Clone the repository:
   `git clone https://github.com/Anamika-kumari31/CareerConnect-Task6.git`
2. Open `index.html` in a browser. No installation is needed.

## Run the Tests
- **Browser:** open `tests.html`. The page shows `27/27 tests passed`.
- **Node.js (optional):** run `node tests/tests.js`

The 27 tests cover search, filters, sorting, form validation, HTML escaping and Local Storage data cleaning.

## How to Use
1. Use the search box, filters and sort menu to find opportunities.
2. Press **Save** to keep a job, or **Track Application** to add it to the tracker.
3. In **My Application Tracker**, change the status as your application progresses.
4. Use **Add an Opportunity** to add a listing you found elsewhere. Added listings show an "Added by you" badge and can be deleted.

## How to Extend
- **Add a sample listing:** add an object to `SAMPLE_JOBS` in `logic.js` (use an id below 1000).
- **Change search behaviour:** edit `matchesSearch()` in `logic.js`, then add a test in `tests/tests.js`.
- **Add a form field:** add it in `index.html`, add it to `FIELDS` in `script.js`, and add a rule in `validateJob()` in `logic.js`.

## Testing and Quality Summary
- **Automated tests:** 27 of 27 passed (browser run on the live site).
- **Manual tests on the live site:** search, filters, clear filters, empty state, form validation, adding a job, persistence after refresh, sorting, save, tracker status and script-tag safety. All checks passed.
- **Responsive check:** tested at 375px (mobile), 768px (tablet) and desktop widths.
- **Keyboard check:** all controls can be reached with the Tab key and show a visible focus outline.

### Lighthouse Results (live site, run on 29 October 2026)

| Category | Desktop | Mobile |
|---|---|---|
| Performance | 100 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

In the earlier testing phase (Task 4), SEO scored 90. Adding a meta description in this final version raised it to 100.

## Security and Data Safety
- All user-entered and stored text is HTML-escaped before it is shown on the page.
- Data read from Local Storage is checked and cleaned. Corrupt or unexpected data is ignored instead of breaking the page.
- Form input is validated for length and allowed values before it is saved.

## Known Limitations
- Listings are sample data. There is no backend, database or user login.
- Data is stored in Local Storage, so it is not shared between browsers or devices and can be cleared by the user.
- Search matches whole words only (typing "jav" will not match "Java").
- GitHub Pages sites under the same account share one Local Storage origin, so data saved by another project on the same account's Pages domain may appear here.

## Future Improvements
- Backend and database with user accounts
- Real vacancy data through an API
- Editing of added listings and CSV export of tracked applications
- Reminders for application deadlines

## Author
Anamika Kumari
Frontend Development Intern, Yuva Intern
