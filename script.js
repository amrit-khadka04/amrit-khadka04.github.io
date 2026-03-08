/* ============================================
   Amrit Khadka — Google Maps-Style Portfolio JS
   ============================================ */

(function () {
  'use strict';

  /* ===== Constants ===== */
  var WORLD_W = 5000;
  var WORLD_H = 4000;
  var MIN_ZOOM = 0.2;
  var MAX_ZOOM = 4.0;
  var ZOOM_SPEED = 0.15;
  var LERP_SPEED = 0.12;
  var BUILDING_ZOOM = 1.8;

  /* ===== Building positions & data ===== */
  var buildings = {
    hero:       { x: 2500, y: 2000, label: 'Amrit Khadka HQ' },
    about:      { x: 900,  y: 700,  label: 'Research Lab' },
    skills:     { x: 2500, y: 600,  label: 'Skills Factory' },
    experience: { x: 4100, y: 700,  label: 'Experience District' },
    projects:   { x: 4100, y: 2900, label: 'Innovation Park' },
    education:  { x: 900,  y: 2900, label: 'University Campus' },
    contact:    { x: 2500, y: 3400, label: 'Communication Hub' }
  };

  /* ===== Search data ===== */
  var searchItems = [
    { section: 'hero',       icon: 'fas fa-landmark',        text: 'Amrit Khadka HQ — Home' },
    { section: 'about',      icon: 'fas fa-user-astronaut',   text: 'About Me — Research Lab' },
    { section: 'about',      icon: 'fas fa-flask',            text: 'UKP Lab — Vision-Language Models' },
    { section: 'skills',     icon: 'fas fa-cogs',             text: 'Skills — Python, React Native, PyTorch' },
    { section: 'skills',     icon: 'fas fa-robot',            text: 'AI/ML — Hugging Face, VLLM, CUDA' },
    { section: 'experience', icon: 'fas fa-briefcase',        text: 'Experience — UKP Lab, Pathmate, Bloomsmobility' },
    { section: 'experience', icon: 'fas fa-building',         text: 'Axis Bank UPI — Bloomsmobility' },
    { section: 'projects',   icon: 'fas fa-rocket',           text: 'Projects — Visual Reasoning, PIPE-X' },
    { section: 'projects',   icon: 'fas fa-coins',            text: 'eRupes CBDC — Digital Currency' },
    { section: 'education',  icon: 'fas fa-graduation-cap',   text: 'Education — TU Darmstadt, M.Sc. CS' },
    { section: 'education',  icon: 'fas fa-university',       text: 'Bengaluru City University — B.C.A.' },
    { section: 'contact',    icon: 'fas fa-satellite-dish',   text: 'Contact — Email, LinkedIn, GitHub' }
  ];

  /* ===== State ===== */
  var state = {
    panX: 0, panY: 0, zoom: 0.5,
    targetPanX: 0, targetPanY: 0, targetZoom: 0.5,
    isDragging: false,
    dragStartX: 0, dragStartY: 0,
    dragStartPanX: 0, dragStartPanY: 0,
    activePanel: null,
    tilted: false,
    animating: false,
    touchDist: 0
  };

  /* ===== DOM Elements ===== */
  var viewport = document.getElementById('map-viewport');
  var world = document.getElementById('map-world');
  var infoPanel = document.getElementById('info-panel');
  var panelClose = document.getElementById('panel-close');
  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');
  var zoomInBtn = document.getElementById('zoom-in-btn');
  var zoomOutBtn = document.getElementById('zoom-out-btn');
  var homeBtn = document.getElementById('home-btn');
  var tiltBtn = document.getElementById('tilt-btn');
  var zoomDisplay = document.getElementById('zoom-level-display');
  var coordsText = document.getElementById('coords-text');
  var zoomText = document.getElementById('zoom-text');
  var welcomeOverlay = document.getElementById('welcome-overlay');
  var startBtn = document.getElementById('start-btn');
  var minimapViewport = document.getElementById('minimap-viewport');
  var buildingEls = document.querySelectorAll('.map-building');
  var panelSections = document.querySelectorAll('.panel-section');
  var minimapDots = document.querySelectorAll('.minimap-dot');

  /* ===== Initialize ===== */
  function init() {
    centerOnBuilding('hero', 0.5, false);
    requestAnimationFrame(animationLoop);
    bindEvents();
  }

  /* ===== Center view on a building ===== */
  function centerOnBuilding(section, zoom, animate) {
    var b = buildings[section];
    if (!b) return;
    var vw = viewport.clientWidth;
    var vh = viewport.clientHeight;
    var z = zoom || BUILDING_ZOOM;

    state.targetZoom = z;
    state.targetPanX = vw / 2 - b.x * z;
    state.targetPanY = vh / 2 - b.y * z;

    if (!animate) {
      state.panX = state.targetPanX;
      state.panY = state.targetPanY;
      state.zoom = state.targetZoom;
    } else {
      state.animating = true;
      world.classList.add('animating');
      setTimeout(function () {
        world.classList.remove('animating');
        state.animating = false;
      }, 900);
    }
  }

  /* ===== Animation Loop ===== */
  function animationLoop() {
    // Lerp toward target
    state.panX += (state.targetPanX - state.panX) * LERP_SPEED;
    state.panY += (state.targetPanY - state.panY) * LERP_SPEED;
    state.zoom += (state.targetZoom - state.zoom) * LERP_SPEED;

    // Clamp zoom
    state.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.zoom));

    applyTransform();
    updateUI();

    requestAnimationFrame(animationLoop);
  }

  /* ===== Apply CSS Transform ===== */
  function applyTransform() {
    var transform = 'translate(' + state.panX + 'px, ' + state.panY + 'px) scale(' + state.zoom + ')';
    if (state.tilted) {
      transform = 'perspective(2000px) rotateX(30deg) ' + transform;
    }
    world.style.transform = transform;
  }

  /* ===== Update UI Elements ===== */
  function updateUI() {
    // Zoom level display
    zoomDisplay.textContent = state.zoom.toFixed(1) + 'x';
    zoomText.textContent = 'Zoom: ' + state.zoom.toFixed(1) + 'x';

    // Coordinates (fun fake GPS coords)
    var centerWorldX = (viewport.clientWidth / 2 - state.panX) / state.zoom;
    var centerWorldY = (viewport.clientHeight / 2 - state.panY) / state.zoom;
    var lat = ((centerWorldY / WORLD_H) * 180 - 90).toFixed(1);
    var lon = ((centerWorldX / WORLD_W) * 360 - 180).toFixed(1);
    coordsText.textContent = Math.abs(lat) + '°' + (lat >= 0 ? 'N' : 'S') + ' ' + Math.abs(lon) + '°' + (lon >= 0 ? 'E' : 'W');

    // Minimap viewport indicator
    if (minimapViewport) {
      var mmW = 140; // minimap width
      var mmH = 90;  // minimap height
      var scaleX = mmW / WORLD_W;
      var scaleY = mmH / WORLD_H;

      var vpWorldX = -state.panX / state.zoom;
      var vpWorldY = -state.panY / state.zoom;
      var vpWorldW = viewport.clientWidth / state.zoom;
      var vpWorldH = viewport.clientHeight / state.zoom;

      minimapViewport.style.left = (vpWorldX * scaleX) + 'px';
      minimapViewport.style.top = (vpWorldY * scaleY) + 'px';
      minimapViewport.style.width = (vpWorldW * scaleX) + 'px';
      minimapViewport.style.height = (vpWorldH * scaleY) + 'px';
    }
  }

  /* ===== Zoom to point ===== */
  function zoomToPoint(clientX, clientY, factor) {
    var rect = viewport.getBoundingClientRect();
    var mouseX = clientX - rect.left;
    var mouseY = clientY - rect.top;

    // World coordinates under cursor
    var worldX = (mouseX - state.targetPanX) / state.targetZoom;
    var worldY = (mouseY - state.targetPanY) / state.targetZoom;

    // New zoom
    var newZoom = state.targetZoom * factor;
    newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

    // Adjust pan to keep same world point under cursor
    state.targetPanX = mouseX - worldX * newZoom;
    state.targetPanY = mouseY - worldY * newZoom;
    state.targetZoom = newZoom;
  }

  /* ===== Zoom from buttons (center of viewport) ===== */
  function zoomCenter(factor) {
    var cx = viewport.clientWidth / 2;
    var cy = viewport.clientHeight / 2;
    zoomToPoint(cx + viewport.getBoundingClientRect().left, cy + viewport.getBoundingClientRect().top, factor);
  }

  /* ===== Open Info Panel ===== */
  function openPanel(section) {
    state.activePanel = section;

    // Activate panel section
    panelSections.forEach(function (ps) {
      ps.classList.remove('active');
      if (ps.getAttribute('data-panel') === section) {
        ps.classList.add('active');
      }
    });

    // Highlight building
    buildingEls.forEach(function (el) {
      el.classList.remove('active');
      if (el.getAttribute('data-section') === section) {
        el.classList.add('active');
      }
    });

    infoPanel.classList.add('open');

    // Animate stats if hero panel
    if (section === 'hero') {
      setTimeout(animateStats, 300);
    }

    // Start typing if hero panel
    if (section === 'hero' && !typingStarted) {
      typingStarted = true;
      setTimeout(startTyping, 500);
    }
  }

  /* ===== Close Info Panel ===== */
  function closePanel() {
    state.activePanel = null;
    infoPanel.classList.remove('open');
    buildingEls.forEach(function (el) {
      el.classList.remove('active');
    });
  }

  /* ===== Stats Animation ===== */
  function animateStats() {
    var statNums = document.querySelectorAll('.stat-num');
    statNums.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) return;
      var current = 0;
      var increment = Math.max(1, Math.floor(target / 30));
      function step() {
        current += increment;
        if (current >= target) {
          el.textContent = target + '+';
          return;
        }
        el.textContent = current;
        setTimeout(step, 60);
      }
      el.textContent = '0';
      step();
    });
  }

  /* ===== Typing Effect ===== */
  var typingStarted = false;
  var typedOutput = document.getElementById('typed-output');
  var phrases = [
    'Building multimodal AI systems',
    'Vision-Language Model researcher',
    'React Native mobile engineer',
    'Transformer architecture explorer',
    'From UPI banking apps to VLLMs',
    'Full-stack developer & AI enthusiast'
  ];

  function startTyping() {
    if (!typedOutput) return;
    var phraseIdx = 0;
    var charIdx = 0;
    var isDeleting = false;
    var speed = 55;

    function type() {
      var current = phrases[phraseIdx];
      if (isDeleting) {
        typedOutput.textContent = current.substring(0, charIdx - 1);
        charIdx--;
      } else {
        typedOutput.textContent = current.substring(0, charIdx + 1);
        charIdx++;
      }

      var delay = isDeleting ? 25 : speed;
      if (!isDeleting && charIdx === current.length) {
        delay = 2000;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        delay = 500;
      }
      setTimeout(type, delay);
    }
    type();
  }

  /* ===== Search ===== */
  function handleSearch(query) {
    if (!query || query.length < 2) {
      searchResults.classList.remove('visible');
      searchResults.innerHTML = '';
      return;
    }

    var q = query.toLowerCase();
    var matches = searchItems.filter(function (item) {
      return item.text.toLowerCase().indexOf(q) !== -1;
    });

    if (matches.length === 0) {
      searchResults.classList.remove('visible');
      searchResults.innerHTML = '';
      return;
    }

    searchResults.innerHTML = '';
    matches.forEach(function (m) {
      var div = document.createElement('div');
      div.className = 'search-result-item';
      div.innerHTML = '<i class="' + m.icon + '"></i><span>' + m.text + '</span>';
      div.addEventListener('click', function () {
        centerOnBuilding(m.section, BUILDING_ZOOM, true);
        setTimeout(function () { openPanel(m.section); }, 400);
        searchResults.classList.remove('visible');
        searchInput.value = '';
      });
      searchResults.appendChild(div);
    });
    searchResults.classList.add('visible');
  }

  /* ===== Touch helpers ===== */
  function getTouchDist(e) {
    if (e.touches.length < 2) return 0;
    var dx = e.touches[0].clientX - e.touches[1].clientX;
    var dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getTouchCenter(e) {
    if (e.touches.length < 2) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return {
      x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
      y: (e.touches[0].clientY + e.touches[1].clientY) / 2
    };
  }

  /* ===== Event Bindings ===== */
  function bindEvents() {
    // Welcome overlay
    startBtn.addEventListener('click', function () {
      welcomeOverlay.classList.add('hidden');
      setTimeout(function () {
        welcomeOverlay.style.display = 'none';
      }, 800);
    });

    // Mouse wheel zoom
    viewport.addEventListener('wheel', function (e) {
      e.preventDefault();
      var factor = e.deltaY < 0 ? (1 + ZOOM_SPEED) : (1 - ZOOM_SPEED);
      zoomToPoint(e.clientX, e.clientY, factor);
    }, { passive: false });

    // Mouse drag to pan
    viewport.addEventListener('mousedown', function (e) {
      if (e.target.closest('.map-building') || e.target.closest('#map-controls') || e.target.closest('#minimap') || e.target.closest('#info-panel') || e.target.closest('#search-bar')) return;
      state.isDragging = true;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      state.dragStartPanX = state.targetPanX;
      state.dragStartPanY = state.targetPanY;
      viewport.classList.add('dragging');
    });

    window.addEventListener('mousemove', function (e) {
      if (!state.isDragging) return;
      var dx = e.clientX - state.dragStartX;
      var dy = e.clientY - state.dragStartY;
      state.targetPanX = state.dragStartPanX + dx;
      state.targetPanY = state.dragStartPanY + dy;
    });

    window.addEventListener('mouseup', function () {
      state.isDragging = false;
      viewport.classList.remove('dragging');
    });

    // Touch events
    viewport.addEventListener('touchstart', function (e) {
      if (e.target.closest('.map-building') || e.target.closest('#map-controls') || e.target.closest('#minimap') || e.target.closest('#info-panel') || e.target.closest('#search-bar')) return;

      if (e.touches.length === 1) {
        state.isDragging = true;
        state.dragStartX = e.touches[0].clientX;
        state.dragStartY = e.touches[0].clientY;
        state.dragStartPanX = state.targetPanX;
        state.dragStartPanY = state.targetPanY;
      }
      if (e.touches.length === 2) {
        state.isDragging = false;
        state.touchDist = getTouchDist(e);
      }
    }, { passive: true });

    viewport.addEventListener('touchmove', function (e) {
      e.preventDefault();
      if (e.touches.length === 1 && state.isDragging) {
        var dx = e.touches[0].clientX - state.dragStartX;
        var dy = e.touches[0].clientY - state.dragStartY;
        state.targetPanX = state.dragStartPanX + dx;
        state.targetPanY = state.dragStartPanY + dy;
      }
      if (e.touches.length === 2) {
        var newDist = getTouchDist(e);
        if (state.touchDist > 0) {
          var factor = newDist / state.touchDist;
          var center = getTouchCenter(e);
          zoomToPoint(center.x, center.y, factor);
        }
        state.touchDist = newDist;
      }
    }, { passive: false });

    viewport.addEventListener('touchend', function () {
      state.isDragging = false;
      state.touchDist = 0;
    });

    // Building clicks
    buildingEls.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var section = el.getAttribute('data-section');
        centerOnBuilding(section, BUILDING_ZOOM, true);
        setTimeout(function () {
          openPanel(section);
        }, 400);
      });

      // Hover cursor change
      el.addEventListener('mouseenter', function () {
        viewport.classList.add('building-hover');
      });
      el.addEventListener('mouseleave', function () {
        viewport.classList.remove('building-hover');
      });
    });

    // Panel close
    panelClose.addEventListener('click', closePanel);

    // Click outside panel to close
    viewport.addEventListener('click', function (e) {
      if (state.activePanel && !e.target.closest('.map-building') && !e.target.closest('#info-panel')) {
        closePanel();
      }
    });

    // Zoom controls
    zoomInBtn.addEventListener('click', function () { zoomCenter(1 + ZOOM_SPEED * 2); });
    zoomOutBtn.addEventListener('click', function () { zoomCenter(1 - ZOOM_SPEED * 2); });

    // Home button
    homeBtn.addEventListener('click', function () {
      closePanel();
      centerOnBuilding('hero', 0.5, true);
    });

    // Tilt toggle
    tiltBtn.addEventListener('click', function () {
      state.tilted = !state.tilted;
      tiltBtn.style.color = state.tilted ? 'var(--accent)' : '';
      world.classList.toggle('tilted', state.tilted);
    });

    // Search
    searchInput.addEventListener('input', function () {
      handleSearch(this.value);
    });
    searchInput.addEventListener('focus', function () {
      if (this.value.length >= 2) handleSearch(this.value);
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#search-bar')) {
        searchResults.classList.remove('visible');
      }
    });

    // Minimap dot clicks
    minimapDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = dot.getAttribute('data-target');
        centerOnBuilding(target, BUILDING_ZOOM, true);
        setTimeout(function () { openPanel(target); }, 400);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT') return;

      if (e.key === 'Escape') {
        closePanel();
      }
      if (e.key === '+' || e.key === '=') {
        zoomCenter(1 + ZOOM_SPEED * 2);
      }
      if (e.key === '-') {
        zoomCenter(1 - ZOOM_SPEED * 2);
      }
      if (e.key === 'h' || e.key === 'H') {
        closePanel();
        centerOnBuilding('hero', 0.5, true);
      }
    });

    // Resize handler
    window.addEventListener('resize', function () {
      // Re-center if needed
    });
  }

  /* ===== Start ===== */
  init();

})();
