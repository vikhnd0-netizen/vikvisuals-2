/* ============================================================
   VikVisuals — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  // ── Nav element ──────────────────────────────────────────
  const nav = document.querySelector('.nav');

  // ── Transparent Nav — homepage only ─────────────────────
  const isHomepage = document.body.classList.contains('page-home');
  if (isHomepage && nav) {
    nav.classList.add('nav--transparent');
    window.addEventListener('scroll', function () {
      if (window.scrollY > window.innerHeight * 0.8) {
        nav.classList.remove('nav--transparent');
        nav.classList.add('scrolled');
      } else {
        nav.classList.add('nav--transparent');
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  } else if (nav) {
    // Non-homepage: apply shadow after scroll
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
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

  // ── Intersection Observer — Fade-in + Slide-in + Process nums ──
  const animEls = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .process__step');

  if (animEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    animEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animEls.forEach(function (el) {
      el.classList.add('visible');
    });
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

  // ── Work Carousel — drag to scroll ──────────────────────
  const carousel = document.getElementById('workCarousel');
  if (carousel) {
    let isDragging = false, startX, scrollLeft;

    carousel.addEventListener('mousedown', function (e) {
      isDragging = true;
      carousel.classList.add('dragging');
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    });

    document.addEventListener('mouseup', function () {
      isDragging = false;
      carousel.classList.remove('dragging');
    });

    carousel.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
    });
  }

}());
