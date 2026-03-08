/* ============================
   Amrit Khadka — Portfolio JS
   ============================ */

(function () {
  'use strict';

  /* ---------- Neural Network Background ---------- */
  const canvas = document.getElementById('neural-bg');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;
    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 150;
    let mouse = { x: -1000, y: -1000 };

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
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.strokeStyle = 'rgba(99, 102, 241, ' + opacity + ')';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        // Mouse interaction
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 200) {
          p.x += mdx * 0.01;
          p.y += mdy * 0.01;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Bounce at edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 92, 246, ' + p.opacity + ')';
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, ' + (p.opacity * 0.1) + ')';
        ctx.fill();
      }

      animFrame = requestAnimationFrame(drawParticles);
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
  var cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
    document.addEventListener('mousemove', function (e) {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  /* ---------- Navbar scroll effect ---------- */
  var navbar = document.getElementById('navbar');
  var navLinks = document.querySelectorAll('.nav-links a');
  var sections = document.querySelectorAll('section[id]');

  function updateNavbar() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link
    var scrollPos = window.scrollY + 200;
    sections.forEach(function (sec) {
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sec.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateNavbar);
  updateNavbar();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.querySelector('.nav-links');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('open');
    });

    // Close menu on link click
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
      });
    });
  }

  /* ---------- Typing effect ---------- */
  var typedOutput = document.getElementById('typed-output');
  if (typedOutput) {
    var phrases = [
      'Building multimodal AI systems',
      'Vision-Language Model researcher',
      'React Native mobile engineer',
      'Full-stack developer & AI enthusiast',
      'Transformer architecture explorer',
      'From UPI banking apps to VLLMs',
    ];
    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typingSpeed = 60;

    function type() {
      var current = phrases[phraseIndex];
      if (isDeleting) {
        typedOutput.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typedOutput.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      var delay = isDeleting ? 30 : typingSpeed;

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

    setTimeout(type, 1000);
  }

  /* ---------- Counter animation ---------- */
  function animateCounters() {
    var counters = document.querySelectorAll('.stat-number');
    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-target'), 10);
      if (isNaN(target)) return;
      var current = 0;
      var increment = Math.max(1, Math.floor(target / 40));
      var duration = 2000;
      var stepTime = duration / (target / increment);

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

  /* ---------- Scroll reveal ---------- */
  var revealElements = document.querySelectorAll('.reveal-up');
  var countersAnimated = false;

  function checkReveal() {
    var windowHeight = window.innerHeight;

    revealElements.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < windowHeight - 80) {
        el.classList.add('revealed');
      }
    });

    // Animate counters when hero stats become visible
    if (!countersAnimated) {
      var statsSection = document.querySelector('.hero-stats');
      if (statsSection) {
        var rect = statsSection.getBoundingClientRect();
        if (rect.top < windowHeight) {
          countersAnimated = true;
          animateCounters();
        }
      }
    }

    // Animate language bars
    document.querySelectorAll('.bar-fill').forEach(function (bar) {
      var rect = bar.getBoundingClientRect();
      if (rect.top < windowHeight - 40 && bar.style.width === '0px' || bar.style.width === '') {
        var width = bar.getAttribute('data-width');
        if (width) {
          bar.style.width = width + '%';
        }
      }
    });
  }

  window.addEventListener('scroll', checkReveal);
  window.addEventListener('load', checkReveal);

  /* ---------- Smooth scroll for nav links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- Transformer viz animation enhancement ---------- */
  var neurons = document.querySelectorAll('.neuron');
  neurons.forEach(function (neuron, i) {
    neuron.style.animationDelay = (i * 0.3) + 's';
  });

})();
