/* Course shell for every page: top bar, course outline sidebar, progress
   tracking, lesson completion, previous/next navigation, course dashboards,
   the all-courses home page and completion notes. Progress is stored in this
   browser only (localStorage), separately for each course.
   Lesson pages:  <body data-lesson="ID">
   Course dashboard: <body data-page="dashboard" data-course="COURSE-ID">
   Home page (all courses): <body data-page="home">
   To add a lesson, add it to its course in COURSES below and give its page data-lesson. */
(function () {
  var SITE = 'SAP Learning Notes';
  var COURSES = [
    {
      id: 'fscd', title: 'SAP FSCD for Business Analysts', brand: 'FSCD Notes', logo: 'FS',
      home: '/fscd', key: 'fscd-academy-progress-v1',
      lede: 'Study notes on SAP FSCD for people joining the SAP FI team: plain English, insurance examples from Denmark, Sweden and Norway, simple pictures and a short self-test after each lesson.',
      blurb: 'Insurance billing and payments: premiums, Nordic payment methods, dunning, the general ledger and SAP BRIM, told with a Danish insurer.',
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
        ] },
        { title: 'Quick reference: T-codes', lessons: [
          { id: 'tcodes', url: '/tcodes', title: 'Frequently used T-codes in FSCD', mins: 10, ref: true,
            blurb: 'A lookup list of the transaction codes you use most, grouped by topic. Reference only, no test.' }
        ] }
      ]
    },
    {
      id: 'fico', title: 'SAP FICO for Business Analysts', brand: 'FICO Notes', logo: 'FI',
      home: '/fico', key: 'fico-academy-progress-v1',
      lede: 'Study notes on SAP FICO for people joining the SAP FI team: plain English, one made-up Danish insurer followed through the year, simple diagrams and a short self-test after each lesson.',
      blurb: 'Financial accounting and controlling at a Danish insurer: the general ledger, suppliers, premiums, reserves, costs by line of business, the combined ratio and month-end.',
      modules: [
        { title: 'FICO foundations', lessons: [
          { id: 'fico-basics', url: '/fico/basics', title: 'FICO basics for an insurer, with a Danish example', mins: 25,
            blurb: 'What FI and CO are, where they sit next to the policy, claims and FS-CD systems, GL accounts, journal entries and the Universal Journal.' }
        ] },
        { title: 'Procure to pay', lessons: [
          { id: 'fico-ap', url: '/fico/ap', title: 'Accounts payable: buying and paying at an insurer', mins: 20,
            blurb: 'Suppliers, purchase orders, GR/IR, invoice matching, non-deductible VAT, the payment run, and what goes through FS-CD instead.' }
        ] },
        { title: 'Premium to cash', lessons: [
          { id: 'fico-ar', url: '/fico/ar', title: 'Premiums and receivables: from policy to cash', mins: 20,
            blurb: 'Premium billing from FS-CD into the general ledger, insurance tax, incoming payments, written and earned premium, and the unearned premium reserve.' }
        ] },
        { title: 'Controlling', lessons: [
          { id: 'fico-controlling', url: '/fico/controlling', title: 'Controlling: costs, lines of business and the combined ratio', mins: 20,
            blurb: 'Cost centres, internal orders, allocations, profit centres per line of business, and the loss, expense and combined ratios.' }
        ] },
        { title: 'Assets, reserves and closing', lessons: [
          { id: 'fico-close', url: '/fico/close', title: 'Fixed assets, insurance reserves and month-end close', mins: 20,
            blurb: 'Depreciation, accruals, currency valuation, premium and claims reserves (RBNS, IBNR), insurance tax, the close and the insurer’s financial statements.' }
        ] },
        { title: 'Quick reference: T-codes', lessons: [
          { id: 'fico-tcodes', url: '/fico/tcodes', title: 'Frequently used T-codes in FICO', mins: 10, ref: true,
            blurb: 'A lookup list of the transaction codes you use most, grouped by topic. Reference only, no test.' }
        ] }
      ]
    }
  ];
  var PASS = 7;

  COURSES.forEach(function (c) {
    c.lessons = [];
    c.modules.forEach(function (m, mi) {
      m.lessons.forEach(function (l) { l.module = mi; l.index = c.lessons.length; c.lessons.push(l); });
    });
    // Reference pages have no test and do not count towards progress or the completion note
    c.core = c.lessons.filter(function (l) { return !l.ref; });
    c.mins = c.core.reduce(function (s, l) { return s + l.mins; }, 0);
  });

  function load(key) {
    try { var s = JSON.parse(localStorage.getItem(key)); if (s && s.lessons) return s; } catch (e) {}
    return { lessons: {} };
  }
  function progress(c) {
    var st = load(c.key);
    var done = c.core.filter(function (l) { return st.lessons[l.id] && st.lessons[l.id].done; }).length;
    return { state: st, done: done, pct: Math.round(done / c.core.length * 100) };
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
  var pageType = body.getAttribute('data-page');
  var isHome = pageType === 'home';
  var isDash = pageType === 'dashboard';
  var course = null, lesson = null;
  COURSES.forEach(function (c) {
    c.lessons.forEach(function (l) { if (l.id === lessonId) { course = c; lesson = l; } });
    if (isDash && c.id === body.getAttribute('data-course')) course = c;
  });
  var main = document.querySelector('main');
  if (main && !main.id) main.id = 'content';

  var lessons = course ? course.core : [];   // lessons that count towards progress
  var state = course ? load(course.key) : null;
  function save() { try { localStorage.setItem(course.key, JSON.stringify(state)); } catch (e) {} }
  function rec(id) { return state.lessons[id] || (state.lessons[id] = {}); }
  function doneCount() { return lessons.filter(function (l) { return rec(l.id).done; }).length; }
  function pct() { return Math.round(doneCount() / lessons.length * 100); }
  function nextUp() {
    var last = lessons.filter(function (l) { return l.id === state.last; })[0];
    if (last && !rec(last.id).done) return last;
    return lessons.filter(function (l) { return !rec(l.id).done; })[0] || null;
  }

  /* ---------- Visitor counts: Vercel Web Analytics (no cookies, no personal data) ---------- */
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  var vaScript = el('script');
  vaScript.defer = true;
  vaScript.src = '/_vercel/insights/script.js';
  document.head.appendChild(vaScript);

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
  var brand = link(course ? course.home : '/', 'lms-brand');
  brand.appendChild(el('span', 'lms-logo', course ? course.logo : 'SA'));
  brand.appendChild(el('span', 'lms-brand-t', course ? course.brand : SITE));
  bar.appendChild(brand);
  var prog = el('div', 'lms-prog');
  var progText = el('span', 'lms-prog-t');
  var fill = el('span');
  if (course) {
    var track = el('span', 'lms-track');
    track.appendChild(fill);
    prog.appendChild(progText);
    prog.appendChild(track);
  }
  bar.appendChild(prog);
  if (lesson) bar.appendChild(link(course.home, 'lms-dash', 'Dashboard'));
  if (!isHome) {
    var homeBtn = link('/', 'lms-home');
    homeBtn.setAttribute('aria-label', 'Home: all courses');
    homeBtn.setAttribute('title', 'Home: all courses');
    homeBtn.appendChild(el('span', 'lms-home-i', '⌂'));
    homeBtn.appendChild(el('span', 'lms-home-t', 'Home'));
    bar.appendChild(homeBtn);
  }
  body.insertBefore(bar, body.firstChild);
  body.insertBefore(skip, body.firstChild);

  function paintProgress() {
    if (!course) return;
    progText.textContent = doneCount() + ' of ' + lessons.length + ' lessons · ' + pct() + '%';
    fill.style.width = pct() + '%';
    prog.setAttribute('title', 'Course progress: ' + pct() + '%');
  }
  paintProgress();

  /* ---------- Back to top (all pages): appears once you have scrolled down ---------- */
  var topBtn = el('button', 'lms-top', '↑');
  topBtn.type = 'button';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.setAttribute('title', 'Back to top');
  body.appendChild(topBtn);
  function paintTop() { topBtn.classList.toggle('on', scrollY > 400); }
  addEventListener('scroll', paintTop, { passive: true });
  paintTop();
  topBtn.addEventListener('click', function () {
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
  });

  /* ---------- Modest note in every footer ---------- */
  var foot = document.querySelector('footer');
  if (foot) {
    var note = el('p', 'lms-note', 'These are study notes to help new joiners get started, not official SAP guidance. Please confirm important points with your team.');
    var copyP = foot.querySelector('.copy');
    foot.insertBefore(note, copyP);
    if (copyP) {
      var li = el('span');
      li.style.fontWeight = '400';
      li.appendChild(document.createTextNode(' · Connect with me on '));
      var liLink = link('https://www.linkedin.com/in/anbuselvan-sivaraju', null, 'LinkedIn');
      liLink.target = '_blank';
      liLink.rel = 'noopener noreferrer';
      li.appendChild(liLink);
      copyP.appendChild(li);
    }
  }

  if (lesson) lessonPage();
  if (isDash && course) dashboard();
  if (isHome) home();

  /* ---------- Lesson page ---------- */
  function lessonPage() {
    var r = rec(lesson.id);
    r.visited = true;
    if (!lesson.ref) state.last = lesson.id;
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
      course.modules.forEach(function (m, mi) {
        var li = el('li', 'lms-mod');
        li.appendChild(el('span', 'lms-mod-t', 'Module ' + (mi + 1) + ' · ' + m.title));
        var lol = el('ol');
        m.lessons.forEach(function (l) {
          var lli = el('li', 'lms-les' + (l === lesson ? ' cur' : '') + (rec(l.id).done ? ' done' : ''));
          var a = link(l.url);
          if (l === lesson) a.setAttribute('aria-current', 'page');
          a.appendChild(el('span', 'lms-ic', l.ref ? 'R' : rec(l.id).done ? '✓' : String(l.index + 1)));
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
      nav.appendChild(link('/', 'lms-allc', '← All courses'));
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
    crumbs.appendChild(link(course.home, null, course.brand));
    crumbs.appendChild(el('span', null, '›'));
    crumbs.appendChild(el('span', null, 'Module ' + (lesson.module + 1) + ': ' + course.modules[lesson.module].title));
    crumbs.appendChild(el('span', null, '›'));
    crumbs.appendChild(el('span', null, lesson.ref ? 'Quick reference' : 'Lesson ' + (lesson.index + 1) + ' of ' + lessons.length));
    main.insertBefore(crumbs, h1);
    var lede = h1.nextElementSibling;
    var meta = el('div', 'lms-meta');
    meta.appendChild(el('span', 'lms-chip', lesson.ref ? '📖 Reference page' : '⏱ ' + lesson.mins + ' min read'));
    meta.appendChild(el('span', 'lms-chip', lesson.ref ? 'No test' : '📝 10-question test'));
    var status = el('span', 'lms-chip');
    if (!lesson.ref) meta.appendChild(status);
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
    if (!lesson.ref) main.insertBefore(box, footer);
    toggle.addEventListener('click', function () { setDone(!rec(lesson.id).done); });

    var pn = el('nav', 'lms-pn');
    pn.setAttribute('aria-label', 'Lesson navigation');
    var prev = course.lessons[lesson.index - 1];
    var next = course.lessons[lesson.index + 1];
    pn.appendChild(prev ? card(prev.url, '← Previous lesson', prev.title, 'prev') : el('span'));
    pn.appendChild(next ? card(next.url, 'Next lesson →', next.title, 'next')
                        : card(course.home, 'Finish →', 'Back to your dashboard', 'next'));
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
    if (!lesson.ref) paintLesson();

    document.addEventListener('quiz:submitted', function (ev) {
      var d = ev.detail, r2 = rec(lesson.id);
      if (r2.best == null || d.score > r2.best) { r2.best = d.score; r2.total = d.total; }
      r2.attempts = (r2.attempts || 0) + 1;
      save();
      if (d.score >= PASS && !r2.done) setDone(true); else paintLesson();
    });
  }

  /* ---------- Home page: all courses ---------- */
  function home() {
    // Old links to sections of the FSCD guide used to live on the home page
    if (location.hash && !document.getElementById(location.hash.slice(1))) {
      location.replace('/basics' + location.hash);
      return;
    }
    var root = document.getElementById('lms-home');
    if (!root) return;
    root.innerHTML = '';
    var hero = el('section', 'lms-hero lms-hero-home');
    var ht = el('div');
    ht.appendChild(el('p', 'lms-kicker', 'For new joiners · SAP FI team'));
    ht.appendChild(el('h1', null, 'SAP learning notes for the FI team'));
    ht.appendChild(el('p', 'lede', 'Plain-English notes to help anyone who joins the SAP FI team get started, using a made-up Danish insurance company, simple diagrams and a short self-test after each lesson.'));
    hero.appendChild(ht);
    root.appendChild(hero);

    var about = el('section', 'lms-about');
    about.appendChild(el('h2', null, 'About these notes'));
    var ul = el('ul');
    [
      'Written as a starting point for new joiners. Please treat these notes as a study aid, not as official guidance.',
      'Made with the help of AI tools and general SAP knowledge. They have not been formally reviewed yet. Names, account numbers and amounts are made up.',
      'Tax and accounting points are simplified. Please confirm anything important with your finance, tax or SAP experts and with SAP’s own documentation.'
    ].forEach(function (t) { ul.appendChild(el('li', null, t)); });
    about.appendChild(ul);
    var aboutF = el('p', 'lms-about-f');
    aboutF.appendChild(el('span', null, 'Last updated: October 2026'));
    var by = el('span', null, 'Shared by Anbuselvan Sivaraju · ');
    var byLink = link('https://www.linkedin.com/in/anbuselvan-sivaraju', null, 'Connect on LinkedIn');
    byLink.target = '_blank';
    byLink.rel = 'noopener noreferrer';
    by.appendChild(byLink);
    aboutF.appendChild(by);
    about.appendChild(aboutF);
    root.appendChild(about);

    root.appendChild(el('h2', null, 'Choose a topic'));
    var grid = el('div', 'lms-courses');
    COURSES.forEach(function (c, ci) {
      var p = progress(c);
      var card = el('section', 'lms-course');
      var head = el('div', 'lms-course-h');
      head.appendChild(el('span', 'lms-logo', c.logo));
      var ttl = el('div');
      ttl.appendChild(el('p', 'lms-modnum', 'Course ' + (ci + 1) + ' · ' + c.core.length + ' lessons · ' + c.mins + ' min'));
      ttl.appendChild(link(c.home, 'lms-course-t', c.title));
      head.appendChild(ttl);
      card.appendChild(head);
      card.appendChild(el('p', 'lms-course-b', c.blurb));
      var mods = el('ol', 'lms-course-m');
      c.modules.forEach(function (m) { mods.appendChild(el('li', null, m.title)); });
      card.appendChild(mods);
      var pr = el('div', 'lms-course-p');
      var tr = el('span', 'lms-track');
      var fl = el('span');
      fl.style.width = p.pct + '%';
      tr.appendChild(fl);
      pr.appendChild(tr);
      pr.appendChild(el('span', null, p.done + ' of ' + c.core.length + ' lessons · ' + p.pct + '%'));
      card.appendChild(pr);
      var started = c.lessons.some(function (l) { return p.state.lessons[l.id] && p.state.lessons[l.id].visited; });
      card.appendChild(link(c.home, 'lms-btn', p.done === c.core.length ? 'Review the course' : started ? 'Continue →' : 'Start the course →'));
      grid.appendChild(card);
    });
    root.appendChild(grid);
  }

  /* ---------- Course dashboard ---------- */
  function dashboard() {
    var root = document.getElementById('lms-dashboard');
    if (!root) return;

    function render() {
      root.innerHTML = '';
      paintProgress();
      var done = doneCount();
      var up = nextUp();

      var hero = el('section', 'lms-hero');
      var ht = el('div');
      ht.appendChild(el('p', 'lms-kicker', 'Self-paced course · ' + lessons.length + ' lessons · ' + course.mins + ' min'));
      ht.appendChild(el('h1', null, course.title));
      ht.appendChild(el('p', 'lede', course.lede));
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
      course.modules.forEach(function (m, mi) {
        var mod = el('section', 'lms-modcard');
        var mh = el('div', 'lms-modhead');
        mh.appendChild(el('span', 'lms-modnum', 'Module ' + (mi + 1)));
        mh.appendChild(el('h3', null, m.title));
        mod.appendChild(mh);
        m.lessons.forEach(function (l) {
          var r = rec(l.id);
          var row = el('div', 'lms-row' + (r.done && !l.ref ? ' done' : ''));
          row.appendChild(el('span', 'lms-ic', l.ref ? 'R' : r.done ? '✓' : String(l.index + 1)));
          var info = el('div', 'lms-row-info');
          info.appendChild(link(l.url, 'lms-row-t', l.title));
          info.appendChild(el('p', null, l.blurb));
          var facts = el('p', 'lms-facts');
          facts.textContent = l.ref ? '📖 Reference page · no test' : '⏱ ' + l.mins + ' min · ' +
            (r.best != null ? 'Best test score ' + r.best + '/' + r.total : 'Test not taken yet') +
            (r.done ? ' · Completed' : r.visited ? ' · In progress' : '');
          info.appendChild(facts);
          row.appendChild(info);
          row.appendChild(link(l.url, 'lms-btn' + (r.done || l.ref ? ' alt' : ''), l.ref ? 'Open' : r.done ? 'Review' : r.visited ? 'Continue' : 'Start'));
          mod.appendChild(row);
        });
        root.appendChild(mod);
      });

      root.appendChild(el('h2', null, 'Your completion note'));
      var cert = el('section', 'lms-certbox');
      if (done < lessons.length) {
        cert.appendChild(el('p', 'lms-lock', '🔒 Complete all ' + lessons.length + ' lessons to unlock your completion note. ' +
          (lessons.length - done) + ' to go!'));
      } else {
        cert.appendChild(el('p', null, '🎉 Congratulations! You have completed the course. Type your name to create your completion note.'));
        var f = el('form', 'lms-certform');
        var inp = el('input');
        inp.placeholder = 'Your full name';
        inp.value = state.name || '';
        inp.maxLength = 80;
        inp.setAttribute('aria-label', 'Your full name');
        var b = el('button', 'lms-btn', 'Show completion note');
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
        if (confirm('Reset all lesson progress and test scores for this course in this browser?')) {
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
      paper.appendChild(el('p', 'lms-cert-k', 'Completion note'));
      paper.appendChild(el('p', null, 'This note records that'));
      paper.appendChild(el('p', 'lms-cert-name', state.name));
      paper.appendChild(el('p', null, 'has completed the self-paced course'));
      paper.appendChild(el('p', 'lms-cert-course', course.title));
      paper.appendChild(el('p', 'lms-cert-date', when.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
        ' · ' + course.brand));
      var p = el('button', 'lms-btn alt lms-noprint', 'Print or save as PDF');
      p.type = 'button';
      p.addEventListener('click', function () { body.classList.add('lms-printing'); print(); body.classList.remove('lms-printing'); });
      paper.appendChild(p);
    }

    render();
  }
})();
