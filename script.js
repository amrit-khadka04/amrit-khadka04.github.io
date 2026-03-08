/* ============================================
   Amrit Khadka — Universe Portfolio JS
   ============================================ */

(function () {
  'use strict';

  /* ===== Configuration ===== */
  var GITHUB_USER = 'amritkc';
  var STAR_COUNT = 400;
  var SHOOTING_STAR_INTERVAL = 4000;

  /* Planet positions (percentage-based for responsiveness) */
  var planetPositions = {
    home:       { xPct: 50, yPct: 50 },
    about:      { xPct: 22, yPct: 25 },
    skills:     { xPct: 78, yPct: 22 },
    projects:   { xPct: 78, yPct: 75 },
    experience: { xPct: 22, yPct: 75 },
    contact:    { xPct: 50, yPct: 88 }
  };

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
    touchDist: 0
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
  var skillsCanvas, skillsCtx;
  var shootingStarsEl;
  var stars = [];
  var skillStars = [];
  var animFrameId;

  /* ===== Initialization ===== */
  function init() {
    cacheDOM();
    positionPlanets();
    initStars();
    initShootingStars();
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

  /* ===== Stars ===== */
  function initStars() {
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
    stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * starsCanvas.width,
        y: Math.random() * starsCanvas.height,
        radius: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.5 + 0.1,
        parallax: Math.random() * 0.5 + 0.2
      });
    }
  }

  function drawStars() {
    starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    var cx = (state.mouseX / window.innerWidth - 0.5) * 2;
    var cy = (state.mouseY / window.innerHeight - 0.5) * 2;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var px = s.x + cx * s.parallax * 30;
      var py = s.y + cy * s.parallax * 30;
      s.alpha += (Math.random() - 0.5) * 0.02;
      if (s.alpha < 0.1) s.alpha = 0.1;
      if (s.alpha > 1) s.alpha = 1;

      starsCtx.beginPath();
      starsCtx.arc(px, py, s.radius, 0, Math.PI * 2);
      starsCtx.fillStyle = 'rgba(255, 255, 255, ' + s.alpha + ')';
      starsCtx.fill();

      if (s.radius > 1.2) {
        starsCtx.beginPath();
        starsCtx.arc(px, py, s.radius * 2.5, 0, Math.PI * 2);
        starsCtx.fillStyle = 'rgba(100, 200, 255, ' + (s.alpha * 0.15) + ')';
        starsCtx.fill();
      }
    }
  }

  /* ===== Shooting Stars ===== */
  function initShootingStars() {
    setInterval(createShootingStar, SHOOTING_STAR_INTERVAL);
    setTimeout(createShootingStar, 1000);
  }

  function createShootingStar() {
    if (state.activeSection) return;
    var star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.top = (Math.random() * 60) + '%';
    star.style.left = (Math.random() * 70) + '%';
    star.style.transform = 'rotate(' + (Math.random() * 30 + 15) + 'deg)';
    shootingStarsEl.appendChild(star);
    setTimeout(function () {
      if (star.parentNode) star.parentNode.removeChild(star);
    }, 1500);
  }

  /* ===== Skills Constellation ===== */
  function initSkillsConstellation() {
    skillsCanvas = document.getElementById('skills-canvas');
    if (!skillsCanvas) return;
    skillsCtx = skillsCanvas.getContext('2d');
    var rect = skillsCanvas.getBoundingClientRect();
    skillsCanvas.width = rect.width;
    skillsCanvas.height = rect.height || 300;

    var skillNames = ['Python', 'PyTorch', 'React', 'JavaScript', 'Docker', 'CUDA', 'NLP', 'CV', 'Node.js', 'SQL', 'Git', 'AWS', 'HuggingFace', 'TypeScript'];
    skillStars = [];
    var w = skillsCanvas.width;
    var h = skillsCanvas.height;
    var padding = 40;

    for (var i = 0; i < skillNames.length; i++) {
      skillStars.push({
        x: padding + Math.random() * (w - 2 * padding),
        y: padding + Math.random() * (h - 2 * padding),
        radius: 3 + Math.random() * 4,
        name: skillNames[i],
        alpha: 0.6 + Math.random() * 0.4,
        hovered: false,
        color: ['#00d4ff', '#a855f7', '#34d399', '#fb923c', '#f472b6'][Math.floor(Math.random() * 5)]
      });
    }
    drawSkillsConstellation();
    skillsCanvas.addEventListener('mousemove', handleSkillHover);
  }

  function drawSkillsConstellation() {
    if (!skillsCtx) return;
    skillsCtx.clearRect(0, 0, skillsCanvas.width, skillsCanvas.height);

    /* Draw connections */
    for (var i = 0; i < skillStars.length; i++) {
      for (var j = i + 1; j < skillStars.length; j++) {
        var dx = skillStars[i].x - skillStars[j].x;
        var dy = skillStars[i].y - skillStars[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          skillsCtx.beginPath();
          skillsCtx.moveTo(skillStars[i].x, skillStars[i].y);
          skillsCtx.lineTo(skillStars[j].x, skillStars[j].y);
          skillsCtx.strokeStyle = 'rgba(0, 212, 255, ' + (0.15 * (1 - dist / 180)) + ')';
          skillsCtx.lineWidth = 1;
          skillsCtx.stroke();
        }
      }
    }

    /* Draw stars */
    for (var k = 0; k < skillStars.length; k++) {
      var s = skillStars[k];
      /* Glow */
      skillsCtx.beginPath();
      skillsCtx.arc(s.x, s.y, s.radius * 3, 0, Math.PI * 2);
      skillsCtx.fillStyle = s.color.replace(')', ', 0.15)').replace('rgb', 'rgba');
      try { skillsCtx.fillStyle = s.color + '26'; } catch(e) {}
      skillsCtx.fill();

      /* Star dot */
      skillsCtx.beginPath();
      skillsCtx.arc(s.x, s.y, s.hovered ? s.radius * 1.5 : s.radius, 0, Math.PI * 2);
      skillsCtx.fillStyle = s.color;
      skillsCtx.fill();

      /* Label on hover */
      if (s.hovered) {
        skillsCtx.font = '12px "Orbitron", sans-serif';
        skillsCtx.fillStyle = '#fff';
        skillsCtx.textAlign = 'center';
        skillsCtx.fillText(s.name, s.x, s.y - s.radius * 2 - 6);
      }
    }
  }

  function handleSkillHover(e) {
    var rect = skillsCanvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var anyHovered = false;
    for (var i = 0; i < skillStars.length; i++) {
      var dx = skillStars[i].x - mx;
      var dy = skillStars[i].y - my;
      skillStars[i].hovered = Math.sqrt(dx * dx + dy * dy) < 20;
      if (skillStars[i].hovered) anyHovered = true;
    }
    drawSkillsConstellation();
    skillsCanvas.style.cursor = anyHovered ? 'pointer' : 'default';
  }

  /* ===== Loading Sequence ===== */
  function startLoadingSequence() {
    var messages = [
      'Initializing star systems...',
      'Mapping galaxy coordinates...',
      'Loading planetary data...',
      'Calibrating warp drive...',
      'Fetching GitHub repositories...',
      'Universe ready!'
    ];
    var progress = 0;
    var step = 0;
    var interval = setInterval(function () {
      progress += Math.random() * 18 + 5;
      if (progress > 100) progress = 100;
      loadingBar.style.width = progress + '%';
      if (progress >= (step + 1) * (100 / messages.length) && step < messages.length - 1) {
        step++;
        loadingText.textContent = messages[step];
      }
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(function () {
          loadingScreen.classList.add('hidden');
          state.loaded = true;
          cursorGlow.classList.add('visible');
        }, 500);
      }
    }, 200);
  }

  /* ===== Events ===== */
  function bindEvents() {
    /* Cursor */
    document.addEventListener('mousemove', function (e) {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });

    /* Hover detection for cursor */
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      if (t.closest && (t.closest('.planet') || t.closest('a') || t.closest('button') || t.closest('.repo-card') || t.closest('.nav-btn') || t.closest('.contact-card'))) {
        cursorGlow.classList.add('hovering');
      } else {
        cursorGlow.classList.remove('hovering');
      }
    });

    /* Planet clicks */
    planets.forEach(function (planet) {
      planet.addEventListener('click', function () {
        var section = planet.dataset.section;
        openSection(section);
        playClickSound();
      });
    });

    /* Panel close */
    panelCloses.forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeActiveSection();
      });
    });

    /* Nav buttons */
    navBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var section = btn.dataset.section;
        openSection(section);
        playClickSound();
      });
    });

    /* Zoom controls */
    zoomInBtn.addEventListener('click', function () {
      state.targetZoom = Math.min(MAX_ZOOM, state.targetZoom + 0.3);
      playClickSound();
    });
    zoomOutBtn.addEventListener('click', function () {
      state.targetZoom = Math.max(MIN_ZOOM, state.targetZoom - 0.3);
      playClickSound();
    });
    zoomResetBtn.addEventListener('click', function () {
      state.targetZoom = 1;
      state.targetPanX = 0;
      state.targetPanY = 0;
      playClickSound();
    });

    /* Mouse wheel zoom */
    document.addEventListener('wheel', function (e) {
      if (state.activeSection) return;
      e.preventDefault();
      var delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
      state.targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.targetZoom + delta));
    }, { passive: false });

    /* Drag to pan */
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
      var dx = e.clientX - state.dragStartX;
      var dy = e.clientY - state.dragStartY;
      state.targetPanX = state.dragPanStartX + dx;
      state.targetPanY = state.dragPanStartY + dy;
    });
    document.addEventListener('mouseup', function () {
      state.isDragging = false;
      universe.style.cursor = 'grab';
    });

    /* Touch support */
    var touchStartX, touchStartY;
    universe.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        state.dragPanStartX = state.targetPanX;
        state.dragPanStartY = state.targetPanY;
      } else if (e.touches.length === 2) {
        state.touchDist = getTouchDist(e.touches);
      }
    }, { passive: true });
    universe.addEventListener('touchmove', function (e) {
      if (e.touches.length === 1 && touchStartX !== undefined) {
        var dx = e.touches[0].clientX - touchStartX;
        var dy = e.touches[0].clientY - touchStartY;
        state.targetPanX = state.dragPanStartX + dx;
        state.targetPanY = state.dragPanStartY + dy;
      } else if (e.touches.length === 2) {
        var newDist = getTouchDist(e.touches);
        var scale = newDist / state.touchDist;
        state.targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.zoom * scale));
        state.touchDist = newDist;
      }
    }, { passive: true });

    /* Keyboard */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (codeModal.classList.contains('active')) {
          codeModal.classList.remove('active');
        } else {
          closeActiveSection();
        }
      }
      if (e.key === '+' || e.key === '=') { state.targetZoom = Math.min(MAX_ZOOM, state.targetZoom + 0.2); }
      if (e.key === '-') { state.targetZoom = Math.max(MIN_ZOOM, state.targetZoom - 0.2); }
    });

    /* Code modal close */
    codeModalClose.addEventListener('click', function () {
      codeModal.classList.remove('active');
    });
    codeModal.addEventListener('click', function (e) {
      if (e.target === codeModal) codeModal.classList.remove('active');
    });

    /* Resize */
    window.addEventListener('resize', function () {
      starsCanvas.width = window.innerWidth;
      starsCanvas.height = window.innerHeight;
      initStars();
      positionPlanets();
    });

    /* Easter egg: Konami code */
    var konamiSeq = [];
    var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    document.addEventListener('keydown', function (e) {
      konamiSeq.push(e.keyCode);
      if (konamiSeq.length > konamiCode.length) konamiSeq.shift();
      if (konamiSeq.join(',') === konamiCode.join(',')) {
        triggerEasterEgg();
        konamiSeq = [];
      }
    });
  }

  function getTouchDist(touches) {
    var dx = touches[0].clientX - touches[1].clientX;
    var dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* ===== Section Management ===== */
  function openSection(section) {
    closeActiveSection();
    var panel = document.getElementById('panel-' + section);
    if (!panel) return;
    state.activeSection = section;
    panel.classList.add('active');

    /* Zoom toward planet */
    var pos = planetPositions[section];
    if (pos) {
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      state.targetPanX = cx - (pos.xPct / 100 * window.innerWidth);
      state.targetPanY = cy - (pos.yPct / 100 * window.innerHeight);
      state.targetZoom = 1.5;
    }

    /* Update nav */
    navBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.section === section);
    });

    /* Section-specific init */
    if (section === 'projects' && state.repos.length === 0) {
      fetchGitHubRepos();
    }
    if (section === 'skills') {
      setTimeout(initSkillsConstellation, 100);
    }
  }

  function closeActiveSection() {
    state.activeSection = null;
    panels.forEach(function (p) { p.classList.remove('active'); });
    navBtns.forEach(function (b) { b.classList.remove('active'); });
    state.targetZoom = 1;
    state.targetPanX = 0;
    state.targetPanY = 0;
  }

  /* ===== GitHub Integration ===== */
  function fetchGitHubRepos() {
    var container = document.getElementById('projects-container');
    fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?sort=updated&per_page=30')
      .then(function (res) {
        if (!res.ok) throw new Error('GitHub API error');
        return res.json();
      })
      .then(function (repos) {
        state.repos = repos;
        renderRepos(repos, container);
      })
      .catch(function (err) {
        container.innerHTML = '<div class="loading-repos"><p>⚠️ Could not fetch repositories. <br><small>' + escapeHtml(err.message) + '</small></p></div>';
      });
  }

  function renderRepos(repos, container) {
    if (!repos.length) {
      container.innerHTML = '<div class="loading-repos"><p>No public repositories found.</p></div>';
      return;
    }
    var html = '';
    repos.forEach(function (repo) {
      var langColor = getLanguageColor(repo.language);
      html += '<div class="repo-card" data-repo="' + escapeHtml(repo.full_name) + '">';
      html += '<h3>' + escapeHtml(repo.name) + '</h3>';
      html += '<p class="repo-desc">' + escapeHtml(repo.description || 'No description') + '</p>';
      html += '<div class="repo-meta">';
      if (repo.language) {
        html += '<span><span class="lang-dot" style="background:' + langColor + '"></span>' + escapeHtml(repo.language) + '</span>';
      }
      html += '<span><i class="fas fa-star"></i> ' + repo.stargazers_count + '</span>';
      html += '<span><i class="fas fa-code-branch"></i> ' + repo.forks_count + '</span>';
      html += '</div>';
      html += '<div class="repo-actions">';
      html += '<a href="' + escapeHtml(repo.html_url) + '" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i> View</a>';
      html += '<button onclick="window._viewCode(\'' + escapeHtml(repo.full_name) + '\')"><i class="fas fa-code"></i> Code</button>';
      html += '</div>';
      html += '</div>';
    });
    container.innerHTML = html;
  }

  /* ===== Code Viewer ===== */
  window._viewCode = function (fullName) {
    codeModal.classList.add('active');
    codeModalLoading.style.display = 'block';
    codeModalContent.parentElement.style.display = 'none';
    codeModalTitle.textContent = fullName;

    fetch('https://api.github.com/repos/' + fullName + '/readme', {
      headers: { 'Accept': 'application/vnd.github.v3.raw' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('README not found');
        return res.text();
      })
      .then(function (text) {
        codeModalLoading.style.display = 'none';
        codeModalContent.parentElement.style.display = 'block';
        codeModalContent.innerHTML = highlightSyntax(escapeHtml(text));
      })
      .catch(function () {
        /* Try fetching file list instead */
        fetch('https://api.github.com/repos/' + fullName + '/contents')
          .then(function (r) { return r.json(); })
          .then(function (files) {
            codeModalLoading.style.display = 'none';
            codeModalContent.parentElement.style.display = 'block';
            var listing = '📁 Repository Files:\n\n';
            if (Array.isArray(files)) {
              files.forEach(function (f) {
                listing += (f.type === 'dir' ? '📂 ' : '📄 ') + f.name + '\n';
              });
            }
            codeModalContent.textContent = listing;
          })
          .catch(function () {
            codeModalLoading.style.display = 'none';
            codeModalContent.parentElement.style.display = 'block';
            codeModalContent.textContent = 'Could not load repository content.';
          });
      });
  };

  /* ===== Syntax Highlighting (basic) ===== */
  function highlightSyntax(text) {
    /* Highlight markdown-like patterns */
    text = text.replace(/(^|\n)(#{1,6}\s.+)/g, '$1<span class="fn">$2</span>');
    text = text.replace(/`([^`]+)`/g, '<span class="str">`$1`</span>');
    text = text.replace(/(https?:\/\/[^\s<]+)/g, '<span class="str">$1</span>');
    text = text.replace(/(\*\*[^*]+\*\*)/g, '<span class="kw">$1</span>');
    text = text.replace(/(^|\n)(\s*[-*]\s)/g, '$1<span class="num">$2</span>');
    return text;
  }

  /* ===== Sound Effect ===== */
  function playClickSound() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) { /* Audio not supported */ }
  }

  /* ===== Easter Egg ===== */
  function triggerEasterEgg() {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);animation:panelSlideIn 0.5s ease;';
    overlay.innerHTML = '<div style="text-align:center;font-family:Orbitron,sans-serif;"><h1 style="font-size:3rem;margin-bottom:20px;">🎮 You found it!</h1><p style="color:#00d4ff;font-size:1.2rem;">Konami Code Activated!</p><p style="color:#888;margin-top:10px;">You\'re a true explorer of this universe.</p></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function () {
      document.body.removeChild(overlay);
    });
    setTimeout(function () {
      if (overlay.parentNode) document.body.removeChild(overlay);
    }, 5000);
  }

  /* ===== Animation Loop ===== */
  function animate() {
    /* Lerp zoom and pan */
    state.zoom += (state.targetZoom - state.zoom) * LERP;
    state.panX += (state.targetPanX - state.panX) * LERP;
    state.panY += (state.targetPanY - state.panY) * LERP;

    universe.style.transform = 'translate(' + state.panX + 'px, ' + state.panY + 'px) scale(' + state.zoom + ')';

    drawStars();
    animFrameId = requestAnimationFrame(animate);
  }

  /* ===== Utility ===== */
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function getLanguageColor(lang) {
    var colors = {
      'JavaScript': '#f1e05a', 'Python': '#3572A5', 'TypeScript': '#2b7489',
      'Java': '#b07219', 'C++': '#f34b7d', 'C': '#555555',
      'HTML': '#e34c26', 'CSS': '#563d7c', 'Go': '#00ADD8',
      'Rust': '#dea584', 'Ruby': '#701516', 'PHP': '#4F5D95',
      'Shell': '#89e051', 'Jupyter Notebook': '#DA5B0B', 'Dart': '#00B4AB',
      'Kotlin': '#A97BFF', 'Swift': '#ffac45', 'R': '#198CE7'
    };
    return colors[lang] || '#8b949e';
  }

  /* ===== Start ===== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
