# anbu-site

## SAP Learning Notes (https://learn-sap.vercel.app)
Static pages deployed to the Vercel project `sap-fscd-guide`. The live address is `learn-sap.vercel.app`; the old `sap-fscd-guide.vercel.app` redirects to it (host rule in `vercel.json`).

The site is a small LMS ("SAP Learning Notes") with several courses. `lms.js` holds every course outline (`COURSES`): add every new lesson to its course there.
- `/` is the home page listing all courses (`index.html`, `<body data-page="home">`).
- Each course has a dashboard: `/fscd` (`fscd.html`) and `/fico` (`fico.html`), with `<body data-page="dashboard" data-course="ID">`.
- Each course ends with a reference module (Quick reference: T-codes): `/tcodes` (`tcodes.html`, lesson id `tcodes`) and `/fico/tcodes` (`fico/tcodes.html`, id `fico-tcodes`). Their `COURSES` entries have `ref: true`: no test, not counted in progress or the completion note (`course.core` holds the counted lessons). Add new codes to the page, not to `lms.js`.
- FSCD lessons are top-level pages (`/basics`, `/payments`, ...); FICO lessons live in `fico/` (`/fico/basics`, `/fico/ap`, ...) with lesson IDs and quiz names prefixed `fico-`.
- The top bar (with the Home button) and the back-to-top button are added by `lms.js` on every page that loads it; pages need no markup for them.
- Progress is saved per course in localStorage (`fscd-academy-progress-v1`, `fico-academy-progress-v1`); never rename these keys.

Every lesson page must have (reference pages with `ref: true` skip the quiz and the quiz.js script):
- `<body data-lesson="ID">` matching its entry in `COURSE`, plus `<link rel="stylesheet" href="/lms.css">` after theme.css and `<script src="/lms.js" defer></script>` before quiz.js.
- A copyright line at the end of the footer: `<p class="copy">© 2026 Anbuselvan Sivaraju. All rights reserved.</p>`
- A "Test yourself" section just before the footer: `<div id="quiz" data-page="NAME"></div>` plus `<script src="/quiz.js" defer></script>`.
  Questions live in `quiz/NAME.json` (at least 20 questions, 4 options, `answer` index, `reason`).
  Upload the same file to Cloudinary (cloud `dnqfhp432`, raw asset, public_id `sap-fscd-guide/quiz/NAME.json`, folder `sap-fscd-guide/quiz`); quiz.js reads Cloudinary first and falls back to the local copy.
- The shared colour theme: `<link rel="stylesheet" href="/theme.css">` right after the page's `</style>`.
- The suggestion box, commented out for now: `<!-- <div id="suggest"></div> -->` and `<!-- <script src="/suggest.js" defer></script> -->`. The owner will ask to switch it back on (FormSubmit did not deliver).
- Shared files (`lms.js`, `lms.css`, `theme.css`, `quiz.js`) are linked with a version tag, e.g. `/lms.js?v=20261022b`. When you change one of them, bump the tag on every page so browsers fetch the new copy. (Vercel already sends `max-age=0, must-revalidate` for css/js, so browsers re-check them on every visit; the bump is a belt-and-braces step.)
- Deploy to a preview first, check every file's hash, then deploy the same file list to production.
