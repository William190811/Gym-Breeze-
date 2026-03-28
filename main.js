/**
 * GymBreeze — Main JavaScript
 * GSAP Parallax · AOS Scroll Animations · Carousel · Nav · Filters · Cart Toast
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     1. AOS INITIALISATION
     ═══════════════════════════════════════════════════════════ */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 750,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      once: true,
      offset: 80,
      delay: 0,
    });
  }

  /* ═══════════════════════════════════════════════════════════
     2. GSAP SETUP
     ═══════════════════════════════════════════════════════════ */
  var hasGSAP = typeof gsap !== 'undefined';
  var hasScrollTrigger = hasGSAP && typeof ScrollTrigger !== 'undefined';

  if (hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ── Hero background parallax ── */
  if (hasScrollTrigger) {
  const heroBgLayer = document.getElementById('heroBgLayer');
  if (heroBgLayer) {
    gsap.to(heroBgLayer, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.4,
      },
    });
  }

  /* ── Hero visual parallax (foreground moves faster than bg) ── */
  const heroVisual = document.getElementById('heroVisual');
  if (heroVisual) {
    gsap.to(heroVisual, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
      },
    });
  }

  /* ── About section image parallax ── */
  const aboutImgWrap = document.getElementById('aboutImgWrap');
  if (aboutImgWrap) {
    gsap.to(aboutImgWrap, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '#about',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      },
    });
  }

  /* ── Product cards subtle depth on scroll ── */
  const productCols = document.querySelectorAll('.gb-product-col');
  productCols.forEach(function (col, i) {
    gsap.fromTo(
      col,
      { y: 20 },
      {
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: col,
          start: 'top 90%',
          end: 'top 40%',
          scrub: true,
        },
      }
    );
  });

  /* ── Neon section header underline animate on scroll ── */
  const sectionHeaders = document.querySelectorAll('.gb-section-header__title');
  sectionHeaders.forEach(function (el) {
    const underline = el.querySelector('.gb-section-header__underline');
    if (!underline) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: function () {
        gsap.to(underline, {
          scaleX: 1,
          duration: 0.9,
          ease: 'power3.out',
          transformOrigin: 'left',
        });
      },
    });
    // Reset transform-origin set via CSS so GSAP can control it
    gsap.set(underline, { scaleX: 0, transformOrigin: 'left' });
  });

  /* ── About section stat number count-up ── */
  const statNums = document.querySelectorAll('.gb-about__stat-num');
  statNums.forEach(function (el) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: function () {
        animateStatNum(el);
      },
    });
  });
  } // end if(hasScrollTrigger)
  function animateStatNum(el) {
    const original = el.textContent.trim();
    // Extract numeric part
    const numMatch = original.match(/[\d.]+/);
    if (!numMatch) return;
    const endVal = parseFloat(numMatch[0]);
    const prefix = original.slice(0, original.indexOf(numMatch[0]));
    const suffix = original.slice(original.indexOf(numMatch[0]) + numMatch[0].length);
    const isInt = !numMatch[0].includes('.');
    const duration = 1.6;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = endVal * eased;
      el.textContent = prefix + (isInt ? Math.round(current).toLocaleString() : current.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = original;
    }
    requestAnimationFrame(tick);
  }

  /* ═══════════════════════════════════════════════════════════
     3. NAVIGATION SCROLL BEHAVIOUR
     ═══════════════════════════════════════════════════════════ */
  const nav = document.getElementById('gbNav');
  let lastScrollY = 0;

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 60) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initial call

  /* ── Mobile nav toggle ── */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  function toggleNav(open) {
    const isOpen = typeof open !== 'undefined' ? open : !navMenu.classList.contains('is-open');
    navMenu.classList.toggle('is-open', isOpen);
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  navToggle.addEventListener('click', function () {
    toggleNav();
  });

  // Close on link click
  navMenu.querySelectorAll('.gb-nav__link, .gb-nav__cta').forEach(function (link) {
    link.addEventListener('click', function () {
      toggleNav(false);
    });
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (navMenu.classList.contains('is-open') && !nav.contains(e.target)) {
      toggleNav(false);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      toggleNav(false);
    }
  });

  /* ── Smooth anchor scrolling with nav offset ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ═══════════════════════════════════════════════════════════
     4. PRODUCT FILTER TABS
     ═══════════════════════════════════════════════════════════ */
  const filterBtns = document.querySelectorAll('.gb-filter');
  const filterableProductCols = document.querySelectorAll('.gb-product-col');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const filter = this.dataset.filter;

      // Update active state
      filterBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      // Show/hide products with a smooth transition
      filterableProductCols.forEach(function (col) {
        const category = col.dataset.category;
        if (filter === 'all' || category === filter) {
          col.classList.remove('is-hidden');
          if (hasGSAP) {
            gsap.fromTo(
              col,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0 }
            );
          }
        } else {
          col.classList.add('is-hidden');
        }
      });

      if (hasGSAP) {
      // Stagger visible items
      const visible = document.querySelectorAll('.gb-product-col:not(.is-hidden)');
      visible.forEach(function (col, i) {
        gsap.fromTo(
          col,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: i * 0.07 }
        );
      });
      }
    });
  });

  /* ═══════════════════════════════════════════════════════════
     5. TESTIMONIALS CAROUSEL
     ═══════════════════════════════════════════════════════════ */
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('carouselDots');
  const cards = Array.from(track ? track.querySelectorAll('.gb-tcard') : []);

  let currentIndex = 0;
  let autoScrollTimer = null;
  let visibleCount = getVisibleCount();

  function getVisibleCount() {
    const w = window.innerWidth;
    if (w >= 992) return 3;
    if (w >= 576) return 2;
    return 1;
  }

  function getTotalSlides() {
    return Math.max(0, cards.length - visibleCount + 1);
  }

  function clampIndex(idx) {
    const total = getTotalSlides();
    return Math.max(0, Math.min(idx, total - 1));
  }

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const total = getTotalSlides();
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'gb-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Testimonial ' + (i + 1));
      dot.setAttribute('role', 'tab');
      dot.addEventListener('click', function () {
        goTo(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.gb-dot');
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === currentIndex);
    });
  }

  function getCardWidth() {
    if (!cards.length) return 0;
    const card = cards[0];
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 24;
    return card.offsetWidth + gap;
  }

  function goTo(idx) {
    currentIndex = clampIndex(idx);
    const offset = currentIndex * getCardWidth();
    track.style.transform = 'translateX(-' + offset + 'px)';
    updateDots();
  }

  function next() {
    const total = getTotalSlides();
    goTo(currentIndex >= total - 1 ? 0 : currentIndex + 1);
  }

  function prev() {
    const total = getTotalSlides();
    goTo(currentIndex <= 0 ? total - 1 : currentIndex - 1);
  }

  function startAutoScroll() {
    stopAutoScroll();
    autoScrollTimer = setInterval(next, 4500);
  }

  function stopAutoScroll() {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  }

  if (prevBtn && nextBtn && track) {
    prevBtn.addEventListener('click', function () {
      prev();
      stopAutoScroll();
      startAutoScroll();
    });

    nextBtn.addEventListener('click', function () {
      next();
      stopAutoScroll();
      startAutoScroll();
    });

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoScroll);
    track.addEventListener('mouseleave', startAutoScroll);
    track.addEventListener('focusin', stopAutoScroll);
    track.addEventListener('focusout', startAutoScroll);

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
      stopAutoScroll();
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? next() : prev();
      }
      startAutoScroll();
    }, { passive: true });

    buildDots();
    startAutoScroll();

    window.addEventListener('resize', function () {
      visibleCount = getVisibleCount();
      buildDots();
      goTo(0);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     6. CART TOAST
     ═══════════════════════════════════════════════════════════ */
  const cartToast = document.getElementById('cartToast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimeout = null;

  function showToast(productName) {
    if (!cartToast) return;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMsg.textContent = (productName || 'Item') + ' added to cart!';
    cartToast.classList.add('is-visible');
    toastTimeout = setTimeout(function () {
      cartToast.classList.remove('is-visible');
    }, 3200);
  }

  document.querySelectorAll('.gb-btn--cart').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const card = btn.closest('.gb-card');
      const productName = card ? card.querySelector('.gb-card__name')?.textContent : 'Item';
      if (hasGSAP) {
        // Brief press animation
        gsap.to(btn, {
          scale: 0.92,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
          onComplete: function () {
            showToast(productName);
          },
        });
      } else {
        showToast(productName);
      }
    });
  });
/* ═══════════════════════════════════════════════════════════
     7. HERO ENTRANCE ANIMATION (on load)
     ═══════════════════════════════════════════════════════════ */
  window.addEventListener('load', function () {
    if (!hasGSAP) return;
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTimeline
      .fromTo(
        '.hero__headline, .gb-hero__headline',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        0
      )
      .fromTo(
        '.hero__subheadline, .gb-hero__sub',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.3
      )
      .fromTo(
        '.hero__cta, .gb-hero__actions',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.5
      )
      .fromTo(
        '.hero__product, .gb-hero__visual',
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.9 },
        0.2
      )
      .fromTo(
        '.hero__scroll-indicator, .gb-hero__scroll',
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        0.8
      );
  });

  /* ═══════════════════════════════════════════════════════════
     8. NEON CARD HOVER GLOW (JS-enhanced)
     ═══════════════════════════════════════════════════════════ */
  if (hasGSAP) {
  document.querySelectorAll('.gb-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      gsap.to(card, {
        boxShadow: '0 20px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(0,240,255,.35), 0 0 24px rgba(0,240,255,.18)',
        duration: 0.3,
        ease: 'power2.out',
      });
    });
    card.addEventListener('mouseleave', function () {
      gsap.to(card, {
        boxShadow: '0 0 0 rgba(0,0,0,0)',
        duration: 0.4,
        ease: 'power2.out',
      });
    });
  });
  }

  /* ═══════════════════════════════════════════════════════════
     9. CURSOR TRAIL EFFECT (subtle neon dots)
     ═══════════════════════════════════════════════════════════ */
  // Only on desktop
  if (window.matchMedia('(pointer: fine)').matches) {
    const MAX_DOTS = 6;
    const dots = [];

    function createDot() {
      const dot = document.createElement('div');
      dot.style.cssText = [
        'position:fixed',
        'width:6px',
        'height:6px',
        'border-radius:50%',
        'background:rgba(0,240,255,0.7)',
        'pointer-events:none',
        'z-index:9998',
        'transform:translate(-50%,-50%)',
        'transition:opacity 0.4s ease',
        'opacity:0',
      ].join(';');
      document.body.appendChild(dot);
      return dot;
    }

    for (let i = 0; i < MAX_DOTS; i++) {
      dots.push(createDot());
    }

    let mouseX = 0, mouseY = 0;
    let dotPositions = dots.map(function () { return { x: 0, y: 0 }; });

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      let prevX = mouseX, prevY = mouseY;
      dots.forEach(function (dot, i) {
        dotPositions[i].x += (prevX - dotPositions[i].x) * (0.5 - i * 0.04);
        dotPositions[i].y += (prevY - dotPositions[i].y) * (0.5 - i * 0.04);
        dot.style.left = dotPositions[i].x + 'px';
        dot.style.top  = dotPositions[i].y + 'px';
        dot.style.opacity = String(0.6 - i * 0.08);
        dot.style.width  = (6 - i * 0.6) + 'px';
        dot.style.height = (6 - i * 0.6) + 'px';
        prevX = dotPositions[i].x;
        prevY = dotPositions[i].y;
      });
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  /* ═══════════════════════════════════════════════════════════
     10. NEWSLETTER FORM
     ═══════════════════════════════════════════════════════════ */
  const newsletterForm = document.querySelector('.gb-newsletter');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = this.querySelector('.gb-newsletter__input');
      const btn = this.querySelector('.gb-btn--newsletter');
      const originalText = btn.textContent;
      btn.textContent = 'Subscribed ✓';
      btn.style.background = 'var(--gb-neon-green)';
      btn.style.color = 'var(--gb-black)';
      input.value = '';
      setTimeout(function () {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 3000);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     11. KEYBOARD NAVIGATION FOR CARDS
     ═══════════════════════════════════════════════════════════ */
  document.querySelectorAll('.gb-card').forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const cartBtn = card.querySelector('.gb-btn--cart');
        if (cartBtn) cartBtn.click();
      }
    });
  });

})();
