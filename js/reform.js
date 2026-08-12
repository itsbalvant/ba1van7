document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('[data-menu-button]');
  const siteNav = document.querySelector('[data-site-nav]');
  menuButton?.setAttribute('aria-label', 'Open navigation');

  const closeMenu = () => {
    if (!menuButton || !siteNav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    siteNav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
  };

  menuButton?.addEventListener('click', () => {
    const nextOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(nextOpen));
    menuButton.setAttribute('aria-label', nextOpen ? 'Close navigation' : 'Open navigation');
    siteNav?.classList.toggle('is-open', nextOpen);
    document.body.classList.toggle('menu-open', nextOpen);
    document.body.style.overflow = nextOpen ? 'hidden' : '';
  });

  siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-recognition-marquee]').forEach((marquee) => {
      const track = marquee.querySelector('.recognition-marquee-track');
      const group = marquee.querySelector('.recognition-marquee-group');
      if (!track || !group || track.children.length > 1) return;
      const clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach((image) => image.setAttribute('alt', ''));
      track.appendChild(clone);
    });
  }

  document.querySelectorAll('.recognition-logo img').forEach((image) => {
    const showFallback = () => image.closest('.recognition-logo')?.classList.add('is-fallback');
    image.addEventListener('error', showFallback, { once: true });
    if (image.complete && !image.naturalWidth) showFallback();
  });

  const revealNodes = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add('is-visible'));
  }

  const filterButtons = document.querySelectorAll('[data-filter]');
  const filterItems = document.querySelectorAll('[data-category]');
  const filterResults = document.querySelector('[data-filter-results]');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      let visibleCount = 0;
      filterItems.forEach((item) => {
        const isVisible = filter === 'all' || item.dataset.category === filter;
        item.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });
      if (filterResults) {
        const count = String(visibleCount).padStart(2, '0');
        filterResults.textContent = filter === 'all' ? `Showing all ${count} entries` : `Showing ${count} ${filter} ${visibleCount === 1 ? 'entry' : 'entries'}`;
      }
    });
  });
});
