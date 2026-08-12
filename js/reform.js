document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('[data-menu-button]');
  const siteNav = document.querySelector('[data-site-nav]');

  const closeMenu = () => {
    if (!menuButton || !siteNav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  menuButton?.addEventListener('click', () => {
    const nextOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(nextOpen));
    siteNav?.classList.toggle('is-open', nextOpen);
    document.body.style.overflow = nextOpen ? 'hidden' : '';
  });

  siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu();
  });

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
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
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      filterItems.forEach((item) => {
        item.hidden = filter !== 'all' && item.dataset.category !== filter;
      });
    });
  });
});
