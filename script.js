(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section')];
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-25% 0px -60% 0px' });
  sections.forEach((section) => navObserver.observe(section));

  const progress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  }, { passive: true });

  if (!reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('main section, .automation-card, .project-card, .timeline-item').forEach((item) => {
      item.classList.add('reveal'); revealObserver.observe(item);
    });
  }

  const toast = document.getElementById('visitToast');
  const close = document.getElementById('visitClose');
  const popupCount = document.getElementById('visitNumber');
  const totalCount = document.getElementById('visitTotal');
  let toastTimer;
  function hideToast() { toast.classList.remove('is-visible'); window.clearTimeout(toastTimer); window.setTimeout(() => { toast.hidden = true; }, reducedMotion ? 0 : 250); }
  close.addEventListener('click', hideToast);
  function animateCount(target) {
    totalCount.hidden = false; totalCount.setAttribute('aria-label', `${target.toLocaleString()} total visits`);
    const duration = reducedMotion ? 0 : 700; const started = performance.now();
    function frame(now) {
      const ratio = duration ? Math.min((now - started) / duration, 1) : 1;
      const value = Math.round(target * ratio);
      totalCount.textContent = `${String.fromCodePoint(128065)} ${value.toLocaleString()} total visits`;
      if (ratio < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function showToast(count) {
    if (sessionStorage.getItem('visit_popup_shown')) return;
    popupCount.textContent = `#${count.toLocaleString()}`; toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    sessionStorage.setItem('visit_popup_shown', '1');
    toastTimer = window.setTimeout(hideToast, 6000);
  }
  async function loadVisits() {
    try {
      const alreadyCounted = sessionStorage.getItem('visit_counted') === '1';
      const response = await fetch('/api/visits', { method: alreadyCounted ? 'GET' : 'POST', headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error('Visit count unavailable');
      const data = await response.json();
      if (!Number.isSafeInteger(data.count) || data.count < 0) throw new Error('Invalid visit count');
      if (!alreadyCounted) sessionStorage.setItem('visit_counted', '1');
      animateCount(data.count); showToast(data.count);
    } catch (_) { totalCount.hidden = true; toast.hidden = true; }
  }
  loadVisits();
})();
