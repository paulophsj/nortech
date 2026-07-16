/* ═══════════════════════════════════════════
   Nortech — interações e animações
   ═══════════════════════════════════════════ */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ── Ano no footer ─────────────────────────── */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ── Tema claro / escuro (com transição "tech") ─ */
  const root = document.documentElement;

  function applyTheme(theme) {
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new CustomEvent('themechange'));
  }

  // raio necessário para cobrir a tela a partir de (x, y)
  function coverRadius(x, y) {
    return Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  }

  // anel de energia que se expande a partir do clique
  function launchTechRipple(x, y, toDark) {
    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple ' + (toDark ? 'to-dark' : 'to-light');
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.setProperty('--r', `${coverRadius(x, y)}px`);
    document.body.appendChild(ripple);
    requestAnimationFrame(() => ripple.classList.add('go'));
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }

  // fallback (navegadores sem View Transitions): revela o novo tema
  // com um "wipe" circular na cor-base de destino
  function fallbackWipe(x, y, next) {
    const overlay = document.createElement('div');
    overlay.className = 'theme-wipe';
    overlay.style.left = `${x}px`;
    overlay.style.top = `${y}px`;
    overlay.style.setProperty('--r', `${coverRadius(x, y)}px`);
    overlay.style.background = next === 'dark' ? '#050810' : '#f8fafc';
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('go'));
    // troca o tema quando o wipe já cobriu a tela...
    setTimeout(() => applyTheme(next), 430);
    // ...e depois some, revelando o tema aplicado
    setTimeout(() => {
      overlay.classList.add('out');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }, 500);
  }

  function switchTheme(x, y) {
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    const toDark = next === 'dark';

    if (prefersReducedMotion) {
      applyTheme(next);
      return;
    }

    // silencia as transições por elemento durante a troca
    // (a revelação circular já anima a mudança de tema)
    root.classList.add('theme-switching');

    if (typeof document.startViewTransition === 'function') {
      const endR = coverRadius(x, y);
      const transition = document.startViewTransition(() => applyTheme(next));
      transition.ready.then(() => {
        // anel de energia acompanha a borda do recorte
        // (substitui o drop-shadow pesado no snapshot da página)
        launchTechRipple(x, y, toDark);
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endR}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 640,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
      transition.finished.finally(() => root.classList.remove('theme-switching'));
    } else {
      // sem View Transitions: anel + wipe circular manual
      launchTechRipple(x, y, toDark);
      fallbackWipe(x, y, next);
      setTimeout(() => root.classList.remove('theme-switching'), 900);
    }
  }

  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      let x = e.clientX;
      let y = e.clientY;
      // acionado por teclado (sem coordenadas): parte do centro do botão
      if (!x && !y) {
        const rect = btn.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
      switchTheme(x, y);
    });
  });

  /* ── Cursor glow + dot (suavizado com lerp) ── */
  if (!isTouch) {
    const glow = document.getElementById('cursor-glow');
    const dot = document.getElementById('cursor-dot');
    let mouseX = innerWidth / 2;
    let mouseY = innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    let dotX = mouseX;
    let dotY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const lerp = (a, b, t) => a + (b - a) * t;

    (function animateCursor() {
      glowX = lerp(glowX, mouseX, 0.06);
      glowY = lerp(glowY, mouseY, 0.06);
      dotX = lerp(dotX, mouseX, 0.35);
      dotY = lerp(dotY, mouseY, 0.35);
      glow.style.transform = `translate(${glowX - 260}px, ${glowY - 260}px)`;
      dot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
      requestAnimationFrame(animateCursor);
    })();

    // Aumenta o cursor sobre elementos interativos
    document.querySelectorAll('a, button, input, textarea, .custom-select-option, .tilt-card').forEach((el) => {
      el.addEventListener('mouseenter', () => dot.classList.add('hovering'));
      el.addEventListener('mouseleave', () => dot.classList.remove('hovering'));
    });
  }

  /* ── Barra de progresso de scroll ──────────── */
  const progressBar = document.getElementById('scroll-progress');
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.width = `${(scrollTop / docHeight) * 100}%`;

    navbar.classList.toggle('scrolled', scrollTop > 40);
    backToTop.classList.toggle('show', scrollTop > 600);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Menu mobile ───────────────────────────── */
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── Reveal on scroll (IntersectionObserver) ─ */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ── Link ativo conforme a seção visível ───── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  /* ── Contadores animados ───────────────────── */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.target;
        const duration = 1800;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          // ease-out cúbico
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );

  document.querySelectorAll('.counter').forEach((el) => counterObserver.observe(el));

  /* ── Efeito typewriter no hero ─────────────── */
  const phrases = [
    'construimos sistemas sob medida_',
    'mantemos sua operação no ar 24/7_',
    'consultoria que gera resultado_',
    'da ideia ao deploy, com você_',
  ];
  const typeEl = document.getElementById('typewriter');
  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function typeLoop() {
    const phrase = phrases[phraseIdx];

    if (!deleting) {
      charIdx++;
      typeEl.textContent = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(typeLoop, 2200);
        return;
      }
      setTimeout(typeLoop, 55 + Math.random() * 60);
    } else {
      charIdx--;
      typeEl.textContent = phrase.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
      setTimeout(typeLoop, 28);
    }
  }

  if (!prefersReducedMotion) {
    setTimeout(typeLoop, 900);
  } else {
    typeEl.textContent = phrases[0];
  }

  /* ── Tilt 3D + glow nos cards ──────────────── */
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotX = ((y / rect.height) - 0.5) * -8;
        const rotY = ((x / rect.width) - 0.5) * 8;

        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  /* ── Botões magnéticos ─────────────────────── */
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ── Parallax suave no scroll ──────────────── */
  const parallaxEls = document.querySelectorAll('[data-parallax]');

  if (!prefersReducedMotion && parallaxEls.length) {
    window.addEventListener(
      'scroll',
      () => {
        parallaxEls.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax);
          const rect = el.getBoundingClientRect();
          const offset = (rect.top + rect.height / 2 - innerHeight / 2) * speed;
          el.style.transform = `translateY(${offset * -1}px)`;
        });
      },
      { passive: true }
    );
  }

  /* ── Partículas no hero (canvas) ───────────── */
  const canvas = document.getElementById('particles');

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;
    let mouseCX = -9999;
    let mouseCY = -9999;

    // cores adaptadas ao tema atual
    let isDark = root.classList.contains('dark');
    window.addEventListener('themechange', () => {
      isDark = root.classList.contains('dark');
    });

    const dotColor = () => (isDark ? 'rgba(56, 189, 248, 0.55)' : 'rgba(2, 132, 199, 0.5)');
    const lineColor = (alpha) =>
      isDark ? `rgba(56, 189, 248, ${alpha})` : `rgba(2, 132, 199, ${alpha})`;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
    }

    function initParticles() {
      const count = Math.min(90, Math.floor((w * h) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6,
      }));
    }

    resize();
    initParticles();
    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseCX = e.clientX - rect.left;
      mouseCY = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', () => {
      mouseCX = -9999;
      mouseCY = -9999;
    });

    function drawParticles() {
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        // leve repulsão ao mouse
        const dx = p.x - mouseCX;
        const dy = p.y - mouseCY;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          p.x += (dx / dist) * force * 1.4;
          p.y += (dy / dist) * force * 1.4;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dotColor();
        ctx.fill();
      });

      // linhas entre partículas próximas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = lineColor(0.14 * (1 - dist / 130));
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(drawParticles);
    }

    drawParticles();
  }

  /* ── Select personalizado ──────────────────── */
  document.querySelectorAll('.custom-select').forEach((select) => {
    const trigger = select.querySelector('.custom-select-trigger');
    const valueEl = select.querySelector('.custom-select-value');
    const hiddenInput = select.querySelector('input[type="hidden"]');
    const options = [...select.querySelectorAll('.custom-select-option')];
    let focusedIdx = options.findIndex((o) => o.classList.contains('selected'));

    function open() {
      select.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      select.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      options.forEach((o) => o.classList.remove('focused'));
    }

    function isOpen() {
      return select.classList.contains('open');
    }

    function selectOption(option, focusTrigger = true) {
      options.forEach((o) => {
        o.classList.toggle('selected', o === option);
        o.setAttribute('aria-selected', o === option ? 'true' : 'false');
      });
      hiddenInput.value = option.dataset.value;
      valueEl.textContent = option.textContent.trim();
      focusedIdx = options.indexOf(option);
      close();
      if (focusTrigger) trigger.focus();
    }

    // permite resetar o select junto com o form.reset()
    select.resetToDefault = () => selectOption(options[0], false);

    function focusOption(idx) {
      focusedIdx = (idx + options.length) % options.length;
      options.forEach((o, i) => o.classList.toggle('focused', i === focusedIdx));
      options[focusedIdx].focus();
    }

    trigger.addEventListener('click', () => {
      isOpen() ? close() : open();
    });

    options.forEach((option) => {
      option.addEventListener('click', () => selectOption(option));
    });

    // Navegação por teclado
    select.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Escape':
          close();
          trigger.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen()) open();
          focusOption(isOpen() && document.activeElement !== trigger ? focusedIdx + 1 : focusedIdx);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen()) open();
          focusOption(document.activeElement !== trigger ? focusedIdx - 1 : focusedIdx);
          break;
        case 'Enter':
        case ' ':
          if (isOpen() && document.activeElement.classList.contains('custom-select-option')) {
            e.preventDefault();
            selectOption(document.activeElement);
          }
          break;
        case 'Tab':
          close();
          break;
      }
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
      if (!select.contains(e.target)) close();
    });
  });

  /* ── Formulário de contato ──────────── */
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');
  const rocketWrap = document.getElementById('rocket-wrap');
  const API_URL = 'https://nortech-contacts.onrender.com/api/contacts';
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const MIN_BURN_MS = 900;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('launching');
    const launchStart = performance.now();

    const data = new FormData(form);
    const servicoSelecionado = form.querySelector('#servico-select .custom-select-value');

    let errorMessage = 'Não foi possível enviar sua mensagem. Tente novamente em instantes.';

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: data.get('nome'),
          email: data.get('email'),
          servicoInteresse: servicoSelecionado ? servicoSelecionado.textContent.trim() : data.get('servico'),
          mensagem: data.get('mensagem'),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (body && body.error) errorMessage = body.error;
        throw new Error(errorMessage);
      }

      const elapsed = performance.now() - launchStart;
      if (elapsed < MIN_BURN_MS) await wait(MIN_BURN_MS - elapsed);

      rocketWrap.classList.add('rocket-liftoff');
      await wait(700);

      feedback.textContent = '✓ Mensagem enviada! Retornaremos em até 48h.';
      feedback.classList.remove('hidden');
      form.reset();
      form.querySelectorAll('.custom-select').forEach((s) => s.resetToDefault && s.resetToDefault());

      submitBtn.classList.remove('launching');
      rocketWrap.classList.remove('rocket-liftoff');
      rocketWrap.classList.add('rocket-return');
      await wait(500);
      rocketWrap.classList.remove('rocket-return');
    } catch (err) {
      submitBtn.classList.remove('launching');
      feedback.textContent = `✗ ${errorMessage}`;
      feedback.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      setTimeout(() => feedback.classList.add('hidden'), 6000);
    }
  });
})();
