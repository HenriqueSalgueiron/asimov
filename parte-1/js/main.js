/* ========================================================== */
/*  Positivus — main.js                                        */
/*  - Mobile nav toggle                                         */
/*  - Scroll reveal (IntersectionObserver)                      */
/* ========================================================== */

(() => {
  'use strict';

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    const setState = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      setState(open);
    });

    // Close on link click
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setState(false));
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setState(false);
        toggle.focus();
      }
    });

    // Close when viewport widens above tablet breakpoint
    const mq = window.matchMedia('(min-width: 1200px)');
    mq.addEventListener('change', (e) => {
      if (e.matches) setState(false);
    });
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((el) => io.observe(el));
  } else {
    // Fallback: show all
    reveals.forEach((el) => el.classList.add('is-visible'));
  }
})();
