// Hero title mouse-follow text interaction (additive, homepage-only behavior)
(function () {
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const textLayers = Array.from(heroTitle.querySelectorAll('.hero-line, .hero-accent'));
  if (!textLayers.length) return;

  const styleId = 'hero-title-animation-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .hero-title.hero-title-cursorfx {
        position: relative;
        cursor: default;
      }

      .hero-title.hero-title-cursorfx .hero-char {
        display: inline-block;
        transform: translate3d(0, 0, 0);
        will-change: transform, filter, text-shadow;
      }
    `;
    document.head.appendChild(style);
  }

  const chars = [];

  textLayers.forEach((layer) => {
    const text = layer.textContent || '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (ch === ' ') {
        fragment.appendChild(document.createTextNode(' '));
        continue;
      }

      const span = document.createElement('span');
      span.className = 'hero-char';
      span.textContent = ch;
      fragment.appendChild(span);
      chars.push(span);
    }

    layer.textContent = '';
    layer.appendChild(fragment);
  });

  if (!chars.length) return;

  heroTitle.classList.add('hero-title-cursorfx');

  const intensity = {
    radius: 180,
    maxShift: 14,
    maxBlur: 5,
  };

  let pointer = { x: -9999, y: -9999, active: false };
  let charCenters = [];
  let rafId = null;

  const updateCenters = () => {
    charCenters = chars.map((charEl) => {
      const rect = charEl.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    });
  };

  const resetChars = () => {
    chars.forEach((charEl) => {
      charEl.style.transform = 'translate3d(0, 0, 0)';
      charEl.style.filter = 'blur(0px)';
      charEl.style.textShadow = 'none';
    });
  };

  const tick = () => {
    if (!pointer.active) {
      resetChars();
      rafId = null;
      return;
    }

    chars.forEach((charEl, i) => {
      const center = charCenters[i];
      const dx = center.x - pointer.x;
      const dy = center.y - pointer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= intensity.radius) {
        charEl.style.transform = 'translate3d(0, 0, 0)';
        charEl.style.filter = 'blur(0px)';
        charEl.style.textShadow = 'none';
        return;
      }

      const force = Math.pow(1 - dist / intensity.radius, 2);
      const normX = dist === 0 ? 0 : dx / dist;
      const normY = dist === 0 ? 0 : dy / dist;
      const tx = normX * intensity.maxShift * force;
      const ty = normY * intensity.maxShift * 0.78 * force;
      const blur = intensity.maxBlur * force;
      const glow = 18 * force;

      charEl.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      charEl.style.filter = `blur(${blur.toFixed(2)}px)`;
      charEl.style.textShadow = `0 0 ${glow.toFixed(1)}px rgba(242,193,78,0.35)`;
    });

    rafId = window.requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (rafId === null) rafId = window.requestAnimationFrame(tick);
  };

  const onMove = (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    startLoop();
  };

  const onEnter = (event) => {
    updateCenters();
    onMove(event);
  };

  const onLeave = () => {
    pointer.active = false;
  };

  heroTitle.addEventListener('mouseenter', onEnter);
  heroTitle.addEventListener('mousemove', onMove);
  heroTitle.addEventListener('mouseleave', onLeave);
  window.addEventListener('resize', updateCenters);

  // Keep character centers in sync when fonts/layout finish settling.
  window.setTimeout(updateCenters, 350);
})();
