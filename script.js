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
      setTimeout(hidePopup, 5000);
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
    let userPaused = false; // true only when the user explicitly hits pause

    // Reflect "not audible yet" in the icon right away
    musicIconOn.style.display = "none";
    musicIconOff.style.display = "block";

    // 1) Autoplay muted the instant the page loads.
    //    Every browser allows muted autoplay, so this always succeeds —
    //    the track starts right on schedule, just silently.
    bgMusic.muted = true;
    bgMusic.play().catch(() => {
        // Even muted autoplay can rarely be blocked (e.g. some in-app browsers).
        // If so, playback will simply start on the first interaction below.
    });

    // 2) The moment the user does something real — click, tap, or key press —
    //    unmute automatically. Audio is already playing in sync, so sound
    //    kicks in instantly with no restart/lag. (Mouse movement and scroll
    //    don't count — browsers don't treat those as genuine user gestures,
    //    so unmuting there would silently fail.)
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

    // Manual toggle button — unmute/play if muted or paused, otherwise pause
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

  // Build dot indicators
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
      // shortest circular distance from active index
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

// Rotating skills carousel
const skillsTrack = document.getElementById('skillsTrack');
const skillsNext = document.getElementById('skillsNext');

if (skillsTrack && skillsNext) {
  let isAnimating = false;

  skillsNext.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;

    const firstCard = skillsTrack.children[0];
    const cardWidth = firstCard.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(skillsTrack).gap) || 20;
    const shiftAmount = cardWidth + gap;

    skillsTrack.style.transform = `translateX(-${shiftAmount}px)`;

    const onTransitionEnd = () => {
      skillsTrack.removeEventListener('transitionend', onTransitionEnd);
      // Move the first card to the end, then reset position instantly
      skillsTrack.appendChild(firstCard);
      skillsTrack.style.transition = 'none';
      skillsTrack.style.transform = 'translateX(0)';
      // Force reflow so the transition re-enables cleanly next click
      void skillsTrack.offsetHeight;
      skillsTrack.style.transition = '';
      isAnimating = false;
    };

    skillsTrack.addEventListener('transitionend', onTransitionEnd);
  });
}

// Floating "click anywhere" hint — drifts slowly in a random direction
// and bounces off the edges of the screen, like a DVD logo. Disappears
// as soon as the user clicks/taps/presses a key anywhere.
const clickHint = document.getElementById('clickHint');
let hideClickHintFn = () => {};

if (clickHint) {
  let hintActive = true;
  let x = Math.random() * (window.innerWidth - 220);
  let y = Math.random() * (window.innerHeight - 60);

  // Random direction, slow constant speed
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.35; // px per frame — slow drift
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

// Watery ripple effect — expanding, fading rings that trail the cursor.
// Renders on a full-viewport canvas sitting behind all real content, so it
// only shows through empty space (gaps between sections/cards), since
// anything opaque on top naturally hides it.
const waterCanvas = document.getElementById('waterCanvas');

if (waterCanvas) {
  const ctx = waterCanvas.getContext('2d');
  let ripples = [];
  let lastRippleTime = 0;
  const rippleInterval = 90; // ms between new ripples while moving
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

// Glowing cursor trail that eases toward the mouse position
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
    // ease factor: lower = more trailing lag, higher = snappier
    const ease = 0.12;
    glowX += (mouseX - glowX) * ease;
    glowY += (mouseY - glowY) * ease;
    cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

// Typewriter effect for hero heading — starts only after popup closes
const typewriterEl = document.getElementById('typewriter');

function startTypewriter() {
  if (!typewriterEl) return;
  const plainPart = "Hi, I'm ";
  const accentPart = "Vaibhav";
  const fullText = plainPart + accentPart;
  let i = 0;
  const speed = 70; // ms per character

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
// Hover tilt / parallax effect on hero photo (Lando Norris style)
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