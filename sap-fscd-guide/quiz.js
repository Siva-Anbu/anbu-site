/* Page quiz: picks 10 random questions for this page from the question bank.
   The bank is stored in Cloudinary (folder sap-fscd-guide/quiz); a copy on this
   site is used as a fallback if Cloudinary can't be reached.
   Usage: <div id="quiz" data-page="guide"></div><script src="/quiz.js" defer></script> */
(function () {
  var CLOUDINARY = 'https://res.cloudinary.com/dnqfhp432/raw/upload/sap-fscd-guide/quiz/';
  var LOCAL = '/quiz/';
  var COUNT = 10;

  var box = document.getElementById('quiz');
  if (!box) return;
  var page = box.getAttribute('data-page');
  var bank = [];

  var css = document.createElement('style');
  css.textContent =
    '.qz-q{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px 16px;margin:12px 0}' +
    '.qz-q legend{font-weight:600;padding:0 4px}' +
    '.qz-q fieldset{border:0;margin:0;padding:0}' +
    '.qz-opt{display:flex;gap:10px;align-items:flex-start;padding:7px 10px;margin:4px 0;border:1px solid var(--line);border-radius:6px;cursor:pointer;font-size:15px}' +
    '.qz-opt:hover{border-color:var(--accent)}' +
    '.qz-opt input{margin-top:5px;flex:none}' +
    '.qz-opt.right{border-color:var(--ok);background:color-mix(in srgb,var(--ok) 12%,transparent)}' +
    '.qz-opt.wrong{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 12%,transparent)}' +
    '.qz-done .qz-opt{cursor:default}' +
    '.qz-why{margin:8px 2px 0;font-size:14.5px}' +
    '.qz-why b{display:inline}' +
    '.qz-bar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:16px 0}' +
    '.qz-btn{font:inherit;font-weight:600;border:0;border-radius:6px;padding:9px 18px;background:var(--accent);color:#fff;cursor:pointer}' +
    '.qz-btn:disabled{opacity:.45;cursor:not-allowed}' +
    '.qz-btn.alt{background:transparent;color:var(--accent);border:1px solid var(--accent)}' +
    '.qz-note{color:var(--muted);font-size:14px}' +
    '.qz-score{font-size:1.15rem;font-weight:700;background:var(--tip);border:1px solid var(--tipline);border-radius:8px;padding:12px 16px;margin:12px 0}';
  document.head.appendChild(css);

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function getJson(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  function load() {
    return getJson(CLOUDINARY + page + '.json').catch(function () {
      return getJson(LOCAL + page + '.json');
    });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function render() {
    box.innerHTML = '';
    box.classList.remove('qz-done');
    var picked = shuffle(bank.slice()).slice(0, Math.min(COUNT, bank.length)).map(function (q) {
      var opts = q.options.map(function (text, i) { return { text: text, right: i === q.answer }; });
      return { q: q.q, reason: q.reason, options: shuffle(opts) };
    });

    var form = el('form');
    picked.forEach(function (q, qi) {
      var wrap = el('div', 'qz-q');
      var fs = el('fieldset');
      fs.appendChild(el('legend', null, (qi + 1) + '. ' + q.q));
      q.options.forEach(function (o, oi) {
        var lab = el('label', 'qz-opt');
        var inp = el('input');
        inp.type = 'radio';
        inp.name = 'q' + qi;
        inp.value = oi;
        lab.appendChild(inp);
        lab.appendChild(el('span', null, o.text));
        o.label = lab;
        fs.appendChild(lab);
      });
      wrap.appendChild(fs);
      q.wrap = wrap;
      form.appendChild(wrap);
    });

    var bar = el('div', 'qz-bar');
    var submit = el('button', 'qz-btn', 'Submit answers');
    submit.type = 'submit';
    submit.disabled = true;
    var note = el('span', 'qz-note', 'Answered 0 of ' + picked.length);
    bar.appendChild(submit);
    bar.appendChild(note);
    form.appendChild(bar);

    form.addEventListener('change', function () {
      var n = picked.filter(function (q, qi) { return form.querySelector('input[name="q' + qi + '"]:checked'); }).length;
      note.textContent = n === picked.length ? 'All answered. Ready to submit!' : 'Answered ' + n + ' of ' + picked.length;
      submit.disabled = n !== picked.length;
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var score = 0;
      picked.forEach(function (q, qi) {
        var chosen = +form.querySelector('input[name="q' + qi + '"]:checked').value;
        var ok = q.options[chosen].right;
        if (ok) score++;
        q.options.forEach(function (o, oi) {
          if (o.right) o.label.classList.add('right');
          else if (oi === chosen) o.label.classList.add('wrong');
        });
        var why = el('p', 'qz-why');
        var head = el('b', null, ok ? '✓ Correct. ' : '✗ Not quite. ');
        head.style.color = ok ? 'var(--ok)' : 'var(--bad)';
        why.appendChild(head);
        why.appendChild(document.createTextNode(q.reason));
        q.wrap.appendChild(why);
      });
      form.querySelectorAll('input').forEach(function (i) { i.disabled = true; });
      box.classList.add('qz-done');
      bar.innerHTML = '';
      var again = el('button', 'qz-btn', 'Try 10 new questions');
      again.type = 'button';
      again.addEventListener('click', function () { render(); box.scrollIntoView({ behavior: 'smooth' }); });
      bar.appendChild(again);
      var msg = score === picked.length ? 'Perfect score! 🎉' : score >= 7 ? 'Well done!' : 'Keep learning. Read the reasons below and try again.';
      var result = el('div', 'qz-score', 'You scored ' + score + ' out of ' + picked.length + '. ' + msg);
      box.insertBefore(result, form);
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    box.appendChild(form);
  }

  box.appendChild(el('p', 'qz-note', 'Loading questions…'));
  load().then(function (data) {
    bank = data.questions || [];
    render();
  }).catch(function () {
    box.innerHTML = '';
    box.appendChild(el('p', 'qz-note', 'Sorry, the questions could not be loaded. Please refresh the page.'));
  });
})();
