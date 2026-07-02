/* ═══════════════════════════════════════════════════════════
   script.js — Portfolio Visual Storyteller
   ═══════════════════════════════════════════════════════════ */

/* ── DETECT PLATFORM & DEVICE ────────────────────────────────
   Mendeteksi apakah user di mobile, tablet, atau desktop
   untuk optimasi scroll animation yang lebih baik
──────────────────────────────────────────────────────────── */
const isMobile = window.innerWidth <= 768;
const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
const isDesktop = window.innerWidth > 1024;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);

/* ── INIT GSAP ScrollTrigger ─────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

// Disable smooth scroll pada mobile untuk performa lebih baik
if (isMobile) {
  document.documentElement.style.scrollBehavior = 'auto';
} else {
  document.documentElement.style.scrollBehavior = 'smooth';
}

/* ── CURSOR ─────────────────────────────────────────────────────
   Mengikuti posisi mouse secara real-time (desktop saja).
──────────────────────────────────────────────────────────── */
const cursor = document.getElementById('cursor');

if (isDesktop) {
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
} else {
  cursor.style.display = 'none';
}

/* ── NAVBAR SCROLL ───────────────────────────────────────────
   Menambah class .scrolled saat halaman di-scroll > 60px
   agar navbar mendapat blur backdrop.
──────────────────────────────────────────────────────────── */
const mainNav = document.getElementById('mainNav');

window.addEventListener('scroll', () => {
  mainNav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ── VIDEO FALLBACK ──────────────────────────────────────────
   Sembunyikan fallback jika video tersedia; sembunyikan video
   jika tidak ada source yang disediakan.
──────────────────────────────────────────────────────────── */
const heroVideo = document.getElementById('heroVideo');
const videoFallback = document.getElementById('videoFallback');
const videoSource = heroVideo ? heroVideo.querySelector('source') : null;

if (heroVideo && videoSource) {
  heroVideo.load();
}

if (heroVideo && videoFallback) {
  if (videoSource && videoSource.getAttribute('src')) {
    videoFallback.style.display = 'none';
  } else {
    heroVideo.style.display = 'none';
  }
}

/* ── HERO TYPING EFFECT ─────────────────────────────────────
   BUG FIX: elemen #typingTarget punya atribut data-typing berisi
   daftar frasa, tapi sebelumnya tidak ada satupun kode yang
   membacanya — span-nya selalu kosong. Kode di bawah ini
   mengetik & menghapus tiap frasa secara bergantian.
──────────────────────────────────────────────────────────── */
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
        charIndex++;
        typingTarget.textContent = currentPhrase.slice(0, charIndex);

        if (charIndex === currentPhrase.length) {
          isDeleting = true;
          window.setTimeout(tick, HOLD_AFTER_TYPE);
          return;
        }
        window.setTimeout(tick, TYPE_SPEED);
      } else {
        charIndex--;
        typingTarget.textContent = currentPhrase.slice(0, charIndex);

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          window.setTimeout(tick, HOLD_AFTER_DELETE);
          return;
        }
        window.setTimeout(tick, DELETE_SPEED);
      }
    };

    tick();
  } else if (phrases.length) {
    // Reduced motion: tampilkan frasa pertama secara statis, tanpa animasi
    typingTarget.textContent = phrases[0];
  }
}

/* ── PORTFOLIO GALLERY (SPOTLIGHT CAROUSEL) ──────────────────
   Carousel baru: satu proyek besar tampil penuh ("spotlight"),
   dinavigasi lewat panah, thumbnail strip, keyboard, dan drag/swipe.
   Progress bar bergaya "stories" menggerakkan autoplay lewat event
   animationend, jadi hanya ada satu sumber waktu (bukan interval
   terpisah yang bisa desync dari progress bar). ───────────────── */
const gallery = document.getElementById('portfolioGallery');
const galleryStage = document.getElementById('galleryStage');
const galleryTrack = document.getElementById('galleryTrack');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');
const galleryProgress = document.getElementById('galleryProgress');
const galleryThumbs = document.getElementById('galleryThumbs');
const galleryCounter = document.getElementById('galleryCounter');

if (gallery && galleryStage && galleryTrack && galleryPrev && galleryNext) {
  const cards = Array.from(galleryTrack.querySelectorAll('.gallery-card'));
  const total = cards.length;
  let current = 0;
  let pointerDown = false;
  let pointerStartX = 0;
  let autoplayTimer = null;
  const autoplayDelay = 6000;

  galleryTrack.style.setProperty('--count', String(total));

  // Bangun segmen progress bar (gaya "stories")
  const segments = cards.map(() => {
    const seg = document.createElement('div');
    seg.className = 'progress-seg';
    const fill = document.createElement('span');
    fill.className = 'progress-fill';
    seg.appendChild(fill);
    galleryProgress.appendChild(seg);
    return seg;
  });

  // Bangun thumbnail strip dari gambar & judul tiap kartu
  const thumbs = cards.map((card, i) => {
    const media = card.querySelector('.gallery-card-media');
    const titleEl = card.querySelector('.s-title');
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'gallery-thumb';
    thumb.style.backgroundImage = media ? media.style.backgroundImage : '';
    thumb.setAttribute('role', 'tab');
    thumb.setAttribute('data-label', String(i + 1).padStart(2, '0'));
    thumb.setAttribute('aria-label', titleEl ? `Lihat proyek ${titleEl.textContent}` : `Proyek ${i + 1}`);
    galleryThumbs.appendChild(thumb);
    return thumb;
  });

  // Memaksa animasi CSS progress bar untuk restart dari 0%
  const restartSegmentFill = (seg) => {
    const fill = seg.querySelector('.progress-fill');
    fill.style.animation = 'none';
    void fill.offsetWidth; // force reflow
    fill.style.animation = '';
    seg.classList.add('is-current');
  };

  const render = () => {
    galleryTrack.style.transform = `translateX(-${current * (100 / total)}%)`;

    cards.forEach((card, i) => card.classList.toggle('is-active', i === current));
    thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === current));

    segments.forEach((seg, i) => {
      seg.classList.remove('is-filled', 'is-current');
      if (i < current) seg.classList.add('is-filled');
    });
    restartSegmentFill(segments[current]);

    if (galleryCounter) {
      galleryCounter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }
  };

  const goTo = (index) => {
    current = ((index % total) + total) % total;
    render();
  };

  const restartAutoplay = () => {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
    }

    autoplayTimer = window.setInterval(() => {
      goTo(current + 1);
    }, autoplayDelay);
  };

  const pauseAutoplay = () => {
    gallery.classList.add('is-paused');
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  galleryNext.addEventListener('click', () => {
    goTo(current + 1);
    restartAutoplay();
  });
  galleryPrev.addEventListener('click', () => {
    goTo(current - 1);
    restartAutoplay();
  });

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => goTo(i));
  });

  // Autoplay berjalan terus setiap beberapa detik, tanpa tergantung hover.
  restartAutoplay();

  gallery.addEventListener('mouseenter', () => {
    gallery.classList.add('is-hovered');
  });

  gallery.addEventListener('mouseleave', () => {
    gallery.classList.remove('is-hovered');
  });

  gallery.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      goTo(current + 1);
      restartAutoplay();
    } else if (e.key === 'ArrowLeft') {
      goTo(current - 1);
      restartAutoplay();
    }
  });

  // Drag / swipe via Pointer Events (mencakup mouse & sentuhan sekaligus)
  galleryStage.addEventListener('pointerdown', (e) => {
    pointerDown = true;
    pointerStartX = e.clientX;
    pauseAutoplay();
    galleryStage.setPointerCapture(e.pointerId);
  });

  galleryStage.addEventListener('pointerup', (e) => {
    if (!pointerDown) return;
    pointerDown = false;

    const deltaX = e.clientX - pointerStartX;
    const swipeThreshold = 50;

    if (deltaX < -swipeThreshold) goTo(current + 1);
    else if (deltaX > swipeThreshold) goTo(current - 1);

    restartAutoplay();
  });

  galleryStage.addEventListener('pointercancel', () => {
    pointerDown = false;
    restartAutoplay();
  });

  render();
}

/* ── SCROLL REVEAL (UPDATE) ──────────────────────────────────
   Memicu animasi elemen saat masuk ke viewport.
──────────────────────────────────────────────────────────── */
const revealElements = document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right, .reveal-scale'
);

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

/* ── SCROLL ANIMATIONS DESKTOP ──────────────────────────────
   Animasi parallax dan scroll untuk desktop dengan GSAP
──────────────────────────────────────────────────────────── */
if (isDesktop) {
  // Hero title parallax
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
        scrub: 1,
        markers: false
      }
    }
  );

  // About section fade-in & slide
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
        scrub: 1,
        markers: false
      }
    }
  );

  // About photo zoom effect
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

  // About title parallax scroll animation
 

  // About badge counter animation
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

  // Badge pulse/glow animation
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

  // Badge plus sign rotate animation
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

  // Badge scale pop animation
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

  // About stats counter animation
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

  // Work section stagger animation
  gsap.fromTo(
    '.gallery-card',
    { opacity: 0, scale: 0.9 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.1,
      scrollTrigger: {
        trigger: '#work',
        start: 'top 60%',
        toggleActions: 'play none none none'
      }
    }
  );

  // Services card hover animation
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

  // Testimonial fade-in
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

  // Contact section slide-up
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

/* ── SCROLL ANIMATIONS MOBILE ──────────────────────────────
   Animasi scroll yang lebih ringan untuk mobile/tablet
──────────────────────────────────────────────────────────── */
if (isMobile || isTablet) {
  // About photo scale on scroll (ringan)
  gsap.fromTo(
    '.about-photo-placeholder',
    { scale: 0.95 },
    {
      scale: 1,
      scrollTrigger: {
        trigger: '.about-photo-placeholder',
        start: 'top bottom',
        end: 'top 60%',
        scrub: 0.5,
        markers: false
      }
    }
  );

  // About title parallax mobile (lebih ringan)
  gsap.fromTo(
    '.about-title',
    { y: 0 },
    {
      y: -40,
      scrollTrigger: {
        trigger: '#about',
        start: 'top center',
        end: 'center center',
        scrub: 0.3,
        markers: false
      }
    }
  );

  // Badge counter animation mobile
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

  // Badge glow mobile (lebih ringan)
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

  // Badge scale pop mobile
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

  // Parallax yang ringan untuk hero
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

/* ── OPTIMASI TOUCH UNTUK iOS ───────────────────────────── */
if (isIOS) {
  document.body.addEventListener('touchmove', function(e) {
    // Prevent scroll bounce
    if (e.target.closest('input, textarea, select')) {
      return;
    }
  }, { passive: true });

  // Fix untuk iOS 100vh issue
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  window.addEventListener('resize', () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });
}

/* ── OPTIMASI ANDROID SCROLL ────────────────────────────── */
if (isAndroid) {
  // Reduce animation complexity untuk Android
  ScrollTrigger.defaults({ fastScrollEnd: true });
}

/* ── CONTACT FORM ────────────────────────────────────────────
   Mencegah default submit; menampilkan konfirmasi sementara;
   mereset form setelah 3 detik.
──────────────────────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.form-submit');

    // Tampilkan status berhasil
    submitBtn.textContent = 'Pesan Terkirim ✓';
    submitBtn.style.background = '#2a7a4b';
    submitBtn.style.color = '#fff';

    // Reset setelah 3 detik
    setTimeout(() => {
      submitBtn.textContent = 'Kirim Pesan →';
      submitBtn.style.background = '';
      submitBtn.style.color = '';
      contactForm.reset();
    }, 3000);
  });
}

/* ── PERFORMANCE OPTIMIZATION ──────────────────────────────
   Reduce frame rate pada mobile untuk hemat baterai
──────────────────────────────────────────────────────────── */
if (isMobile) {
  ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,orientationchange' });
}

/* ── MOBILE MENU LOGIC ─────────────────────────────────────────
   BUG FIX: sebelumnya blok ini hanya dijalankan jika isMobile
   (lebar layar <= 768px) bernilai true. Padahal tombol hamburger
   di CSS baru muncul sampai lebar 900px, jadi perangkat tablet
   (769px–900px) mendapat tombol menu yang terlihat tapi tidak
   berfungsi. Logika ini sekarang berjalan untuk semua ukuran
   layar — CSS-lah yang menentukan kapan tombolnya terlihat.
──────────────────────────────────────────────────────────── */
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');
const navItems = document.querySelectorAll('.nav-links a');

if (mobileMenuToggle && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove('active');
    mobileMenuToggle.querySelector('ion-icon').setAttribute('name', 'menu-outline');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    const isOpen = navLinks.classList.toggle('active');
    const icon = mobileMenuToggle.querySelector('ion-icon');
    icon.setAttribute('name', isOpen ? 'close-outline' : 'menu-outline');
    mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
  };

  mobileMenuToggle.addEventListener('click', toggleMenu);

  // Keyboard support (Enter / Space) karena tombolnya berupa <div>
  mobileMenuToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });

  // Tutup menu otomatis jika salah satu link diklik
  navItems.forEach((item) => {
    item.addEventListener('click', closeMenu);
  });

  // Tutup menu jika layar di-resize melewati breakpoint mobile
  const desktopMediaQuery = window.matchMedia('(min-width: 901px)');
  desktopMediaQuery.addEventListener('change', (e) => {
    if (e.matches) closeMenu();
  });

  // Tutup menu dengan tombol Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMenu();
    }
  });
}