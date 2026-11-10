// Hall of Leadership renderer: timeline/grid views, search, biography modal and lightbox.
let executiveRecords = [];
let presidentRecords = [];
let vicePresidentRecords = [];
let activeRole = 'president';
let newestFirst = true;
let activeRecords = [];
let activeIndex = 0;
let activeBiographyType = 'history';
let modalReturnFocus = null;
let touchStartX = 0;

const safeText = (value, fallback = '[EDIT ME]') => typeof value === 'string' && value.trim() ? value : fallback;
const textItems = value => Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim()) : typeof value === 'string' && value.trim() ? [value] : [];
const leaderInitials = name => {
  const clean = safeText(name, 'LSG');
  return clean.startsWith('[') ? 'LSG' : clean.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
};

function makePhotoButton(person) {
  const button = document.createElement('button');
  button.className = 'leadership-photo-button is-loading';
  button.type = 'button';
  button.setAttribute('aria-label', `View ${safeText(person.name)} photograph`);
  if (!person.photo) {
    button.classList.remove('is-loading');
    button.classList.add('is-fallback');
    button.textContent = leaderInitials(person.name);
    button.disabled = true;
    return button;
  }
  const image = document.createElement('img');
  image.src = person.photo;
  image.alt = `Portrait of ${safeText(person.name)}`;
  image.width = 600;
  image.height = 750;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('load', () => button.classList.remove('is-loading'), { once: true });
  image.addEventListener('error', () => {
    image.remove();
    button.classList.remove('is-loading');
    button.classList.add('is-fallback');
    button.textContent = leaderInitials(person.name);
    button.disabled = true;
  }, { once: true });
  button.append(image);
  button.addEventListener('click', () => openLightbox(person));
  return button;
}

function buildExecutiveCard(person, index) {
  const card = document.createElement('article');
  card.className = `leader-card leadership-card executive-featured${index === 0 ? ' president-spotlight' : ''}`;
  const body = document.createElement('div');
  body.className = 'leadership-card-body';
  const photo = makePhotoButton(person);
  const info = document.createElement('div');
  info.className = 'leadership-info';
  const name = document.createElement('h3');
  name.textContent = safeText(person.name);
  const position = document.createElement('p');
  position.className = 'badge';
  position.textContent = safeText(person.position);
  const institution = document.createElement('p');
  institution.textContent = safeText(person.institution);
  info.append(name, position, institution);
  if (person.currentRole) {
    const currentRole = document.createElement('p');
    currentRole.textContent = `Current role: ${safeText(person.currentRole)}`;
    info.append(currentRole);
  }
  const biography = document.createElement('button');
  biography.className = 'button button-dark';
  biography.type = 'button';
  biography.textContent = 'See bio';
  biography.addEventListener('click', () => openBiography(index, executiveRecords, biography, 'executive'));
  info.append(biography);
  body.append(photo, info);
  card.append(body);
  addCardEffects(body);
  return card;
}

function renderExecutive() {
  const grid = document.querySelector('#current-executive-grid');
  if (!grid) return;
  grid.replaceChildren();
  if (!executiveRecords.length) {
    grid.innerHTML = '<p class="empty-state">Records coming soon</p>';
    return;
  }
  executiveRecords.forEach((person, index) => grid.append(buildExecutiveCard(person, index)));
  observeLeadershipCards(grid);
}

function sortRecords(records) {
  return [...records].sort((a, b) => (Number(b.number) - Number(a.number)) * (newestFirst ? 1 : -1));
}

function matchesSearch(person, query) {
  if (!query) return true;
  return `${person.name} ${person.institution} ${person.position || ''} ${person.servedUnder || ''}`.toLowerCase().includes(query);
}

function createHistoryCard(person, index, list) {
  const card = document.createElement('article');
  card.className = 'leadership-card';
  card.dataset.recordIndex = String(index);
  const marker = document.createElement('span');
  marker.className = 'number-marker';
  marker.textContent = `No. ${person.number}`;
  const body = document.createElement('div');
  body.className = 'leadership-card-body';
  const photo = makePhotoButton(person);
  const info = document.createElement('div');
  info.className = 'leadership-info';
  const name = document.createElement('h3');
  name.textContent = safeText(person.name);
  const role = document.createElement('p');
  role.className = 'badge';
  role.textContent = activeRole === 'president' ? 'Past President' : 'Past Vice President';
  const term = document.createElement('p');
  term.textContent = person.term && person.term !== '[EDIT ME]' ? person.term : 'Term not recorded';
  const institution = document.createElement('p');
  institution.textContent = safeText(person.institution);
  if (person.currentRole) {
    const currentRole = document.createElement('p');
    currentRole.textContent = `Current role: ${safeText(person.currentRole)}`;
    info.append(name, role, term, institution, currentRole);
  } else {
    info.append(name, role, term, institution);
  }
  const biography = document.createElement('button');
  biography.className = 'button button-dark';
  biography.type = 'button';
  biography.textContent = 'View Biography';
  biography.addEventListener('click', () => openBiography(index, list, biography));
  if (activeRole === 'vice-president') {
    const servedUnder = document.createElement('p');
    servedUnder.textContent = `Served under: ${safeText(person.servedUnder)}`;
    info.append(servedUnder);
  }
  info.append(biography);
  body.append(photo, info);
  card.append(marker, body);
  addCardEffects(body);
  return card;
}

function renderHistory() {
  const grid = document.querySelector(activeRole === 'president' ? '#presidents-grid' : '#vice-presidents-grid');
  if (!grid) return;
  const query = document.querySelector('#leadership-search')?.value.trim().toLowerCase() || '';
  const list = sortRecords(activeRole === 'president' ? presidentRecords : vicePresidentRecords).filter(item => matchesSearch(item, query));
  grid.replaceChildren();
  if (!list.length) {
    grid.innerHTML = '<p class="empty-state">Records coming soon</p>';
    return;
  }
  list.forEach((person, index) => grid.append(createHistoryCard(person, index, list)));
  observeLeadershipCards(grid);
  setupTimelineProgress(grid);
}

function observeLeadershipCards(container) {
  const cards = container.querySelectorAll('.leadership-card');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cards.forEach(card => card.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: .12 });
  cards.forEach(card => observer.observe(card));
}

function setupTimelineProgress(grid) {
  let queued = false;
  const update = () => {
    if (!grid.classList.contains('is-timeline')) return;
    const bounds = grid.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight * .82 - bounds.top) / (bounds.height || 1)));
    grid.style.setProperty('--timeline-progress', `${progress * 100}%`);
    queued = false;
  };
  const onScroll = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}

function addCardEffects(element) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  element.addEventListener('pointermove', event => {
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    element.style.setProperty('--tilt-x', `${(0.5 - y) * 4}deg`);
    element.style.setProperty('--tilt-y', `${(x - 0.5) * 4}deg`);
    element.style.setProperty('--glow-x', `${x * 100}%`);
    element.style.setProperty('--glow-y', `${y * 100}%`);
  });
  element.addEventListener('pointerleave', () => {
    element.style.setProperty('--tilt-x', '0deg');
    element.style.setProperty('--tilt-y', '0deg');
  });
}

function switchRole(role) {
  activeRole = role;
  const presidentTab = document.querySelector('#presidents-tab');
  const viceTab = document.querySelector('#vice-presidents-tab');
  const presidentPanel = document.querySelector('#presidents-panel');
  const vicePanel = document.querySelector('#vice-presidents-panel');
  const isPresident = role === 'president';
  presidentTab.setAttribute('aria-selected', String(isPresident));
  viceTab.setAttribute('aria-selected', String(!isPresident));
  presidentTab.tabIndex = isPresident ? 0 : -1;
  viceTab.tabIndex = isPresident ? -1 : 0;
  presidentPanel.hidden = !isPresident;
  vicePanel.hidden = isPresident;
  renderHistory();
}

function setLayout(mode) {
  document.querySelectorAll('.leadership-grid').forEach(grid => {
    grid.classList.toggle('is-grid', mode === 'grid');
    grid.classList.toggle('is-timeline', mode === 'timeline');
    grid.querySelectorAll('.leadership-card').forEach((card, index) => {
      card.style.transitionDelay = `${Math.min(index, 6) * 35}ms`;
      card.classList.remove('is-visible');
      requestAnimationFrame(() => card.classList.add('is-visible'));
    });
  });
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === mode)));
}

function openBiography(index, records, trigger, type = 'history') {
  activeRecords = records;
  activeIndex = index;
  activeBiographyType = type;
  modalReturnFocus = trigger;
  updateBiography();
  const backdrop = document.querySelector('#bio-backdrop');
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add('is-open'));
  document.querySelector('#bio-dialog').focus();
  document.addEventListener('keydown', onModalKeydown);
}

function updateBiography() {
  const person = activeRecords[activeIndex];
  document.querySelector('#bio-title').textContent = safeText(person.name);
  const meta = activeBiographyType === 'executive'
    ? [safeText(person.position), safeText(person.institution)]
    : [activeRole === 'president' ? 'Past President' : 'Past Vice President', person.term && person.term !== '[EDIT ME]' ? person.term : 'Term not recorded', safeText(person.institution)];
  if (person.currentRole) meta.push(`Current role: ${safeText(person.currentRole)}`);
  document.querySelector('#bio-meta').textContent = meta.join(' | ');
  const bioCopy = document.querySelector('#bio-copy');
  bioCopy.replaceChildren();
  textItems(person.bio).forEach(paragraph => {
    const paragraphElement = document.createElement('p');
    paragraphElement.textContent = paragraph;
    bioCopy.append(paragraphElement);
  });
  if (!bioCopy.childElementCount) bioCopy.textContent = 'Biography not recorded.';
  let achievements = document.querySelector('#bio-achievements');
  if (!achievements) {
    achievements = document.createElement('section');
    achievements.id = 'bio-achievements';
    const heading = document.createElement('h3');
    heading.textContent = 'Achievements';
    achievements.append(heading, document.createElement('ul'));
    document.querySelector('.bio-dialog-content').insertBefore(achievements, document.querySelector('.bio-dialog-nav'));
  }
  const achievementList = achievements.querySelector('ul');
  achievementList.replaceChildren();
  textItems(person.achievements).forEach(achievement => {
    const item = document.createElement('li');
    item.textContent = achievement;
    achievementList.append(item);
  });
  achievements.hidden = !achievementList.childElementCount;
  const photo = document.querySelector('#bio-photo');
  photo.replaceChildren();
  photo.className = 'bio-dialog-photo';
  if (person.photo) {
    const image = new Image();
    image.src = person.photo;
    image.alt = `Portrait of ${safeText(person.name)}`;
    image.width = 600;
    image.height = 750;
    image.decoding = 'async';
    photo.append(image);
  } else {
    photo.textContent = leaderInitials(person.name);
    photo.classList.add('leadership-photo-button', 'is-fallback');
  }
}

function closeBiography() {
  const backdrop = document.querySelector('#bio-backdrop');
  if (!backdrop || backdrop.hidden) return;
  backdrop.classList.remove('is-open');
  window.setTimeout(() => { backdrop.hidden = true; }, 280);
  document.removeEventListener('keydown', onModalKeydown);
  modalReturnFocus?.focus();
}

function browseBiography(direction) {
  activeIndex = (activeIndex + direction + activeRecords.length) % activeRecords.length;
  updateBiography();
}

function onModalKeydown(event) {
  if (event.key === 'Escape') closeBiography();
  if (event.key === 'ArrowLeft') browseBiography(-1);
  if (event.key === 'ArrowRight') browseBiography(1);
  if (event.key === 'Tab') {
    const modal = document.querySelector('#bio-dialog');
    const focusable = [...modal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === modal)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
}

function openLightbox(person) {
  if (!person.photo) return;
  const backdrop = document.querySelector('#leadership-lightbox');
  const image = document.querySelector('#lightbox-image');
  image.src = person.photo;
  image.alt = `Portrait of ${safeText(person.name)}`;
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add('is-open'));
}

function closeLightbox() {
  const backdrop = document.querySelector('#leadership-lightbox');
  backdrop.classList.remove('is-open');
  window.setTimeout(() => { backdrop.hidden = true; }, 280);
}

async function loadLeadership() {
  try {
    const [executives, presidents, vicePresidents] = await Promise.all(['current-executive', 'presidents', 'vice-presidents'].map(async filename => {
      const response = await fetch(`data/${filename}.json`);
      if (!response.ok) throw new Error(`Could not load ${filename}.json`);
      return response.json();
    }));
    executiveRecords = executives;
    presidentRecords = presidents;
    vicePresidentRecords = vicePresidents;
    renderExecutive();
    renderHistory();
  } catch (error) {
    document.querySelectorAll('#current-executive-grid, #presidents-grid, #vice-presidents-grid').forEach(grid => { grid.innerHTML = '<p class="error-state">Leadership records could not be loaded. Please try again later.</p>'; });
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#leadership-search')?.addEventListener('input', () => renderHistory());
  document.querySelector('#presidents-tab')?.addEventListener('click', () => switchRole('president'));
  document.querySelector('#vice-presidents-tab')?.addEventListener('click', () => switchRole('vice-president'));
  document.querySelectorAll('.hall-tab').forEach((tab, index, tabs) => tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    next.click();
  }));
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setLayout(button.dataset.view)));
  document.querySelector('#sort-leadership')?.addEventListener('click', event => {
    newestFirst = !newestFirst;
    event.currentTarget.textContent = newestFirst ? 'Newest first' : 'Oldest first';
    event.currentTarget.setAttribute('aria-pressed', String(!newestFirst));
    renderHistory();
  });
  document.querySelector('.bio-dialog-close')?.addEventListener('click', closeBiography);
  document.querySelector('#bio-previous')?.addEventListener('click', () => browseBiography(-1));
  document.querySelector('#bio-next')?.addEventListener('click', () => browseBiography(1));
  document.querySelector('#bio-backdrop')?.addEventListener('click', event => { if (event.target === event.currentTarget) closeBiography(); });
  document.querySelector('#bio-dialog')?.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  document.querySelector('#bio-dialog')?.addEventListener('touchend', event => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 60) browseBiography(delta < 0 ? 1 : -1);
  }, { passive: true });
  document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  document.querySelector('#leadership-lightbox')?.addEventListener('click', event => { if (event.target === event.currentTarget) closeLightbox(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !document.querySelector('#leadership-lightbox').hidden) closeLightbox(); });
  loadLeadership();
});
