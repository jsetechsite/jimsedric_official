/* ==========================================================================
   JIMSEDRIC — interaction & scroll engine
   Vanilla JS. No dependencies. Progressively enhanced.
   ========================================================================== */

(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const desktopRail = window.matchMedia('(min-width: 1024px)');

  const scrollHandlers = new Set();
  let scrollQueued = false;

  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      scrollHandlers.forEach((handler) => handler());
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ------------------------------------------------------------------
     Navigation, progress bar, active section
     ------------------------------------------------------------------ */

  const nav = $('[data-nav]');
  const progressBar = $('[data-progress]');
  const navLinks = $$('.nav__link');

  function handleChrome() {
    if (!nav || !progressBar) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    progressBar.style.transform = `scaleX(${ratio})`;
  }

  scrollHandlers.add(handleChrome);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });

  ['about', 'stack', 'work', 'experiments', 'journey', 'contact'].forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */

  const menu = $('[data-menu]');
  const menuOpen = $('[data-menu-open]');
  const menuClose = $('[data-menu-close]');
  let lastFocused = null;

  function openMenu() {
    if (!menu || !menuOpen) return;
    lastFocused = document.activeElement;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    menuOpen.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    if (menuClose) requestAnimationFrame(() => menuClose.focus());
  }

  function closeMenu(restoreFocus = true) {
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    menuOpen.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (!restoreFocus) return;
    const target = lastFocused && lastFocused !== document.body && document.contains(lastFocused) ? lastFocused : menuOpen;
    if (target) target.focus();
  }

  if (menuOpen) menuOpen.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  $$('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', () => {
      const target = document.querySelector(link.getAttribute('href'));
      closeMenu(false);
      if (!target) return;
      target.setAttribute('tabindex', '-1');
      window.setTimeout(() => target.focus({ preventScroll: true }), 450);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
    if (event.key !== 'Tab' || !menu || !menu.classList.contains('is-open')) return;
    const focusable = $$('a[href], button:not([disabled])', menu);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const menuBreakpoint = window.matchMedia('(min-width: 1101px)');
  const handleBreakpoint = (event) => {
    if (event.matches) closeMenu();
  };
  if (menuBreakpoint.addEventListener) menuBreakpoint.addEventListener('change', handleBreakpoint);

  /* ------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------ */

  const revealElements = $$('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-inview');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.06 });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-inview'));
  }

  /* ------------------------------------------------------------------
     Stack index
     ------------------------------------------------------------------ */

  const techData = {
    javascript: {
      name: 'JavaScript', category: 'Language',
      note: 'Interface logic, canvas drawing, streaming model output, and Deno services. It is the thread running through most of the public repos.',
      links: [['Local-AI-Chatbot', 'https://github.com/espinojim2/Local-AI-Chatbot'], ['deno_app', 'https://github.com/espinojim2/deno_app'], ['DynamicNodeDiagram', 'https://github.com/espinojim2/DynamicNodeDiagram']]
    },
    python: {
      name: 'Python', category: 'Language',
      note: 'Part of my working stack for scripting and AI experiments. The public repositories currently show more JavaScript than Python.',
      links: []
    },
    php: {
      name: 'PHP', category: 'Language',
      note: 'Where the 2016 systems were built: CodeIgniter scheduling, personnel, file management, and booking prototypes.',
      links: [['School scheduling', 'https://github.com/espinojim2/CI_School-scheduling-system-mytemplate'], ['Personnel system', 'https://github.com/espinojim2/Personnel-Information-system-mytemplate-'], ['Legal file manager', 'https://github.com/espinojim2/legal-office-fileManager'], ['Hotel booking', 'https://github.com/espinojim2/Tanchuling-hotel-booking-systemv1.0']]
    },
    c: {
      name: 'C', category: 'Language',
      note: 'Listed in my profile stack. A low-level tool I keep in the kit; there is no original C repository public yet.',
      links: []
    },
    java: {
      name: 'Java', category: 'Language',
      note: 'Used in cordovaapp, an Android packaging experiment built with Cordova.',
      links: [['cordovaapp', 'https://github.com/espinojim2/cordovaapp']]
    },
    'html-css': {
      name: 'HTML / CSS', category: 'Language',
      note: 'The base layer of every repo here, from single-file tools to dashboard interfaces.',
      links: [['Simple-HR-Payroll-Application', 'https://github.com/espinojim2/Simple-HR-Payroll-Application'], ['pineappltech', 'https://github.com/espinojim2/pineappltech'], ['HTMLStepTemplate', 'https://github.com/espinojim2/HTMLStepTemplate']]
    },
    htmx: {
      name: 'HTMX', category: 'Framework / runtime',
      note: 'In the stack for lightweight interactions without a full framework. It is loaded in the cash-breakdown calculator.',
      links: [['Cash breakdown', 'https://github.com/espinojim2/simple-salary-breakdown-calculator']]
    },
    nodejs: {
      name: 'Node.js', category: 'Framework / runtime',
      note: 'Part of the server-side stack alongside Deno. The profile lists it as a primary tool.',
      links: []
    },
    deno: {
      name: 'Deno', category: 'Framework / runtime',
      note: 'deno_app is a small Oak service: a message list, a POST endpoint, and a health route.',
      links: [['deno_app', 'https://github.com/espinojim2/deno_app']]
    },
    django: {
      name: 'Django', category: 'Framework / runtime',
      note: 'Listed in my profile stack for Python web work.',
      links: []
    },
    codeigniter: {
      name: 'CodeIgniter', category: 'Framework / runtime',
      note: 'The framework behind the 2016 school, personnel, legal-office, and hotel prototypes.',
      links: [['School scheduling', 'https://github.com/espinojim2/CI_School-scheduling-system-mytemplate'], ['Personnel system', 'https://github.com/espinojim2/Personnel-Information-system-mytemplate-'], ['Legal file manager', 'https://github.com/espinojim2/legal-office-fileManager']]
    },
    wordpress: {
      name: 'WordPress', category: 'Framework / runtime',
      note: 'A long-running part of the web stack, alongside Bluehost hosting.',
      links: []
    },
    tailwind: {
      name: 'Tailwind CSS', category: 'Framework / runtime',
      note: 'Used in the HR dashboard, the salary calculator, and the HTML step template.',
      links: [['HR payroll', 'https://github.com/espinojim2/Simple-HR-Payroll-Application'], ['Cash breakdown', 'https://github.com/espinojim2/simple-salary-breakdown-calculator'], ['HTMLStepTemplate', 'https://github.com/espinojim2/HTMLStepTemplate']]
    },
    mysql: {
      name: 'MySQL', category: 'Data',
      note: 'Profile database stack. The PHP systems were built around relational data.',
      links: []
    },
    postgresql: {
      name: 'PostgreSQL', category: 'Data',
      note: 'Profile database stack.',
      links: []
    },
    sqlite: {
      name: 'SQLite', category: 'Data',
      note: 'Profile database stack.',
      links: []
    },
    firebase: {
      name: 'Firebase / Firestore', category: 'Data',
      note: 'Auth and Firestore power the HR/payroll dashboard, including per-user data paths and live snapshots.',
      links: [['Simple-HR-Payroll-Application', 'https://github.com/espinojim2/Simple-HR-Payroll-Application']]
    },
    aws: {
      name: 'AWS', category: 'Infrastructure',
      note: 'Profile cloud stack.',
      links: []
    },
    docker: {
      name: 'Docker', category: 'Infrastructure',
      note: 'Used for self-hosted apps and container experiments; part of the infrastructure toolbox.',
      links: []
    },
    cloudflare: {
      name: 'Cloudflare', category: 'Infrastructure',
      note: 'This portfolio and the Pineappltech site are static deployments; Cloudflare Pages is part of the stack.',
      links: [['pineappltech', 'https://github.com/espinojim2/pineappltech']]
    },
    bluehost: {
      name: 'Bluehost', category: 'Infrastructure',
      note: 'Listed as hosting in my profile stack.',
      links: []
    },
    proxmox: {
      name: 'Proxmox', category: 'Infrastructure',
      note: 'Home-lab and server management stack.',
      links: []
    },
    'debian-ubuntu': {
      name: 'Debian / Ubuntu', category: 'Infrastructure',
      note: 'Linux environments for servers and self-hosted services.',
      links: []
    },
    ollama: {
      name: 'Ollama', category: 'Exploration',
      note: 'The local model runtime behind Local-AI-Chatbot: streaming from localhost:11434, tinyllama by default.',
      links: [['Local-AI-Chatbot', 'https://github.com/espinojim2/Local-AI-Chatbot']]
    },
    'local-ai': {
      name: 'Local AI', category: 'Exploration',
      note: 'Running open-source models on my own machine, with interfaces that keep the data local.',
      links: [['Local-AI-Chatbot', 'https://github.com/espinojim2/Local-AI-Chatbot']]
    },
    n8n: {
      name: 'n8n automation', category: 'Exploration',
      note: 'Workflow automation in the stack. The profile notes: yes, I do AI automations.',
      links: []
    },
    'ai-ml': {
      name: 'AI / ML', category: 'Exploration',
      note: 'Currently learning and experimenting; the local chatbot is the clearest public artifact.',
      links: [['Local-AI-Chatbot', 'https://github.com/espinojim2/Local-AI-Chatbot']]
    },
    devops: {
      name: 'DevOps', category: 'Exploration',
      note: 'Learning and practicing deployment, containers, and server management.',
      links: []
    },
    'self-hosting': {
      name: 'Self-hosting', category: 'Exploration',
      note: 'Docker and Proxmox experiments. Self-hosted apps are a recurring interest.',
      links: []
    },
    blockchain: {
      name: 'Blockchain', category: 'Exploration',
      note: 'An area I am exploring, not a claim of shipped work.',
      links: []
    }
  };

  const stackPanel = $('.stack__panel');
  const techName = $('[data-tech-name]');
  const techCat = $('[data-tech-cat]');
  const techNote = $('[data-tech-note]');
  const techLinks = $('[data-tech-links]');
  const techButtons = $$('.tech');

  function setTech(key) {
    const item = techData[key];
    if (!item || !stackPanel) return;

    techName.textContent = item.name;
    techCat.textContent = item.category;
    techNote.textContent = item.note;
    techLinks.textContent = '';

    if (item.links.length) {
      item.links.forEach(([label, href]) => {
        const link = document.createElement('a');
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `${label} ↗`;
        techLinks.append(link);
      });
    } else {
      const note = document.createElement('span');
      note.textContent = 'Profile stack — no public repository yet.';
      techLinks.append(note);
    }

    techButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.tech === key));
    });

    if (!reduceMotion.matches && stackPanel.animate) {
      stackPanel.animate(
        [{ opacity: 0.45, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }],
        { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' }
      );
    }
  }

  techButtons.forEach((button) => {
    button.addEventListener('click', () => setTech(button.dataset.tech));
  });


  const stackSection = $('.stack__grid')?.closest('section');

  if (stackSection) {
    const stackAside = $('.stack__aside', stackSection);
    const sheetClose = $('.stack__sheet-close', stackSection);
    const sheetQuery = window.matchMedia('(max-width: 1100px)');
    let lastTechButton = null;

    stackSection.classList.add('stack-sheet');

    const closeSheet = () => {
      if (!stackSection.classList.contains('sheet-open')) return;
      stackSection.classList.remove('sheet-open');
      document.body.classList.remove('sheet-lock');
      stackAside.removeAttribute('role');
      stackAside.removeAttribute('aria-modal');
      if (lastTechButton && sheetQuery.matches) lastTechButton.focus();
      lastTechButton = null;
    };

    const openSheet = (button) => {
      if (!sheetQuery.matches) return;
      lastTechButton = button;
      stackSection.classList.add('sheet-open');
      document.body.classList.add('sheet-lock');
      stackAside.setAttribute('role', 'dialog');
      stackAside.setAttribute('aria-modal', 'true');
      if (sheetClose) requestAnimationFrame(() => sheetClose.focus());
    };

    techButtons.forEach((button) => {
      button.addEventListener('click', () => openSheet(button));
    });

    $$('[data-sheet-close]', stackSection).forEach((element) => {
      element.addEventListener('click', closeSheet);
    });

    document.addEventListener('keydown', (event) => {
      if (!stackSection.classList.contains('sheet-open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSheet();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = $('a[href], button:not([disabled])', stackAside);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    const handleSheetQuery = (event) => {
      if (!event.matches) closeSheet();
    };
    if (sheetQuery.addEventListener) sheetQuery.addEventListener('change', handleSheetQuery);
  }

  /* ------------------------------------------------------------------
     Horizontal project rail
     ------------------------------------------------------------------ */

  const work = $('[data-work]');

  if (work) {
    const viewport = $('[data-work-viewport]', work);
    const sticky = $('.work__sticky', work);
    const track = $('[data-work-track]', work);
    const projects = $$('.project', track);
    const bar = $('[data-work-progress]', work);
    const counter = $('[data-work-count]', work);
    const prevButton = $('[data-work-prev]', work);
    const nextButton = $('[data-work-next]', work);

    let distance = 0;
    let currentPanel = -1;
    let pinned = false;
    let resizeTimer = 0;

    const pad = (number) => String(number).padStart(2, '0');

    function setCurrent(index) {
      if (index === currentPanel) return;
      currentPanel = index;
      if (counter) counter.textContent = `${pad(index + 1)} / ${pad(projects.length)}`;
      if (prevButton) prevButton.disabled = index === 0;
      if (nextButton) nextButton.disabled = index === projects.length - 1;
    }

    function workTop() {
      return viewport.getBoundingClientRect().top + window.scrollY;
    }

    function updateRail() {
      if (!pinned) {
        if (bar) bar.style.transform = 'scaleX(0)';
        setCurrent(0);
        return;
      }
      const ratio = clamp((window.scrollY - workTop()) / Math.max(distance, 1), 0, 1);
      if (ratio === 0) track.scrollLeft = 0;
      track.style.transform = `translate3d(${-ratio * distance}px, 0, 0)`;
      work.classList.toggle('is-rail-end', ratio > 0.985);
      if (bar) bar.style.transform = `scaleX(${ratio})`;
      setCurrent(Math.round(ratio * (projects.length - 1)));
    }

    function measureRail() {
      work.classList.remove('is-pinned');
      viewport.style.height = '';
      track.style.transform = '';
      pinned = false;
      distance = 0;
      currentPanel = -1;

      if (desktopRail.matches && !reduceMotion.matches) {
        work.classList.add('is-pinned');
        pinned = true;
        track.scrollLeft = 0;
        distance = Math.max(0, track.scrollWidth - sticky.clientWidth);
        viewport.style.height = `${window.innerHeight + distance}px`;
      }

      updateRail();
    }

    function panelOffset(index) {
      const panel = projects[index];
      const padding = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const offset = panel.getBoundingClientRect().left - track.getBoundingClientRect().left;
      return clamp(offset - padding, 0, distance);
    }

    function goToPanel(index) {
      const target = clamp(index, 0, projects.length - 1);
      if (!pinned) {
        projects[target].scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      const y = workTop() + panelOffset(target);
      window.scrollTo({ top: y, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }

    scrollHandlers.add(updateRail);

    if (prevButton) prevButton.addEventListener('click', () => goToPanel(currentPanel - 1));
    if (nextButton) nextButton.addEventListener('click', () => goToPanel(currentPanel + 1));

    track.addEventListener('focusin', (event) => {
      if (!pinned) return;
      const panel = event.target.closest('.project');
      if (!panel) return;
      const index = projects.indexOf(panel);
      if (index < 0) return;
      window.scrollTo({ top: workTop() + panelOffset(index), behavior: 'auto' });
    });

    track.addEventListener('keydown', (event) => {
      if (!pinned || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')) return;
      event.preventDefault();
      goToPanel(currentPanel + (event.key === 'ArrowRight' ? 1 : -1));
    });

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measureRail, 150);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureRail);
    }

    window.addEventListener('load', measureRail);
    measureRail();
  }

  /* ------------------------------------------------------------------
     Repo trail progress
     ------------------------------------------------------------------ */

  const trail = $('[data-trail]');

  if (trail) {
    const updateTrail = () => {
      const rect = trail.getBoundingClientRect();
      const startLine = window.innerHeight * 0.7;
      const ratio = clamp((startLine - rect.top) / Math.max(rect.height, 1), 0, 1);
      trail.style.setProperty('--trail', ratio.toFixed(4));
    };
    scrollHandlers.add(updateTrail);
    updateTrail();
  }

  /* ------------------------------------------------------------------
     Hero orbit: pointer + scroll parallax
     ------------------------------------------------------------------ */

  const hero = $('.hero');
  const orbit = $('[data-orbit]');

  if (hero && orbit) {
    if (!reduceMotion.matches) {
      scrollHandlers.add(() => {
        const ratio = clamp(window.scrollY / Math.max(hero.offsetHeight, 1), 0, 1);
        orbit.style.setProperty('--sy', (ratio * 60).toFixed(2));
      });
    }

    if (finePointer.matches && !reduceMotion.matches) {
      let targetX = 0;
      let targetY = 0;
      let x = 0;
      let y = 0;
      let animating = false;

      const animate = () => {
        x += (targetX - x) * 0.065;
        y += (targetY - y) * 0.065;
        orbit.style.setProperty('--mx', x.toFixed(4));
        orbit.style.setProperty('--my', y.toFixed(4));
        if (Math.abs(targetX - x) > 0.0006 || Math.abs(targetY - y) > 0.0006) {
          requestAnimationFrame(animate);
        } else {
          animating = false;
        }
      };

      hero.addEventListener('pointermove', (event) => {
        const rect = hero.getBoundingClientRect();
        targetX = (event.clientX - rect.left) / rect.width - 0.5;
        targetY = (event.clientY - rect.top) / rect.height - 0.5;
        if (!animating) {
          animating = true;
          requestAnimationFrame(animate);
        }
      }, { passive: true });
    }
  }

  /* ------------------------------------------------------------------
     Additive cursor
     ------------------------------------------------------------------ */

  if (finePointer.matches && !reduceMotion.matches) {
    const cursor = $('[data-cursor]');
    if (cursor) {
      document.body.classList.add('has-cursor');
      let targetX = -100;
      let targetY = -100;
      let x = -100;
      let y = -100;
      let moving = false;

      const render = () => {
        x += (targetX - x) * 0.2;
        y += (targetY - y) * 0.2;
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        if (Math.abs(targetX - x) > 0.35 || Math.abs(targetY - y) > 0.35) {
          requestAnimationFrame(render);
        } else {
          moving = false;
        }
      };

      window.addEventListener('pointermove', (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        if (!moving) {
          moving = true;
          requestAnimationFrame(render);
        }
      }, { passive: true });

      document.addEventListener('pointerover', (event) => {
        const hit = event.target.closest('a, button, [data-cursor]');
        cursor.classList.toggle('is-hover', Boolean(hit));
      });

      document.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
      document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
      document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
      document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
    }
  }

  /* ------------------------------------------------------------------
     Magnetic buttons
     ------------------------------------------------------------------ */

  if (finePointer.matches && !reduceMotion.matches) {
    $$('[data-magnetic]').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const offsetX = clamp((event.clientX - rect.left - rect.width / 2) * 0.14, -6, 6);
        const offsetY = clamp((event.clientY - rect.top - rect.height / 2) * 0.2, -5, 5);
        element.style.setProperty('--mag-x', `${offsetX.toFixed(2)}px`);
        element.style.setProperty('--mag-y', `${offsetY.toFixed(2)}px`);
      });
      element.addEventListener('pointerleave', () => {
        element.style.setProperty('--mag-x', '0px');
        element.style.setProperty('--mag-y', '0px');
      });
    });
  }

  /* ------------------------------------------------------------------
     Copy email
     ------------------------------------------------------------------ */

  const copyButton = $('[data-copy-email]');
  const copyLabel = $('[data-copy-label]');
  const copyStatus = $('[data-copy-status]');
  const EMAIL = 'jimsedric@gmail.com';

  if (copyButton) {
    let resetTimer = 0;

    copyButton.addEventListener('click', async () => {
      let copied = false;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(EMAIL);
          copied = true;
        }
      } catch (error) {
        copied = false;
      }

      if (!copied) {
        const field = document.createElement('textarea');
        field.value = EMAIL;
        field.setAttribute('readonly', '');
        field.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;';
        document.body.append(field);
        field.select();
        try {
          copied = document.execCommand('copy');
        } catch (error) {
          copied = false;
        }
        field.remove();
      }

      if (copyLabel) copyLabel.textContent = copied ? 'Copied' : 'Copy failed';
      if (copyStatus) {
        copyStatus.textContent = copied
          ? 'Email address copied to clipboard.'
          : `Copy failed. The address is ${EMAIL}.`;
      }

      clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        if (copyLabel) copyLabel.textContent = 'Copy email';
      }, 2400);
    });
  }

  /* ------------------------------------------------------------------
     Housekeeping
     ------------------------------------------------------------------ */

  $$('[data-year]').forEach((year) => {
    year.textContent = new Date().getFullYear();
  });

  handleChrome();
})();
