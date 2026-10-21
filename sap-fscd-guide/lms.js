/* Course shell for every page: top bar, course outline sidebar, progress
   tracking, lesson completion, previous/next navigation, dashboard and
   certificate. Progress is stored in this browser only (localStorage).
   Lesson pages:  <body data-lesson="ID">     Dashboard: <body data-page="dashboard">
   To add a lesson, add it to COURSE below and give its page data-lesson. */
(function () {
  var COURSE = {
    title: 'SAP FSCD for Business Analysts',
    brand: 'FSCD Academy',
    modules: [
      { title: 'FSCD foundations', lessons: [
        { id: 'basics', url: '/basics', title: 'FSCD basics, with a Danish example', mins: 25,
          blurb: 'Business partners, contract accounts, posting documents, open items, dunning and the daily money flow.' }
      ] },
      { title: 'Payments in the Nordics', lessons: [
        { id: 'payments', url: '/payments', title: 'Nordic payment methods', mins: 15,
          blurb: 'Direct debit, reference numbers, e-invoices, MobilePay, Swish and Vipps, and how claims are paid out.' }
      ] },
      { title: 'Collections in depth', lessons: [
        { id: 'dunning', url: '/dunning', title: 'Dunning, returns and collections', mins: 20,
          blurb: 'Dunning levels and runs, locks, bounced payments, instalment plans, write-offs and the Danish rules behind them.' }
      ] },
      { title: 'Finance and period-end', lessons: [
        { id: 'accounting', url: '/accounting', title: 'From FSCD to the general ledger', mins: 20,
          blurb: 'Account determination, journal entries, reconciliation keys, the GL transfer, reconciliation and month-end.' }
      ] },
      { title: 'Beyond FSCD: SAP BRIM', lessons: [
        { id: 'brim', url: '/brim', title: 'SAP BRIM for insurance', mins: 20,
          blurb: 'Subscriptions, usage-based pricing, convergent invoicing and partner settlement, and how BRIM works next to FSCD.' }
      ] }
    ]
  };
  var KEY = 'fscd-academy-progress-v1';
  var PASS = 7;

  var lessons = [];
  COURSE.modules.forEach(function (m, mi) {
    m.lessons.forEach(function (l) { l.module = mi; l.index = lessons.length; lessons.push(l); });
  });

  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.lessons) return s; } catch (e) {}
    return { lessons: {} };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  var state = load();
  function rec(id) { return state.lessons[id] || (state.lessons[id] = {}); }
  function doneCount() { return lessons.filter(function (l) { return rec(l.id).done; }).length; }
  function pct() { return Math.round(doneCount() / lessons.length * 100); }
  function nextUp() {
    var last = lessons.filter(function (l) { return l.id === state.last; })[0];
    if (last && !rec(last.id).done) return last;
    return lessons.filter(function (l) { return !rec(l.id).done; })[0] || null;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function link(href, cls, text) { var a = el('a', cls, text); a.href = href; return a; }

  var body = document.body;
  var lessonId = body.getAttribute('data-lesson');
  var lesson = lessons.filter(function (l) { return l.id === lessonId; })[0];
  var isDash = body.getAttribute('data-page') === 'dashboard';
  var main = document.querySelector('main');
  if (main && !main.id) main.id = 'content';

  /* ---------- Top bar (all pages) ---------- */
  var skip = link('#content', 'lms-skip', 'Skip to content');
  var bar = el('header', 'lms-bar');
  var menuBtn = null;
  if (lesson) {
    menuBtn = el('button', 'lms-menu', '☰');
    menuBtn.type = 'button';
    menuBtn.setAttribute('aria-label', 'Open course menu');
    menuBtn.setAttribute('aria-expanded', 'false');
    bar.appendChild(menuBtn);
  }
  var brand = link('/', 'lms-brand');
  brand.appendChild(el('span', 'lms-logo', 'FS'));
  brand.appendChild(el('span', 'lms-brand-t', COURSE.brand));
  bar.appendChild(brand);
  var prog = el('div', 'lms-prog');
  var progText = el('span', 'lms-prog-t');
  var track = el('span', 'lms-track');
  var fill = el('span');
  track.appendChild(fill);
  prog.appendChild(progText);
  prog.appendChild(track);
  bar.appendChild(prog);
  if (!isDash) bar.appendChild(link('/', 'lms-dash', 'Dashboard'));
  body.insertBefore(bar, body.firstChild);
  body.insertBefore(skip, body.firstChild);

  function paintProgress() {
    progText.textContent = doneCount() + ' of ' + lessons.length + ' lessons · ' + pct() + '%';
    fill.style.width = pct() + '%';
    prog.setAttribute('title', 'Course progress: ' + pct() + '%');
  }
  paintProgress();

  if (lesson) lessonPage();
  if (isDash) dashboard();

  /* ---------- Lesson page ---------- */
  function lessonPage() {
    var r = rec(lesson.id);
    r.visited = true;
    state.last = lesson.id;
    save();

    var read = el('div', 'lms-read');
    var readFill = el('span');
    read.appendChild(readFill);
    body.insertBefore(read, bar.nextSibling);
    function onScroll() {
      var h = document.documentElement.scrollHeight - innerHeight;
      readFill.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 100) + '%';
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Sidebar: course outline with this lesson's sections underneath
    var nav = document.getElementById('toc');
    var sectionLinks = {};
    if (nav) {
      nav.innerHTML = '';
      nav.setAttribute('aria-label', 'Course content');
      nav.appendChild(el('b', null, 'Course content'));
      var ol = el('ol', 'lms-outline');
      COURSE.modules.forEach(function (m, mi) {
        var li = el('li', 'lms-mod');
        li.appendChild(el('span', 'lms-mod-t', 'Module ' + (mi + 1) + ' · ' + m.title));
        var lol = el('ol');
        m.lessons.forEach(function (l) {
          var lli = el('li', 'lms-les' + (l === lesson ? ' cur' : '') + (rec(l.id).done ? ' done' : ''));
          var a = link(l.url);
          if (l === lesson) a.setAttribute('aria-current', 'page');
          a.appendChild(el('span', 'lms-ic', rec(l.id).done ? '✓' : String(l.index + 1)));
          var t = el('span', 'lms-les-t', l.title);
          t.appendChild(el('small', null, l.mins + ' min'));
          a.appendChild(t);
          lli.appendChild(a);
          if (l === lesson) {
            var sec = el('ol', 'lms-sec');
            document.querySelectorAll('main h2[id]').forEach(function (h) {
              var sli = el('li');
              var sa = link('#' + h.id, null, h.textContent);
              sectionLinks[h.id] = sa;
              sli.appendChild(sa);
              sec.appendChild(sli);
            });
            lli.appendChild(sec);
          }
          lol.appendChild(lli);
        });
        li.appendChild(lol);
        ol.appendChild(li);
      });
      nav.appendChild(ol);
      nav.addEventListener('click', function (ev) { if (ev.target.closest('a')) toggleMenu(false); });
    }

    function toggleMenu(open) {
      if (!menuBtn) return;
      body.classList.toggle('lms-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? '✕' : '☰';
    }
    if (menuBtn) menuBtn.addEventListener('click', function () { toggleMenu(!body.classList.contains('lms-open')); });

    // Highlight the section being read
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          Object.keys(sectionLinks).forEach(function (k) { sectionLinks[k].classList.toggle('on', k === en.target.id); });
        });
      }, { rootMargin: '-80px 0px -70% 0px' });
      document.querySelectorAll('main h2[id]').forEach(function (h) { io.observe(h); });
    }

    // Lesson header: breadcrumb and meta line
    var h1 = main.querySelector('h1');
    var crumbs = el('nav', 'lms-crumbs');
    crumbs.setAttribute('aria-label', 'Breadcrumb');
    crumbs.appendChild(link('/', null, 'Dashboard'));
    crumbs.appendChild(el('span', null, '›'));
    crumbs.appendChild(el('span', null, 'Module ' + (lesson.module + 1) + ': ' + COURSE.modules[lesson.module].title));
    crumbs.appendChild(el('span', null, '›'));
    crumbs.appendChild(el('span', null, 'Lesson ' + (lesson.index + 1) + ' of ' + lessons.length));
    main.insertBefore(crumbs, h1);
    var lede = h1.nextElementSibling;
    var meta = el('div', 'lms-meta');
    meta.appendChild(el('span', 'lms-chip', '⏱ ' + lesson.mins + ' min read'));
    meta.appendChild(el('span', 'lms-chip', '📝 10-question test'));
    var status = el('span', 'lms-chip');
    meta.appendChild(status);
    (lede && lede.classList.contains('lede') ? lede : h1).insertAdjacentElement('afterend', meta);

    // Completion box and previous / next
    var footer = main.querySelector('footer');
    var box = el('section', 'lms-complete');
    box.setAttribute('aria-label', 'Lesson completion');
    var boxText = el('div');
    var boxTitle = el('b');
    var boxSub = el('p');
    boxText.appendChild(boxTitle);
    boxText.appendChild(boxSub);
    var toggle = el('button', 'lms-btn');
    toggle.type = 'button';
    box.appendChild(boxText);
    box.appendChild(toggle);
    main.insertBefore(box, footer);
    toggle.addEventListener('click', function () { setDone(!rec(lesson.id).done); });

    var pn = el('nav', 'lms-pn');
    pn.setAttribute('aria-label', 'Lesson navigation');
    var prev = lessons[lesson.index - 1];
    var next = lessons[lesson.index + 1];
    pn.appendChild(prev ? card(prev.url, '← Previous lesson', prev.title, 'prev') : el('span'));
    pn.appendChild(next ? card(next.url, 'Next lesson →', next.title, 'next')
                        : card('/', 'Finish →', 'Back to your dashboard', 'next'));
    main.insertBefore(pn, footer);
    function card(href, small, title, cls) {
      var a = link(href, 'lms-pn-' + cls);
      a.appendChild(el('small', null, small));
      a.appendChild(el('b', null, title));
      return a;
    }

    function paintLesson() {
      var r2 = rec(lesson.id);
      status.textContent = r2.done ? '✓ Completed' : 'In progress';
      status.classList.toggle('ok', !!r2.done);
      boxTitle.textContent = r2.done ? '✓ Lesson completed' : 'Finished this lesson?';
      boxSub.textContent = r2.done
        ? 'Nice work! ' + (r2.best != null ? 'Your best test score: ' + r2.best + '/' + r2.total + '. ' : '') + 'Carry on with the next lesson.'
        : 'Mark it as complete to track your progress. Scoring ' + PASS + '/10 or more on the test completes it automatically.';
      toggle.textContent = r2.done ? 'Mark as not complete' : 'Mark as complete';
      toggle.classList.toggle('alt', !!r2.done);
      var me = nav && nav.querySelector('.lms-les.cur');
      if (me) {
        me.classList.toggle('done', !!r2.done);
        me.querySelector('.lms-ic').textContent = r2.done ? '✓' : String(lesson.index + 1);
      }
      paintProgress();
    }
    function setDone(v) {
      var r2 = rec(lesson.id);
      r2.done = v;
      if (v) r2.doneAt = new Date().toISOString(); else delete r2.doneAt;
      save();
      paintLesson();
    }
    paintLesson();

    document.addEventListener('quiz:submitted', function (ev) {
      var d = ev.detail, r2 = rec(lesson.id);
      if (r2.best == null || d.score > r2.best) { r2.best = d.score; r2.total = d.total; }
      r2.attempts = (r2.attempts || 0) + 1;
      save();
      if (d.score >= PASS && !r2.done) setDone(true); else paintLesson();
    });
  }

  /* ---------- Dashboard ---------- */
  function dashboard() {
    // Old links to sections of the guide used to live on the home page
    if (location.hash && !document.getElementById(location.hash.slice(1))) {
      location.replace('/basics' + location.hash);
      return;
    }
    var root = document.getElementById('lms-dashboard');
    if (!root) return;

    function render() {
      root.innerHTML = '';
      paintProgress();
      var done = doneCount();
      var up = nextUp();

      var hero = el('section', 'lms-hero');
      var ht = el('div');
      ht.appendChild(el('p', 'lms-kicker', 'Self-paced course · ' + lessons.length + ' lessons · ' +
        lessons.reduce(function (s, l) { return s + l.mins; }, 0) + ' min'));
      ht.appendChild(el('h1', null, COURSE.title));
      ht.appendChild(el('p', 'lede', 'Learn SAP FSCD the simple way: plain English, real insurance stories from Denmark, Sweden and Norway, pictures of the key screens, and a short test after every lesson.'));
      var go = link(up ? up.url : lessons[0].url, 'lms-btn big',
        done === 0 ? 'Start the course →' : up ? 'Continue: ' + up.title + ' →' : 'Review the course');
      ht.appendChild(go);
      hero.appendChild(ht);

      var ring = el('div', 'lms-ring');
      ring.style.setProperty('--p', pct());
      ring.appendChild(el('b', null, pct() + '%'));
      ring.appendChild(el('span', null, done + ' of ' + lessons.length + ' lessons'));
      hero.appendChild(ring);
      root.appendChild(hero);

      root.appendChild(el('h2', null, 'Course content'));
      COURSE.modules.forEach(function (m, mi) {
        var mod = el('section', 'lms-modcard');
        var mh = el('div', 'lms-modhead');
        mh.appendChild(el('span', 'lms-modnum', 'Module ' + (mi + 1)));
        mh.appendChild(el('h3', null, m.title));
        mod.appendChild(mh);
        m.lessons.forEach(function (l) {
          var r = rec(l.id);
          var row = el('div', 'lms-row' + (r.done ? ' done' : ''));
          row.appendChild(el('span', 'lms-ic', r.done ? '✓' : String(l.index + 1)));
          var info = el('div', 'lms-row-info');
          info.appendChild(link(l.url, 'lms-row-t', l.title));
          info.appendChild(el('p', null, l.blurb));
          var facts = el('p', 'lms-facts');
          facts.textContent = '⏱ ' + l.mins + ' min · ' +
            (r.best != null ? 'Best test score ' + r.best + '/' + r.total : 'Test not taken yet') +
            (r.done ? ' · Completed' : r.visited ? ' · In progress' : '');
          info.appendChild(facts);
          row.appendChild(info);
          row.appendChild(link(l.url, 'lms-btn' + (r.done ? ' alt' : ''), r.done ? 'Review' : r.visited ? 'Continue' : 'Start'));
          mod.appendChild(row);
        });
        root.appendChild(mod);
      });

      root.appendChild(el('h2', null, 'Your certificate'));
      var cert = el('section', 'lms-certbox');
      if (done < lessons.length) {
        cert.appendChild(el('p', 'lms-lock', '🔒 Complete all ' + lessons.length + ' lessons to unlock your certificate of completion. ' +
          (lessons.length - done) + ' to go!'));
      } else {
        cert.appendChild(el('p', null, '🎉 Congratulations! You have completed the course. Type your name to create your certificate.'));
        var f = el('form', 'lms-certform');
        var inp = el('input');
        inp.placeholder = 'Your full name';
        inp.value = state.name || '';
        inp.maxLength = 80;
        inp.setAttribute('aria-label', 'Your full name');
        var b = el('button', 'lms-btn', 'Show certificate');
        b.type = 'submit';
        f.appendChild(inp);
        f.appendChild(b);
        cert.appendChild(f);
        var paper = el('div', 'lms-cert');
        cert.appendChild(paper);
        f.addEventListener('submit', function (ev) {
          ev.preventDefault();
          state.name = inp.value.trim();
          save();
          drawCert(paper);
        });
        if (state.name) drawCert(paper);
      }
      root.appendChild(cert);

      var foot = el('p', 'lms-note');
      foot.appendChild(document.createTextNode('Your progress is saved in this browser only. '));
      var reset = el('button', 'lms-linkbtn', 'Reset my progress');
      reset.type = 'button';
      reset.addEventListener('click', function () {
        if (confirm('Reset all lesson progress and test scores in this browser?')) {
          state = { lessons: {} };
          save();
          render();
        }
      });
      foot.appendChild(reset);
      root.appendChild(foot);
    }

    function drawCert(paper) {
      paper.innerHTML = '';
      if (!state.name) return;
      var lastDone = lessons.map(function (l) { return rec(l.id).doneAt || ''; }).sort().pop();
      var when = lastDone ? new Date(lastDone) : new Date();
      paper.appendChild(el('p', 'lms-cert-k', 'Certificate of completion'));
      paper.appendChild(el('p', null, 'This certifies that'));
      paper.appendChild(el('p', 'lms-cert-name', state.name));
      paper.appendChild(el('p', null, 'has completed the self-paced course'));
      paper.appendChild(el('p', 'lms-cert-course', COURSE.title));
      paper.appendChild(el('p', 'lms-cert-date', when.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
        ' · ' + COURSE.brand));
      var p = el('button', 'lms-btn alt lms-noprint', 'Print or save as PDF');
      p.type = 'button';
      p.addEventListener('click', function () { body.classList.add('lms-printing'); print(); body.classList.remove('lms-printing'); });
      paper.appendChild(p);
    }

    render();
  }
})();
