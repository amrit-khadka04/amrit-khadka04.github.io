/* ============================
   Amrit Khadka — Transformer City Portfolio JS
   ============================ */

(function () {
  'use strict';

  /* ---------- Neural Network Background ---------- */
  var canvas = document.getElementById('neural-bg');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var PARTICLE_COUNT = 50;
    var CONNECTION_DIST = 140;
    var mouse = { x: -1000, y: -1000 };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) {
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

      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            var opacity = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.strokeStyle = 'rgba(99, 102, 241, ' + opacity + ')';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < particles.length; k++) {
        var p = particles[k];
        var mdx = p.x - mouse.x;
        var mdy = p.y - mouse.y;
        var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
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
  var cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
    document.addEventListener('mousemove', function (e) {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  /* ---------- Mobile Nav Toggle ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });

    var mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  /* ---------- Typing Effect ---------- */
  var typedOutput = document.getElementById('typed-output');
  if (typedOutput) {
    var phrases = [
      'Building multimodal AI systems',
      'Vision-Language Model researcher',
      'React Native mobile engineer',
      'Transformer architecture explorer',
      'From UPI banking apps to VLLMs',
      'Full-stack developer & AI enthusiast',
    ];
    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typingSpeed = 55;

    function type() {
      var current = phrases[phraseIndex];
      if (isDeleting) {
        typedOutput.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typedOutput.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      var delay = isDeleting ? 25 : typingSpeed;

      if (!isDeleting && charIndex === current.length) {
        delay = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 400;
      }

      setTimeout(type, delay);
    }

    setTimeout(type, 800);
  }

  /* ---------- Counter Animation ---------- */
  function animateCounters() {
    var counters = document.querySelectorAll('.stat-number');
    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-target'), 10);
      if (isNaN(target)) return;
      var current = 0;
      var increment = Math.max(1, Math.floor(target / 40));
      var stepTime = 50;

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
  var revealObserver = new IntersectionObserver(function (entries) {
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
  var countersAnimated = false;
  var statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  var statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  /* ---------- Language Bar Animation ---------- */
  var barObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var bars = entry.target.querySelectorAll('.bar-fill');
        bars.forEach(function (bar) {
          var width = bar.getAttribute('data-width');
          if (width) {
            bar.style.width = width + '%';
          }
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  var langSection = document.querySelector('.lang-bars');
  if (langSection) {
    barObserver.observe(langSection);
  }

  /* ---------- Mini-Map Active Section Tracking ---------- */
  var minimapNodes = document.querySelectorAll('.minimap-node');
  var sections = document.querySelectorAll('.building-section');

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        // Add in-view class to section for CSS animations
        entry.target.classList.add('in-view');

        // Update minimap
        var sectionId = entry.target.id;
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
      var targetEl = document.querySelector(this.getAttribute('href'));
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- Parallax Building Entrances on Scroll ---------- */
  var buildingEntrances = document.querySelectorAll('.building-entrance');

  function updateParallax() {
    var scrollY = window.scrollY;
    var windowH = window.innerHeight;

    buildingEntrances.forEach(function (entrance) {
      var rect = entrance.getBoundingClientRect();
      var centerY = rect.top + rect.height / 2;
      var offset = (centerY - windowH / 2) / windowH;
      var building = entrance.querySelector('.building-3d');
      if (building) {
        var translateY = offset * -15;
        var rotateExtra = offset * 3;
        building.style.transform = 'translateY(' + translateY + 'px)';
      }
    });
  }

  var ticking = false;
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
  var isoBuildings = document.querySelectorAll('.iso-building[data-building]');
  var buildingMap = {
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
      var target = buildingMap[this.getAttribute('data-building')];
      if (target) {
        var el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
