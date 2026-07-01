/* ═══════════════════════════════════════════════════════════
   script.js — Portfolio Visual Storyteller
   ═══════════════════════════════════════════════════════════ */

const isMobile = window.innerWidth <= 768;
const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
const isDesktop = window.innerWidth > 1024;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

if (isMobile) {
  document.documentElement.style.scrollBehavior = 'auto';
} else {
  document.documentElement.style.scrollBehavior = 'smooth';
}

const cursor = document.getElementById('cursor');

if (cursor) {
  if (isDesktop) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
  } else {
    cursor.style.display = 'none';
  }
}

const mainNav = document.getElementById('mainNav');

if (mainNav) {
  window.addEventListener('scroll', () => {
    mainNav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

const heroVideo = document.getElementById('heroVideo');
const videoFallback = document.getElementById('videoFallback');

if (heroVideo && videoFallback) {
  if (heroVideo.querySelector('source')) {
    videoFallback.style.display = 'none';
  } else {
    heroVideo.style.display = 'none';
  }
}

const typingTarget = document.getElementById('typingTarget');

if (typingTarget) {
  const phrases = (typingTarget.dataset.typing || '')
    .split(',')
    .map((phrase) => phrase.trim())
    .filter(Boolean);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (phrases.length && !prefersReducedMotion) {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const TYPE_SPEED = 65;
    const DELETE_SPEED = 35;
    const HOLD_AFTER_TYPE = 1800;
    const HOLD_AFTER_DELETE = 400;

    const tick = () => {
      const currentPhrase = phrases[phraseIndex];

      if (!isDeleting) {
        charIndex += 1;
        typingTarget.textContent = currentPhrase.slice(0, charIndex);

        if (charIndex === currentPhrase.length) {
          isDeleting = true;
          window.setTimeout(tick, HOLD_AFTER_TYPE);
          return;
        }

        window.setTimeout(tick, TYPE_SPEED);
        return;
      }

      charIndex -= 1;
      typingTarget.textContent = currentPhrase.slice(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        window.setTimeout(tick, HOLD_AFTER_DELETE);
        return;
      }

      window.setTimeout(tick, DELETE_SPEED);
    };

    tick();
  } else if (phrases.length) {
    typingTarget.textContent = phrases[0];
  }
}

const slider = document.getElementById('mainSlider');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('carouselDots');
const carouselSection = document.getElementById('portfolioCarousel') || document.querySelector('.portfolio-carousel');
const carouselCurrent = document.getElementById('carouselCurrent');
const carouselTotal = document.getElementById('carouselTotal');

if (slider && prevBtn && nextBtn) {
  const slides = Array.from(slider.querySelectorAll('.portfolio-slide'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const totalItems = slides.length;
  const animationDuration = prefersReducedMotion ? 0 : 720;
  const autoplayDelay = 7000;

  let activeIndex = 0;
  let isAnimating = false;
  let autoplayTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoved = false;

  const formatIndex = (index) => String(index + 1).padStart(2, '0');

  const syncCarouselState = () => {
    slider.style.transform = `translateX(-${activeIndex * 100}%)`;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      slide.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    if (carouselCurrent) {
      carouselCurrent.textContent = formatIndex(activeIndex);
    }

    if (carouselTotal) {
      carouselTotal.textContent = formatIndex(totalItems);
    }

    if (dotsContainer) {
      Array.from(dotsContainer.children).forEach((dot, index) => {
        dot.classList.toggle('is-current', index === activeIndex);
        dot.setAttribute('aria-pressed', index === activeIndex ? 'true' : 'false');
      });
    }
  };

  const moveTo = (targetIndex) => {
    if (isAnimating || totalItems < 2) {
      return;
    }

    const nextIndex = (targetIndex + totalItems) % totalItems;
    if (nextIndex === activeIndex) {
      return;
    }

    isAnimating = true;
    activeIndex = nextIndex;
    syncCarouselState();

    window.setTimeout(() => {
      isAnimating = false;
    }, animationDuration);
  };

  const nextSlide = () => moveTo(activeIndex + 1);
  const prevSlide = () => moveTo(activeIndex - 1);

  const stopAutoplay = () => {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const startAutoplay = () => {
    if (prefersReducedMotion || isMobile || totalItems < 2) {
      return;
    }

    stopAutoplay();
    autoplayTimer = window.setInterval(nextSlide, autoplayDelay);
  };

  if (dotsContainer) {
    dotsContainer.innerHTML = '';

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ke proyek ${index + 1}`);
      dot.addEventListener('click', () => {
        moveTo(index);
        startAutoplay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  prevBtn.addEventListener('click', () => {
    prevSlide();
    startAutoplay();
  });

  nextBtn.addEventListener('click', () => {
    nextSlide();
    startAutoplay();
  });

  if (carouselSection) {
    carouselSection.setAttribute('tabindex', '0');

    carouselSection.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
        startAutoplay();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
        startAutoplay();
      }
    });

    carouselSection.addEventListener('mouseenter', stopAutoplay);
    carouselSection.addEventListener('mouseleave', startAutoplay);
    carouselSection.addEventListener('focusin', stopAutoplay);
    carouselSection.addEventListener('focusout', startAutoplay);
  }

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    touchMoved = false;
    stopAutoplay();
  }, { passive: true });

  slider.addEventListener('touchmove', (e) => {
    const touch = e.changedTouches[0];
    touchMoved = Math.abs(touch.screenX - touchStartX) > 10 || Math.abs(touch.screenY - touchStartY) > 10;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    if (!touchMoved) {
      startAutoplay();
      return;
    }

    const touchEndX = e.changedTouches[0].screenX;
    const deltaX = touchEndX - touchStartX;
    const swipeThreshold = 50;

    if (deltaX < -swipeThreshold) {
      nextSlide();
    } else if (deltaX > swipeThreshold) {
      prevSlide();
    }

    startAutoplay();
  }, { passive: true });

  syncCarouselState();
  startAutoplay();
}

const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

if (window.IntersectionObserver) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('visible'));
}

if (window.gsap && window.ScrollTrigger && isDesktop) {
  gsap.fromTo(
    '.hero-title',
    { y: 0, opacity: 1 },
    {
      y: -100,
      opacity: 0.7,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom center',
        scrub: 1
      }
    }
  );

  gsap.fromTo(
    '#about',
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1,
      scrollTrigger: {
        trigger: '#about',
        start: 'top 70%',
        end: 'top 30%',
        scrub: 1
      }
    }
  );

  gsap.fromTo(
    '.about-photo-placeholder',
    { scale: 0.8, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.about-photo-placeholder',
        start: 'top 80%',
        end: 'center center',
        scrub: 1
      }
    }
  );

  gsap.fromTo(
    '.badge-counter',
    { innerHTML: 0, opacity: 0, scale: 0 },
    {
      innerHTML: 8,
      opacity: 1,
      scale: 1,
      duration: 2,
      snap: { innerHTML: 1 },
      scrollTrigger: {
        trigger: '.about-badge',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );

  gsap.fromTo(
    '.about-badge',
    { boxShadow: '0 0 0px 0px rgba(245, 160, 51, 0)' },
    {
      boxShadow: '0 0 20px 5px rgba(245, 160, 51, 0.3)',
      duration: 2,
      repeat: -1,
      yoyo: true,
      scrollTrigger: {
        trigger: '.about-badge',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );

  gsap.fromTo(
    '.badge-plus',
    { rotation: 0, opacity: 0 },
    {
      rotation: 360,
      opacity: 1,
      duration: 1.5,
      scrollTrigger: {
        trigger: '.about-badge',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );

  gsap.fromTo(
    '.about-badge',
    { scale: 0, rotation: -10 },
    {
      scale: 1,
      rotation: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.about-badge',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );

  gsap.utils.toArray('.stat-num').forEach((stat) => {
    gsap.fromTo(
      stat,
      { innerHTML: 0 },
      {
        innerHTML: stat.textContent,
        duration: 2,
        snap: { innerHTML: 1 },
        scrollTrigger: {
          trigger: stat,
          start: 'center 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  gsap.fromTo(
    '.portfolio-slide',
    { opacity: 0, y: 40, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      stagger: 0.12,
      scrollTrigger: {
        trigger: '#work',
        start: 'top 60%',
        toggleActions: 'play none none none'
      }
    }
  );

  gsap.utils.toArray('.service-card').forEach((card, index) => {
    gsap.fromTo(
      card,
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        delay: index * 0.1,
        scrollTrigger: {
          trigger: '#services',
          start: 'top 70%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  gsap.fromTo(
    '.testimonial-text',
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: '#testimonial',
        start: 'top 70%',
        toggleActions: 'play none none none'
      }
    }
  );

  gsap.fromTo(
    '#contact',
    { opacity: 0, y: 100 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: '#contact',
        start: 'top 70%',
        toggleActions: 'play none none none'
      }
    }
  );
}

if (window.gsap && window.ScrollTrigger && (isMobile || isTablet)) {
  gsap.fromTo(
    '.about-photo-placeholder',
    { scale: 0.95 },
    {
      scale: 1,
      scrollTrigger: {
        trigger: '.about-photo-placeholder',
        start: 'top bottom',
        end: 'top 60%',
        scrub: 0.5
      }
    }
  );

  gsap.fromTo(
    '.about-title',
    { y: 0 },
    {
      y: -40,
      scrollTrigger: {
        trigger: '#about',
        start: 'top center',
        end: 'center center',
        scrub: 0.3
      }
    }
  );

  gsap.fromTo(
    '.badge-counter',
    { innerHTML: 0, opacity: 0, scale: 0.5 },
    {
      innerHTML: 8,
      opacity: 1,
      scale: 1,
      duration: 1.5,
      snap: { innerHTML: 1 },
      scrollTrigger: {
        trigger: '.about-badge',
        start: 'top 70%',
        toggleActions: 'play none none none'
      }
    }
  );

  gsap.fromTo(
    '.about-badge',
    { boxShadow: '0 0 10px 2px rgba(245, 160, 51, 0)' },
    {
      boxShadow: '0 0 15px 3px rgba(245, 160, 51, 0.25)',
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      scrollTrigger: {
        trigger: '.about-badge',
        start: 'top 70%',
        toggleActions: 'play none none none'
      }
    }
  );

  gsap.utils.toArray('.service-card').forEach((card, index) => {
    gsap.fromTo(
      card,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: index * 0.08,
        scrollTrigger: {
          trigger: '#services',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  gsap.fromTo(
    '.hero-title',
    { y: 0 },
    {
      y: -50,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom 50%',
        scrub: 0.3
      }
    }
  );
}

if (isIOS) {
  document.body.addEventListener('touchmove', (e) => {
    if (e.target.closest('input, textarea, select')) {
      return;
    }
  }, { passive: true });

  const updateViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  updateViewportHeight();
  window.addEventListener('resize', updateViewportHeight);
}

if (isAndroid && window.ScrollTrigger) {
  ScrollTrigger.defaults({ fastScrollEnd: true });
}

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.form-submit');

    if (!submitBtn) {
      return;
    }

    submitBtn.textContent = 'Pesan Terkirim ✓';
    submitBtn.style.background = '#2a7a4b';
    submitBtn.style.color = '#fff';

    window.setTimeout(() => {
      submitBtn.textContent = 'Kirim Pesan →';
      submitBtn.style.background = '';
      submitBtn.style.color = '';
      contactForm.reset();
    }, 3000);
  });
}

if (isMobile && window.ScrollTrigger) {
  ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,orientationchange' });
}

const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');
const navItems = document.querySelectorAll('.nav-links a');

if (mobileMenuToggle && navLinks) {
  const icon = mobileMenuToggle.querySelector('ion-icon');

  const closeMenu = () => {
    navLinks.classList.remove('active');
    if (icon) {
      icon.setAttribute('name', 'menu-outline');
    }
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    const isOpen = navLinks.classList.toggle('active');
    if (icon) {
      icon.setAttribute('name', isOpen ? 'close-outline' : 'menu-outline');
    }
    mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
  };

  mobileMenuToggle.addEventListener('click', toggleMenu);

  mobileMenuToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });

  navItems.forEach((item) => {
    item.addEventListener('click', closeMenu);
  });

  const desktopMediaQuery = window.matchMedia('(min-width: 901px)');
  desktopMediaQuery.addEventListener('change', (e) => {
    if (e.matches) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMenu();
    }
  });
}
