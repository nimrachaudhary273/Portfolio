// Portfolio interaction layer.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  /* ---- Scroll-reveal: fade a block up once, the first time it enters view ---- */
  var revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length) {
    if (!('IntersectionObserver' in window) || reduceMotion) {
      revealItems.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealItems.forEach(function (el) { revealObs.observe(el); });
    }
  }

  /* ---- Word-by-word rise-in for section headings ---- */
  var titles = document.querySelectorAll('h2.section-title');
  titles.forEach(function (title) {
    var words = title.textContent.trim().split(/\s+/);
    title.innerHTML = words.map(function (w, i) {
      return '<span class="word" style="transition-delay:' + (reduceMotion ? 0 : i * 0.05) + 's">' + w + '&nbsp;</span>';
    }).join('');
  });
  if (titles.length) {
    if (!('IntersectionObserver' in window) || reduceMotion) {
      titles.forEach(function (t) { t.classList.add('in-view'); });
    } else {
      var titleObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            titleObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      titles.forEach(function (t) { titleObs.observe(t); });
    }
  }

  if (reduceMotion) return; // everything below is purely decorative motion

  /* ---- Top scroll-progress bar ---- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  function updateProgress() {
    var h = document.documentElement;
    var height = h.scrollHeight - h.clientHeight;
    bar.style.width = (height > 0 ? (h.scrollTop / height) * 100 : 0) + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---- Mouse-tracking spotlight in the hero ---- */
  var hero = document.querySelector('.hero');
  if (hero && !coarsePointer) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  }

  /* ---- Cursor-follow ambient glow (desktop only) ---- */
  if (!coarsePointer) {
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2, cx = gx, cy = gy;
    document.addEventListener('mousemove', function (e) { gx = e.clientX; gy = e.clientY; });
    (function loop() {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---- Subtle 3D tilt on cards ---- */
  if (!coarsePointer) {
    document.querySelectorAll('.project-card, .testi-card, .edu-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateX(' + (py * -6) + 'deg) rotateY(' + (px * 8) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  /* ---- Magnetic buttons ---- */
  if (!coarsePointer) {
    document.querySelectorAll('.btn-solid, .btn-gold').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = (e.clientX - r.left - r.width / 2) * 0.3;
        var my = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---- Typewriter: cycles role titles ---- */
  var roleEl = document.querySelector('.role-text');
  if (roleEl) {
    var roles = ['Frontend Developer', 'Figma \u2192 Code', 'Pixel-Perfect Builder', 'Bug Hunter'];
    var ri = 0, ci = 0, deleting = false;
    (function tick() {
      var word = roles[ri];
      if (!deleting) {
        ci++;
        roleEl.textContent = word.slice(0, ci);
        if (ci === word.length) { deleting = true; setTimeout(tick, 1400); return; }
      } else {
        ci--;
        roleEl.textContent = word.slice(0, ci);
        if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
      }
      setTimeout(tick, deleting ? 40 : 80);
    })();
  }

  /* ---- Figma-to-Code drag compare slider (signature element) ---- */
  var compare = document.getElementById('compare');
  if (compare) {
    var dragging = false;
    function setSplit(clientX) {
      var r = compare.getBoundingClientRect();
      var pct = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
      compare.style.setProperty('--split', pct + '%');
    }
    compare.addEventListener('pointerdown', function (e) {
      dragging = true;
      compare.setPointerCapture(e.pointerId);
      setSplit(e.clientX);
    });
    compare.addEventListener('pointermove', function (e) { if (dragging) setSplit(e.clientX); });
    compare.addEventListener('pointerup', function () { dragging = false; });
    compare.addEventListener('pointerleave', function () { dragging = false; });
  }

  /* ---- Duplicate marquee content once so the CSS loop is seamless ---- */
  document.querySelectorAll('.marquee-track').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });
})();

/* ---- Projects carousel (arrows + dots) ---- */
(function () {
  var track = document.getElementById('projTrack');
  if (!track) return;

  var cards = Array.prototype.slice.call(track.children);
  var prevBtn = document.getElementById('projPrev');
  var nextBtn = document.getElementById('projNext');
  var dotsWrap = document.getElementById('projDots');
  var index = 0;

  function visibleCount() {
    var w = window.innerWidth;
    if (w <= 640) return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - visibleCount());
  }

  function update() {
    var gap = 24;
    var cardWidth = cards[0].getBoundingClientRect().width;
    track.style.transform = 'translateX(-' + index * (cardWidth + gap) + 'px)';
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= maxIndex();
    var dots = dotsWrap.querySelectorAll('button');
    dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    var count = maxIndex() + 1;
    for (var i = 0; i < count; i++) {
      (function (i) {
        var b = document.createElement('button');
        b.setAttribute('aria-label', 'Go to project ' + (i + 1));
        b.addEventListener('click', function () { index = i; update(); });
        dotsWrap.appendChild(b);
      })(i);
    }
  }

  prevBtn.addEventListener('click', function () {
    index = Math.max(0, index - 1);
    update();
  });
  nextBtn.addEventListener('click', function () {
    index = Math.min(maxIndex(), index + 1);
    update();
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      index = Math.min(index, maxIndex());
      buildDots();
      update();
    }, 150);
  });

  /* basic swipe support on touch devices */
  var startX = null;
  track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var diff = e.changedTouches[0].clientX - startX;
    if (diff > 40) { index = Math.max(0, index - 1); update(); }
    else if (diff < -40) { index = Math.min(maxIndex(), index + 1); update(); }
    startX = null;
  });

  buildDots();
  update();
})();
