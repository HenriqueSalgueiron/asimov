/* ============================================================
   main.js — terminal typing, counters, scroll reveals, header
   ============================================================ */
(function () {
  'use strict';

  // -----------------------------------------------------------
  // Header scroll state
  // -----------------------------------------------------------
  const header = document.querySelector('.header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // -----------------------------------------------------------
  // Scroll reveal via IntersectionObserver
  // -----------------------------------------------------------
  const reveals = document.querySelectorAll('[data-reveal]');
  reveals.forEach(el => {
    const d = el.getAttribute('data-reveal-delay');
    if (d) el.style.setProperty('--reveal-delay', d + 'ms');
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // -----------------------------------------------------------
  // Animated counters
  // -----------------------------------------------------------
  const formatNumber = (n) => {
    if (n >= 1000) return n.toLocaleString('pt-BR');
    return String(n);
  };

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-to'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const value = Math.round(target * ease(p));
      el.textContent = formatNumber(value) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counters = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => cio.observe(el));
  } else {
    counters.forEach(animateCounter);
  }

  // -----------------------------------------------------------
  // Feature card — cursor-following glow
  // -----------------------------------------------------------
  document.querySelectorAll('.feature').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    });
  });

  // -----------------------------------------------------------
  // Terminal typing animation
  // -----------------------------------------------------------
  const termEl = document.getElementById('term-code');
  if (!termEl) return;

  // Tokens: [cls, text]. Pseudo-token "\n" for line break. "prompt" marks prompts.
  const script = [
    ['tk-comment', '# projeto-ia.py — seu primeiro assistente com IA\n'],
    ['tk-keyword', 'from'], ['', ' '], ['tk-var', 'openai'], ['', ' '],
    ['tk-keyword', 'import'], ['', ' '], ['tk-var', 'OpenAI'], ['', '\n'],

    ['tk-var', 'client'], ['tk-op', ' = '], ['tk-fn', 'OpenAI'], ['tk-op', '()'], ['', '\n\n'],

    ['tk-keyword', 'def'], ['', ' '], ['tk-fn', 'perguntar'], ['tk-op', '('],
    ['tk-var', 'pergunta'], ['tk-op', '):'], ['', '\n'],
    ['', '    '], ['tk-var', 'resposta'], ['tk-op', ' = '], ['tk-var', 'client'],
    ['tk-op', '.'], ['tk-var', 'chat'], ['tk-op', '.'], ['tk-var', 'completions'],
    ['tk-op', '.'], ['tk-fn', 'create'], ['tk-op', '('], ['', '\n'],
    ['', '        '], ['tk-var', 'model'], ['tk-op', '='],
    ['tk-string', '"gpt-4o"'], ['tk-op', ','], ['', '\n'],
    ['', '        '], ['tk-var', 'messages'], ['tk-op', '=['],
    ['tk-op', '{'], ['tk-string', '"role"'], ['tk-op', ': '], ['tk-string', '"user"'],
    ['tk-op', ', '], ['tk-string', '"content"'], ['tk-op', ': '],
    ['tk-var', 'pergunta'], ['tk-op', '}]'], ['', '\n'],
    ['', '    '], ['tk-op', ')'], ['', '\n'],
    ['', '    '], ['tk-keyword', 'return'], ['', ' '], ['tk-var', 'resposta'],
    ['tk-op', '.'], ['tk-var', 'choices'], ['tk-op', '['], ['tk-number', '0'],
    ['tk-op', '].'], ['tk-var', 'message'], ['tk-op', '.'], ['tk-var', 'content'], ['', '\n\n'],

    ['tk-fn', 'print'], ['tk-op', '('], ['tk-fn', 'perguntar'], ['tk-op', '('],
    ['tk-string', '"O que faz Python tão poderoso?"'], ['tk-op', '))'], ['', '\n\n'],

    ['tk-prompt', '$ python projeto-ia.py\n'],
    ['tk-out', '> pensando'], ['dots', ''], ['', '\n'],
    ['tk-out-accent', '→ '], ['tk-out', 'Python combina sintaxe simples com um\n'],
    ['tk-out', '  ecossistema enorme — ideal pra IA, dados\n'],
    ['tk-out', '  e automação. Você escreve menos e faz mais.\n'],
    ['', '\n'],
    ['tk-prompt', '$ '],
  ];

  // Convert to character stream while preserving classes
  const stream = [];
  for (const [cls, text] of script) {
    if (cls === 'dots') {
      stream.push({ kind: 'dots' });
      continue;
    }
    for (const ch of text) stream.push({ cls, ch });
  }

  // State + render
  let i = 0;
  let rendered = ''; // HTML string
  let currentCls = null;
  let openSpan = false;

  const ensureCls = (cls) => {
    if (cls === currentCls) return;
    if (openSpan) { rendered += '</span>'; openSpan = false; }
    if (cls) {
      rendered += `<span class="${cls}">`;
      openSpan = true;
    }
    currentCls = cls;
  };

  const escape = (c) => {
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '&') return '&amp;';
    return c;
  };

  const termBody = termEl.parentElement;
  const paint = () => {
    let html = rendered;
    if (openSpan) html += '</span>';
    html += '<span class="caret"></span>';
    termEl.innerHTML = html;
    if (termBody) termBody.scrollTop = termBody.scrollHeight;
  };

  const typeStep = () => {
    if (i >= stream.length) {
      paint();
      // restart after pause
      setTimeout(() => {
        i = 0;
        rendered = '';
        currentCls = null;
        openSpan = false;
        paint();
        scheduleNext();
      }, 6500);
      return;
    }

    const tok = stream[i++];
    if (tok.kind === 'dots') {
      // animated "..." ellipsis
      ensureCls('tk-out');
      const frames = ['', '.', '..', '...'];
      let f = 0;
      const dotsId = 'd' + Date.now();
      rendered += `<span data-dots="${dotsId}"></span>`;
      paint();
      const int = setInterval(() => {
        const node = termEl.querySelector(`[data-dots="${dotsId}"]`);
        if (!node) { clearInterval(int); return; }
        f = (f + 1) % frames.length;
        node.textContent = frames[f];
        if (f === 3) {
          clearInterval(int);
          // bake in final dots
          rendered = rendered.replace(
            new RegExp(`<span data-dots="${dotsId}"></span>`),
            '...'
          );
          scheduleNext();
        }
      }, 220);
      return;
    }

    ensureCls(tok.cls);
    rendered += escape(tok.ch);
    paint();
    scheduleNext();
  };

  const scheduleNext = () => {
    const tok = stream[i];
    if (!tok) { setTimeout(typeStep, 0); return; }
    let delay = 18;
    if (tok.kind === 'dots') delay = 120;
    else if (tok.ch === '\n') delay = 55;
    else if (tok.cls === 'tk-out' || tok.cls === 'tk-out-accent' || tok.cls === 'tk-prompt') delay = 14;
    else if (Math.random() < 0.08) delay = 60; // human variation
    setTimeout(typeStep, delay);
  };

  // Respect prefers-reduced-motion: render final state without animation
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    let html = '';
    let cls = null;
    let open = false;
    for (const tok of stream) {
      const tokCls = tok.kind === 'dots' ? 'tk-out' : tok.cls;
      if (tokCls !== cls) {
        if (open) { html += '</span>'; open = false; }
        if (tokCls) { html += `<span class="${tokCls}">`; open = true; }
        cls = tokCls;
      }
      html += tok.kind === 'dots' ? '...' : escape(tok.ch);
    }
    if (open) html += '</span>';
    termEl.innerHTML = html;
    return;
  }

  // Kick off once terminal is in view
  const startTyping = () => scheduleNext();
  if ('IntersectionObserver' in window) {
    const tio = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          startTyping();
          obs.disconnect();
        }
      });
    }, { threshold: 0.2 });
    tio.observe(termEl);
  } else {
    startTyping();
  }
})();
