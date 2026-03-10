/**
 * ============================================================
 *  script.js — Amrit Khadka Portfolio
 *  Handles: loader, scroll-progress, smooth navigation,
 *           reveal-on-scroll, country-theme transitions,
 *           active-nav highlighting, and GitHub repo fetching.
 * ============================================================
 */
(function () {
  'use strict';

  /* -------------------------------------------------------
   *  0. CONSTANTS & DOM REFERENCES
   * ------------------------------------------------------- */
  const GITHUB_USER = 'Amritkc';
  const GITHUB_API  = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=30`;

  const loader             = document.getElementById('loader');
  const scrollProgress     = document.getElementById('scroll-progress');
  const themeOverlay       = document.getElementById('theme-overlay');
  const countryIndicator   = document.getElementById('country-indicator');
  const countryFlag        = countryIndicator ? countryIndicator.querySelector('.country-flag') : null;
  const sideNavLinks       = document.querySelectorAll('#side-nav a[data-section]');
  const sections           = document.querySelectorAll('section.section');
  const revealElements     = document.querySelectorAll('.reveal');
  const projectsContainer  = document.getElementById('projects-container');

  /** Language → colour map for GitHub repo language dots */
  const LANG_COLORS = {
    JavaScript:        '#f1e05a',
    TypeScript:        '#3178c6',
    Python:            '#3572A5',
    Java:              '#b07219',
    Kotlin:            '#A97BFF',
    Swift:             '#F05138',
    HTML:              '#e34c26',
    CSS:               '#563d7c',
    Shell:             '#89e051',
    Jupyter:           '#DA5B0B',
    'Jupyter Notebook':'#DA5B0B',
    Dart:              '#00B4AB',
    C:                 '#555555',
    'C++':             '#f34b7d',
    Go:                '#00ADD8',
    Ruby:              '#701516',
    PHP:               '#4F5D95',
    Rust:              '#dea584',
  };

  /* -------------------------------------------------------
   *  1. LOADING SCREEN
   *  Simulate a brief loading period then hide the loader.
   * ------------------------------------------------------- */
  function hideLoader() {
    setTimeout(function () {
      if (loader) loader.classList.add('hidden');
    }, 1500);
  }

  /* -------------------------------------------------------
   *  2. SMOOTH-SCROLL NAV
   *  Side-nav links smooth-scroll to their target section
   *  and update the URL hash without causing a jump.
   * ------------------------------------------------------- */
  function initSmoothScroll() {
    sideNavLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = link.getAttribute('data-section');
        const target   = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, '', '#' + targetId);
        }
      });
    });
  }

  /* -------------------------------------------------------
   *  3. SCROLL-PROGRESS BAR
   *  On scroll, calculate percentage and set bar width.
   * ------------------------------------------------------- */
  function updateScrollProgress() {
    const scrollTop     = window.scrollY;
    const docHeight     = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) {
      scrollProgress.style.width = scrollPercent + '%';
    }
  }

  /* -------------------------------------------------------
   *  4. REVEAL-ON-SCROLL  (IntersectionObserver)
   *  Observe all .reveal elements; add class "visible"
   *  once they scroll into view, then unobserve.
   * ------------------------------------------------------- */
  function initRevealObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: make everything visible immediately
      revealElements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach(function (el) { observer.observe(el); });
  }

  /* -------------------------------------------------------
   *  5. COUNTRY-THEME TRANSITIONS  (the star feature)
   *  Uses IntersectionObserver on every <section> to detect
   *  which "chapter" is dominant and swap body classes,
   *  flag emoji, and overlay gradient accordingly.
   * ------------------------------------------------------- */
  let currentTheme = 'neutral';

  /**
   * Apply a theme to the page.
   * @param {'neutral'|'india'|'germany'} theme
   */
  function applyTheme(theme) {
    if (theme === currentTheme) return;
    currentTheme = theme;

    const body = document.body;

    // Swap body classes
    body.classList.remove('theme-india', 'theme-germany');
    if (theme === 'india')   body.classList.add('theme-india');
    if (theme === 'germany') body.classList.add('theme-germany');

    // Update country flag emoji
    if (countryFlag) {
      if (theme === 'india') {
        countryFlag.textContent = '\u{1F1EE}\u{1F1F3}';
      } else if (theme === 'germany') {
        countryFlag.textContent = '\u{1F1E9}\u{1F1EA}';
      } else {
        countryFlag.textContent = '';
      }
    }

    // Show / hide the indicator badge
    if (countryIndicator) {
      countryIndicator.classList.toggle('visible', theme !== 'neutral');
    }

    // Overlay gradient
    if (themeOverlay) {
      if (theme === 'india') {
        themeOverlay.style.background =
          'radial-gradient(ellipse at 50% 0%, rgba(255,153,51,0.08) 0%, transparent 70%)';
      } else if (theme === 'germany') {
        themeOverlay.style.background =
          'radial-gradient(ellipse at 50% 0%, rgba(255,206,0,0.08) 0%, transparent 70%)';
      } else {
        themeOverlay.style.background = 'transparent';
      }
    }
  }

  /** Debounce helper — returns a wrapper that delays execution. */
  function debounce(fn, delay) {
    let timer = null;
    return function () {
      const context = this;
      const args    = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  /**
   * Set up a single IntersectionObserver for section-level
   * detection (themes + active nav).  A debounced handler
   * prevents jitter during fast scrolling.
   */
  function initSectionObserver() {
    if (!('IntersectionObserver' in window) || !sections.length) return;

    // Debounce rapid theme changes during fast scroll
    const debouncedApplyTheme = debounce(applyTheme, 80);

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const theme = entry.target.dataset.theme || 'neutral';
            debouncedApplyTheme(theme);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach(function (sec) { observer.observe(sec); });
  }

  /* -------------------------------------------------------
   *  6. ACTIVE NAV HIGHLIGHTING
   *  On scroll, determine which section is in view and
   *  toggle the "active" class on the matching nav link.
   * ------------------------------------------------------- */
  function highlightActiveNav() {
    const scrollY  = window.scrollY + window.innerHeight / 3;
    let activeId   = '';

    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollY) {
        activeId = sec.id;
      }
    });

    sideNavLinks.forEach(function (link) {
      if (link.dataset.section === activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* -------------------------------------------------------
   *  7. GITHUB REPOS
   *  Fetch public repos, skip forks, render cards.
   *  Uses textContent for user-generated strings to
   *  prevent XSS; innerHTML is only used with safe markup.
   * ------------------------------------------------------- */

  /**
   * Create a single repo-card DOM element.
   * All user-supplied text is set via textContent.
   * @param {Object} repo  GitHub API repo object
   * @returns {HTMLElement}
   */
  function createRepoCard(repo) {
    const card = document.createElement('div');
    card.className = 'repo-card';

    // --- Name ---
    const h4 = document.createElement('h4');
    h4.textContent = repo.name;
    card.appendChild(h4);

    // --- Description ---
    const desc = document.createElement('p');
    desc.textContent = repo.description || 'No description provided.';
    card.appendChild(desc);

    // --- Meta row (language, stars, forks) ---
    const meta = document.createElement('div');
    meta.className = 'repo-meta';

    if (repo.language) {
      const langSpan = document.createElement('span');
      langSpan.className = 'repo-lang';

      const dot = document.createElement('span');
      dot.className = 'lang-dot';
      dot.style.background = LANG_COLORS[repo.language] || '#ccc';

      langSpan.appendChild(dot);
      langSpan.appendChild(document.createTextNode(' ' + repo.language));
      meta.appendChild(langSpan);
    }

    // Stars
    const starSpan = document.createElement('span');
    starSpan.className = 'repo-stat';
    const starIcon = document.createElement('i');
    starIcon.className = 'fa-regular fa-star';
    starSpan.appendChild(starIcon);
    starSpan.appendChild(document.createTextNode(' ' + repo.stargazers_count));
    meta.appendChild(starSpan);

    // Forks
    const forkSpan = document.createElement('span');
    forkSpan.className = 'repo-stat';
    const forkIcon = document.createElement('i');
    forkIcon.className = 'fa-solid fa-code-fork';
    forkSpan.appendChild(forkIcon);
    forkSpan.appendChild(document.createTextNode(' ' + repo.forks_count));
    meta.appendChild(forkSpan);

    card.appendChild(meta);

    // --- Links row ---
    const linksDiv = document.createElement('div');
    linksDiv.className = 'repo-links';

    const codeLink = document.createElement('a');
    codeLink.className = 'repo-link';
    codeLink.href = repo.html_url;
    codeLink.target = '_blank';
    codeLink.rel = 'noopener noreferrer';
    const codeLinkIcon = document.createElement('i');
    codeLinkIcon.className = 'fa-brands fa-github';
    codeLink.appendChild(codeLinkIcon);
    codeLink.appendChild(document.createTextNode(' Code'));
    linksDiv.appendChild(codeLink);

    if (repo.homepage) {
      const liveLink = document.createElement('a');
      liveLink.className = 'repo-link';
      liveLink.href = repo.homepage;
      liveLink.target = '_blank';
      liveLink.rel = 'noopener noreferrer';
      const liveLinkIcon = document.createElement('i');
      liveLinkIcon.className = 'fa-solid fa-arrow-up-right-from-square';
      liveLink.appendChild(liveLinkIcon);
      liveLink.appendChild(document.createTextNode(' Live'));
      linksDiv.appendChild(liveLink);
    }

    card.appendChild(linksDiv);
    return card;
  }

  /** Fetch repos from GitHub API and render cards. */
  async function fetchGitHubRepos() {
    if (!projectsContainer) return;

    // Loading state
    const loadingP = document.createElement('p');
    loadingP.className = 'loading-text';
    const spinnerIcon = document.createElement('i');
    spinnerIcon.className = 'fa-solid fa-spinner fa-spin';
    loadingP.appendChild(spinnerIcon);
    loadingP.appendChild(document.createTextNode(' Loading repositories\u2026'));
    projectsContainer.innerHTML = '';
    projectsContainer.appendChild(loadingP);

    try {
      const res = await fetch(GITHUB_API);
      if (!res.ok) throw new Error('GitHub API responded with status ' + res.status);
      const repos = await res.json();

      const filtered = repos.filter(function (r) { return !r.fork; });

      // Clear loading state
      projectsContainer.innerHTML = '';

      if (filtered.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = 'No repositories found.';
        projectsContainer.appendChild(empty);
        return;
      }

      const fragment = document.createDocumentFragment();
      filtered.forEach(function (repo) {
        fragment.appendChild(createRepoCard(repo));
      });
      projectsContainer.appendChild(fragment);

    } catch (err) {
      console.error('Failed to load GitHub repos:', err);
      projectsContainer.innerHTML = '';

      const errorP = document.createElement('p');
      errorP.className = 'error-text';
      errorP.textContent = 'Could not load repositories. ';

      const fallback = document.createElement('a');
      fallback.href = 'https://github.com/' + GITHUB_USER;
      fallback.target = '_blank';
      fallback.rel = 'noopener noreferrer';
      fallback.textContent = 'Visit GitHub \u2192';

      errorP.appendChild(fallback);
      projectsContainer.appendChild(errorP);
    }
  }

  /* -------------------------------------------------------
   *  8. SCROLL-EVENT HANDLER  (throttled via rAF)
   *  A single scroll listener batches progress-bar and
   *  active-nav updates inside requestAnimationFrame for
   *  smooth 60 fps performance.
   * ------------------------------------------------------- */
  let scrollTicking = false;

  function onScroll() {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        updateScrollProgress();
        highlightActiveNav();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  /* -------------------------------------------------------
   *  INIT — wire everything up on DOMContentLoaded
   * ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    hideLoader();
    initSmoothScroll();
    initRevealObserver();
    initSectionObserver();
    fetchGitHubRepos();

    window.addEventListener('scroll', onScroll, { passive: true });

    // Run once on load so the bar and nav are correct immediately
    updateScrollProgress();
    highlightActiveNav();
  });
})();
