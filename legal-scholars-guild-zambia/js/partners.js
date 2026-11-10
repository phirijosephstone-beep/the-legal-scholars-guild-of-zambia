// Load organisation records and apply the category and text filters.
const partnerSources = [
  ['data/sister-bodies.json', 'Sister Body'],
  ['data/law-associations.json', 'Law Association'],
  ['data/partners.json', null]
];
let partnerRecords = [];
let activePartnerCategory = 'all';

function initialsForOrganisation(name) {
  return (name || 'LS').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function organisationLogo(organisation) {
  const logo = document.createElement('div');
  logo.className = 'logo-fallback';
  if (!organisation.logo) {
    logo.textContent = initialsForOrganisation(organisation.name);
    return logo;
  }
  const image = document.createElement('img');
  image.src = organisation.logo;
  image.alt = `${organisation.name} logo`;
  image.addEventListener('error', () => {
    image.remove();
    logo.textContent = initialsForOrganisation(organisation.name);
  }, { once: true });
  logo.append(image);
  return logo;
}

function renderOrganisations() {
  const grid = document.querySelector('#partners-grid');
  if (!grid) return;
  const query = document.querySelector('#partner-search')?.value.trim().toLowerCase() || '';
  const visible = partnerRecords.filter(record => {
    const matchesCategory = activePartnerCategory === 'all' || record.category === activePartnerCategory;
    const matchesQuery = `${record.name} ${record.category} ${record.description}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
  grid.replaceChildren();
  if (!visible.length) {
    grid.innerHTML = '<p class="empty-state">Records coming soon</p>';
    return;
  }

  visible.forEach(organisation => {
    const card = document.createElement('article');
    card.className = 'content-card partner-card reveal';
    card.dataset.animate = 'up';
    card.append(organisationLogo(organisation));
    const badge = document.createElement('p');
    badge.className = 'badge';
    badge.textContent = organisation.category || 'Organisation';
    const title = document.createElement('h3');
    title.textContent = organisation.name || '[EDIT ME]';
    const description = document.createElement('p');
    description.textContent = organisation.description || '[EDIT ME: add a verified description.]';
    card.append(badge, title, description);
    if (organisation.website && /^https?:\/\//i.test(organisation.website)) {
      const link = document.createElement('a');
      link.className = 'link-arrow';
      link.href = organisation.website;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Visit Website →';
      card.append(link);
    } else {
      const note = document.createElement('p');
      note.className = 'inline-note';
      note.textContent = 'Website to be confirmed';
      card.append(note);
    }
    grid.append(card);
  });
  grid.querySelectorAll('.partner-card').forEach((card, index) => {
    card.style.transitionDelay = `${Math.min(index, 6) * 45}ms`;
    requestAnimationFrame(() => card.classList.add('is-visible'));
  });
}

function renderMarquees() {
  const first = document.querySelector('#partners-marquee-one');
  const second = document.querySelector('#partners-marquee-two');
  if (!first || !second || !partnerRecords.length) return;
  [first, second].forEach((track, row) => {
    track.replaceChildren();
    const rowItems = partnerRecords.filter((_, index) => index % 2 === row);
    const repeated = [...rowItems, ...rowItems];
    repeated.forEach(organisation => {
      const item = document.createElement('div');
      item.className = 'partner-marquee-item';
      if (organisation.logo) {
        const image = document.createElement('img');
        image.src = organisation.logo;
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.addEventListener('error', () => { image.remove(); item.textContent = initialsForOrganisation(organisation.name); }, { once: true });
        item.append(image);
      } else item.textContent = organisation.name;
      track.append(item);
    });
  });
}

async function loadPartnerRecords() {
  const recordsByFile = await Promise.all(partnerSources.map(async ([path, defaultCategory]) => {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`${path} unavailable`);
      const items = await response.json();
      return items.map(item => ({ ...item, category: item.category || defaultCategory }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }));
  partnerRecords = recordsByFile.flat();
  renderMarquees();
  renderOrganisations();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#partner-search')?.addEventListener('input', renderOrganisations);
  document.querySelectorAll('[data-partner-filter]').forEach(button => button.addEventListener('click', () => {
    activePartnerCategory = button.dataset.partnerFilter;
    document.querySelectorAll('[data-partner-filter]').forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    renderOrganisations();
  }));
  loadPartnerRecords().catch(error => {
    const grid = document.querySelector('#partners-grid');
    if (grid) grid.innerHTML = '<p class="error-state">Organisation records could not be loaded.</p>';
    console.error(error);
  });
});