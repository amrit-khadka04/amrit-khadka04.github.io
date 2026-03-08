/* ============================
   Amrit Khadka — Transformer City Portfolio JS
   ============================ */

(function () {
  'use strict';

  /* ---------- Neural Network Background ---------- */
  const canvas = document.getElementById('neural-bg');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 50;
    const CONNECTION_DIST = 140;
    const mouse = { x: -1000, y: -1000 };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.15,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.strokeStyle = 'rgba(99, 102, 241, ' + opacity + ')';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (let k = 0; k < particles.length; k++) {
        const p = particles[k];
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 200) {
          p.x += mdx * 0.008;
          p.y += mdy * 0.008;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 92, 246, ' + p.opacity + ')';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, ' + (p.opacity * 0.08) + ')';
        ctx.fill();
      }

      requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    createParticles();
    drawParticles();

    window.addEventListener('resize', function () {
      resizeCanvas();
      createParticles();
    });

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
  }

  /* ---------- Cursor Glow ---------- */
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
    document.addEventListener('mousemove', function (e) {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  /* ---------- Mobile Nav Toggle ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });

    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  /* ---------- Typing Effect ---------- */
  const typedOutput = document.getElementById('typed-output');
  if (typedOutput) {
    const phrases = [
      'Building multimodal AI systems',
      'Vision-Language Model researcher',
      'React Native mobile engineer',
      'Transformer architecture explorer',
      'From UPI banking apps to VLLMs',
      'Full-stack developer & AI enthusiast',
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 55;

    function type() {
      const current = phrases[phraseIndex];
      if (isDeleting) {
        typedOutput.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typedOutput.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      let delay = isDeleting ? 25 : typingSpeed;

      if (!isDeleting && charIndex === current.length) {
        delay = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 500;
      }

      setTimeout(type, delay);
    }

    setTimeout(type, 800);
  }

  /* ---------- Counter Animation ---------- */
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(function (counter) {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      if (isNaN(target)) return;
      let current = 0;
      const increment = Math.max(1, Math.floor(target / 40));
      const stepTime = 50;

      function update() {
        current += increment;
        if (current >= target) {
          counter.textContent = target;
          return;
        }
        counter.textContent = current;
        setTimeout(update, stepTime);
      }

      update();
    });
  }

  /* ---------- Scroll Reveal via Intersection Observer ---------- */
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('.reveal-up').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- Stats Counter Trigger ---------- */
  let countersAnimated = false;
  const statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  /* ---------- Language Bar Animation ---------- */
  const barObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const bars = entry.target.querySelectorAll('.bar-fill');
        bars.forEach(function (bar) {
          const width = bar.getAttribute('data-width');
          if (width) {
            bar.style.width = width + '%';
          }
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const langSection = document.querySelector('.lang-bars');
  if (langSection) {
    barObserver.observe(langSection);
  }

  /* ---------- Mini-Map Active Section Tracking ---------- */
  const minimapNodes = document.querySelectorAll('.minimap-node');
  const sections = document.querySelectorAll('.building-section');

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');

        const sectionId = entry.target.id;
        minimapNodes.forEach(function (node) {
          node.classList.remove('active');
          if (node.getAttribute('href') === '#' + sectionId) {
            node.classList.add('active');
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-10% 0px -10% 0px'
  });

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  /* ---------- Smooth Scroll for All Anchor Links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetEl = document.querySelector(this.getAttribute('href'));
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- Parallax Building Entrances on Scroll ---------- */
  const buildingEntrances = document.querySelectorAll('.building-entrance');

  function updateParallax() {
    const windowH = window.innerHeight;

    buildingEntrances.forEach(function (entrance) {
      const rect = entrance.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const offset = (centerY - windowH / 2) / windowH;
      const building = entrance.querySelector('.building-3d');
      if (building) {
        const translateY = offset * -15;
        building.style.transform = 'translateY(' + translateY + 'px)';
      }
    });
  }

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  });

  /* ---------- Isometric City Building Click to Navigate ---------- */
  const isoBuildings = document.querySelectorAll('.iso-building[data-building]');
  const buildingMap = {
    embedding: '#about',
    positional: '#architecture',
    attention: '#experience',
    ffn: '#projects',
    layernorm: '#education',
    output: '#contact'
  };

  isoBuildings.forEach(function (building) {
    building.style.cursor = 'pointer';
    building.addEventListener('click', function () {
      const target = buildingMap[this.getAttribute('data-building')];
      if (target) {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
