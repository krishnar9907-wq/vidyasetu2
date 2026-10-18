/* VidyaSetu NCERT Finder  v1.0
   Adds an "NCERT Textbooks" card: student picks class, subject and language,
   then opens the official NCERT page (or your direct book link if you added one).

   Install: add AFTER the extras script, before </body>:
       <script src="vidyasetu-ncert.js" defer></script>

   HOW TO ADD DIRECT BOOK LINKS (recommended, takes 5 minutes per class):
   1. Open https://ncert.nic.in/textbook.php in your browser.
   2. Choose the class and subject, open the book, copy the page or PDF address.
   3. Paste it into BOOKS below, one line per book, like the example.
   Check each link yourself. NCERT is replacing books class by class under the
   new curriculum, so book addresses can change. If a link is missing or
   not added, the button safely opens the official NCERT page instead. */
(function () {
  'use strict';
  if (window.__vsNcert) return;
  window.__vsNcert = true;

  var OFFICIAL = 'https://ncert.nic.in/textbook.php';

  var BOOKS = [
    /* Example (replace with a link you copied from ncert.nic.in):
    { c: 10, s: 'Science', l: 'English', u: 'https://ncert.nic.in/....' }, */
  ];

  var SUBJECTS = ['Maths', 'Science', 'Social Science', 'English', 'Hindi', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Political Science', 'Economics'];
  var LANGS = ['English', 'Hindi', 'Urdu'];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function select(opts, label) {
    var wrap = el('label');
    wrap.style.cssText = 'display:block;margin:0 0 10px;font-size:.85rem;color:#475569';
    wrap.appendChild(document.createTextNode(label));
    var s = el('select');
    s.style.cssText = 'display:block;width:100%;margin-top:4px;padding:10px;border:1px solid #cbd5e1;border-radius:10px;font-size:16px;background:#fff';
    opts.forEach(function (o) { var op = el('option', '', o.t); op.value = o.v; s.appendChild(op); });
    wrap.appendChild(s);
    return { wrap: wrap, sel: s };
  }

  function init() {
    var sec = el('section');
    sec.id = 'ncert';
    sec.style.cssText = 'max-width:1100px;margin:0 auto;padding:8px 16px 32px;font-family:inherit;color:#0f172a';
    var card = el('div');
    card.style.cssText = 'background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:18px;box-shadow:0 2px 10px rgba(15,23,42,.05)';
    card.appendChild(el('h2', '', '📘 NCERT Textbooks (Free, Official)')).style.cssText = 'font-size:1.3rem;margin:0 0 6px';
    var sub = el('p', '', 'Choose your class and subject to open the official NCERT book.');
    sub.style.cssText = 'margin:0 0 14px;color:#475569';
    card.appendChild(sub);

    var cls = select(Array.apply(null, Array(12)).map(function (_, i) { return { v: i + 1, t: 'Class ' + (i + 1) }; }), 'Class');
    var sbj = select(SUBJECTS.map(function (s) { return { v: s, t: s }; }), 'Subject');
    var lng = select(LANGS.map(function (l) { return { v: l, t: l }; }), 'Language');
    cls.sel.value = 10;
    card.appendChild(cls.wrap); card.appendChild(sbj.wrap); card.appendChild(lng.wrap);

    var btn = el('button', '', 'Open NCERT book ↗');
    btn.style.cssText = 'background:#115e59;color:#fff;border:0;border-radius:12px;padding:12px 18px;font-size:1rem;font-weight:600;cursor:pointer;min-height:44px';
    card.appendChild(btn);

    var note = el('p');
    note.style.cssText = 'margin:12px 0 0;font-size:.85rem;color:#64748b';
    card.appendChild(note);

    btn.onclick = function () {
      var c = Number(cls.sel.value), s = sbj.sel.value, l = lng.sel.value, url = null;
      for (var i = 0; i < BOOKS.length; i++) {
        if (BOOKS[i].c === c && BOOKS[i].s === s && BOOKS[i].l === l) { url = BOOKS[i].u; break; }
      }
      if (url) {
        note.textContent = 'Opening Class ' + c + ' ' + s + ' (' + l + ') on NCERT.';
      } else {
        url = OFFICIAL;
        note.textContent = 'Opening the official NCERT page. There, pick Class ' + c + ', then ' + s + ', then the book.';
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    var more = el('p');
    more.style.cssText = 'margin:12px 0 0;font-size:.85rem';
    var a = el('a', '', 'More free lessons on DIKSHA ↗');
    a.href = 'https://diksha.gov.in/'; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.style.color = '#115e59';
    more.appendChild(a);
    card.appendChild(more);
    sec.appendChild(card);

    var lib = document.getElementById('library');
    var anchor = lib ? (lib.closest('section') || lib) : null;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else document.body.appendChild(sec);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
