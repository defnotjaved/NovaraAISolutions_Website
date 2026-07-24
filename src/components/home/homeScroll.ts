/**
 * All GSAP/ScrollTrigger cinematics for the home page live here.
 * Everything is guarded by prefers-reduced-motion — without it the page
 * still works on the CSS [data-reveal] observer alone.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHomeScroll(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ── Hero: headline lines rise, supporting copy fades in ── */
  const heroLines = document.querySelectorAll('[data-hero-title] .line');
  const heroFades = document.querySelectorAll('[data-hero-fade]');
  if (heroLines.length) {
    gsap.set(heroLines, { yPercent: 110, opacity: 0 });
    gsap.set(heroFades, { y: 18, opacity: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(heroLines, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.12 }, 0.15)
      .to(heroFades, { y: 0, opacity: 1, duration: 0.8, stagger: 0.09 }, 0.55);
  }

  /* ── ProblemStrip: pinned scrub — lines type on one by one ── */
  const plines = gsap.utils.toArray<HTMLElement>('[data-pline]');
  const punch = document.querySelector('[data-punch]');
  if (plines.length && punch) {
    gsap.set(plines, { opacity: 0.12, x: -14 });
    gsap.set(punch, { opacity: 0, scale: 0.94 });
    plines.forEach((l) => l.querySelector('em')?.style.setProperty('--sweep', '0'));

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.problem',
        start: 'top top',
        end: '+=160%',
        pin: '.problem-pin',
        scrub: 0.6,
      },
    });
    plines.forEach((line) => {
      tl.to(line, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' });
      const em = line.querySelector('em');
      if (em) tl.fromTo(em, { '--sweep': 0 }, { '--sweep': 1, duration: 0.3 }, '<0.2');
    });
    tl.to(punch, { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.4)' }, '+=0.2');
  }

  /* ── Constellation: draw SVG lines between product cards ── */
  const grid = document.querySelector<HTMLElement>('[data-const-grid]');
  const svg = document.querySelector<SVGSVGElement>('[data-const-lines]');
  if (grid && svg) {
    const drawLines = () => {
      const cards = Array.from(grid.querySelectorAll<HTMLElement>('article'));
      if (cards.length < 2) return;
      const gRect = grid.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${gRect.width} ${gRect.height}`);
      svg.innerHTML = '';
      for (let i = 0; i < cards.length - 1; i++) {
        const a = cards[i].getBoundingClientRect();
        const b = cards[i + 1].getBoundingClientRect();
        const x1 = a.left - gRect.left + a.width / 2;
        const y1 = a.top - gRect.top + a.height / 2;
        const x2 = b.left - gRect.left + b.width / 2;
        const y2 = b.top - gRect.top + b.height / 2;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M${x1} ${y1} L${x2} ${y2}`);
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '1');
        path.setAttribute('stroke-dasharray', '3 6');
        svg.appendChild(path);
        const len = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDashoffset: len, opacity: 0 },
          {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: { trigger: cards[i + 1], start: 'top 85%' },
          }
        );
      }
    };
    drawLines();
    let resizeT: number | undefined;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(() => {
        ScrollTrigger.refresh();
        drawLines();
      }, 250);
    });
  }

  /* ── Finale: blobs converge + brighten as the section scrolls in ── */
  const finaleBlobs = gsap.utils.toArray<HTMLElement>('[data-finale-blob]');
  if (finaleBlobs.length) {
    gsap.fromTo(
      finaleBlobs,
      { scale: 1.25, opacity: 0.25 },
      {
        scale: 1,
        opacity: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.finale',
          start: 'top 80%',
          end: 'center center',
          scrub: 0.8,
        },
      }
    );
  }
}
