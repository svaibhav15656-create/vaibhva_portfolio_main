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
  const popupCount = document.getElementById('visitNumber');
  const totalCount = document.getElementById('visitTotal');
  let toastTimer;
  let popupAnimationFrame;
  function hideToast() {
    toast.hidden = true;
    document.body.classList.remove('visit-modal-open');
    window.clearTimeout(toastTimer);
  }
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
  function animatePopupCount(count) {
    window.cancelAnimationFrame(popupAnimationFrame);
    const duration = reducedMotion ? 0 : 1200;
    const started = performance.now();
    function animatePopup(now) {
      const progress = duration ? Math.min((now - started) / duration, 1) : 1;
      const value = Math.floor(count * progress);
      popupCount.textContent = `#${value.toLocaleString()}`;
      if (progress < 1) popupAnimationFrame = requestAnimationFrame(animatePopup);
    }
    popupAnimationFrame = requestAnimationFrame(animatePopup);
  }
  function showToast(count) {
    animatePopupCount(count);
    toast.hidden = false;
    document.body.classList.add('visit-modal-open');
    toastTimer = window.setTimeout(hideToast, 2000);
  }
  showToast(126);
  async function loadVisits() {
    try {
      const response = await fetch('/api/visits', { method: 'POST', headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error('Visit count unavailable');
      const data = await response.json();
      if (!Number.isSafeInteger(data.count) || data.count < 0) throw new Error('Invalid visit count');
      animateCount(data.count); animatePopupCount(data.count);
    } catch (_) {
      // Keep the welcome message available even if the hosted counter API is
      // temporarily unreachable; the persistent counter is seeded at 126.
      animateCount(126);
      animatePopupCount(126);
    }
  }
  loadVisits();
})();
