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
    // Gentle tilt on content cards too, so every panel has depth.
    document.querySelectorAll(".card, .step, .region").forEach(function (el) { if (!el.hasAttribute("data-tilt")) el.setAttribute("data-tilt", "3"); });
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var max = Number(el.getAttribute("data-tilt")) || 6;
      var raf = 0;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.setProperty("--mx", ((x + 0.5) * 100).toFixed(1) + "%");
          el.style.setProperty("--my", ((y + 0.5) * 100).toFixed(1) + "%");
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

  // Share bars: copy link (or the phone's native share sheet), with tracking for every channel.
  function copy(text, btn, done) {
    var ok = function () {
      var label = btn.querySelector("span") || btn;
      var old = label.textContent;
      label.textContent = done || "Copied";
      setTimeout(function () { label.textContent = old; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, function () { window.prompt("Copy this:", text); });
    else window.prompt("Copy this:", text);
  }
  document.querySelectorAll("[data-share]").forEach(function (bar) {
    var btn = bar.querySelector("[data-copy-link]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var url = bar.getAttribute("data-url"), title = bar.getAttribute("data-title");
      window.dataLayer.push({ event: "share", method: navigator.share ? "native" : "copy", page: location.pathname });
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        navigator.share({ title: title, text: title, url: url.replace("utm_source=copy", "utm_source=native") }).catch(function () {});
      } else copy(url, btn, "Link copied");
    });
  });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-track^='share_'], [data-track^='follow_']");
    if (a) window.dataLayer.push({ event: a.getAttribute("data-track").split("_")[0], method: a.getAttribute("data-track").split("_")[1], page: location.pathname });
    var c = e.target.closest && e.target.closest("[data-copy-text]");
    if (c) { var ta = c.parentElement.querySelector("textarea"); if (ta) copy(ta.value, c, "Caption copied"); }
  });

  // Blog topic filters
  var grid = document.querySelector("[data-post-grid]");
  document.querySelectorAll("[data-filter]").forEach(function (b, _, all) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      all.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      if (grid) grid.querySelectorAll(".post-card").forEach(function (card) {
        card.hidden = !(f === "all" || card.getAttribute("data-pillar") === f);
      });
    });
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

// Phones: keep the floating chat button out of the way while the hero ask box is visible.
(function () {
  var card = document.querySelector(".hero-card"), chat = document.querySelector(".chat");
  if (!card || !chat || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(function (e) { chat.classList.toggle("hero-visible", e[0].isIntersecting); }, { threshold: 0.15 }).observe(card);
})();

// Depth layers: floating orbs in plain sections and scroll parallax (--p from -1 to 1 per section).
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var secs = [].slice.call(document.querySelectorAll("main .section, main section.section-tight, .page-hero"));
  secs.forEach(function (s, i) {
    if (!s.classList.contains("section") || s.classList.contains("section-alt")) return;
    if (i % 2) return; // every other plain section, so it stays calm
    ["o1", "o2", "o3"].forEach(function (c) { var d = document.createElement("span"); d.className = "depth-orb " + c; d.setAttribute("aria-hidden", "true"); s.insertBefore(d, s.firstChild); });
    s.style.overflow = "hidden";
  });
  if (reduce) return;
  var visible = new Set(), ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    visible.forEach(function (s) {
      var r = s.getBoundingClientRect();
      var p = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
      s.style.setProperty("--p", Math.max(-1, Math.min(1, p)).toFixed(3));
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? visible.add(e.target) : visible.delete(e.target); }); onScroll(); });
    secs.forEach(function (s) { io.observe(s); });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }
})();
