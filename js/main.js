/* ============================================================
   VikVisuals — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    var nav = document.getElementById('main-nav');
    var isHomepage    = document.body.classList.contains('page-home');
    var isServicePage = document.body.classList.contains('page-service');

    // ── 1. Nav behaviour ────────────────────────────────────
    if (nav) {
      if (isHomepage || isServicePage) {
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
      var hoverTimer;

      dropdown.addEventListener('mouseenter', function () {
        clearTimeout(hoverTimer);
        dropdown.classList.add('open');
      });

      dropdown.addEventListener('mouseleave', function () {
        hoverTimer = setTimeout(function () {
          dropdown.classList.remove('open');
        }, 100);
      });

      // Keep click behaviour as a fallback for touch devices
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
        menu.addEventListener('mouseenter', function () {
          clearTimeout(hoverTimer);
        });
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

    // ── 7. Work carousel — momentum drag-scroll ─────────────
    var carousel = document.querySelector('.work-carousel');
    if (carousel) {
      var isDragging = false;
      var startX, scrollLeft;
      var velX = 0;
      var lastX = 0;
      var rafId;

      function momentumScroll() {
        if (Math.abs(velX) > 0.3) {
          carousel.scrollLeft -= velX;
          velX *= 0.96;
          rafId = requestAnimationFrame(momentumScroll);
        }
      }

      carousel.addEventListener('mousedown', function (e) {
        isDragging = true;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        lastX = e.pageX;
        velX = 0;
        cancelAnimationFrame(rafId);
        carousel.style.cursor = 'grabbing';
        carousel.style.userSelect = 'none';
      });

      carousel.addEventListener('mouseleave', function () {
        if (!isDragging) return;
        isDragging = false;
        carousel.style.cursor = 'grab';
        carousel.style.userSelect = '';
        requestAnimationFrame(momentumScroll);
      });

      carousel.addEventListener('mouseup', function () {
        isDragging = false;
        carousel.style.cursor = 'grab';
        carousel.style.userSelect = '';
        requestAnimationFrame(momentumScroll);
      });

      carousel.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        e.preventDefault();
        var x = e.pageX - carousel.offsetLeft;
        var walk = (x - startX) * 0.7;
        velX = e.pageX - lastX;
        lastX = e.pageX;
        carousel.scrollLeft = scrollLeft - walk;
      });

      // Touch support
      var touchStartX, touchScrollLeft, touchLastX;
      carousel.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].pageX;
        touchLastX = touchStartX;
        touchScrollLeft = carousel.scrollLeft;
        velX = 0;
        cancelAnimationFrame(rafId);
      }, { passive: true });

      carousel.addEventListener('touchmove', function (e) {
        var x = e.touches[0].pageX;
        velX = x - touchLastX;
        touchLastX = x;
        carousel.scrollLeft = touchScrollLeft - (x - touchStartX);
      }, { passive: true });

      carousel.addEventListener('touchend', function () {
        requestAnimationFrame(momentumScroll);
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

    // ── 8. Gallery filter + staggered reveal (work.html) ────
    var galleryInner   = document.querySelector('.gallery-masonry__inner');
    var filterBtns     = document.querySelectorAll('.filter-btn');
    var galleryItems   = document.querySelectorAll('.gallery-item');

    function staggerReveal(items, delayStep) {
      var visibleIndex = 0;
      items.forEach(function (item) {
        if (!item.classList.contains('hidden')) {
          item.classList.remove('gallery-item--visible');
          // Force reflow so animation restarts cleanly
          void item.offsetWidth;
          item.style.animationDelay = (visibleIndex * delayStep) + 'ms';
          item.classList.add('gallery-item--visible');
          visibleIndex++;
        }
      });
    }

    if (galleryInner) {
      var GAP = 12;

      function layoutMasonry() {
        var containerWidth = galleryInner.offsetWidth;
        var cols = containerWidth >= 900 ? 3 : containerWidth >= 540 ? 2 : 1;
        var colWidth = (containerWidth - GAP * (cols - 1)) / cols;
        var colHeights = [];
        var i;
        for (i = 0; i < cols; i++) { colHeights[i] = 0; }

        var visibleItems = Array.prototype.filter.call(galleryItems, function (item) {
          return !item.classList.contains('hidden');
        });

        visibleItems.forEach(function (item) {
          var img = item.querySelector('img');
          var naturalW = img ? img.naturalWidth  : 0;
          var naturalH = img ? img.naturalHeight : 0;
          var itemHeight = (naturalW > 0 && naturalH > 0)
            ? Math.round(colWidth * naturalH / naturalW)
            : Math.round(colWidth * 0.75);

          var shortestCol = 0;
          for (i = 1; i < cols; i++) {
            if (colHeights[i] < colHeights[shortestCol]) { shortestCol = i; }
          }

          item.style.position = 'absolute';
          item.style.width    = colWidth + 'px';
          item.style.left     = (shortestCol * (colWidth + GAP)) + 'px';
          item.style.top      = colHeights[shortestCol] + 'px';

          colHeights[shortestCol] += itemHeight + GAP;
        });

        var maxHeight = 0;
        for (i = 0; i < cols; i++) {
          if (colHeights[i] > maxHeight) { maxHeight = colHeights[i]; }
        }
        galleryInner.style.height = maxHeight + 'px';
      }

      // Switch lazy images to eager so dimensions are available immediately
      var galleryImgs = galleryInner.querySelectorAll('img');
      galleryImgs.forEach(function (img) {
        if (img.getAttribute('loading') === 'lazy') {
          img.setAttribute('loading', 'eager');
        }
      });

      // Wait for all images to load then run layout
      var imagePromises = Array.prototype.map.call(galleryImgs, function (img) {
        if (img.complete) { return Promise.resolve(); }
        return new Promise(function (resolve) {
          img.addEventListener('load',  resolve);
          img.addEventListener('error', resolve);
        });
      });

      Promise.all(imagePromises).then(function () {
        layoutMasonry();
        staggerReveal(galleryItems, 40);
      });

      // Debounced resize listener
      var resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layoutMasonry, 150);
      });
    }

    if (filterBtns.length > 0 && galleryItems.length > 0) {
      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var filter = btn.getAttribute('data-filter');

          filterBtns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');

          // Show/hide items
          galleryItems.forEach(function (item) {
            var category = item.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
              item.classList.remove('hidden');
            } else {
              item.classList.add('hidden');
              item.classList.remove('gallery-item--visible');
              item.style.animationDelay = '';
            }
          });

          if (galleryInner) { layoutMasonry(); }

          // Re-stagger the visible set at 30ms per item
          staggerReveal(galleryItems, 30);
        });
      });

    }

  });

}());
