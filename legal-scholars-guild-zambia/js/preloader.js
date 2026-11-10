// First-visit loading curtain. It never captures focus and always has a timeout.
(() => {
  const preloader = document.querySelector('#site-preloader');
  if (!preloader) return;

  const title = preloader.querySelector('.preloader-title');
  const fill = preloader.querySelector('.preloader-fill');
  const percent = preloader.querySelector('.preloader-percent');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const startedAt = performance.now();
  let dismissed = false;
  let actualProgress = 0;
  let displayProgress = 0;

  let alreadySeen = false;
  try {
    alreadySeen = sessionStorage.getItem('lsgz-intro-seen') === 'true';
  } catch (error) {
    // Storage can be disabled; the preloader still works for this page view.
  }

  if (alreadySeen) {
    preloader.hidden = true;
    return;
  }

  try { sessionStorage.setItem('lsgz-intro-seen', 'true'); } catch (error) { /* Continue without persistence. */ }

  const titleText = "LEGAL SCHOLARS' GUILD OF ZAMBIA";
  title.replaceChildren(...[...titleText].map((character, index) => {
    const span = document.createElement('span');
    span.textContent = character === ' ' ? '\u00a0' : character;
    span.style.setProperty('--letter-index', index);
    return span;
  }));

  function paintProgress(value) {
    displayProgress = Math.max(displayProgress, Math.min(100, Math.round(value)));
    fill.style.width = `${displayProgress}%`;
    percent.textContent = `${displayProgress}%`;
  }

  function finish() {
    if (dismissed) return;
    dismissed = true;
    paintProgress(100);
    if (motionPreference.matches) {
      preloader.classList.add('is-fade-out');
      window.setTimeout(() => { preloader.hidden = true; }, 180);
      return;
    }
    preloader.classList.add('is-leaving');
    window.setTimeout(() => { preloader.hidden = true; }, 740);
  }

  if (motionPreference.matches) {
    window.addEventListener('load', () => window.setTimeout(finish, 100), { once: true });
    window.setTimeout(finish, 900);
    return;
  }

  const timer = window.setInterval(() => {
    const elapsed = performance.now() - startedAt;
    const eased = 1 - Math.exp(-elapsed / 1500);
    paintProgress(Math.max(actualProgress, eased * 88));
  }, 90);

  async function waitForRealAssets() {
    if (document.readyState !== 'complete') {
      await new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
    }
    const images = [...document.images];
    let completed = 0;
    if (images.length) {
      await Promise.all(images.map(async image => {
        try {
          if (image.decode) await image.decode();
          else if (!image.complete) await new Promise(resolve => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          });
        } catch (error) {
          // A missing image must not hold the page behind the loading screen.
        } finally {
          completed += 1;
          actualProgress = 88 + (12 * completed / images.length);
          paintProgress(actualProgress);
        }
      }));
    } else {
      actualProgress = 100;
    }
    const remaining = Math.max(0, 1800 - (performance.now() - startedAt));
    window.setTimeout(() => {
      window.clearInterval(timer);
      finish();
    }, remaining);
  }

  waitForRealAssets();
  window.setTimeout(() => {
    window.clearInterval(timer);
    finish();
  }, 6000);
})();