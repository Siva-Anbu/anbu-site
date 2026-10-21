/* Suggestion box: a button that opens a short form. Submissions are emailed
   to the site owner through FormSubmit (formsubmit.co).
   Usage: <div id="suggest"></div><script src="/suggest.js" defer></script> */
(function () {
  var ENDPOINT = 'https://formsubmit.co/ajax/s.anbuselvan@gmail.com';

  var box = document.getElementById('suggest');
  if (!box) return;

  var css = document.createElement('style');
  css.textContent =
    '#suggest{background:var(--tip);border:1px solid var(--tipline);border-radius:10px;padding:16px 18px;margin:2.4em 0 0}' +
    '.sg-title{font-weight:700;font-size:1.1rem;margin:0 0 4px}' +
    '.sg-sub{margin:0 0 12px;color:var(--muted);font-size:15px}' +
    '.sg-form{display:grid;gap:10px;margin-top:12px}' +
    '.sg-form label{font-size:14px;font-weight:600;display:grid;gap:4px}' +
    '.sg-form label span{font-weight:400;color:var(--muted)}' +
    '.sg-form input,.sg-form textarea{font:inherit;font-size:15px;color:var(--fg);background:var(--card);border:1px solid var(--line);border-radius:6px;padding:8px 10px;width:100%}' +
    '.sg-form textarea{min-height:110px;resize:vertical}' +
    '.sg-form input:focus,.sg-form textarea:focus{outline:2px solid var(--accent);outline-offset:1px}' +
    '.sg-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '@media (max-width:600px){.sg-two{grid-template-columns:1fr}}' +
    '.sg-btn{font:inherit;font-weight:600;border:0;border-radius:6px;padding:9px 18px;background:var(--accent);color:#fff;cursor:pointer;justify-self:start}' +
    '.sg-btn:disabled{opacity:.5;cursor:wait}' +
    '.sg-msg{margin:6px 0 0;font-weight:600}' +
    '.sg-hp{position:absolute;left:-9999px}';
  document.head.appendChild(css);

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function field(labelText, hint, input) {
    var lab = el('label', null, labelText + ' ');
    if (hint) lab.appendChild(el('span', null, hint));
    lab.appendChild(input);
    return lab;
  }

  box.appendChild(el('p', 'sg-title', '💡 Have a suggestion?'));
  box.appendChild(el('p', 'sg-sub', 'Spotted a mistake, want a new topic, or have an idea to make this page better? Tell me. It goes straight to my inbox.'));
  var open = el('button', 'sg-btn', 'Write a suggestion');
  open.type = 'button';
  box.appendChild(open);

  open.addEventListener('click', function () {
    open.remove();
    var form = el('form', 'sg-form');

    var name = el('input'); name.name = 'name'; name.autocomplete = 'name'; name.maxLength = 100;
    var email = el('input'); email.name = 'email'; email.type = 'email'; email.autocomplete = 'email'; email.maxLength = 200;
    var text = el('textarea'); text.name = 'suggestion'; text.required = true; text.maxLength = 3000;
    var hp = el('input', 'sg-hp'); hp.name = '_honey'; hp.tabIndex = -1; hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');

    var two = el('div', 'sg-two');
    two.appendChild(field('Your name', '(optional)', name));
    two.appendChild(field('Your email', '(optional, if you want a reply)', email));
    form.appendChild(two);
    form.appendChild(field('Your suggestion', null, text));
    form.appendChild(hp);

    var send = el('button', 'sg-btn', 'Send suggestion');
    send.type = 'submit';
    form.appendChild(send);
    var msg = el('p', 'sg-msg');
    form.appendChild(msg);

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!text.value.trim()) { text.focus(); return; }
      send.disabled = true;
      send.textContent = 'Sending…';
      msg.textContent = '';
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'Suggestion: ' + document.title,
          _template: 'table',
          _captcha: 'false',
          _honey: hp.value,
          page: location.href,
          name: name.value.trim() || '(not given)',
          email: email.value.trim() || '(not given)',
          suggestion: text.value.trim()
        })
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (String(res.success) !== 'true') throw new Error(res.message || 'failed');
        form.innerHTML = '';
        var ok = el('p', 'sg-msg', '✓ Thank you! Your suggestion has been sent.');
        ok.style.color = 'var(--ok)';
        form.appendChild(ok);
      }).catch(function () {
        send.disabled = false;
        send.textContent = 'Send suggestion';
        msg.style.color = 'var(--bad)';
        msg.textContent = 'Sorry, it could not be sent just now. Please try again in a moment.';
      });
    });

    box.appendChild(form);
    text.focus();
  });
})();
