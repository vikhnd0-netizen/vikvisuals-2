/* ============================================================
   VikVisuals — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    var nav = document.getElementById('main-nav');
    var isHomepage = document.body.classList.contains('page-home');

    // ── 1. Nav behaviour ────────────────────────────────────
    if (nav) {
      if (isHomepage) {
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
      } else {
        window.addEventListener('scroll', function () {
          nav.classList.toggle('scrolled', window.scrollY > 10);
        }, { passive: true });
      }
    }

    // ── 2. Services Dropdown ─────────────────────────────────
    var dropdown = document.querySelector('.nav__dropdown');
    if (dropdown) {
      var toggle = dropdown.querySelector('.nav__dropdown-toggle');

      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });

      document.addEventListener('click', function () {
        dropdown.classList.remove('open');
      });

      var menu = dropdown.querySelector('.nav__dropdown-menu');
      if (menu) {
        menu.addEventListener('click', function (e) {
          e.stopPropagation();
        });
      }
    }

    // ── 3. Mobile Hamburger Menu ─────────────────────────────
    var hamburger = document.querySelector('.nav__hamburger');
    var mobileNav = document.querySelector('.nav__mobile');

    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('open');
        mobileNav.classList.toggle('open');
      });

      var mobileLinks = mobileNav.querySelectorAll('a');
      mobileLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          hamburger.classList.remove('open');
          mobileNav.classList.remove('open');
        });
      });
    }

    // ── 4. Hero Slideshow ────────────────────────────────────
    var slides = document.querySelectorAll('.hero__slide');
    var dots = document.querySelectorAll('.hero__dot');

    if (slides.length) {
      var current = 0;
      var slideshowTimer;

      function goTo(n) {
        slides[current].classList.remove('active');
        if (dots[current]) dots[current].classList.remove('active');
        current = (n + slides.length) % slides.length;
        slides[current].classList.add('active');
        if (dots[current]) dots[current].classList.add('active');
      }

      function startTimer() {
        slideshowTimer = setInterval(function () {
          goTo(current + 1);
        }, 5000);
      }

      goTo(0);
      startTimer();

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          clearInterval(slideshowTimer);
          goTo(i);
          startTimer();
        });
      });
    }

    // ── 6. IntersectionObserver — fade & slide animations ────
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      document.querySelectorAll(
        '.fade-in, .slide-in-left, .slide-in-right, .process__card'
      ).forEach(function (el) {
        io.observe(el);
      });
    } else {
      // Fallback: show all immediately
      document.querySelectorAll(
        '.fade-in, .slide-in-left, .slide-in-right, .process__card'
      ).forEach(function (el) {
        el.classList.add('visible');
      });
    }

    // ── 8. Gallery filter (work.html) ───────────────────────
    var filterBtns = document.querySelectorAll('.filter-btn');
    var galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length > 0 && galleryItems.length > 0) {
      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var filter = btn.getAttribute('data-filter');

          filterBtns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');

          galleryItems.forEach(function (item) {
            var category = item.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
              item.classList.remove('hidden');
            } else {
              item.classList.add('hidden');
            }
          });
        });
      });
    }

  });

}());
