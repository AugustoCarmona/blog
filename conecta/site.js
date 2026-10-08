const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menu && nav) {
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open));
    menu.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
    nav.classList.toggle('open', !open);
  });
  nav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Abrir menú');
      nav.classList.remove('open');
    }
  });
}

const current = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav a[href]').forEach((link) => {
  if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const typewriter = document.querySelector('[data-typewriter]');
if (typewriter instanceof HTMLElement) {
  const phrase = typewriter.dataset.typewriter || '';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const quoteBand = typewriter.closest('.quote-band');
  let frame = 0;
  let previousLength = -1;

  const syncWithScroll = () => {
    frame = 0;
    if (reduceMotion || !(quoteBand instanceof HTMLElement)) {
      typewriter.textContent = phrase;
      return;
    }

    const bounds = quoteBand.getBoundingClientRect();
    const quoteCenter = bounds.top + bounds.height / 2;
    const screenCenter = window.innerHeight / 2;
    const distance = Math.abs(quoteCenter - screenCenter);
    const fullTextZone = window.innerHeight * 0.07;
    const transitionRange = window.innerHeight * 0.72;
    const progress = Math.max(0, Math.min(1, 1 - (distance - fullTextZone) / transitionRange));
    const visibleLength = Math.round(phrase.length * progress);

    if (visibleLength !== previousLength) {
      typewriter.textContent = phrase.slice(0, visibleLength);
      previousLength = visibleLength;
    }
  };

  const requestSync = () => {
    if (!frame) frame = window.requestAnimationFrame(syncWithScroll);
  };

  window.addEventListener('scroll', requestSync, { passive: true });
  window.addEventListener('resize', requestSync);
  syncWithScroll();
}

const footerTypewriter = document.querySelector('[data-footer-typewriter]');
if (footerTypewriter instanceof HTMLElement) {
  const phrase = footerTypewriter.dataset.footerTypewriter || '';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = 0;
  let position = 0;

  const stopWriting = () => {
    if (timer) window.clearInterval(timer);
    timer = 0;
  };

  const writeFooter = () => {
    if (reduceMotion) {
      footerTypewriter.textContent = phrase;
      return;
    }
    if (timer || position >= phrase.length) return;
    timer = window.setInterval(() => {
      position += 1;
      footerTypewriter.textContent = phrase.slice(0, position);
      if (position >= phrase.length) stopWriting();
    }, 72);
  };

  const resetFooter = () => {
    if (reduceMotion) return;
    stopWriting();
    position = 0;
    footerTypewriter.textContent = '';
  };

  if ('IntersectionObserver' in window) {
    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) writeFooter();
        else resetFooter();
      });
    }, { threshold: 0.35 });
    footerObserver.observe(footerTypewriter);
  } else {
    writeFooter();
  }
}

const form = document.querySelector('#contact-form');
if (form instanceof HTMLFormElement) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const body = [
      `Nombre: ${values.get('nombre')}`,
      `Empresa: ${values.get('empresa') || 'No indicada'}`,
      `Email: ${values.get('email')}`,
      '',
      'Desafío:',
      String(values.get('desafio') || ''),
    ].join('\n');
    const subject = `Consulta para Conecta — ${values.get('nombre')}`;
    const mailto = `mailto:augustocarmonaperez@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const status = document.querySelector('#form-status');
    if (status) status.textContent = 'Abrimos un borrador de email. Elegí el destinatario antes de enviarlo.';
    window.location.href = mailto;
  });
}
