/* ==========================================================
   VidyaSetu Extras  v1.0
   Adds: AI Gem (concept explainer), Study Streak + XP + badges,
         Daily Quiz, Focus Timer, Daily Thought, Study Tips,
         Free Official Resources, and the closing motivation line.
   Install: add ONE line before </body> in index.html:
       <script src="vidyasetu-extras.js" defer></script>
   No other file or library is needed. Data stays on the student's device.
   ========================================================== */
(function () {
  'use strict';
  if (window.__vsExtras) return;
  window.__vsExtras = true;

  /* ---------- CONFIG ----------
     AI Gem works offline with a built-in concept library.
     To make it answer ANY question with a real AI model, deploy the small
     proxy in worker.js and put its URL below (or set
     window.VIDYASETU_AI_ENDPOINT before this script loads).
     NEVER put an API key in this file: anyone can read it. */
  var AI_ENDPOINT = window.VIDYASETU_AI_ENDPOINT || '';

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function load(key) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function ymd(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function today() { return ymd(new Date()); }
  function daysAgo(n) { var d = new Date(); d.setDate(d.getDate() - n); return ymd(d); }
  function dayNumber() { var d = new Date(); d.setHours(0, 0, 0, 0); return Math.floor(d.getTime() / 864e5); }

  /* ---------- styles ---------- */
  var css = '' +
    '.vs-zone{max-width:1100px;margin:0 auto;padding:40px 16px;font-family:inherit;color:#0f172a}' +
    '.vs-zone h2{font-size:1.6rem;margin:0 0 6px}' +
    '.vs-sub{margin:0 0 20px;color:#475569}' +
    '.vs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}' +
    '.vs-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:18px;box-shadow:0 2px 10px rgba(15,23,42,.05)}' +
    '.vs-card h3{margin:0 0 10px;font-size:1.05rem}' +
    '.vs-wide{grid-column:1/-1}' +
    '.vs-btn{background:#115e59;color:#fff;border:0;border-radius:12px;padding:10px 16px;font-size:.95rem;font-weight:600;cursor:pointer;min-height:44px}' +
    '.vs-btn:hover{background:#0f766e}.vs-btn:disabled{background:#94a3b8;cursor:default}' +
    '.vs-btn.alt{background:#f1f5f9;color:#115e59;border:1px solid #cbd5e1}' +
    '.vs-big{font-size:3rem;font-weight:800;line-height:1;color:#ea580c}' +
    '.vs-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
    '.vs-dots{display:flex;gap:6px;margin:12px 0}' +
    '.vs-dot{flex:1;text-align:center;font-size:.7rem;color:#64748b}' +
    '.vs-dot i{display:block;height:28px;border-radius:8px;background:#e2e8f0;margin-bottom:3px}' +
    '.vs-dot.on i{background:#f97316}.vs-dot.now i{outline:2px solid #115e59}' +
    '.vs-bar{height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden;margin:6px 0}' +
    '.vs-bar b{display:block;height:100%;background:#115e59;width:0;transition:width .4s}' +
    '.vs-muted{color:#64748b;font-size:.85rem}' +
    '.vs-badges{display:flex;gap:10px;flex-wrap:wrap}' +
    '.vs-badge{width:92px;text-align:center;padding:10px 4px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;opacity:.45;filter:grayscale(1)}' +
    '.vs-badge.on{opacity:1;filter:none;background:#fff7ed;border-color:#fdba74}' +
    '.vs-badge span{display:block;font-size:1.6rem}.vs-badge small{font-size:.7rem}' +
    '.vs-opt{display:block;width:100%;text-align:left;margin:6px 0;padding:10px 12px;border-radius:12px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font-size:.95rem;min-height:44px}' +
    '.vs-opt.ok{background:#dcfce7;border-color:#22c55e}.vs-opt.bad{background:#fee2e2;border-color:#ef4444}' +
    '.vs-timer{font-size:2.6rem;font-weight:800;font-variant-numeric:tabular-nums;color:#115e59;margin:6px 0}' +
    '.vs-quote{font-size:1.1rem;font-style:italic;line-height:1.5}' +
    '.vs-tips{margin:0;padding-left:18px;line-height:1.6}' +
    '.vs-res{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}' +
    '.vs-res a{display:block;padding:12px;border-radius:12px;border:1px solid #e2e8f0;text-decoration:none;color:#0f172a;background:#f8fafc}' +
    '.vs-res a:hover{border-color:#115e59}.vs-res b{color:#115e59}.vs-res small{display:block;color:#64748b;margin-top:2px}' +
    '.vs-end{background:linear-gradient(135deg,#115e59,#0f766e);color:#fff;text-align:center;padding:36px 16px;margin-top:24px}' +
    '.vs-end p{margin:0;font-size:1.5rem;font-weight:800;letter-spacing:.2px}' +
    '.vs-end small{display:block;margin-top:6px;opacity:.85}' +
    /* AI Gem */
    '.gem-fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9998;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;border:0;border-radius:99px;padding:13px 18px;font-size:1rem;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(37,99,235,.4)}' +
    '.gem-panel{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:9999;width:min(400px,calc(100vw - 24px));height:min(620px,calc(100vh - 24px));background:#fff;border-radius:20px;box-shadow:0 12px 48px rgba(15,23,42,.35);display:none;flex-direction:column;overflow:hidden;font-family:inherit;color:#0f172a}' +
    '.gem-panel.open{display:flex}' +
    '.gem-head{background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;padding:12px 14px;display:flex;align-items:center;justify-content:space-between}' +
    '.gem-head b{font-size:1.05rem}.gem-head small{display:block;opacity:.85;font-size:.72rem}' +
    '.gem-x{background:transparent;border:0;color:#fff;font-size:1.5rem;cursor:pointer;line-height:1;min-width:40px;min-height:40px}' +
    '.gem-level{display:flex;gap:6px;padding:8px 10px;border-bottom:1px solid #e2e8f0;background:#f8fafc}' +
    '.gem-level button{flex:1;border:1px solid #cbd5e1;background:#fff;border-radius:99px;padding:6px 4px;font-size:.78rem;cursor:pointer}' +
    '.gem-level button.on{background:#7c3aed;color:#fff;border-color:#7c3aed}' +
    '.gem-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;background:#f1f5f9}' +
    '.gem-msg{max-width:88%;padding:10px 12px;border-radius:14px;font-size:.93rem;line-height:1.5;word-wrap:break-word}' +
    '.gem-msg p{margin:0 0 6px}.gem-msg p:last-child{margin:0}.gem-msg ul{margin:4px 0 0;padding-left:18px}' +
    '.gem-msg.me{align-self:flex-end;background:#2563eb;color:#fff;border-bottom-right-radius:4px}' +
    '.gem-msg.ai{align-self:flex-start;background:#fff;border:1px solid #e2e8f0;border-bottom-left-radius:4px}' +
    '.gem-msg .hi{color:#6d28d9;margin-top:6px}' +
    '.gem-chips{display:flex;gap:6px;flex-wrap:wrap;padding:8px 10px;background:#f1f5f9}' +
    '.gem-chips button{border:1px solid #c4b5fd;background:#fff;color:#5b21b6;border-radius:99px;padding:6px 10px;font-size:.78rem;cursor:pointer}' +
    '.gem-form{display:flex;gap:6px;padding:10px;border-top:1px solid #e2e8f0;background:#fff}' +
    '.gem-form input{flex:1;min-width:0;border:1px solid #cbd5e1;border-radius:12px;padding:10px;font-size:16px}' +
    '.gem-form button{border:0;border-radius:12px;background:#7c3aed;color:#fff;padding:0 14px;font-size:1rem;cursor:pointer;min-height:44px}' +
    '.gem-form button.mic{background:#e2e8f0;color:#0f172a}' +
    '.gem-note{font-size:.7rem;color:#64748b;text-align:center;padding:0 10px 8px;background:#fff}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ==========================================================
     1. STREAK + XP + BADGES
     ========================================================== */
  var S = load('vs_streak') || { last: '', count: 0, best: 0, days: [], xp: 0 };
  var ui = {};

  function liveCount() { return (S.last === today() || S.last === daysAgo(1)) ? S.count : 0; }
  function persist() { save('vs_streak', S); }

  function checkIn() {
    var t = today();
    if (S.last === t) return false;
    S.count = (S.last === daysAgo(1)) ? S.count + 1 : 1;
    S.last = t;
    S.best = Math.max(S.best, S.count);
    S.days.push(t);
    if (S.days.length > 60) S.days = S.days.slice(-60);
    S.xp += 10;
    persist();
    renderStreak();
    return true;
  }
  function addXP(n) { S.xp += n; persist(); renderStreak(); }
  function studied(xp) { checkIn(); if (xp) addXP(xp); }

  var BADGES = [
    { n: 1, icon: '🌱', name: 'First Step' },
    { n: 3, icon: '⚡', name: '3-Day Spark' },
    { n: 7, icon: '🔥', name: 'Week Warrior' },
    { n: 14, icon: '🚀', name: 'Fortnight Focus' },
    { n: 30, icon: '🏆', name: 'Month Master' },
    { n: 100, icon: '👑', name: 'Century Scholar' }
  ];

  function renderStreak() {
    if (!ui.count) return;
    var c = liveCount();
    ui.count.textContent = c;
    ui.best.textContent = S.best;
    ui.xp.textContent = S.xp;
    var done = S.last === today();
    ui.btn.disabled = done;
    ui.btn.textContent = done ? '✅ Studied today. Great job!' : '✔ I studied today';
    var next = 1;
    for (var i = 0; i < BADGES.length; i++) { if (BADGES[i].n > c) { next = BADGES[i].n; break; } next = BADGES[i].n; }
    var pct = Math.min(100, Math.round((c / next) * 100));
    ui.bar.style.width = pct + '%';
    ui.next.textContent = c >= 100 ? 'You reached every badge!' : (next - c) + ' more day(s) to unlock the next badge';
    ui.msg.textContent = c === 0 ? 'Start today. Even 10 minutes counts.' :
      c < 3 ? 'Good start! Come back tomorrow to keep it going.' :
      c < 7 ? 'You are building a habit. Do not break the chain!' :
      'Amazing consistency. You are inspiring others!';
    /* week dots */
    ui.dots.innerHTML = '';
    var names = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    for (var d = 6; d >= 0; d--) {
      var key = daysAgo(d);
      var dt = new Date(); dt.setDate(dt.getDate() - d);
      var box = el('div', 'vs-dot' + (S.days.indexOf(key) > -1 ? ' on' : '') + (d === 0 ? ' now' : ''));
      box.appendChild(document.createElement('i'));
      box.appendChild(document.createTextNode(names[dt.getDay()]));
      ui.dots.appendChild(box);
    }
    /* badges */
    ui.badges.innerHTML = '';
    BADGES.forEach(function (b) {
      var x = el('div', 'vs-badge' + (S.best >= b.n ? ' on' : ''));
      x.appendChild(el('span', '', b.icon));
      x.appendChild(el('b', '', b.name));
      x.appendChild(document.createElement('br'));
      x.appendChild(el('small', '', b.n + (b.n === 1 ? ' day' : ' days')));
      ui.badges.appendChild(x);
    });
  }

  /* ==========================================================
     2. CONTENT DATA
     ========================================================== */
  var QUOTES = [
    'Small steps every day lead to big results.',
    'You do not have to be perfect. You just have to begin.',
    'Your village does not decide your future. Your effort does.',
    'Every expert was once a beginner.',
    'Dreams need hard work, and hard work needs a start today.',
    'Mistakes are proof that you are trying.',
    'Be a little better than yesterday.',
    'A student who never gives up can never be defeated.',
    'Learn today so you can lead tomorrow.',
    'Discipline is choosing what you want most over what you want now.'
  ];
  var TIPS = [
    'Study in short blocks (25 minutes) with a 5-minute break. Your brain remembers more.',
    'Explain a topic aloud to a friend or sibling. If you can teach it, you know it.',
    'Revise a new topic after 1 day, 3 days and 7 days. This stops forgetting.',
    'Write a mistake notebook. Re-read your wrong answers before every test.',
    'Sleep 7 to 8 hours. Sleep is when your brain saves what you studied.',
    'Start with the hardest subject when your mind is fresh.',
    'Keep your phone away while studying. Use it only for learning.',
    'Make small notes and diagrams instead of copying whole pages.'
  ];
  var FACTS = [
    'Honey never spoils. Edible honey has been found in ancient Egyptian tombs.',
    'India gave the world the number zero, a base of all modern computing.',
    'A day on Venus is longer than a year on Venus.',
    'Your heart beats around 100,000 times every day.',
    'The Indian Constitution is one of the longest written constitutions in the world.',
    'Octopuses have three hearts.',
    'Light from the Sun takes about 8 minutes to reach the Earth.'
  ];
  var RESOURCES = [
    { n: 'NCERT Books', u: 'https://ncert.nic.in/textbook.php', d: 'Free official textbooks, Class 1 to 12' },
    { n: 'DIKSHA', u: 'https://diksha.gov.in/', d: 'Government learning app with QR textbooks' },
    { n: 'SWAYAM', u: 'https://swayam.gov.in/', d: 'Free online courses with certificates' },
    { n: 'NPTEL', u: 'https://nptel.ac.in/', d: 'IIT and IISc video lectures' },
    { n: 'National Scholarship Portal', u: 'https://scholarships.gov.in/', d: 'Apply for central and state scholarships' },
    { n: 'Khan Academy', u: 'https://www.khanacademy.org/', d: 'Free maths and science lessons' }
  ];
  var QUIZ = [
    { q: 'Which gas do plants take in for photosynthesis?', o: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], a: 1, e: 'Plants use carbon dioxide, water and sunlight to make food.' },
    { q: 'What is the value of 12 x 12?', o: ['124', '144', '122', '148'], a: 1, e: '12 x 12 = 144.' },
    { q: 'Who is known as the Father of the Indian Constitution?', o: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'B. R. Ambedkar', 'Sardar Patel'], a: 2, e: 'Dr. B. R. Ambedkar chaired the Drafting Committee.' },
    { q: 'What is the force that pulls objects towards the Earth?', o: ['Friction', 'Magnetism', 'Gravity', 'Pressure'], a: 2, e: 'Gravity pulls everything towards the centre of the Earth.' },
    { q: 'Which is the largest planet in our solar system?', o: ['Earth', 'Jupiter', 'Saturn', 'Mars'], a: 1, e: 'Jupiter is bigger than all other planets combined.' },
    { q: 'What is the capital of India?', o: ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'], a: 2, e: 'New Delhi is the capital of India.' },
    { q: 'Which part of the cell contains its genetic material?', o: ['Nucleus', 'Cell wall', 'Vacuole', 'Ribosome'], a: 0, e: 'The nucleus holds DNA, the instructions of the cell.' },
    { q: 'In a right triangle, which side is the longest?', o: ['Base', 'Height', 'Hypotenuse', 'All equal'], a: 2, e: 'The hypotenuse is opposite the right angle.' },
    { q: 'Which city is the capital of Haryana?', o: ['Rohtak', 'Chandigarh', 'Hisar', 'Ambala'], a: 1, e: 'Chandigarh is the capital of Haryana (and Punjab).' },
    { q: 'What do we call a word that describes a noun?', o: ['Verb', 'Adverb', 'Adjective', 'Pronoun'], a: 2, e: 'An adjective describes a noun, like "tall boy".' },
    { q: 'Water boils at what temperature at sea level?', o: ['50 C', '80 C', '100 C', '120 C'], a: 2, e: 'Pure water boils at 100 degrees Celsius.' },
    { q: 'Which gas do we breathe in to stay alive?', o: ['Oxygen', 'Helium', 'Methane', 'Argon'], a: 0, e: 'Our body uses oxygen to release energy from food.' },
    { q: 'What is 25% of 200?', o: ['25', '40', '50', '75'], a: 2, e: '25% is one quarter. 200 / 4 = 50.' },
    { q: 'Which of these is a renewable source of energy?', o: ['Coal', 'Petrol', 'Solar', 'Diesel'], a: 2, e: 'Sunlight never runs out, so solar is renewable.' },
    { q: 'Who wrote the national anthem of India?', o: ['Bankim Chandra', 'Rabindranath Tagore', 'Sarojini Naidu', 'Premchand'], a: 1, e: 'Jana Gana Mana was written by Rabindranath Tagore.' }
  ];

  /* ==========================================================
     3. BUILD THE LEARNING ZONE
     ========================================================== */
  function buildZone() {
    var sec = el('section', 'vs-zone');
    sec.id = 'learn';
    sec.innerHTML =
      '<h2>🔥 Learning Zone</h2>' +
      '<p class="vs-sub">Build a daily habit, test yourself, and find free official study material.</p>' +
      '<div class="vs-grid">' +

      /* streak */
      '<div class="vs-card"><h3>🔥 Your Study Streak</h3>' +
      '<div class="vs-row"><div><div class="vs-big" id="vsCount">0</div><div class="vs-muted">day streak</div></div>' +
      '<div style="margin-left:auto;text-align:right"><div>🏅 Best: <b id="vsBest">0</b></div><div>⭐ XP: <b id="vsXp">0</b></div></div></div>' +
      '<div class="vs-dots" id="vsDots"></div>' +
      '<div class="vs-bar"><b id="vsBar"></b></div><div class="vs-muted" id="vsNext"></div>' +
      '<p id="vsMsg" style="margin:10px 0"></p>' +
      '<button class="vs-btn" id="vsCheck">✔ I studied today</button>' +
      '<p class="vs-muted" style="margin:10px 0 0">Quiz, focus timer and AI Gem questions also count as study. Streak is saved on this device.</p></div>' +

      /* thought */
      '<div class="vs-card"><h3>💡 Thought of the Day</h3><p class="vs-quote" id="vsQuote"></p>' +
      '<h3 style="margin-top:16px">🤯 Did you know?</h3><p id="vsFact" style="margin:0"></p></div>' +

      /* quiz */
      '<div class="vs-card"><h3>🧠 Daily Quiz (5 questions)</h3><div id="vsQuiz"></div></div>' +

      /* timer */
      '<div class="vs-card"><h3>⏱ Focus Timer</h3>' +
      '<div class="vs-row" id="vsModes"></div>' +
      '<div class="vs-timer" id="vsTime">25:00</div>' +
      '<div class="vs-row"><button class="vs-btn" id="vsStart">Start</button><button class="vs-btn alt" id="vsReset">Reset</button></div>' +
      '<p class="vs-muted" id="vsTimerMsg" style="margin:10px 0 0">Finish a session to earn 15 XP and keep your streak.</p></div>' +

      /* tips */
      '<div class="vs-card"><h3>📝 Smart Study Tips</h3><ul class="vs-tips" id="vsTips"></ul></div>' +

      /* badges */
      '<div class="vs-card vs-wide"><h3>🎖 Badges</h3><div class="vs-badges" id="vsBadges"></div></div>' +

      /* resources */
      '<div class="vs-card vs-wide"><h3>🆓 Free Official Study Resources</h3><div class="vs-res" id="vsRes"></div>' +
      '<p class="vs-muted" style="margin:10px 0 0">Links open official websites. Always check dates and eligibility there.</p></div>' +
      '</div>';

    var lib = document.getElementById('library');
    var anchor = lib ? (lib.closest('section') || lib) : null;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else (document.querySelector('main') || document.body).appendChild(sec);

    ui = {
      count: $('#vsCount', sec), best: $('#vsBest', sec), xp: $('#vsXp', sec), dots: $('#vsDots', sec),
      bar: $('#vsBar', sec), next: $('#vsNext', sec), msg: $('#vsMsg', sec), btn: $('#vsCheck', sec),
      badges: $('#vsBadges', sec)
    };
    ui.btn.addEventListener('click', function () { checkIn(); });

    var dn = dayNumber();
    $('#vsQuote', sec).textContent = '"' + QUOTES[dn % QUOTES.length] + '"';
    $('#vsFact', sec).textContent = FACTS[dn % FACTS.length];

    var tipsEl = $('#vsTips', sec);
    for (var i = 0; i < 3; i++) tipsEl.appendChild(el('li', '', TIPS[(dn + i) % TIPS.length]));

    var resEl = $('#vsRes', sec);
    RESOURCES.forEach(function (r) {
      var a = el('a');
      a.href = r.u; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.appendChild(el('b', '', r.n + ' ↗'));
      a.appendChild(el('small', '', r.d));
      resEl.appendChild(a);
    });

    renderStreak();
    buildQuiz($('#vsQuiz', sec));
    buildTimer(sec);

    /* add "Learn" to the top navigation */
    try {
      var links = document.querySelectorAll('a[href="#library"]');
      for (var k = 0; k < links.length; k++) {
        if (!links[k].closest('nav')) continue;
        var l = links[k].cloneNode(false);
        l.href = '#learn'; l.textContent = 'Learn';
        links[k].parentNode.insertBefore(l, links[k]);
      }
    } catch (e) {}
  }

  /* ---------- quiz ---------- */
  function buildQuiz(box) {
    var qs = [], qi = 0, score = 0;
    function pick() {
      qs = []; var s = (dayNumber() * 5) % QUIZ.length;
      for (var i = 0; i < 5; i++) qs.push(QUIZ[(s + i) % QUIZ.length]);
      qi = 0; score = 0;
    }
    function intro() {
      box.innerHTML = '';
      var done = load('vs_quizdone') === today();
      box.appendChild(el('p', '', done ? 'You finished today\'s quiz. Play again for practice!' : 'Answer 5 quick questions and earn 25 XP.'));
      var b = el('button', 'vs-btn', done ? 'Play again' : 'Start quiz');
      b.onclick = function () { pick(); show(); };
      box.appendChild(b);
    }
    function show() {
      box.innerHTML = '';
      var q = qs[qi];
      box.appendChild(el('div', 'vs-muted', 'Question ' + (qi + 1) + ' of 5'));
      box.appendChild(el('p', '', q.q));
      var fb = el('p', 'vs-muted');
      var answered = false;
      q.o.forEach(function (txt, idx) {
        var o = el('button', 'vs-opt', txt);
        o.onclick = function () {
          if (answered) return; answered = true;
          var all = box.querySelectorAll('.vs-opt');
          all[q.a].classList.add('ok');
          if (idx === q.a) { score++; fb.textContent = '✅ Correct! ' + q.e; }
          else { o.classList.add('bad'); fb.textContent = '❌ Not quite. ' + q.e; }
          nextBtn.style.display = 'inline-block';
        };
        box.appendChild(o);
      });
      box.appendChild(fb);
      var nextBtn = el('button', 'vs-btn', qi === 4 ? 'See result' : 'Next');
      nextBtn.style.display = 'none';
      nextBtn.onclick = function () { qi++; if (qi < 5) show(); else result(); };
      box.appendChild(nextBtn);
    }
    function result() {
      box.innerHTML = '';
      var first = load('vs_quizdone') !== today();
      box.appendChild(el('div', 'vs-big', score + '/5'));
      box.appendChild(el('p', '', score === 5 ? 'Perfect! You are a star! 🌟' : score >= 3 ? 'Well done! Keep practising.' : 'Good try. Revise and try again!'));
      if (first) { save('vs_quizdone', today()); studied(25); box.appendChild(el('p', 'vs-muted', '+25 XP earned. Streak updated.')); }
      var b = el('button', 'vs-btn alt', 'Back');
      b.onclick = intro;
      box.appendChild(b);
    }
    intro();
  }

  /* ---------- focus timer ---------- */
  function buildTimer(sec) {
    var mins = 25, left = mins * 60, id = null;
    var timeEl = $('#vsTime', sec), startEl = $('#vsStart', sec), resetEl = $('#vsReset', sec), msg = $('#vsTimerMsg', sec);
    function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
    function paint() { timeEl.textContent = fmt(left); }
    function stop() { if (id) { clearInterval(id); id = null; } startEl.textContent = 'Start'; }
    var modesEl = $('#vsModes', sec);
    [15, 25, 45].forEach(function (m) {
      var b = el('button', 'vs-btn ' + (m === mins ? '' : 'alt'), m + ' min');
      b.onclick = function () {
        stop(); mins = m; left = m * 60; paint();
        var bs = modesEl.querySelectorAll('button');
        for (var i = 0; i < bs.length; i++) bs[i].className = 'vs-btn alt';
        b.className = 'vs-btn';
      };
      modesEl.appendChild(b);
    });
    startEl.onclick = function () {
      if (id) { stop(); return; }
      startEl.textContent = 'Pause';
      id = setInterval(function () {
        left--; paint();
        if (left <= 0) {
          stop(); left = mins * 60; paint();
          studied(15);
          msg.textContent = '🎉 Session complete! +15 XP. Take a 5-minute break.';
          try { if (navigator.vibrate) navigator.vibrate([300, 150, 300]); } catch (e) {}
        }
      }, 1000);
    };
    resetEl.onclick = function () { stop(); left = mins * 60; paint(); };
  }

  /* ==========================================================
     4. AI GEM
     ========================================================== */
  /* Built-in concept library (works with no internet or server). */
  var KB = [
    { k: ['photosynthesis', 'प्रकाश संश्लेषण', 'prakash sanshleshan'], t: 'Photosynthesis',
      simple: 'Plants make their own food using sunlight, water and carbon dioxide from the air. The green part (chlorophyll) catches the sunlight. The plant makes sugar for energy and gives out oxygen for us to breathe.',
      analogy: 'A leaf is like a small kitchen. Sunlight is the gas stove, water and air are the ingredients, and sugar is the food that gets cooked.',
      points: ['Equation: 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2', 'Happens in chloroplasts (they contain chlorophyll)', 'Gases enter through stomata', 'Needs: sunlight, water, CO2, chlorophyll'],
      hi: 'पौधे सूरज की रोशनी, पानी और कार्बन डाइऑक्साइड से अपना भोजन बनाते हैं और ऑक्सीजन छोड़ते हैं।' },
    { k: ['gravity', 'gravitation', 'गुरुत्वाकर्षण', 'gurutvakarshan'], t: 'Gravity',
      simple: 'Gravity is the invisible pull between any two objects. The bigger the object, the stronger the pull. Earth is huge, so it pulls everything towards its centre. That is why a ball you throw up comes back down.',
      analogy: 'Imagine the Earth is a giant magnet that attracts everything, not only iron.',
      points: ['Newton: every mass attracts every other mass', 'F = G m1 m2 / r^2', 'g = 9.8 m/s^2 on Earth', 'Weight = mass x g; mass stays same everywhere, weight changes'],
      hi: 'गुरुत्वाकर्षण वह अदृश्य खिंचाव है जिससे पृथ्वी हर चीज़ को अपनी ओर खींचती है।' },
    { k: ['newton', 'laws of motion', 'inertia', 'न्यूटन'], t: "Newton's Laws of Motion",
      simple: '1) A thing at rest stays at rest, and a moving thing keeps moving, unless a force acts on it. 2) A bigger push makes a bigger change in speed, and a heavier thing needs more push. 3) Every action has an equal and opposite reaction.',
      analogy: 'When a bus suddenly stops, you lurch forward. Your body wants to keep moving (1st law). When you push a wall, the wall pushes you back (3rd law).',
      points: ['1st law: inertia', '2nd law: F = m x a', '3rd law: action and reaction are equal and opposite, on different bodies', 'SI unit of force: newton (N)'],
      hi: 'बिना बल के वस्तु की अवस्था नहीं बदलती; F = m x a; हर क्रिया की बराबर और विपरीत प्रतिक्रिया होती है।' },
    { k: ['ohm', 'current', 'voltage', 'electric', 'electricity', 'बिजली', 'resistance'], t: "Electricity and Ohm's Law",
      simple: 'Electric current is the flow of tiny charged particles (electrons) through a wire. Voltage is the push that makes them flow, and resistance is how much the wire resists the flow. Ohm\'s law links the three: more push means more current, more resistance means less current.',
      analogy: 'Think of water in a pipe. Voltage is the water pressure, current is how much water flows, and resistance is how narrow the pipe is.',
      points: ['V = I x R', 'Current unit: ampere (A); voltage: volt (V); resistance: ohm', 'Series: same current; Parallel: same voltage', 'Metals conduct well; rubber and plastic insulate'],
      hi: 'वोल्टेज धक्का है, करंट प्रवाह है और प्रतिरोध रुकावट है। V = I x R।' },
    { k: ['atom', 'electron', 'proton', 'neutron', 'परमाणु'], t: 'Atom',
      simple: 'Everything is made of tiny building blocks called atoms. In the middle is the nucleus with protons (positive) and neutrons (no charge). Electrons (negative) move around it.',
      analogy: 'An atom is like a tiny solar system. The nucleus is the Sun and the electrons are planets going around it.',
      points: ['Proton: +1, Neutron: 0, Electron: -1', 'Atomic number = number of protons', 'Mass number = protons + neutrons', 'Atom is electrically neutral'],
      hi: 'सब कुछ परमाणुओं से बना है। नाभिक में प्रोटॉन और न्यूट्रॉन होते हैं और इलेक्ट्रॉन उसके चारों ओर घूमते हैं।' },
    { k: ['democracy', 'लोकतंत्र', 'loktantra'], t: 'Democracy',
      simple: 'Democracy means the people choose who governs them, by voting. Everyone is equal and has the right to speak, vote and ask questions. Leaders have to answer to the people.',
      analogy: 'Like a class choosing its monitor by vote. The monitor works for the class, not the other way round.',
      points: ['Features: free and fair elections, equal rights, rule of law, accountability', 'India is the largest democracy in the world', 'Universal adult franchise: every citizen 18+ can vote'],
      hi: 'लोकतंत्र में जनता वोट देकर अपनी सरकार चुनती है और हर नागरिक बराबर होता है।' },
    { k: ['fundamental rights', 'मौलिक अधिकार', 'right to equality', 'right to education'], t: 'Fundamental Rights (India)',
      simple: 'Fundamental Rights are basic freedoms every citizen of India has, which no one can take away unfairly. They protect you from unfair treatment, and you can go to court if they are violated.',
      analogy: 'They are like a safety shield that the Constitution gives every citizen.',
      points: ['Six rights: Equality, Freedom, Against Exploitation, Freedom of Religion, Cultural and Educational Rights, Constitutional Remedies', 'Part III, Articles 12 to 35', 'Right to Education (Art. 21A): free and compulsory for ages 6 to 14'],
      hi: 'मौलिक अधिकार संविधान द्वारा हर नागरिक को दी गई बुनियादी आज़ादियाँ हैं।' },
    { k: ['inflation', 'महंगाई', 'mehngai'], t: 'Inflation',
      simple: 'Inflation means prices of things slowly go up over time, so the same money buys less. A sweet that cost 5 rupees years ago may cost 10 now.',
      analogy: 'Your 100 rupee note slowly shrinks in power, like a balloon losing air.',
      points: ['Measured by CPI (Consumer Price Index)', 'Causes: demand-pull, cost-push', 'Controlled by RBI via interest rates and money supply'],
      hi: 'महंगाई का मतलब है चीज़ों के दाम बढ़ना, जिससे उतने ही पैसों में कम सामान मिलता है।' },
    { k: ['gdp', 'gross domestic product', 'सकल घरेलू'], t: 'GDP',
      simple: 'GDP is the total value of all goods and services made inside a country in one year. It shows how big a country\'s economy is.',
      analogy: 'If a village is one big shop, GDP is the total money value of everything the village made and sold in a year.',
      points: ['GDP = C + I + G + (X - M)', 'Real GDP removes the effect of inflation', 'GDP per capita = GDP / population'],
      hi: 'जीडीपी एक साल में देश में बनी सभी वस्तुओं और सेवाओं का कुल मूल्य है।' },
    { k: ['monsoon', 'मानसून', 'rainfall'], t: 'Monsoon',
      simple: 'In summer, land heats up faster than the sea. Hot air over land rises, and cool, wet wind from the ocean rushes in to fill the gap. This wind brings the heavy rain we get from June to September.',
      analogy: 'Like a fan pulling cool air into a hot room. The "cool air" here carries rain clouds.',
      points: ['South-West monsoon arrives around 1 June at Kerala', 'Caused by differential heating of land and sea', 'Retreating monsoon: Oct to Nov', 'Vital for Kharif crops like rice'],
      hi: 'गर्मी में ज़मीन गर्म होने पर समुद्र की नम हवाएँ आती हैं और बारिश लाती हैं।' },
    { k: ['pythagoras', 'pythagorean', 'hypotenuse', 'पाइथागोरस'], t: 'Pythagoras Theorem',
      simple: 'In a right-angled triangle, if you make a square on each of the two shorter sides, their areas added together equal the area of the square on the longest side.',
      analogy: 'A ladder leaning on a wall: ladder length, wall height and ground distance are linked by this rule.',
      points: ['a^2 + b^2 = c^2 (c is the hypotenuse)', 'Example: 3, 4, 5 -> 9 + 16 = 25', 'Works only for right-angled triangles'],
      hi: 'समकोण त्रिभुज में कर्ण का वर्ग = अन्य दोनों भुजाओं के वर्गों का योग।' },
    { k: ['fraction', 'भिन्न', 'numerator', 'denominator'], t: 'Fractions',
      simple: 'A fraction shows a part of a whole. The bottom number says into how many equal parts the whole is cut, and the top number says how many parts you take.',
      analogy: 'If a roti is cut into 4 equal pieces and you eat 1, you ate 1/4 of the roti.',
      points: ['Numerator on top, denominator at bottom', 'To add: make denominators same first', 'Equivalent fractions: 1/2 = 2/4 = 3/6'],
      hi: 'भिन्न किसी पूरी चीज़ का एक हिस्सा बताती है, जैसे 1/4 मतलब चार बराबर हिस्सों में से एक।' },
    { k: ['percentage', 'percent', 'प्रतिशत'], t: 'Percentage',
      simple: 'Percent means "out of 100". 40% means 40 out of every 100. To find a percentage of a number, divide by 100 and multiply.',
      analogy: 'If you score 40 out of 50, that is like 80 out of 100, so 80%.',
      points: ['x% of N = (x / 100) x N', 'Percentage = (part / whole) x 100', 'Percentage increase = (change / original) x 100'],
      hi: 'प्रतिशत का मतलब है "प्रति सौ"। 40% यानी 100 में से 40।' },
    { k: ['greenhouse', 'global warming', 'climate change', 'ग्लोबल वार्मिंग'], t: 'Global Warming and Greenhouse Effect',
      simple: 'Some gases in the air, like carbon dioxide, trap the Sun\'s heat like a blanket. A little is good, as it keeps Earth warm. But burning coal, petrol and cutting forests adds too much, so the Earth is getting hotter.',
      analogy: 'It is like sitting in a car with closed windows on a sunny day. The heat gets in but cannot get out.',
      points: ['Greenhouse gases: CO2, methane, nitrous oxide, water vapour', 'Effects: melting glaciers, sea level rise, extreme weather', 'Solutions: solar, trees, public transport, saving energy'],
      hi: 'कार्बन डाइऑक्साइड जैसी गैसें गर्मी रोक लेती हैं, जिससे धरती गर्म हो रही है।' },
    { k: ['acid', 'base', 'alkali', 'ph scale', 'अम्ल', 'क्षार'], t: 'Acids and Bases',
      simple: 'Acids taste sour (like lemon) and bases feel soapy and taste bitter. The pH scale tells which is which: below 7 is acid, 7 is neutral (pure water), above 7 is base.',
      analogy: 'The pH scale is like a thermometer for sourness: low is very sour, high is very soapy.',
      points: ['Litmus: acid turns blue to red; base turns red to blue', 'Acid + base -> salt + water (neutralisation)', 'Never taste unknown chemicals'],
      hi: 'अम्ल खट्टे होते हैं और क्षार साबुन जैसे। pH 7 से कम अम्ल, 7 उदासीन, 7 से अधिक क्षार।' },
    { k: ['cell', 'mitochondria', 'nucleus', 'कोशिका'], t: 'The Cell',
      simple: 'The cell is the smallest living building block. Your body is made of trillions of cells. Each cell has a nucleus (the boss with the instructions), mitochondria (power plants) and a membrane (the gate).',
      analogy: 'A cell is like a tiny factory: the nucleus is the office, mitochondria are the power house, and the membrane is the gate.',
      points: ['Plant cells have a cell wall and chloroplasts; animal cells do not', 'Mitochondria produce energy (ATP)', 'Robert Hooke discovered cells in 1665'],
      hi: 'कोशिका जीवन की सबसे छोटी इकाई है। केंद्रक उसका नियंत्रण कक्ष है।' },
    { k: ['water cycle', 'evaporation', 'condensation', 'जल चक्र'], t: 'Water Cycle',
      simple: 'The Sun heats water in rivers and seas and it turns into vapour and rises. High up it cools and forms clouds. Then it falls as rain, flows back into rivers and the cycle repeats.',
      analogy: 'It is like boiling water in a pot with a lid. The vapour sticks to the lid and drops back down.',
      points: ['Stages: evaporation, condensation, precipitation, collection', 'Transpiration: water vapour from plants', 'Water is never lost, only recycled'],
      hi: 'सूरज से पानी भाप बनकर बादल बनता है, फिर बारिश बनकर वापस आता है।' }
  ];

  var level = 'simple';
  var history = [];

  function kbMatch(q) {
    var s = q.toLowerCase(), best = null, bestScore = 0;
    KB.forEach(function (e) {
      var sc = 0;
      e.k.forEach(function (w) { if (s.indexOf(w) > -1) sc += w.length; });
      if (sc > bestScore) { bestScore = sc; best = e; }
    });
    return best;
  }

  function localAnswer(q) {
    if (/^\s*(hi|hello|hey|namaste|नमस्ते|hii+)\b/i.test(q)) {
      return [{ t: 'p', x: 'Namaste! I am AI Gem 💎. Ask me any concept from school or college and I will explain it in simple words.' }];
    }
    var e = kbMatch(q);
    if (!e) {
      var topics = KB.map(function (x) { return x.t; }).join(', ');
      return [
        { t: 'p', x: 'I could not find that topic in my offline library yet.' },
        { t: 'p', x: 'Try asking about: ' + topics + '.' },
        { t: 'p', x: 'You can also try rewording with the main keyword, for example "explain gravity".' }
      ];
    }
    var out = [{ t: 'h', x: e.t }];
    if (level === 'exam') {
      out.push({ t: 'p', x: e.simple });
      e.points.forEach(function (p) { out.push({ t: 'li', x: p }); });
    } else if (level === 'kid') {
      out.push({ t: 'p', x: e.analogy });
      out.push({ t: 'p', x: 'In short: ' + e.simple.split('. ')[0].replace(/\.$/, '') + '.' });
    } else {
      out.push({ t: 'p', x: e.simple });
      out.push({ t: 'p', x: 'Example: ' + e.analogy });
    }
    out.push({ t: 'hi', x: 'हिंदी में: ' + e.hi });
    return out;
  }

  function remoteAnswer(q) {
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 25000);
    return fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, level: level, history: history.slice(-6) }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }).then(function (j) {
      if (!j || !j.answer) throw new Error('empty');
      return String(j.answer).split(/\n+/).filter(Boolean).map(function (line) {
        var m = line.match(/^\s*[-*•]\s+(.*)/);
        return m ? { t: 'li', x: m[1] } : { t: 'p', x: line.replace(/[*#]+/g, '') };
      });
    });
  }

  function buildGem() {
    var fab = el('button', 'gem-fab', '💎 AI Gem');
    fab.setAttribute('aria-label', 'Open AI Gem, the study helper');
    var p = el('div', 'gem-panel');
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'AI Gem');
    p.innerHTML =
      '<div class="gem-head"><div><b>💎 AI Gem</b><small>Ask anything. I explain it simply.</small></div><button class="gem-x" aria-label="Close">×</button></div>' +
      '<div class="gem-level"><button data-l="simple" class="on">Simple</button><button data-l="kid">Like I\'m 10</button><button data-l="exam">Exam notes</button></div>' +
      '<div class="gem-log" id="gemLog"></div>' +
      '<div class="gem-chips" id="gemChips"></div>' +
      '<form class="gem-form"><button type="button" class="mic" id="gemMic" aria-label="Speak your question">🎤</button>' +
      '<input id="gemIn" type="text" placeholder="Type a topic or question..." autocomplete="off" maxlength="300"><button type="submit">Ask</button></form>' +
      '<div class="gem-note" id="gemNote"></div>';
    document.body.appendChild(fab);
    document.body.appendChild(p);

    var log = $('#gemLog', p), inp = $('#gemIn', p), chips = $('#gemChips', p);
    $('#gemNote', p).textContent = AI_ENDPOINT
      ? 'AI answers can be wrong. Check important facts with your teacher or textbook.'
      : 'Offline mode: I know popular school topics. Check facts with your teacher or textbook.';

    function render(box, blocks) {
      var ul = null;
      blocks.forEach(function (b) {
        if (b.t === 'li') {
          if (!ul) { ul = el('ul'); box.appendChild(ul); }
          ul.appendChild(el('li', '', b.x));
        } else {
          ul = null;
          var n = el('p', b.t === 'hi' ? 'hi' : '', b.x);
          if (b.t === 'h') n.style.fontWeight = '700';
          box.appendChild(n);
        }
      });
    }
    function add(role, blocks) {
      var m = el('div', 'gem-msg ' + role);
      render(m, typeof blocks === 'string' ? [{ t: 'p', x: blocks }] : blocks);
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
      return m;
    }
    function ask(q) {
      q = (q || '').trim();
      if (!q) return;
      add('me', q);
      inp.value = '';
      history.push({ role: 'user', content: q });
      studied(2);
      var finish = function (blocks) {
        add('ai', blocks);
        history.push({ role: 'assistant', content: blocks.map(function (b) { return b.x; }).join(' ').slice(0, 500) });
      };
      if (AI_ENDPOINT) {
        var wait = add('ai', 'Thinking...');
        remoteAnswer(q).then(function (blocks) {
          log.removeChild(wait); finish(blocks);
        }).catch(function () {
          log.removeChild(wait);
          var fb = localAnswer(q);
          fb.unshift({ t: 'p', x: 'The AI server is not reachable right now, so here is my offline answer.' });
          finish(fb);
        });
      } else {
        setTimeout(function () { finish(localAnswer(q)); }, 350);
      }
    }

    ['Explain photosynthesis', 'What is gravity?', 'Explain democracy', "Newton's laws", 'What is inflation?'].forEach(function (c) {
      var b = el('button', '', c);
      b.type = 'button';
      b.onclick = function () { ask(c); };
      chips.appendChild(b);
    });

    var lvls = p.querySelectorAll('.gem-level button');
    for (var i = 0; i < lvls.length; i++) {
      lvls[i].onclick = function () {
        level = this.getAttribute('data-l');
        for (var j = 0; j < lvls.length; j++) lvls[j].className = '';
        this.className = 'on';
      };
    }

    $('form', p).addEventListener('submit', function (ev) { ev.preventDefault(); ask(inp.value); });
    fab.onclick = function () {
      p.classList.add('open'); fab.style.display = 'none'; inp.focus();
      if (!log.children.length) add('ai', [
        { t: 'p', x: 'Namaste! I am AI Gem 💎, your study helper.' },
        { t: 'p', x: 'Ask me any concept and I will explain it in simple words. Choose "Like I\'m 10" for the easiest explanation.' }
      ]);
    };
    $('.gem-x', p).onclick = function () { p.classList.remove('open'); fab.style.display = ''; };

    /* voice input (uses the browser's speech recognition where available) */
    var mic = $('#gemMic', p);
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { mic.style.display = 'none'; }
    else {
      mic.onclick = function () {
        try {
          var r = new SR();
          r.lang = (document.documentElement.lang === 'hi') ? 'hi-IN' : 'en-IN';
          r.onresult = function (e) { inp.value = e.results[0][0].transcript; ask(inp.value); };
          r.start();
        } catch (e) {}
      };
    }
  }

  /* ==========================================================
     5. CLOSING MOTIVATION LINE
     ========================================================== */
  function buildEnd() {
    var d = el('div', 'vs-end');
    d.appendChild(el('p', '', 'Education is the most powerful weapon.'));
    d.appendChild(el('small', '', 'शिक्षा सबसे शक्तिशाली हथियार है।'));
    document.body.appendChild(d);
  }

  /* ---------- start ---------- */
  function init() {
    try { buildZone(); } catch (e) { if (window.console) console.error('VidyaSetu zone', e); }
    try { buildGem(); } catch (e) { if (window.console) console.error('AI Gem', e); }
    try { buildEnd(); } catch (e) { if (window.console) console.error('End line', e); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
