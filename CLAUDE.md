# anbu-site

## sap-fscd-guide (https://sap-fscd-guide.vercel.app)
Static pages deployed to the Vercel project `sap-fscd-guide`.

The site is a small course (LMS). `lms.js` holds the course outline (`COURSE`): add every new lesson there.
`/` is the dashboard (`index.html`, `<body data-page="dashboard">`); lessons are separate pages (`/basics`, `/payments`, ...).

Every lesson page must have:
- `<body data-lesson="ID">` matching its entry in `COURSE`, plus `<link rel="stylesheet" href="/lms.css">` after theme.css and `<script src="/lms.js" defer></script>` before quiz.js.
- A copyright line at the end of the footer: `<p class="copy">© 2026 Anbuselvan Sivaraju. All rights reserved.</p>`
- A "Test yourself" section just before the footer: `<div id="quiz" data-page="NAME"></div>` plus `<script src="/quiz.js" defer></script>`.
  Questions live in `quiz/NAME.json` (at least 20 questions, 4 options, `answer` index, `reason`).
  Upload the same file to Cloudinary (cloud `dnqfhp432`, raw asset, public_id `sap-fscd-guide/quiz/NAME.json`, folder `sap-fscd-guide/quiz`); quiz.js reads Cloudinary first and falls back to the local copy.
- The shared colour theme: `<link rel="stylesheet" href="/theme.css">` right after the page's `</style>`.
- The suggestion box, commented out for now: `<!-- <div id="suggest"></div> -->` and `<!-- <script src="/suggest.js" defer></script> -->`. The owner will ask to switch it back on (FormSubmit did not deliver).
