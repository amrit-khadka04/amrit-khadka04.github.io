/* ============================================
   Amrit Khadka — Universe Portfolio JS
   ============================================ */

(function () {
  'use strict';

  /* ===== Configuration ===== */
  var GITHUB_USER = 'amritkc';
  var STAR_COUNT = 500;
  var SHOOTING_STAR_INTERVAL = 4000;
  var SUPERNOVA_INTERVAL = 12000;

  /* Planet positions (percentage-based) */
  var planetPositions = {
    home:       { xPct: 50, yPct: 30 },
    about:      { xPct: 18, yPct: 20 },
    education:  { xPct: 82, yPct: 18 },
    skills:     { xPct: 86, yPct: 50 },
    projects:   { xPct: 75, yPct: 82 },
    experience: { xPct: 18, yPct: 78 },
    contact:    { xPct: 50, yPct: 92 }
  };

  /* Star colors for variety */
  var starColors = [
    { r: 255, g: 255, b: 255 },
    { r: 200, g: 220, b: 255 },
    { r: 255, g: 220, b: 200 },
    { r: 180, g: 200, b: 255 },
    { r: 255, g: 200, b: 180 },
    { r: 220, g: 255, b: 220 },
    { r: 255, g: 180, b: 220 }
  ];

  /* ===== State ===== */
  var state = {
    zoom: 1,
    targetZoom: 1,
    panX: 0, panY: 0,
    targetPanX: 0, targetPanY: 0,
    isDragging: false,
    dragStartX: 0, dragStartY: 0,
    dragPanStartX: 0, dragPanStartY: 0,
    mouseX: 0, mouseY: 0,
    activeSection: null,
    loaded: false,
    repos: [],
    touchDist: 0,
    rocketAnimating: false
  };

  var MIN_ZOOM = 0.5;
  var MAX_ZOOM = 3.0;
  var ZOOM_SPEED = 0.15;
  var LERP = 0.1;

  /* ===== DOM References ===== */
  var loadingScreen, loadingBar, loadingText;
  var cursorGlow, starsCanvas, starsCtx;
  var universe, planets;
  var panels, panelCloses;
  var zoomInBtn, zoomOutBtn, zoomResetBtn;
  var navBtns;
  var codeModal, codeModalTitle, codeModalContent, codeModalClose, codeModalLoading;
  var shootingStarsEl, supernovaContainer;
  var rocketEl;
  var stars = [];
  var animFrameId;

  /* ===== Initialization ===== */
  function init() {
    cacheDOM();
    positionPlanets();
    initStars();
    initShootingStars();
    initSupernova();
    bindEvents();
    startLoadingSequence();
    animate();
  }

  function cacheDOM() {
    loadingScreen = document.getElementById('loading-screen');
    loadingBar = document.getElementById('loading-bar');
    loadingText = document.getElementById('loading-text');
    cursorGlow = document.getElementById('cursor-glow');
    starsCanvas = document.getElementById('stars-canvas');
    starsCtx = starsCanvas.getContext('2d');
    universe = document.getElementById('universe');
    planets = document.querySelectorAll('.planet');
    panels = document.querySelectorAll('.section-panel');
    panelCloses = document.querySelectorAll('.panel-close');
    zoomInBtn = document.getElementById('zoom-in');
    zoomOutBtn = document.getElementById('zoom-out');
    zoomResetBtn = document.getElementById('zoom-reset');
    navBtns = document.querySelectorAll('.nav-btn');
    codeModal = document.getElementById('code-modal');
    codeModalTitle = document.getElementById('code-modal-title');
    codeModalContent = document.querySelector('#code-modal-content code');
    codeModalClose = document.getElementById('code-modal-close');
    codeModalLoading = document.getElementById('code-modal-loading');
    shootingStarsEl = document.getElementById('shooting-stars');
    supernovaContainer = document.getElementById('supernova-container');
    rocketEl = document.getElementById('rocket');
  }

  /* ===== Planet Positioning ===== */
  function positionPlanets() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    planets.forEach(function (planet) {
      var section = planet.dataset.section;
      var pos = planetPositions[section];
      if (pos) {
        planet.style.left = (pos.xPct / 100 * w - planet.offsetWidth / 2) + 'px';
        planet.style.top = (pos.yPct / 100 * h - planet.offsetHeight / 2) + 'px';
      }
    });
  }

  /* ===== Star Field ===== */
  function initStars() {
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
    stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      var colorObj = starColors[Math.floor(Math.random() * starColors.length)];
      stars.push({
        x: Math.random() * starsCanvas.width,
        y: Math.random() * starsCanvas.height,
        radius: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: colorObj
      });
    }
  }

  function drawStars(time) {
    starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
      var alpha = s.alpha + twinkle * 0.3;
      if (alpha < 0.1) alpha = 0.1;
      if (alpha > 1) alpha = 1;
      starsCtx.beginPath();
      starsCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      starsCtx.fillStyle = 'rgba(' + s.color.r + ',' + s.color.g + ',' + s.color.b + ',' + alpha + ')';
      starsCtx.fill();
      if (s.radius > 1.2) {
        starsCtx.beginPath();
        starsCtx.arc(s.x, s.y, s.radius * 2, 0, Math.PI * 2);
        starsCtx.fillStyle = 'rgba(' + s.color.r + ',' + s.color.g + ',' + s.color.b + ',' + (alpha * 0.15) + ')';
        starsCtx.fill();
      }
    }
  }

  /* ===== Shooting Stars ===== */
  function initShootingStars() {
    createShootingStar();
    setInterval(createShootingStar, SHOOTING_STAR_INTERVAL);
  }

  function createShootingStar() {
    if (!state.loaded) return;
    var el = document.createElement('div');
    el.className = 'shooting-star';
    var startX = Math.random() * window.innerWidth * 0.7;
    var startY = Math.random() * window.innerHeight * 0.5;
    var angle = 15 + Math.random() * 30;
    el.style.left = startX + 'px';
    el.style.top = startY + 'px';
    el.style.transform = 'rotate(' + angle + 'deg)';
    el.style.width = (60 + Math.random() * 80) + 'px';
    shootingStarsEl.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1200);
  }

  /* ===== Supernova ===== */
  function initSupernova() {
    setInterval(createSupernova, SUPERNOVA_INTERVAL);
  }

  function createSupernova() {
    if (!state.loaded) return;
    var el = document.createElement('div');
    el.className = 'supernova';
    var x = Math.random() * window.innerWidth;
    var y = Math.random() * window.innerHeight;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    var hue = Math.floor(Math.random() * 360);
    el.style.background = 'radial-gradient(circle, hsla(' + hue + ',100%,80%,0.9), hsla(' + hue + ',80%,50%,0.5), transparent)';
    supernovaContainer.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 2500);
  }

  /* ===== Whoosh Sound ===== */
  var audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playWhoosh() {
    try {
      var ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      var bufferSize = Math.floor(ctx.sampleRate * 0.5);
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        var t = i / bufferSize;
        var envelope = Math.sin(t * Math.PI);
        data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
      }
      var source = ctx.createBufferSource();
      source.buffer = buffer;
      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
      filter.Q.value = 0.8;
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch (e) {
      /* Audio not available */
    }
  }

  /* ===== Rocket Travel Animation ===== */
  function animateRocket(targetSection, callback) {
    if (state.rocketAnimating) return;
    state.rocketAnimating = true;

    var w = window.innerWidth;
    var h = window.innerHeight;
    var startX = w / 2;
    var startY = h / 2;
    var targetPos = planetPositions[targetSection];
    if (!targetPos) {
      state.rocketAnimating = false;
      callback();
      return;
    }
    var endX = targetPos.xPct / 100 * w;
    var endY = targetPos.yPct / 100 * h;

    var dx = endX - startX;
    var dy = endY - startY;
    var angle = Math.atan2(dy, dx) * (180 / Math.PI) - 45;

    rocketEl.style.left = startX + 'px';
    rocketEl.style.top = startY + 'px';
    rocketEl.querySelector('.rocket-body').style.transform = 'rotate(' + angle + 'deg)';
    rocketEl.classList.add('active');

    playWhoosh();

    var duration = 800;
    var startTime = performance.now();

    function step(currentTime) {
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      var cx = startX + dx * ease;
      var cy = startY + dy * ease;
      rocketEl.style.left = cx + 'px';
      rocketEl.style.top = cy + 'px';

      createRocketTrailParticle(cx, cy);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        rocketEl.classList.remove('active');
        state.rocketAnimating = false;
        callback();
      }
    }

    requestAnimationFrame(step);
  }

  var MAX_TRAIL_PARTICLES = 30;
  var activeTrailParticles = 0;

  function createRocketTrailParticle(x, y) {
    if (activeTrailParticles >= MAX_TRAIL_PARTICLES) return;
    activeTrailParticles++;
    var particle = document.createElement('div');
    particle.style.cssText = 'position:fixed;width:4px;height:4px;border-radius:50%;pointer-events:none;z-index:9998;' +
      'left:' + x + 'px;top:' + y + 'px;' +
      'background:radial-gradient(circle,rgba(0,212,255,0.8),rgba(168,85,247,0.4),transparent);' +
      'box-shadow:0 0 6px rgba(0,212,255,0.6);';
    document.body.appendChild(particle);

    var size = 4;
    var opacity = 1;
    function fadeOut() {
      size += 0.5;
      opacity -= 0.05;
      if (opacity <= 0) {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
        activeTrailParticles--;
        return;
      }
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.opacity = opacity;
      requestAnimationFrame(fadeOut);
    }
    requestAnimationFrame(fadeOut);
  }

  /* ===== Panel Management ===== */
  function openSection(section) {
    if (state.activeSection === section) return;
    closeAllPanels();
    var panel = document.getElementById('panel-' + section);
    if (!panel) return;

    if (state.rocketAnimating) return;

    animateRocket(section, function () {
      panel.classList.add('active');
      state.activeSection = section;
      updateNavActive(section);

      if (section === 'projects' && state.repos.length === 0) {
        fetchGitHubRepos();
      }
    });
  }

  function closeAllPanels() {
    panels.forEach(function (p) { p.classList.remove('active'); });
    state.activeSection = null;
    updateNavActive(null);
  }

  function updateNavActive(section) {
    navBtns.forEach(function (btn) {
      if (btn.dataset.section === section) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /* ===== GitHub Repos ===== */
  function fetchGitHubRepos() {
    var container = document.getElementById('projects-container');
    fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?sort=updated&per_page=30')
      .then(function (r) { return r.json(); })
      .then(function (repos) {
        state.repos = repos;
        renderRepos(repos, container);
      })
      .catch(function () {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;">Could not fetch repos. Try again later.</p>';
      });
  }

  function renderRepos(repos, container) {
    if (!repos || !repos.length) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;">No repositories found.</p>';
      return;
    }

    var langColors = {
      JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5',
      Java: '#b07219', Kotlin: '#A97BFF', Swift: '#F05138',
      HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
      'Jupyter Notebook': '#DA5B0B', Dart: '#00B4AB', C: '#555555',
      'C++': '#f34b7d', Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516'
    };

    var html = '';
    repos.forEach(function (repo) {
      if (repo.fork) return;
      var lang = repo.language || '';
      var langDot = lang ? '<span class="repo-lang"><span class="lang-dot" style="background:' + (langColors[lang] || '#888') + '"></span>' + lang + '</span>' : '';
      var desc = repo.description ? escapeHtml(repo.description) : 'No description';
      if (desc.length > 120) desc = desc.substring(0, 120) + '...';

      html += '<div class="repo-card glass-card">' +
        '<h4><i class="fas fa-code-branch"></i> ' + escapeHtml(repo.name) + '</h4>' +
        '<p>' + desc + '</p>' +
        '<div class="repo-meta">' + langDot +
        '<span><i class="fas fa-star"></i> ' + repo.stargazers_count + '</span>' +
        '<span><i class="fas fa-code-branch"></i> ' + repo.forks_count + '</span>' +
        '</div>' +
        '<div class="repo-links">' +
        '<a href="' + escapeHtml(repo.html_url) + '" target="_blank" rel="noopener" class="repo-link"><i class="fab fa-github"></i> Repo</a>' +
        (repo.homepage ? '<a href="' + escapeHtml(repo.homepage) + '" target="_blank" rel="noopener" class="repo-link"><i class="fas fa-external-link-alt"></i> Live</a>' : '') +
        '</div></div>';
    });

    container.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;">No repositories found.</p>';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ===== Experience Collapsible ===== */
  function initExpCollapse() {
    var headers = document.querySelectorAll('.exp-header[data-collapse]');
    headers.forEach(function (header) {
      header.addEventListener('click', function () {
        var targetId = header.getAttribute('data-collapse');
        var details = document.getElementById(targetId);
        var toggle = header.querySelector('.exp-toggle');
        if (!details) return;

        var isOpen = details.classList.contains('open');
        /* Close all first */
        document.querySelectorAll('.exp-details').forEach(function (d) { d.classList.remove('open'); });
        document.querySelectorAll('.exp-toggle').forEach(function (t) { t.classList.remove('rotated'); });

        if (!isOpen) {
          details.classList.add('open');
          if (toggle) toggle.classList.add('rotated');
        }
      });
    });
  }

  /* ===== Event Bindings ===== */
  function bindEvents() {
    window.addEventListener('resize', function () {
      positionPlanets();
      starsCanvas.width = window.innerWidth;
      starsCanvas.height = window.innerHeight;
      initStars();
    });

    /* Cursor */
    document.addEventListener('mousemove', function (e) {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
      if (!cursorGlow.classList.contains('visible')) {
        cursorGlow.classList.add('visible');
      }
    });

    document.addEventListener('mouseover', function (e) {
      var target = e.target;
      if (target.closest && (target.closest('a') || target.closest('button') || target.closest('.planet') || target.closest('.repo-card') || target.closest('.contact-card') || target.closest('.exp-header'))) {
        cursorGlow.classList.add('hovering');
      } else {
        cursorGlow.classList.remove('hovering');
      }
    });

    /* Planets */
    planets.forEach(function (planet) {
      planet.addEventListener('click', function (e) {
        e.stopPropagation();
        var section = planet.dataset.section;
        openSection(section);
      });
    });

    /* Panel close */
    panelCloses.forEach(function (btn) {
      btn.addEventListener('click', closeAllPanels);
    });

    /* Nav */
    navBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        openSection(btn.dataset.section);
      });
    });

    /* Zoom controls */
    zoomInBtn.addEventListener('click', function () { zoomBy(ZOOM_SPEED); });
    zoomOutBtn.addEventListener('click', function () { zoomBy(-ZOOM_SPEED); });
    zoomResetBtn.addEventListener('click', function () { state.targetZoom = 1; state.targetPanX = 0; state.targetPanY = 0; });

    /* Scroll zoom */
    document.addEventListener('wheel', function (e) {
      if (state.activeSection) return;
      e.preventDefault();
      zoomBy(e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED);
    }, { passive: false });

    /* Pan: mouse */
    universe.addEventListener('mousedown', function (e) {
      if (e.target.closest('.planet')) return;
      state.isDragging = true;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      state.dragPanStartX = state.targetPanX;
      state.dragPanStartY = state.targetPanY;
      universe.style.cursor = 'grabbing';
    });
    document.addEventListener('mousemove', function (e) {
      if (!state.isDragging) return;
      state.targetPanX = state.dragPanStartX + (e.clientX - state.dragStartX);
      state.targetPanY = state.dragPanStartY + (e.clientY - state.dragStartY);
    });
    document.addEventListener('mouseup', function () {
      state.isDragging = false;
      universe.style.cursor = '';
    });

    /* Touch pan/pinch */
    universe.addEventListener('touchstart', function (e) {
      if (e.target.closest('.planet')) return;
      if (e.touches.length === 1) {
        state.isDragging = true;
        state.dragStartX = e.touches[0].clientX;
        state.dragStartY = e.touches[0].clientY;
        state.dragPanStartX = state.targetPanX;
        state.dragPanStartY = state.targetPanY;
      } else if (e.touches.length === 2) {
        state.touchDist = getTouchDist(e.touches);
      }
    }, { passive: true });
    universe.addEventListener('touchmove', function (e) {
      if (e.touches.length === 1 && state.isDragging) {
        state.targetPanX = state.dragPanStartX + (e.touches[0].clientX - state.dragStartX);
        state.targetPanY = state.dragPanStartY + (e.touches[0].clientY - state.dragStartY);
      } else if (e.touches.length === 2) {
        var newDist = getTouchDist(e.touches);
        var delta = (newDist - state.touchDist) * 0.005;
        zoomBy(delta);
        state.touchDist = newDist;
      }
    }, { passive: true });
    universe.addEventListener('touchend', function () {
      state.isDragging = false;
    });

    /* Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (codeModal.classList.contains('active')) {
          codeModal.classList.remove('active');
        } else {
          closeAllPanels();
        }
      }
    });

    /* Code modal close */
    if (codeModalClose) {
      codeModalClose.addEventListener('click', function () {
        codeModal.classList.remove('active');
      });
    }
    if (codeModal) {
      codeModal.addEventListener('click', function (e) {
        if (e.target === codeModal) {
          codeModal.classList.remove('active');
        }
      });
    }

    /* Experience collapsible */
    initExpCollapse();
  }

  /* ===== Zoom ===== */
  function zoomBy(delta) {
    state.targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.targetZoom + delta));
  }

  function getTouchDist(touches) {
    var dx = touches[0].clientX - touches[1].clientX;
    var dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* ===== Loading Sequence ===== */
  function startLoadingSequence() {
    var msgs = [
      'Initializing star systems...',
      'Generating nebula clouds...',
      'Forming black hole...',
      'Plotting planet orbits...',
      'Calibrating warp drive...',
      'Universe ready!'
    ];
    var progress = 0;
    var msgIdx = 0;
    var interval = setInterval(function () {
      progress += 3 + Math.random() * 5;
      if (progress > 100) progress = 100;
      loadingBar.style.width = progress + '%';
      if (progress > (msgIdx + 1) * (100 / msgs.length) && msgIdx < msgs.length - 1) {
        msgIdx++;
        loadingText.textContent = msgs[msgIdx];
      }
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(function () {
          loadingScreen.classList.add('hidden');
          state.loaded = true;
        }, 600);
      }
    }, 80);
  }

  /* ===== Animation Loop ===== */
  function animate() {
    var time = performance.now();
    drawStars(time);

    /* Smooth zoom/pan */
    state.zoom += (state.targetZoom - state.zoom) * LERP;
    state.panX += (state.targetPanX - state.panX) * LERP;
    state.panY += (state.targetPanY - state.panY) * LERP;
    universe.style.transform = 'translate(' + state.panX + 'px,' + state.panY + 'px) scale(' + state.zoom + ')';

    animFrameId = requestAnimationFrame(animate);
  }

  /* ===== Boot ===== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
