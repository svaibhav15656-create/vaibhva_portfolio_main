// Visitor counter popup (real incrementing count — free, no signup)
(function () {
  const popup = document.getElementById('visitorPopup');
  const closeBtn = document.getElementById('visitorClose');
  const numberEl = document.getElementById('visitorNumber');
  if (!popup) return;

  const KEY = 'svaibhav15656-create-portfolio-visits';
  let typewriterStarted = false;

  function showPopup() {
    popup.classList.add('visible');
  }
  function hidePopup() {
    popup.classList.remove('visible');
    if (!typewriterStarted) {
      typewriterStarted = true;
      startTypewriter();
    }
  }

  fetch(`https://countapi.mileshilliard.com/api/v1/hit/${KEY}`)
    .then((res) => res.json())
    .then((data) => {
      numberEl.textContent = Number(data.value).toLocaleString();
    })
    .catch(() => {
      numberEl.textContent = '—';
    })
    .finally(() => {
      showPopup();
      setTimeout(hidePopup, 3000);
    });

  closeBtn.addEventListener('click', hidePopup);
  popup.addEventListener('click', (e) => {
    if (e.target === popup) hidePopup();
  });
})();

// Background music toggle
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const musicIconOn = document.getElementById("musicIconOn");
const musicIconOff = document.getElementById("musicIconOff");

if (bgMusic && musicToggle) {
    bgMusic.volume = 0.5;
    let userPaused = false;

    musicIconOn.style.display = "none";
    musicIconOff.style.display = "block";

    bgMusic.muted = true;
    bgMusic.play().catch(() => {});

    const unmuteOnInteraction = async () => {
        if (userPaused) return;
        bgMusic.muted = false;
        try {
            await bgMusic.play();
        } catch (err) {
            console.log("Unmute/play failed", err);
        }
        musicToggle.classList.add("playing");
        musicIconOn.style.display = "block";
        musicIconOff.style.display = "none";
        document.removeEventListener("click", unmuteOnInteraction);
        document.removeEventListener("keydown", unmuteOnInteraction);
        document.removeEventListener("touchstart", unmuteOnInteraction);
        hideClickHintFn();
    };
    document.addEventListener("click", unmuteOnInteraction);
    document.addEventListener("keydown", unmuteOnInteraction);
    document.addEventListener("touchstart", unmuteOnInteraction);

    musicToggle.addEventListener("click", async () => {
        hideClickHintFn();
        if (bgMusic.muted || bgMusic.paused) {
            userPaused = false;
            bgMusic.muted = false;
            try {
                await bgMusic.play();
                musicToggle.classList.add("playing");
                musicIconOn.style.display = "block";
                musicIconOff.style.display = "none";
            } catch (err) {
                console.log("Playback failed");
            }
        } else {
            userPaused = true;
            bgMusic.pause();
            musicToggle.classList.remove("playing");
            musicIconOn.style.display = "none";
            musicIconOff.style.display = "block";
        }
    });
}

// Projects coverflow carousel
const projectTrack = document.getElementById('projectTrack');
const projPrev = document.getElementById('projPrev');
const projNext = document.getElementById('projNext');
const projDotsWrap = document.getElementById('projDots');

if (projectTrack) {
  const cards = Array.from(projectTrack.children);
  const total = cards.length;
  let activeIndex = 0;

  cards.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.addEventListener('click', () => {
      activeIndex = i;
      render();
    });
    projDotsWrap.appendChild(dot);
  });
  const dots = Array.from(projDotsWrap.children);

  function render() {
    cards.forEach((card, i) => {
      let diff = i - activeIndex;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;

      const spacing = 240;
      const scale = Math.max(1 - Math.abs(diff) * 0.18, 0.55);
      const opacity = Math.max(1 - Math.abs(diff) * 0.35, 0);
      const translateX = diff * spacing;
      const zIndex = 10 - Math.abs(diff);

      card.style.transform = `translateX(${translateX}px) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
      card.style.pointerEvents = diff === 0 ? 'auto' : 'none';
      card.classList.toggle('is-center', diff === 0);
    });

    dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
  }

  projNext.addEventListener('click', () => {
    activeIndex = (activeIndex + 1) % total;
    render();
  });

  projPrev.addEventListener('click', () => {
    activeIndex = (activeIndex - 1 + total) % total;
    render();
  });

  render();
}

// Floating "click anywhere" hint
const clickHint = document.getElementById('clickHint');
let hideClickHintFn = () => {};

if (clickHint) {
  let hintActive = true;
  let x = Math.random() * (window.innerWidth - 220);
  let y = Math.random() * (window.innerHeight - 60);

  const angle = Math.random() * Math.PI * 2;
  const speed = 0.35;
  let vx = Math.cos(angle) * speed;
  let vy = Math.sin(angle) * speed;

  clickHint.style.transform = `translate(${x}px, ${y}px)`;
  requestAnimationFrame(() => clickHint.classList.add('visible'));

  function animateHint() {
    if (!hintActive) return;

    const rect = clickHint.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    x += vx;
    y += vy;

    if (x <= 0) { x = 0; vx = Math.abs(vx); }
    if (x >= maxX) { x = maxX; vx = -Math.abs(vx); }
    if (y <= 0) { y = 0; vy = Math.abs(vy); }
    if (y >= maxY) { y = maxY; vy = -Math.abs(vy); }

    clickHint.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(animateHint);
  }
  requestAnimationFrame(animateHint);

  hideClickHintFn = () => {
    hintActive = false;
    clickHint.classList.remove('visible');
    clickHint.classList.add('fade-out');
    setTimeout(() => clickHint.remove(), 500);
  };
}

// Watery ripple effect
const waterCanvas = document.getElementById('waterCanvas');

if (waterCanvas) {
  const ctx = waterCanvas.getContext('2d');
  let ripples = [];
  let lastRippleTime = 0;
  const rippleInterval = 90;
  const accentColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent').trim() || '#e0a052';

  function resizeCanvas() {
    waterCanvas.width = window.innerWidth * window.devicePixelRatio;
    waterCanvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function hexToRgb(hex) {
    const parsed = hex.replace('#', '');
    const bigint = parseInt(parsed, 16);
    return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
  }
  const rgb = accentColor.startsWith('#') ? hexToRgb(accentColor) : '224, 160, 82';

  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastRippleTime < rippleInterval) return;
    lastRippleTime = now;
    ripples.push({
      x: e.clientX,
      y: e.clientY,
      radius: 4,
      maxRadius: 70 + Math.random() * 30,
      opacity: 0.35
    });
  });

  function drawRipples() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    ripples.forEach((r) => {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rgb}, ${r.opacity})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      r.radius += (r.maxRadius - r.radius) * 0.06 + 0.4;
      r.opacity *= 0.965;
    });

    ripples = ripples.filter((r) => r.opacity > 0.02);
    requestAnimationFrame(drawRipples);
  }
  drawRipples();
}

// Glowing cursor trail
const cursorGlow = document.getElementById('cursorGlow');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let glowX = mouseX;
let glowY = mouseY;

if (cursorGlow) {
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorGlow.classList.add('active');
  });

  window.addEventListener('mouseleave', () => {
    cursorGlow.classList.remove('active');
  });

  function animateGlow() {
    const ease = 0.12;
    glowX += (mouseX - glowX) * ease;
    glowY += (mouseY - glowY) * ease;
    cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

// Typewriter effect for hero heading
const typewriterEl = document.getElementById('typewriter');

function startTypewriter() {
  if (!typewriterEl) return;
  const plainPart = "Hi, I'm ";
  const accentPart = "Vaibhav";
  const fullText = plainPart + accentPart;
  let i = 0;
  const speed = 70;

  function typeChar() {
    if (i <= fullText.length) {
      const typedSoFar = fullText.slice(0, i);
      if (typedSoFar.length <= plainPart.length) {
        typewriterEl.innerHTML = typedSoFar;
      } else {
        const plain = typedSoFar.slice(0, plainPart.length);
        const accent = typedSoFar.slice(plainPart.length);
        typewriterEl.innerHTML = plain + '<span class="accent">' + accent + '</span>';
      }
      i++;
      setTimeout(typeChar, speed);
    }
  }
  typeChar();
}

// Hover tilt / parallax effect on hero photo
const wrap = document.getElementById('photoWrap');
const card = document.getElementById('photoCard');
const inner = document.getElementById('photoInner');
const shine = document.getElementById('shine');

if (wrap) {
  wrap.addEventListener('mousemove', (e) => {
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -8;
    const rotateY = ((x - cx) / cx) * 8;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    inner.style.transform = `translate(${(x - cx) / 15}px, ${(y - cy) / 15}px) scale(1.08)`;
    shine.style.opacity = '0.12';
    shine.style.background = `radial-gradient(circle at ${x}px ${y}px, white, transparent 60%)`;
  });

  wrap.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0) rotateY(0) scale(1)';
    inner.style.transform = 'translate(0,0) scale(1)';
    shine.style.opacity = '0';
  });
}

// Simple scroll-reveal for sections
const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

sections.forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(24px)';
  section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  observer.observe(section);
});

// 1. Scroll progress bar
(function () {
  const scrollProgress = document.getElementById('scrollProgress');
  if (!scrollProgress) return;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  });
})();

// 2. Count-up animation for stat numbers
(function () {
  const statNums = document.querySelectorAll('.stat-num');
  if (!statNums.length) return;

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent.trim();
        const suffix = text.replace(/[0-9]/g, '');
        const target = parseInt(text.replace(/[^0-9]/g, ''), 10);
        if (isNaN(target)) return;

        let current = 0;
        const duration = 1200;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = target / steps;

        const counter = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = target + suffix;
            clearInterval(counter);
          } else {
            el.textContent = Math.floor(current) + suffix;
          }
        }, stepTime);

        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => statObserver.observe(el));
})();

// 3. Staggered reveal for tech items and timeline items
(function () {
  function staggerReveal(selector, groupSelector, delayStep) {
    const items = document.querySelectorAll(selector);
    if (!items.length) return;
    items.forEach(item => item.classList.add('stagger-hidden'));

    const groupObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const parent = entry.target;
          const children = Array.from(parent.querySelectorAll(selector));
          children.forEach((child, i) => {
            setTimeout(() => {
              child.classList.remove('stagger-hidden');
              child.classList.add('stagger-visible');
            }, i * delayStep);
          });
          groupObserver.unobserve(parent);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll(groupSelector).forEach(parent => {
      groupObserver.observe(parent);
    });
  }

  staggerReveal('.tech-item', '.tech-grid', 50);
  staggerReveal('.timeline-item', '.timeline', 120);
})();

// 4. Section dot indicator
(function () {
  const sectionDotsWrap = document.getElementById('sectionDots');
  if (!sectionDotsWrap) return;

  const trackedSections = document.querySelectorAll('main section');
  if (!trackedSections.length) return;

  trackedSections.forEach(sec => {
    const dot = document.createElement('span');
    dot.className = 'sdot';
    dot.addEventListener('click', () => {
      sec.scrollIntoView({ behavior: 'smooth' });
    });
    sectionDotsWrap.appendChild(dot);
  });
  const sdots = Array.from(sectionDotsWrap.children);

  const sectionDotObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = Array.from(trackedSections).indexOf(entry.target);
      if (entry.isIntersecting && idx !== -1) {
        sdots.forEach(d => d.classList.remove('active'));
        sdots[idx].classList.add('active');
      }
    });
  }, { threshold: 0.5 });

  trackedSections.forEach(sec => sectionDotObserver.observe(sec));
})();

// 5. Magnetic hover effect for social links and carousel arrows
(function () {
  function applyMagnetic(selector, strength) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  applyMagnetic('.social-row a', 0.3);
  applyMagnetic('.carousel-arrow', 0.35);
})();

// 6. Heading text reveal
(function () {
  const headings = document.querySelectorAll('main section h2');
  if (!headings.length) return;

  headings.forEach(h => {
    const words = h.textContent.trim().split(/\s+/);
    h.innerHTML = words
      .map(w => `<span class="reveal-word">${w}</span>`)
      .join(' ');
  });

  const headingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const spans = entry.target.querySelectorAll('.reveal-word');
        spans.forEach((span, i) => {
          setTimeout(() => {
            span.classList.add('reveal-visible');
          }, i * 60);
        });
        headingObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  headings.forEach(h => headingObserver.observe(h));
})();

// 7. Subtle film-grain overlay
(function () {
  const grain = document.createElement('div');
  grain.className = 'grain-overlay';
  document.body.appendChild(grain);
})();

// 8. Scroll-scrub the project coverflow carousel with mouse wheel
(function () {
  const track = document.getElementById('projectTrack');
  const carousel = document.querySelector('.project-carousel');
  if (!track || !carousel) return;

  let scrubCooldown = false;

  carousel.addEventListener('wheel', (e) => {
    if (scrubCooldown) return;
    e.preventDefault();

    const goingNext = e.deltaY > 0;
    const nextBtn = document.getElementById('projNext');
    const prevBtn = document.getElementById('projPrev');
    if (goingNext && nextBtn) nextBtn.click();
    if (!goingNext && prevBtn) prevBtn.click();

    scrubCooldown = true;
    setTimeout(() => { scrubCooldown = false; }, 450);
  }, { passive: false });
})();

// 9. Text scramble effect on hero role text
(function () {
  const roleEl = document.querySelector('.role');
  if (!roleEl) return;

  const finalHTML = roleEl.innerHTML;
  const finalText = roleEl.textContent;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!<>-_\\/[]{}—=+*^?#';

  let frame = 0;
  const totalFrames = 24;
  let scrambleInterval = null;

  function runScramble() {
    scrambleInterval = setInterval(() => {
      let output = '';
      const revealCount = Math.floor((frame / totalFrames) * finalText.length);

      for (let i = 0; i < finalText.length; i++) {
        if (finalText[i] === ' ') {
          output += ' ';
        } else if (i < revealCount) {
          output += finalText[i];
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      roleEl.textContent = output;
      frame++;

      if (frame > totalFrames) {
        clearInterval(scrambleInterval);
        roleEl.innerHTML = finalHTML;
      }
    }, 35);
  }

  const roleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runScramble();
        roleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  roleObserver.observe(roleEl);
})();

// 10. Konami code easter egg
(function () {
  const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let position = 0;

  function showKonamiToast() {
    const toast = document.createElement('div');
    toast.className = 'konami-toast';
    toast.textContent = '🎉 Konami code activated — disco mode!';
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  document.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === konamiSequence[position]) {
      position++;
      if (position === konamiSequence.length) {
        document.body.classList.toggle('disco-mode');
        showKonamiToast();
        position = 0;
      }
    } else {
      position = key === konamiSequence[0] ? 1 : 0;
    }
  });
})();

// 11. Marquee strip — pause on hover is handled purely via CSS (:hover),
// no JS needed. Included here only as a placeholder in case a manual
// pause/play toggle is wanted later.