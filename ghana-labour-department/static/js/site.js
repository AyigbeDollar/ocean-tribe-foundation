// Site-wide behaviour: theme, mobile menu, header state, reveal-on-scroll,
// 3D tilt cards, lazy 3D hero, and outbound GLMIS click tracking.
(function () {
  "use strict";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme: respect system preference, allow manual override.
  try {
    var saved = localStorage.getItem("ld-theme");
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (e) {}
  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  if (!root.getAttribute("data-theme")) root.setAttribute("data-theme", currentTheme());
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("ld-theme", next); } catch (e) {}
    });
  });

  // Mobile menu
  var menuBtn = document.querySelector("[data-menu-toggle]");
  var navList = document.getElementById("nav-list");
  if (menuBtn && navList) {
    menuBtn.addEventListener("click", function () {
      var open = navList.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navList.classList.contains("is-open")) { navList.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); }
    });
  }

  // Header border once page scrolls (IntersectionObserver on a sentinel, no scroll listener).
  var header = document.querySelector("[data-header]");
  if (header && "IntersectionObserver" in window) {
    var sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:0;height:8px;width:1px;pointer-events:none";
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  // Reveal on scroll
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // 3D tilt on cards (pointer devices only). Communicates "this is interactive".
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var max = Number(el.getAttribute("data-tilt")) || 6;
      var raf = 0;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = "perspective(900px) rotateX(" + (-y * max).toFixed(2) + "deg) rotateY(" + (x * max).toFixed(2) + "deg) translateZ(0)";
        });
      });
      el.addEventListener("pointerleave", function () { cancelAnimationFrame(raf); el.style.transform = ""; });
    });
  }

  // Lazy-load the WebGL hero once the browser is idle.
  var heroCanvas = document.querySelector("[data-hero-3d]");
  if (heroCanvas) {
    var load = function () {
      var s = document.createElement("script");
      s.type = "module";
      s.src = "/js/hero3d.js";
      document.body.appendChild(s);
    };
    if ("requestIdleCallback" in window) requestIdleCallback(load, { timeout: 1500 }); else setTimeout(load, 600);
  }

  // Hide photos that fail to load so the branded gradient frame shows instead of a broken icon.
  document.querySelectorAll(".glmis-visual img").forEach(function (img) {
    var hide = function () { img.style.visibility = "hidden"; };
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) hide();
    img.addEventListener("error", hide);
  });

  // Analytics hook: outbound GLMIS clicks (works with GA4/GTM via dataLayer if added later).
  window.dataLayer = window.dataLayer || [];
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href*='glmis.gov.gh']");
    if (a) window.dataLayer.push({ event: "glmis_click", location: a.getAttribute("data-track") || "inline", page: location.pathname });
  });

  // Contact form: compose an email (no backend required, works on any host).
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector("[data-form-status]");
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var d = new FormData(form);
      var to = form.getAttribute("data-mailto") || "";
      var subject = "[" + d.get("topic") + "] Enquiry from " + d.get("name");
      var body = d.get("message") + "\n\nName: " + d.get("name") + "\nPhone: " + (d.get("phone") || "-") + "\nRegion: " + d.get("region");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      if (status) status.textContent = "Your email app has opened with your message. Press send to deliver it.";
    });
  }
})();
