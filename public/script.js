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

/* ── NEW CAROUSEL LOGIC (STACKED) ───────────────────────────── */
const slider = document.querySelector('.slider');
const navButtons = document.querySelectorAll('.carousel-nav .btn');

if (slider && navButtons.length > 0) {
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Ambil daftar item terbaru setiap kali diklik
      const items = document.querySelectorAll('.slider .item');
      
      // Jika klik tombol next
      if (e.target.closest('.next')) {
        slider.append(items[0]); // Pindahkan item pertama ke urutan paling akhir
      } 
      // Jika klik tombol prev
      else if (e.target.closest('.prev')) {
        slider.prepend(items[items.length - 1]); // Pindahkan item terakhir ke paling awal
      }
    });
  });
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
  const badgeCounter = document.querySelector('.badge-counter');

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

  // Badge counter animation mobile
  if (badgeCounter) {
    gsap.fromTo(
      badgeCounter,
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
  }

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