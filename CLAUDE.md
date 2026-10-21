# anbu-site

## sap-fscd-guide (https://sap-fscd-guide.vercel.app)
Static pages deployed to the Vercel project `sap-fscd-guide`.

Every page must have:
- A copyright line at the end of the footer: `<p class="copy">© 2026 Anbuselvan Sivaraju. All rights reserved.</p>`
- A "Test yourself" section just before the footer: `<div id="quiz" data-page="NAME"></div>` plus `<script src="/quiz.js" defer></script>`.
  Questions live in `quiz/NAME.json` (at least 20 questions, 4 options, `answer` index, `reason`).
  Upload the same file to Cloudinary (cloud `dnqfhp432`, raw asset, public_id `sap-fscd-guide/quiz/NAME.json`, folder `sap-fscd-guide/quiz`); quiz.js reads Cloudinary first and falls back to the local copy.
- The page switcher (`.pages`) linking all pages.
- The shared colour theme: `<link rel="stylesheet" href="/theme.css">` right after the page's `</style>`.
- A suggestion box after the quiz: `<div id="suggest"></div>` plus `<script src="/suggest.js" defer></script>` (emails the owner via FormSubmit).
