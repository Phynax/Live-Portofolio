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

if (heroVideo && heroVideo.querySelector('source')) {
  videoFallback.style.display = 'none';
} else if (heroVideo) {
  heroVideo.style.display = 'none';
}

/* ── CAROUSEL ────────────────────────────────────────────────
   Menggeser item carousel dengan memanipulasi urutan DOM.
   Prev → prepend item terakhir ke depan.
   Next → append item pertama ke belakang.
──────────────────────────────────────────────────────────── */
const slider = document.getElementById('mainSlider');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

/**
 * Mengaktifkan arah carousel.
 * @param {'next' | 'prev'} direction
 */
function activateSlider(direction) {
  const items = slider.querySelectorAll('.slider-item');

  if (direction === 'next') {
    slider.append(items[0]);
  } else if (direction === 'prev') {
    slider.prepend(items[items.length - 1]);
  }
}

nextBtn.addEventListener('click', () => activateSlider('next'));
prevBtn.addEventListener('click', () => activateSlider('prev'));

/* Touch / swipe support ─────────────────────────────────── */
/* ── Touch / swipe support (UPDATED FOR MOBILE) ─────────── */
let touchStartX = 0;
let touchEndX = 0;

// Tambahkan passive: true untuk performa scroll yang lebih baik
slider.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

slider.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const swipeThreshold = 40; // Jarak minimal agar dianggap sebagai swipe
  const deltaX = touchEndX - touchStartX;

  if (deltaX < -swipeThreshold) {
    // Swipe ke Kiri -> Next
    activateSlider('next');
  } else if (deltaX > swipeThreshold) {
    // Swipe ke Kanan -> Prev
    activateSlider('prev');
  }
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
    '.slider-item',
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

  /* ── MOBILE MENU LOGIC ─────────────────────────────────────── */
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');
const navItems = document.querySelectorAll('.nav-links a');

if (mobileMenuToggle && navLinks) {
  mobileMenuToggle.addEventListener('click', () => {
    // Toggle class active
    navLinks.classList.toggle('active');
    
    // Ganti ikon menu menjadi close (silang) saat terbuka
    const icon = mobileMenuToggle.querySelector('ion-icon');
    if (navLinks.classList.contains('active')) {
      icon.setAttribute('name', 'close-outline');
    } else {
      icon.setAttribute('name', 'menu-outline');
    }
  });

  // Tutup menu otomatis jika salah satu link diklik
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileMenuToggle.querySelector('ion-icon').setAttribute('name', 'menu-outline');
    });
  });
}
}