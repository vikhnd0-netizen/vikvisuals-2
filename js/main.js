/* ============================================================
   VikVisuals — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  // ── Sticky Nav Shadow on Scroll ──────────────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
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

    // Click toggle for mobile-friendly interaction
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', function () {
      dropdown.classList.remove('open');
    });

    // Prevent close when clicking inside menu
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

    // Close mobile nav on link click
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

  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
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

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    fadeEls.forEach(function (el) {
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

        // Update active button
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        // Show/hide gallery items
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
