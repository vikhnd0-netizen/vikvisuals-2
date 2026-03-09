/* ============================================================
   VikVisuals — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  // ── Nav: hide/show on scroll for hero pages ──────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    const isHeroNav = nav.classList.contains('nav--hero');

    function updateNav() {
      const threshold = window.innerHeight * 0.85;
      if (isHeroNav) {
        if (window.scrollY > threshold) {
          nav.classList.add('nav--scrolled');
        } else {
          nav.classList.remove('nav--scrolled');
        }
      } else {
        // On all other pages: just add/remove shadow
        if (window.scrollY > 20) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav(); // run on load
  }

  // ── Services Dropdown (desktop hover + click) ────────────
  const dropdown = document.querySelector('.nav__dropdown');
  if (dropdown) {
    const toggle = dropdown.querySelector('.nav__dropdown-toggle');

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', function () {
      dropdown.classList.remove('open');
    });

    const menu = dropdown.querySelector('.nav__dropdown-menu');
    if (menu) {
      menu.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
  }

  // ── Mobile Hamburger Menu ────────────────────────────────
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileNav = document.querySelector('.nav__mobile');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });

    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  // ── Intersection Observer — Fade-in on Scroll ────────────
  const fadeEls = document.querySelectorAll('.fade-in');
  const processCards = document.querySelectorAll('.process__card');
  const allAnimEls = [...fadeEls, ...processCards];

  if (allAnimEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    allAnimEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    allAnimEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ── Hero Slideshow + Dot Indicators ─────────────────────
  const heroSlides = document.querySelectorAll('.hero__slide');
  const heroDots = document.querySelectorAll('.hero__dot');

  if (heroSlides.length > 0) {
    let currentSlide = 0;
    let slideshowTimer = null;

    function goToSlide(index) {
      heroSlides[currentSlide].classList.remove('active');
      if (heroDots.length > 0) heroDots[currentSlide].classList.remove('active');
      currentSlide = (index + heroSlides.length) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
      if (heroDots.length > 0) heroDots[currentSlide].classList.add('active');
    }

    function startSlideshow() {
      slideshowTimer = setInterval(function () {
        goToSlide(currentSlide + 1);
      }, 5000);
    }

    // Dot click handlers
    heroDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = parseInt(dot.getAttribute('data-slide'), 10);
        clearInterval(slideshowTimer);
        goToSlide(index);
        startSlideshow();
      });
    });

    startSlideshow();
  }

  // ── Work Carousel (drag + prev/next) ────────────────────
  const carousel = document.getElementById('work-carousel');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (carousel) {
    // Prev / Next buttons
    function getCardWidth() {
      const card = carousel.querySelector('.work-card');
      if (!card) return 300;
      const gap = parseFloat(getComputedStyle(carousel).gap) || 24;
      return card.offsetWidth + gap;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        carousel.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        carousel.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
      });
    }

    // Mouse drag to scroll
    let isDragging = false;
    let dragStartX = 0;
    let dragScrollLeft = 0;

    carousel.addEventListener('mousedown', function (e) {
      isDragging = true;
      dragStartX = e.pageX - carousel.offsetLeft;
      dragScrollLeft = carousel.scrollLeft;
      carousel.style.userSelect = 'none';
    });

    carousel.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - dragStartX) * 1.5;
      carousel.scrollLeft = dragScrollLeft - walk;
    });

    function stopDrag() {
      isDragging = false;
      carousel.style.userSelect = '';
    }

    carousel.addEventListener('mouseup', stopDrag);
    carousel.addEventListener('mouseleave', stopDrag);

    // Touch swipe support
    let touchStartX = 0;
    let touchScrollLeft = 0;

    carousel.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = carousel.scrollLeft;
    }, { passive: true });

    carousel.addEventListener('touchmove', function (e) {
      const walk = touchStartX - e.touches[0].pageX;
      carousel.scrollLeft = touchScrollLeft + walk;
    }, { passive: true });
  }

  // ── Smooth Lerp Scroll ───────────────────────────────────
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  if (!prefersReduced && !isTouch) {
    document.documentElement.style.scrollBehavior = 'auto';

    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let rafId = null;
    let isScrolling = false;

    window.addEventListener('wheel', function (e) {
      e.preventDefault();
      targetScrollY += e.deltaY;
      // Clamp to page bounds
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      targetScrollY = Math.max(0, Math.min(targetScrollY, maxScroll));

      if (!isScrolling) {
        isScrolling = true;
        rafLoop();
      }
    }, { passive: false });

    function rafLoop() {
      currentScrollY += (targetScrollY - currentScrollY) * 0.09;
      window.scrollTo(0, currentScrollY);

      if (Math.abs(targetScrollY - currentScrollY) > 0.5) {
        rafId = requestAnimationFrame(rafLoop);
      } else {
        currentScrollY = targetScrollY;
        window.scrollTo(0, currentScrollY);
        isScrolling = false;
      }
    }
  }

  // ── Gallery Filter (work.html) ───────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length > 0 && galleryItems.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const filter = btn.getAttribute('data-filter');

        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        galleryItems.forEach(function (item) {
          const category = item.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

}());
