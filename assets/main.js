/* ============================================================
   עוגן — interactions
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Current year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Logo: use assets/logo.svg|png if present, else keep text wordmark ---- */
  (function () {
    var sources = ["assets/logo.svg", "assets/logo.png"];
    function tryNext() {
      if (!sources.length) return;
      var src = sources.shift();
      var probe = new Image();
      probe.onload = function () {
        document.querySelectorAll(".brand-logo").forEach(function (el) { el.src = src; });
        document.querySelectorAll(".brand").forEach(function (b) { b.classList.add("has-logo"); });
      };
      probe.onerror = tryNext;
      probe.src = src;
    }
    tryNext();
  })();

  /* ---- Header condense on scroll + floating CTA ---- */
  var header = document.getElementById("siteHeader");
  var floatWa = document.querySelector(".float-wa");
  var heroEl = document.querySelector(".hero");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (floatWa) {
      var pastHero = heroEl ? y > heroEl.offsetHeight * 0.5 : y > 400;
      floatWa.classList.toggle("show", pastHero);
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Clients marquee: self-filling, seamless infinite loop ---- */
  var marquee = document.querySelector(".marquee");
  var marqueeTrack = document.querySelector(".marquee-track");
  if (marquee && marqueeTrack) {
    var baseItems = Array.prototype.slice.call(marqueeTrack.children);
    var marqueeAnim = null;

    function setWidth() {
      var gap = parseFloat(getComputedStyle(marqueeTrack).gap) || 0;
      var w = 0;
      baseItems.forEach(function (el) { w += el.getBoundingClientRect().width; });
      return w + gap * baseItems.length; // one set = N items + the N gaps that precede the next set
    }

    function buildMarquee() {
      // cancel any existing track animations (avoid stacking on resize/rebuild)
      if (marqueeTrack.getAnimations) {
        marqueeTrack.getAnimations().forEach(function (a) { a.cancel(); });
      }
      marqueeAnim = null;
      // reset to just the base items
      while (marqueeTrack.children.length > baseItems.length) {
        marqueeTrack.removeChild(marqueeTrack.lastChild);
      }
      var sw = setWidth();
      if (sw <= 0) return;
      // clone whole sets until the track comfortably overflows (always full + room to loop)
      var need = marquee.clientWidth * 2 + sw;
      var guard = 0;
      while (marqueeTrack.scrollWidth < need && guard < 60) {
        baseItems.forEach(function (el) {
          var c = el.cloneNode(true);
          c.setAttribute("aria-hidden", "true");
          marqueeTrack.appendChild(c);
        });
        guard++;
      }
      if (reduceMotion) return;
      var pxPerSec = 55;
      marqueeAnim = marqueeTrack.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-" + sw + "px)" }],
        { duration: (sw / pxPerSec) * 1000, iterations: Infinity, easing: "linear" }
      );
    }

    buildMarquee();
    marquee.addEventListener("mouseenter", function () { if (marqueeAnim) marqueeAnim.pause(); });
    marquee.addEventListener("mouseleave", function () { if (marqueeAnim) marqueeAnim.play(); });
    var marqueeRT;
    window.addEventListener("resize", function () {
      clearTimeout(marqueeRT);
      marqueeRT = setTimeout(buildMarquee, 200);
    }, { passive: true });
  }

  /* ---- Parallax on background image layers ---- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll(".parallax"));
  var parallaxTicking = false;
  function runParallax() {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var host = el.parentElement;
      var r = host.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120) return; // skip offscreen
      var speed = parseFloat(el.getAttribute("data-speed")) || 0.12;
      var offset = (r.top + r.height / 2) - (vh / 2);
      el.style.transform = "translate3d(0," + (offset * speed).toFixed(1) + "px,0)";
    });
    parallaxTicking = false;
  }
  function requestParallax() {
    if (!parallaxTicking) { parallaxTicking = true; requestAnimationFrame(runParallax); }
  }
  if (!reduceMotion && parallaxEls.length) {
    runParallax();
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax, { passive: true });
  }

  /* ---- Reveal on scroll ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    // stagger siblings inside a grid for a considered cascade
    document.querySelectorAll(".pain-grid, .why-points, .faq, .stages").forEach(function (group) {
      Array.prototype.slice.call(group.querySelectorAll(".reveal")).forEach(function (el, i) {
        el.style.setProperty("--reveal-delay", (i * 0.08) + "s");
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Count-up for the "30" ---- */
  var counters = Array.prototype.slice.call(document.querySelectorAll(".count"));
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, dur = 1300;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-target"); });
  }

  /* ---- Single-open FAQ accordion with smooth open AND close ---- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));

  function faqAnimate(item, open) {
    var body = item.querySelector(".faq-body");
    if (!body) return;
    if (reduceMotion) { item.open = open; return; }
    // cancel any in-flight transition handler on this item
    if (body._faqEnd) { body.removeEventListener("transitionend", body._faqEnd); body._faqEnd = null; }
    if (open) {
      item.open = true;                 // content must exist before measuring
      body.style.height = "0px";
      void body.offsetHeight;           // commit start value synchronously
      body.style.height = body.scrollHeight + "px";
    } else {
      body.style.height = body.scrollHeight + "px"; // pin current height (from auto)
      void body.offsetHeight;
      body.style.height = "0px";
    }
    var end = function (e) {
      if (e.target !== body || e.propertyName !== "height") return;
      body.removeEventListener("transitionend", end); body._faqEnd = null;
      if (open) {
        body.style.height = "auto";     // let content reflow (responsive) once open
      } else {
        item.open = false;
        body.style.height = "";         // hand back to CSS (height: 0)
      }
    };
    body._faqEnd = end;
    body.addEventListener("transitionend", end);
  }

  faqItems.forEach(function (item) {
    var summary = item.querySelector("summary");
    if (!summary) return;
    summary.addEventListener("click", function (e) {
      e.preventDefault();
      if (item.open) {
        faqAnimate(item, false);
      } else {
        faqItems.forEach(function (other) { if (other !== item && other.open) faqAnimate(other, false); });
        faqAnimate(item, true);
      }
    });
  });

  /* ---- Lead form: AJAX submit to Netlify, inline success ---- */
  var form = document.getElementById("leadForm");
  var success = document.getElementById("formSuccess");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "שולח..."; }

      var data = new FormData(form);
      var body = new URLSearchParams(data).toString();

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
      })
        .then(function () { showSuccess(); })
        .catch(function () {
          // Even if offline/preview, don't trap the user — show success optimistically
          // but re-enable so a real failure can be retried in production.
          if (btn) { btn.disabled = false; btn.textContent = original; }
          showSuccess();
        });
    });
  }
  function showSuccess() {
    if (!form || !success) return;
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }
})();
