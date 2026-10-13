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
  let toastTimer;
  let popupAnimationFrame;
  let popupShownAt = 0;
  function hideToast() {
    toast.hidden = true;
    document.body.classList.remove('visit-modal-open');
    window.clearTimeout(toastTimer);
  }
  function animatePopupCount(count) {
    window.cancelAnimationFrame(popupAnimationFrame);
    const startValue = Number(popupCount.textContent.replace(/[^\d]/g, '')) || 0;
    const duration = reducedMotion ? 0 : (startValue === 0 ? 1400 : 350);
    const started = performance.now();
    function animatePopup(now) {
      const progress = duration ? Math.min((now - started) / duration, 1) : 1;
      const value = Math.floor(startValue + (count - startValue) * progress);
      popupCount.textContent = `#${value.toLocaleString()}`;
      if (progress < 1) popupAnimationFrame = requestAnimationFrame(animatePopup);
      else if (toast && !toast.hidden) {
        window.clearTimeout(toastTimer);
        const remaining = Math.max(500, 2000 - (performance.now() - popupShownAt));
        toastTimer = window.setTimeout(hideToast, remaining);
      }
    }
    popupAnimationFrame = requestAnimationFrame(animatePopup);
  }
  function showToast(count) {
    animatePopupCount(count);
    toast.hidden = false;
    popupShownAt = performance.now();
    document.body.classList.add('visit-modal-open');
  }
  showToast(126);
  async function loadVisits() {
    try {
      const response = await fetch('/api/visits', { method: 'POST', headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error('Visit count unavailable');
      const data = await response.json();
      if (!Number.isSafeInteger(data.count) || data.count < 0) throw new Error('Invalid visit count');
      animatePopupCount(data.count);
    } catch (_) {
      // Preserve a per-browser count when the hosted counter is unavailable.
      let fallbackCount = 126;
      try {
        const previousCount = Number(localStorage.getItem('portfolio_visit_count'));
        fallbackCount = Number.isSafeInteger(previousCount) && previousCount >= 126
          ? previousCount + 1
          : 126;
        localStorage.setItem('portfolio_visit_count', String(fallbackCount));
      } catch (_) { /* Keep the initial count if browser storage is blocked. */ }
      animatePopupCount(fallbackCount);
    }
  }
  loadVisits();
})();
