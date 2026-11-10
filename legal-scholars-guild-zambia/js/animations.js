// Shared progressive motion: all optional effects respect reduced-motion settings.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function prepareScrollAnimations() {
    document.querySelectorAll('.section-heading, .content-card, .leader-card, .cta-band .container, .image-frame, .stat-grid').forEach(element => {
      if (!element.hasAttribute('data-animate') && !element.hasAttribute('data-stagger')) {
        if (element.matches('.content-card, .leader-card')) element.setAttribute('data-animate', 'up');
        else element.setAttribute('data-animate', 'up');
      }
    });
    document.querySelectorAll('.grid, .footer-grid').forEach(grid => {
      if (grid.children.length > 1 && !grid.hasAttribute('data-stagger')) grid.setAttribute('data-stagger', '');
      [...grid.children].forEach((child, index) => child.style.setProperty('--stagger-index', index));
    });

    const targets = document.querySelectorAll('[data-animate], [data-stagger], .section-heading:not(.is-visible)');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      targets.forEach(target => target.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: .12, rootMargin: '0px 0px -35px 0px' });
    targets.forEach(target => observer.observe(target));
  }

  function setupWordReveal() {
    document.querySelectorAll('.page-hero h1').forEach(heading => {
      if (heading.dataset.wordsReady) return;
      const text = heading.textContent.trim();
      heading.dataset.wordsReady = 'true';
      heading.setAttribute('aria-label', text);
      const words = text.split(/\s+/).map((word, index) => {
        const mask = document.createElement('span');
        mask.className = 'word-mask';
        const inner = document.createElement('span');
        inner.textContent = word;
        inner.style.setProperty('--word-index', index);
        mask.append(inner);
        return mask;
      });
      heading.replaceChildren(...words.flatMap((word, index) => index ? [document.createTextNode(' '), word] : [word]));
      if (!reducedMotion.matches) heading.classList.add('is-visible');
    });
  }

  function setupScrollProgressAndHeader() {
    const track = document.createElement('div');
    track.className = 'scroll-progress-track';
    track.setAttribute('aria-hidden', 'true');
    const bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    track.append(bar);
    document.body.append(track);

    const header = document.querySelector('.site-header');
    let previousY = window.scrollY;
    let queued = false;
    const update = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
      bar.style.transform = `scaleX(${ratio})`;
      document.querySelectorAll('.back-to-top').forEach(button => button.style.setProperty('--scroll-ring', `${ratio * 360}deg`));
      if (header) {
        const currentY = window.scrollY;
        header.classList.toggle('is-scrolled', currentY > 24);
        header.classList.toggle('is-compact', currentY > 100);
        if (currentY < 120 || currentY < previousY) header.classList.remove('is-hidden');
        else if (currentY > previousY + 8) header.classList.add('is-hidden');
        previousY = currentY;
      }
      queued = false;
    };
    window.addEventListener('scroll', () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  function setupCounters() {
    // [EDIT ME] Set these to verified Guild counts; zero is intentionally honest meanwhile.
    const values = { institutions: 0, programmes: 0, events: 0, partners: 0 };
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const run = counter => {
      const target = values[counter.dataset.count] ?? 0;
      if (reducedMotion.matches) {
        counter.textContent = String(target);
        return;
      }
      const start = performance.now();
      const duration = 1100;
      const step = now => {
        const progress = clamp((now - start) / duration, 0, 1);
        counter.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 4))));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) return counters.forEach(run);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        run(entry.target);
        observer.unobserve(entry.target);
      }
    }), { threshold: .4 });
    counters.forEach(counter => observer.observe(counter));
  }

  function setupParallax() {
    const hero = document.querySelector('.hero-home');
    if (!hero || reducedMotion.matches) return;
    if (finePointer.matches) {
      hero.addEventListener('pointermove', event => {
        const bounds = hero.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - .5) * 12;
        const y = ((event.clientY - bounds.top) / bounds.height - .5) * 10;
        hero.style.setProperty('--parallax-x', `${x}px`);
        hero.style.setProperty('--parallax-y', `${y}px`);
      }, { passive: true });
      hero.addEventListener('pointerleave', () => {
        hero.style.setProperty('--parallax-x', '0px');
        hero.style.setProperty('--parallax-y', '0px');
      });
    } else {
      window.addEventListener('scroll', () => {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty('--parallax-y', `${clamp(-rect.top * .04, -18, 18)}px`);
      }, { passive: true });
    }
  }

  function setupMagneticButtons() {
    if (!finePointer.matches || reducedMotion.matches) return;
    document.querySelectorAll('.button').forEach(button => {
      button.addEventListener('pointermove', event => {
        const bounds = button.getBoundingClientRect();
        button.style.transform = `translate(${(event.clientX - bounds.left - bounds.width / 2) * .07}px, ${(event.clientY - bounds.top - bounds.height / 2) * .1 - 2}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }

  function setupCursor() {
    if (!finePointer.matches || reducedMotion.matches) return;
    const cursor = document.createElement('div');
    cursor.className = 'cursor-follower';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.append(cursor);
    let frame = 0;
    document.addEventListener('pointermove', event => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
        cursor.classList.add('is-ready');
      });
    }, { passive: true });
    document.addEventListener('pointerover', event => cursor.classList.toggle('is-hovering', Boolean(event.target.closest('a, button, input, select, textarea'))));
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-ready'));
  }

  function setupRipplesAndTransitions() {
    document.addEventListener('click', event => {
      const button = event.target.closest('.button');
      if (button && !reducedMotion.matches) {
        const bounds = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-dot';
        ripple.style.left = `${event.clientX - bounds.left}px`;
        ripple.style.top = `${event.clientY - bounds.top}px`;
        button.append(ripple);
        window.setTimeout(() => ripple.remove(), 650);
      }

      const link = event.target.closest('a[href]');
      if (!link || reducedMotion.matches || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname && url.hash) return;
      const curtain = document.querySelector('.page-curtain');
      if (!curtain) return;
      event.preventDefault();
      curtain.classList.add('is-active');
      window.setTimeout(() => { location.assign(url.href); }, 390);
    });
  }

  function setupHamburgerStagger() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.primary-nav');
    if (!toggle || !nav) return;
    nav.querySelectorAll('li').forEach((item, index) => item.style.setProperty('--nav-index', index));
    toggle.addEventListener('click', () => toggle.classList.toggle('is-open', toggle.getAttribute('aria-expanded') === 'true'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    prepareScrollAnimations();
    setupWordReveal();
    setupScrollProgressAndHeader();
    setupCounters();
    setupParallax();
    setupMagneticButtons();
    setupCursor();
    setupRipplesAndTransitions();
    setupHamburgerStagger();
  });
})();