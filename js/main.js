/* ============================================================
   VikVisuals — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  // ── Page fade overlay — created immediately so it covers page on load ──
  var fadeOverlay = document.createElement('div');
  fadeOverlay.id = 'page-fade-overlay';
  document.body.appendChild(fadeOverlay);

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

      // Touch: only add custom handlers on non-touch devices (pointer-based).
      // On real touch/mobile, native CSS overflow scroll handles it cleanly.
      if (!('ontouchstart' in window) && navigator.maxTouchPoints === 0) {
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
    }

    // ── 6. IntersectionObserver — fade & slide animations ────
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var staggerDelay = 0;

            // Stagger process cards within their grid
            if (el.classList.contains('process-h__card')) {
              var siblings = el.parentElement
                ? Array.from(el.parentElement.children)
                : [];
              var idx = siblings.indexOf(el);
              if (idx > 0) {
                staggerDelay = idx * 0.12;
              }
            }

            if (staggerDelay > 0) {
              el.style.transitionDelay = staggerDelay + 's';
            }
            el.classList.add('visible');

            // Reset transition-delay after entrance so hover interactions aren't delayed
            setTimeout(function () {
              el.style.transitionDelay = '';
            }, Math.round((staggerDelay + 0.75) * 1000));

            io.unobserve(el);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll(
        '.fade-in, .slide-in-left, .slide-in-right, .process-h__card'
      ).forEach(function (el) {
        // Service cards are handled separately for consistent group stagger
        if (!el.classList.contains('service-card')) {
          io.observe(el);
        }
      });

      // Service cards: observe all as a group so they stagger together
      // regardless of which card first enters the viewport
      var serviceCards = Array.from(document.querySelectorAll('.services__grid .service-card'));
      if (serviceCards.length > 0) {
        var serviceCardsAnimated = false;
        var serviceCardObserver = new IntersectionObserver(function (entries) {
          if (serviceCardsAnimated) { return; }
          var anyVisible = entries.some(function (e) { return e.isIntersecting; });
          if (anyVisible) {
            serviceCardsAnimated = true;
            serviceCards.forEach(function (card, idx) {
              card.style.transitionDelay = (idx * 0.12) + 's';
              card.classList.add('visible');
              setTimeout(function () {
                card.style.transitionDelay = '';
              }, Math.round((idx * 0.12 + 0.75) * 1000));
              serviceCardObserver.unobserve(card);
            });
          }
        }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

        serviceCards.forEach(function (card) {
          serviceCardObserver.observe(card);
        });
      }

    } else {
      // Fallback: show all immediately
      document.querySelectorAll(
        '.fade-in, .slide-in-left, .slide-in-right, .process-h__card'
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
        staggerReveal(galleryItems, 80);
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
          staggerReveal(galleryItems, 60);
        });
      });

    }

    // ── 9. Hero & Scroll Animations ─────────────────────────────

    // Animation timing constants
    var WORD_STAGGER_MS       = 100; // ms between each word in a heading
    var WORD_TRANSITION_MS    = 600; // word fade-up transition duration (must match CSS .word-animate)
    var HERO_START_DELAY_MS   = 50;  // ms before first hero animation begins
    var HERO_PHASE_GAP_MS     = 100; // ms gap between hero animation phases
    var HERO_SUB_DURATION_MS  = 900; // sub/location transition + buffer before CTA phase
    var LOGO_FADE_DURATION_MS = 700; // homepage logo fade-in duration (must match CSS .hero__title)
    var TEXT_SUB_OVERLAP_MS   = 200; // ms after last word starts before subheading begins
    var REVEAL_DURATION_MS    = 1150; // img-reveal transition (1.1s) + buffer (ms)

    // Check if element is inside zones we never animate
    function insideExcluded(el) {
      return !!(el.closest('.hero') || el.closest('#main-nav') ||
                el.closest('.nav__mobile') || el.closest('.footer'));
    }

    // Check if element has a .fade-in ancestor
    function hasFadeInAncestor(el) {
      var parent = el.parentElement;
      while (parent) {
        if (parent.classList && parent.classList.contains('fade-in')) {
          return true;
        }
        parent = parent.parentElement;
      }
      return false;
    }

    // Split an element's text into individual word spans
    function splitIntoWords(el) {
      // Clone and replace <br> with spaces before extracting text
      var clone = el.cloneNode(true);
      clone.querySelectorAll('br').forEach(function (br) {
        br.parentNode.replaceChild(document.createTextNode(' '), br);
      });
      var text = clone.textContent.trim();
      if (!text) { return 0; }
      var words = text.split(/\s+/).filter(function (w) { return w.length > 0; });
      el.innerHTML = '';
      words.forEach(function (word, i) {
        var span = document.createElement('span');
        span.className = 'word-animate';
        span.textContent = word;
        span.style.setProperty('--word-delay', (i * WORD_STAGGER_MS / 1000) + 's');
        el.appendChild(span);
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });
      return words.length;
    }

    // Add .word-visible to all word spans inside an element
    function triggerWordAnimation(el) {
      el.querySelectorAll('.word-animate').forEach(function (span) {
        span.classList.add('word-visible');
      });
    }

    // ── Hero load animation ──────────────────────────────────────
    var heroSection = document.querySelector('.hero');
    if (heroSection) {
      var heroTitle    = heroSection.querySelector('.hero__title');
      var heroSub      = heroSection.querySelector('.hero__sub');
      var heroLocation = heroSection.querySelector('.hero__location');
      var heroCta      = heroSection.querySelector('.hero__cta-group');

      var h1EndMs; // when h1 phase is done (ms from page load)

      if (heroTitle) {
        var titleText = heroTitle.textContent.trim();
        if (titleText.length > 0) {
          // Text-based h1: split into words, animate word-by-word
          var wordCount = splitIntoWords(heroTitle);
          // Make wrapper transparent so only word spans animate
          heroTitle.style.opacity = '1';
          heroTitle.style.transform = 'none';
          heroTitle.style.transition = 'none';
          setTimeout(function () { triggerWordAnimation(heroTitle); }, HERO_START_DELAY_MS);
          // last word starts at (wordCount-1)*WORD_STAGGER_MS, finishes after WORD_TRANSITION_MS
          h1EndMs = HERO_START_DELAY_MS + (wordCount - 1) * WORD_STAGGER_MS + WORD_TRANSITION_MS + 50;
        } else {
          // Image-based h1 (e.g. logo on homepage): fade in as whole element
          setTimeout(function () {
            heroTitle.classList.add('hero-el-visible');
          }, HERO_START_DELAY_MS);
          // 700ms matches the CSS transition on .hero__title
          h1EndMs = HERO_START_DELAY_MS + LOGO_FADE_DURATION_MS;
        }
      } else {
        h1EndMs = 0;
      }

      // Phase 2: tagline (heroSub) timing
      // For image-based h1 (logo): start slightly after logo for a subtle stagger
      // For text-based h1: start sub 200ms into the last word's transition (feels connected)
      var heroSubDelay;
      if (heroTitle && heroTitle.textContent.trim().length === 0) {
        // Image-based (logo): stagger tagline 350ms after logo starts for emphasis
        heroSubDelay = HERO_START_DELAY_MS + 350;
      } else if (heroTitle) {
        // Text-based: start TEXT_SUB_OVERLAP_MS after the last word begins animating
        var _wc = heroTitle.querySelectorAll('.word-animate').length || 1;
        heroSubDelay = HERO_START_DELAY_MS + (_wc - 1) * WORD_STAGGER_MS + TEXT_SUB_OVERLAP_MS;
      } else {
        heroSubDelay = h1EndMs + HERO_PHASE_GAP_MS;
      }
      setTimeout(function () {
        if (heroSub) { heroSub.classList.add('hero-el-visible'); }
      }, heroSubDelay);

      // Phase 3: description (heroLocation) fades in after tagline
      var heroLocationDelay = heroSubDelay + HERO_SUB_DURATION_MS;
      if (heroLocation) {
        setTimeout(function () {
          heroLocation.classList.add('hero-el-visible');
        }, heroLocationDelay);
      }

      // Phase 4: CTA buttons fade in after description (or after sub if no location)
      var ctaDelay = (heroLocation ? heroLocationDelay : heroSubDelay) + HERO_SUB_DURATION_MS;
      setTimeout(function () {
        if (heroCta) { heroCta.classList.add('hero-el-visible'); }
      }, ctaDelay);
    }

    // ── Scroll: word animation for h2/h3 outside hero ───────────
    if ('IntersectionObserver' in window) {
      var headingsToAnimate = [];

      document.querySelectorAll('h2, h3').forEach(function (heading) {
        if (insideExcluded(heading)) { return; }
        splitIntoWords(heading);
        headingsToAnimate.push(heading);
      });

      if (headingsToAnimate.length > 0) {
        var headingObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var heading = entry.target;
              // Small delay if inside a .fade-in container so parent starts first
              var delay = hasFadeInAncestor(heading) ? 150 : 0;
              if (delay > 0) {
                setTimeout(function () { triggerWordAnimation(heading); }, delay);
              } else {
                triggerWordAnimation(heading);
              }
              headingObserver.unobserve(heading);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        headingsToAnimate.forEach(function (heading) {
          headingObserver.observe(heading);
        });
      }

      // ── Scroll: element fade for p/.btn outside hero ──────────
      var elementsToAnimate = [];

      document.querySelectorAll('p, .btn').forEach(function (el) {
        if (insideExcluded(el)) { return; }
        if (el.classList.contains('fade-in')) { return; }
        if (hasFadeInAncestor(el)) { return; } // parent's .fade-in handles it
        el.classList.add('element-animate');
        elementsToAnimate.push(el);
      });

      if (elementsToAnimate.length > 0) {
        var elementObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('element-visible');
              elementObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        elementsToAnimate.forEach(function (el) {
          elementObserver.observe(el);
        });
      }

    } else {
      // Fallback: no IntersectionObserver — show everything immediately
      document.querySelectorAll('h2, h3').forEach(function (heading) {
        if (!insideExcluded(heading)) {
          splitIntoWords(heading);
          triggerWordAnimation(heading);
        }
      });
    }

    // ── 11. Image reveal — rising mask on scroll ─────────────────
    var revealSelectors = [
      '.feature-row__image',
      '.intro-photo__image',
      '.about-portrait',
      '.services-list__image-wrap',
      '.video-examples__embed',
      '.work-carousel-section',
      '.contact-portrait-wrap'
    ];
    var revealContainers = document.querySelectorAll(revealSelectors.join(', '));

    if (revealContainers.length > 0 && 'IntersectionObserver' in window) {
      revealContainers.forEach(function (container) {
        container.classList.add('img-reveal');
      });

      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            void el.offsetHeight; // force reflow so starting state is committed
            el.classList.add('img-reveal-go');
            setTimeout(function () {
              el.classList.remove('img-reveal', 'img-reveal-go');
              el.classList.add('img-revealed');
            }, REVEAL_DURATION_MS);
            revealObserver.unobserve(el);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

      revealContainers.forEach(function (container) {
        revealObserver.observe(container);
      });
    }

    // ── 11c. Clients section reveal — charity & professional pages only ──
    var currentPath = window.location.pathname;
    if ((/\/charity(\.html)?$/.test(currentPath) || /\/professional(\.html)?$/.test(currentPath)) &&
        'IntersectionObserver' in window) {
      var clientsEl = document.querySelector('.clients');
      if (clientsEl) {
        // Remove existing fade-in so we don't double-animate
        clientsEl.classList.remove('fade-in');
        clientsEl.classList.add('clients-reveal');
        var clientsObserver = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            clientsEl.classList.add('clients-reveal-go');
            clientsObserver.unobserve(clientsEl);
          }
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        clientsObserver.observe(clientsEl);
      }
    }

    // ── 12. Page fade transitions ────────────────────────────────
    // Fade in once page is ready
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        fadeOverlay.classList.add('page-loaded');
      });
    });

    // Fade out on internal link click
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      // Skip: external links, anchors, mailto, tel, target="_blank"
      if (!href || href.charAt(0) === '#' || link.hostname !== window.location.hostname ||
          link.target === '_blank' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) {
        return;
      }
      link.addEventListener('click', function (e) {
        var dest = link.href;
        e.preventDefault();
        fadeOverlay.classList.remove('page-loaded');
        fadeOverlay.classList.add('page-leaving');
        setTimeout(function () {
          window.location.href = dest;
        }, 400);
      });
    });

  });

}());
