document.addEventListener('DOMContentLoaded', () => {
  const signalCanvas = document.querySelector('[data-signal-canvas]');
  if (signalCanvas) {
    const context = signalCanvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const basePoints = [
      [.48,.16], [.63,.22], [.72,.36], [.66,.48], [.68,.64], [.57,.79], [.43,.83], [.29,.73], [.23,.57], [.31,.43], [.29,.27],
      [.49,.29], [.58,.39], [.47,.46], [.61,.55], [.48,.62], [.36,.57], [.40,.36], [.53,.72]
    ];
    const triangles = [
      [0,10,11], [0,11,1], [1,11,12], [1,12,2], [2,12,3], [3,12,14], [3,14,4], [4,14,18], [4,18,5],
      [5,18,6], [6,18,7], [7,18,16], [7,16,8], [8,16,9], [8,9,10], [9,17,10], [10,17,11], [11,17,13],
      [11,13,12], [12,13,14], [13,15,14], [14,15,18], [15,16,18], [13,16,15], [9,16,17], [16,13,17]
    ];
    let width = 0;
    let height = 0;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const resizeSignal = () => {
      const bounds = signalCanvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      signalCanvas.width = Math.max(1, Math.round(width * ratio));
      signalCanvas.height = Math.max(1, Math.round(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawSignal = (time = 0) => {
      if (!width || !height) resizeSignal();
      const seconds = time * .001;
      const scale = Math.min(width, height) * .93;
      const centerX = width * .5;
      const centerY = height * .46;
      const angle = reducedMotion ? -.06 : Math.sin(seconds * .19) * .075 + pointerX * .045;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const points = basePoints.map(([x, y], index) => {
        const wave = reducedMotion ? 0 : Math.sin(seconds * .62 + index * 1.73) * scale * .012;
        const px = (x - .5) * scale + wave + pointerX * scale * (.025 + (index % 3) * .004);
        const py = (y - .5) * scale + Math.cos(seconds * .48 + index) * (reducedMotion ? 0 : scale * .009) + pointerY * scale * .022;
        return [centerX + px * cosine - py * sine, centerY + px * sine + py * cosine];
      });

      context.clearRect(0, 0, width, height);
      const aura = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale * .46);
      aura.addColorStop(0, 'rgba(99, 214, 231, .16)');
      aura.addColorStop(.5, 'rgba(59, 119, 164, .07)');
      aura.addColorStop(1, 'rgba(20, 35, 57, 0)');
      context.fillStyle = aura;
      context.fillRect(0, 0, width, height);

      triangles.forEach((triangle, index) => {
        const [a, b, c] = triangle.map((pointIndex) => points[pointIndex]);
        const gradient = context.createLinearGradient(a[0], a[1], c[0], c[1]);
        const pulse = reducedMotion ? .04 : Math.sin(seconds * .7 + index * .9) * .022;
        gradient.addColorStop(0, `rgba(83, 137, 171, ${.08 + (index % 4) * .025 + pulse})`);
        gradient.addColorStop(1, `rgba(116, 225, 224, ${.17 + (index % 5) * .03 + pulse})`);
        context.beginPath();
        context.moveTo(a[0], a[1]);
        context.lineTo(b[0], b[1]);
        context.lineTo(c[0], c[1]);
        context.closePath();
        context.fillStyle = gradient;
        context.fill();
        context.strokeStyle = `rgba(163, 231, 234, ${.06 + (index % 3) * .025})`;
        context.lineWidth = .65;
        context.stroke();
      });

      context.beginPath();
      [0,1,2,3,4,5,6,7,8,9,10,0].forEach((pointIndex, index) => {
        const [x, y] = points[pointIndex];
        if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
      });
      context.strokeStyle = 'rgba(164, 233, 234, .24)';
      context.lineWidth = 1;
      context.shadowColor = 'rgba(72, 208, 226, .34)';
      context.shadowBlur = 16;
      context.stroke();
      context.shadowBlur = 0;

      if (!reducedMotion) frame = requestAnimationFrame(drawSignal);
    };

    signalCanvas.addEventListener('pointermove', (event) => {
      const bounds = signalCanvas.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width - .5;
      pointerY = (event.clientY - bounds.top) / bounds.height - .5;
    });
    signalCanvas.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
    const resizeObserver = new ResizeObserver(() => { resizeSignal(); if (reducedMotion) drawSignal(); });
    resizeObserver.observe(signalCanvas);
    resizeSignal();
    drawSignal();
    window.addEventListener('pagehide', () => cancelAnimationFrame(frame), { once: true });
  }

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
