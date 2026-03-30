// About cards interactive animation (additive, About page only)
(function () {
  const cards = Array.from(document.querySelectorAll('.team-card'));
  if (!cards.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (reduceMotion || coarsePointer) return;

  const styleId = 'about-cards-animation-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .team-card.card-mousefx {
        --mx: 50%;
        --my: 50%;
        --glow: 0;
        transform-style: preserve-3d;
        will-change: transform, box-shadow;
      }

      .team-card.card-mousefx::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;
        background: radial-gradient(220px circle at var(--mx) var(--my), rgba(242,193,78,0.22), rgba(242,193,78,0.08) 38%, rgba(242,193,78,0) 70%);
        opacity: var(--glow);
        transition: opacity 180ms ease;
      }

      .team-card.card-mousefx .card-image-frame,
      .team-card.card-mousefx .card-content,
      .team-card.card-mousefx .tag {
        will-change: transform;
      }
    `;
    document.head.appendChild(style);
  }

  cards.forEach((card) => {
    card.classList.add('card-mousefx');

    const image = card.querySelector('.card-image-frame');
    const content = card.querySelector('.card-content');
    const tags = Array.from(card.querySelectorAll('.tag'));

    let rafId = null;
    let tx = 0;
    let ty = 0;
    let gx = 50;
    let gy = 50;
    let active = false;

    const render = () => {
      card.style.transform = `translateY(-8px) perspective(900px) rotateX(${(-ty * 8).toFixed(2)}deg) rotateY(${(tx * 9).toFixed(2)}deg)`;
      card.style.boxShadow = `${(-tx * 8).toFixed(1)}px ${(10 + ty * 6).toFixed(1)}px 40px rgba(0,0,0,0.42)`;

      card.style.setProperty('--mx', `${gx.toFixed(2)}%`);
      card.style.setProperty('--my', `${gy.toFixed(2)}%`);
      card.style.setProperty('--glow', active ? '1' : '0');

      if (image) {
        image.style.transform = `translate3d(${(tx * 8).toFixed(2)}px, ${(ty * 6).toFixed(2)}px, 24px)`;
      }

      if (content) {
        content.style.transform = `translate3d(${(tx * 4).toFixed(2)}px, ${(ty * 4).toFixed(2)}px, 18px)`;
      }

      tags.forEach((tag, index) => {
        const depth = 14 + index * 2;
        tag.style.transform = `translate3d(${(tx * (3 + index * 0.5)).toFixed(2)}px, ${(ty * (2 + index * 0.3)).toFixed(2)}px, ${depth}px)`;
      });

      rafId = null;
    };

    const requestRender = () => {
      if (rafId === null) rafId = window.requestAnimationFrame(render);
    };

    const reset = () => {
      active = false;
      tx = 0;
      ty = 0;
      gx = 50;
      gy = 50;
      requestRender();
    };

    card.addEventListener('mouseenter', () => {
      active = true;
      requestRender();
    });

    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      tx = (px - 0.5) * 2;
      ty = (py - 0.5) * 2;
      gx = px * 100;
      gy = py * 100;
      active = true;
      requestRender();
    });

    card.addEventListener('mouseleave', reset);
    card.addEventListener('blur', reset, true);
  });
})();
