# VidyaSetu add-on: AI Gem + Streak + Learning Zone

## What it adds
- 💎 **AI Gem**: floating chat button. Explains concepts simply (Simple / Like I'm 10 / Exam notes), with a Hindi line, voice input and quick-topic chips. Works offline with a built-in library of 17 popular topics; connect the optional server to answer anything.
- 🔥 **Study Streak**: daily check-in, best streak, XP, 7-day tracker, 6 badges.
- 🧠 **Daily Quiz** (5 questions, +25 XP), ⏱ **Focus Timer** (15/25/45 min), 💡 Thought of the Day, 🤯 Did-you-know, 📝 Study Tips, 🆓 links to NCERT, DIKSHA, SWAYAM, NPTEL, National Scholarship Portal and Khan Academy.
- 📘 **NCERT Finder** (`vidyasetu-ncert.js`): pick class, subject and language to open the official NCERT book. Add direct book links in the `BOOKS` list inside that file.
- A "Learn" link in the top menu and the closing line: **Education is the most powerful weapon.**

## Install (2 minutes)
1. Put `vidyasetu-extras.js` in your repo next to `index.html`.
2. Also put `vidyasetu-ncert.js` in the repo (NCERT textbook finder).
3. In `index.html`, add these two lines just before `</body>`:
   `<script src="vidyasetu-extras.js" defer></script>`
   `<script src="vidyasetu-ncert.js" defer></script>`
4. Commit and push. GitHub Pages updates in a minute or two.

The Learning Zone is inserted above your Library section automatically. Nothing in your existing code is changed.

## Optional: real AI answers
Never put an API key in the website. Use `worker.js` (instructions at the top of that file), then add before the extras script:
`<script>window.VIDYASETU_AI_ENDPOINT = "https://your-worker.workers.dev";</script>`
If the server is down, AI Gem falls back to the offline library.

## Notes
- Streak, XP and quiz status are stored in the browser (localStorage) on each device.
- AI answers can be wrong; the panel already tells students to verify with their teacher.
