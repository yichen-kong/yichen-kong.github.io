(() => {
  const root = document.documentElement;
  let saved = 'zh';
  try { saved = localStorage.getItem('yk-lang') === 'en' ? 'en' : 'zh'; } catch {}
  root.dataset.lang = saved;
  root.lang = saved === 'zh' ? 'zh-CN' : 'en';
  const langToggle = document.querySelector('[data-lang-toggle]');
  const setLang = (lang) => {
    root.dataset.lang = lang;
    root.lang = lang === 'zh' ? 'zh-CN' : 'en';
    try { localStorage.setItem('yk-lang', lang); } catch {}
    document.querySelectorAll('[data-lang-label]').forEach((el) => {
      el.textContent = lang === 'zh' ? 'EN' : '中';
    });
    document.dispatchEvent(new CustomEvent('languagechange', { detail: lang }));
  };
  langToggle?.addEventListener('click', () => setLang(root.dataset.lang === 'zh' ? 'en' : 'zh'));

  const nav = document.querySelector('.site-nav');
  const menuButton = document.querySelector('.menu-button');
  let lastY = window.scrollY;
  let ticking = false;
  let idleTimer;
  const updateNav = () => {
    const y = window.scrollY;
    nav?.classList.toggle('is-solid', y > 24);
    if (y > 120 && y > lastY + 6 && !nav?.classList.contains('menu-open')) nav?.classList.add('is-hidden');
    if (y < lastY - 6 || y < 60) nav?.classList.remove('is-hidden');
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateNav); ticking = true; }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => nav?.classList.remove('is-hidden'), 750);
  }, { passive: true });
  nav?.addEventListener('mouseenter', () => nav.classList.remove('is-hidden'));
  nav?.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
  const setMenu = (open) => {
    nav?.classList.toggle('menu-open', open);
    nav?.classList.remove('is-hidden');
    document.body.classList.toggle('menu-locked', open);
    menuButton.setAttribute('aria-expanded', String(open));
    document.querySelectorAll('.nav-toggle').forEach(button => {
      if (!open) { button.setAttribute('aria-expanded', 'false'); button.closest('.nav-item').classList.remove('expanded'); }
    });
  };
  menuButton?.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
  document.querySelectorAll('.nav-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.nav-item');
      const open = item.classList.toggle('expanded');
      button.setAttribute('aria-expanded', String(open));
    });
  });
  document.querySelectorAll('.nav-menu a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  window.matchMedia('(max-width: 900px)').addEventListener('change', () => setMenu(false));

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));

  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const closeLightbox = () => { lightbox?.classList.remove('is-open'); document.body.classList.remove('is-locked'); };
  document.querySelectorAll('[data-lightbox]').forEach((button) => button.addEventListener('click', () => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = button.dataset.lightbox;
    lightboxImage.alt = button.dataset.alt || '';
    lightbox.classList.add('is-open');
    document.body.classList.add('is-locked');
  }));
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox || event.target.closest('[data-close-lightbox]')) closeLightbox(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });

  const sunrise = document.querySelector('[data-sunrise]');
  const sunset = document.querySelector('[data-sunset]');
  const sunDate = document.querySelector('[data-sun-date]');
  const formatTime = (value) => new Intl.DateTimeFormat(root.dataset.lang === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value));
  const updateSun = async () => {
    const date = new Date().toISOString().slice(0, 10);
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=36.6171&longitude=101.7782&daily=sunrise,sunset&timezone=Asia%2FShanghai&forecast_days=1`, { cache: 'no-store' });
      const data = await res.json();
      if (!data.daily?.sunrise?.[0] || !data.daily?.sunset?.[0]) throw new Error('sun api');
      if (sunrise) sunrise.textContent = data.daily.sunrise[0].slice(11, 16);
      if (sunset) sunset.textContent = data.daily.sunset[0].slice(11, 16);
    } catch {
      if (sunrise) sunrise.textContent = '--:--';
      if (sunset) sunset.textContent = '--:--';
    }
    if (sunDate) sunDate.textContent = new Intl.DateTimeFormat(root.dataset.lang === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'long' }).format(new Date());
  };
  updateSun();
  document.addEventListener('languagechange', updateSun);
})();
