// Shared navigation, footer, and small interactive features used site-wide.
const sitePages = [
  ['Home', 'index.html'],
  ['About', 'about.html'],
  ['Leadership', 'leadership.html'],
  ['Programmes', 'programmes.html'],
  ['Partners', 'partners.html'],
  ['News & Events', 'events.html'],
  ['Resources', 'resources.html'],
  ['Membership', 'membership.html'],
  ['Contact', 'contact.html']
];

const externalLinks = [
  ['Judiciary of Zambia', 'https://judiciaryzambia.com/'],
  ['Parliament of Zambia', 'https://www.parliament.gov.zm/'],
  ['Zambia Law Development Commission', 'https://www.zldc.org/'],
  ['Law Association of Zambia', 'https://www.laz.org.zm/'],
  ['Zambia Institute of Advanced Legal Education', 'https://ziales.ac.zm/'],
  ['ZambiaLII', 'https://zambialii.org/']
];

const socialLinks = [
  ['f', 'Facebook', 'https://www.facebook.com/p/Legal-Scholars-Guild-of-Zambia-61570412825701/'],
  ['ig', 'Instagram', 'https://www.instagram.com/the_guild_zambia/'],
  ['in', 'LinkedIn', 'https://www.linkedin.com/in/legal-scholars-guild-of-zambia-b379602a3']
];

function renderSharedLayout() {
  const header = document.querySelector('#site-header');
  const footer = document.querySelector('#site-footer');
  const currentPage = location.pathname.split('/').pop() || 'index.html';

  if (header) {
    const links = sitePages.map(([label, url]) => {
      const active = url.split('#')[0] === currentPage;
      return `<li><a href="${url}"${active ? ' aria-current="page"' : ''}>${label}</a></li>`;
    }).join('');

    header.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="index.html" aria-label="Legal Scholars' Guild of Zambia home">
            <img src="images/logo/logo%201.jpg" alt="Legal Scholars' Guild of Zambia logo">
            <span class="brand-name">Legal Scholars' Guild of Zambia<small>Empowering Law Students. Advancing Justice.</small></span>
          </a>
          <button class="menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="primary-navigation"><span></span><span></span><span></span></button>
          <nav class="primary-nav" id="primary-navigation" aria-label="Main navigation"><ul>${links}</ul></nav>
        </div>
      </header>`;
  }

  if (footer) {
    const pageLinks = sitePages.slice(0, 9).map(([label, url]) => `<li><a href="${url}">${label}</a></li>`).join('');
    const otherLinks = externalLinks.map(([label, url]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></li>`).join('');
    const socials = socialLinks.map(([mark, label, url]) => `<a class="social-link" href="${url}" aria-label="${label}" target="_blank" rel="noopener noreferrer">${mark}</a>`).join('');

    footer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div><h2>Legal Scholars' Guild of Zambia</h2><p>Empowering Law Students. Advancing Justice.</p><div class="footer-social" aria-label="Social media">${socials}</div></div>
            <div><h3>Quick links</h3><ul>${pageLinks}</ul></div>
            <div><h3>Contact</h3><ul><li>Email: <a href="mailto:[EDIT-ME-EMAIL]">[EDIT ME: email address]</a></li><li>Phone: <a href="tel:[EDIT-ME-PHONE]">[EDIT ME: phone number]</a></li><li>Address: [EDIT ME: postal or office address]</li></ul></div>
            <div><h3>Other Useful Links</h3><ul>${otherLinks}</ul></div>
          </div>
          <div class="footer-bottom">© 2026 Legal Scholars' Guild of Zambia</div>
        </div>
      </footer>`;
  }
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path} (${response.status})`);
  return response.json();
}

function addSafeImage(container, src, alt, fallbackText) {
  if (!src) {
    container.textContent = fallbackText;
    return;
  }
  const image = document.createElement('img');
  image.src = src;
  image.alt = alt;
  image.addEventListener('error', () => {
    image.remove();
    container.textContent = fallbackText;
  }, { once: true });
  container.append(image);
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'LS';
}

function renderHomeExecutive(people) {
  const grid = document.querySelector('#home-executive');
  if (!grid) return;
  grid.replaceChildren();
  people.forEach(person => {
    const card = document.createElement('article');
    const isPresident = person.position.toLowerCase() === 'president';
    card.className = `leader-card${isPresident ? ' leader-card-president' : ''} reveal`;
    const photo = document.createElement('div');
    photo.className = 'leader-photo';
    addSafeImage(photo, person.photo, `Portrait of ${person.name}`, initials(person.name));
    const body = document.createElement('div');
    body.className = 'leader-body';
    if (isPresident) {
      const officialTitle = document.createElement('p');
      officialTitle.className = 'home-president-label';
      officialTitle.textContent = 'Office of the President';
      body.append(officialTitle);
    }
    const name = document.createElement('h3');
    name.textContent = person.name;
    const role = document.createElement('p');
    role.className = 'badge';
    role.textContent = person.position;
    const institution = document.createElement('p');
    institution.textContent = person.institution;
    body.append(name, role, institution);
    card.append(photo, body);
    grid.append(card);
  });
  observeReveals();
}

function renderHomePartners(partners) {
  const strip = document.querySelector('#home-partners');
  if (!strip) return;
  strip.replaceChildren();
  partners.slice(0, 4).forEach(partner => {
    const item = document.createElement('div');
    item.className = 'logo-item';
    if (partner.logo) addSafeImage(item, partner.logo, `${partner.name} logo`, initials(partner.name));
    else item.textContent = partner.name;
    strip.append(item);
  });
}

async function renderMemberInstitutions() {
  const grid = document.querySelector('#member-institutions');
  if (!grid) return;
  try {
    const institutions = await loadJson('data/member-institutions.json');
    grid.replaceChildren();
    institutions.forEach(institution => {
      const card = document.createElement('article');
      card.className = 'content-card';
      const title = document.createElement('h3');
      title.textContent = institution.name;
      const description = document.createElement('p');
      description.textContent = institution.description;
      card.append(title, description);
      grid.append(card);
    });
  } catch (error) {
    grid.innerHTML = '<p class="error-state">Member institution records are temporarily unavailable.</p>';
    console.error(error);
  }
}

function setupMobileNavigation() {
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#primary-navigation');
  if (!toggle || !navigation) return;
  const closeMenu = () => {
    navigation.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  };
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
    navigation.classList.toggle('is-open', !isOpen);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
}

function setupTabs() {
  document.querySelectorAll('[role="tablist"]').forEach(tabList => {
    if (tabList.classList.contains('hall-tabs')) return;
    const tabs = [...tabList.querySelectorAll('[role="tab"]')];
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tabs, index));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        activateTab(tabs, next);
        tabs[next].focus();
      });
    });
  });
}

function activateTab(tabs, activeIndex) {
  tabs.forEach((tab, index) => {
    const active = index === activeIndex;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (panel) panel.hidden = !active;
  });
}

function setupEventsFilter() {
  const buttons = document.querySelectorAll('.event-filter');
  const cards = document.querySelectorAll('.event-card');
  buttons.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.eventFilter;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = selected !== 'all' && card.dataset.status !== selected; });
  }));
}

function observeReveals() {
  const elements = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!('IntersectionObserver' in window)) {
    elements.forEach(element => element.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach(element => observer.observe(element));
}

function setupBackToTop() {
  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.type = 'button';
  button.setAttribute('aria-label', 'Back to top');
  button.textContent = '↑';
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.append(button);
  window.addEventListener('scroll', () => button.classList.toggle('is-visible', window.scrollY > 500), { passive: true });
}

document.addEventListener('DOMContentLoaded', async () => {
  renderSharedLayout();
  setupMobileNavigation();
  setupTabs();
  setupEventsFilter();
  setupBackToTop();
  observeReveals();
  renderMemberInstitutions();

  const executiveGrid = document.querySelector('#home-executive');
  if (executiveGrid) {
    try { renderHomeExecutive(await loadJson('data/current-executive.json')); }
    catch (error) { executiveGrid.innerHTML = '<p class="error-state">Executive profiles are temporarily unavailable.</p>'; console.error(error); }
  }
  const partnerStrip = document.querySelector('#home-partners');
  if (partnerStrip) {
    try { renderHomePartners(await loadJson('data/partners.json')); }
    catch (error) { partnerStrip.innerHTML = '<p class="error-state">Partner records are temporarily unavailable.</p>'; console.error(error); }
  }
});