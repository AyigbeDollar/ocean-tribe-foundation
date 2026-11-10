// Office finder: live search, region and type filters, nearest office, and an interactive map.
// The list works without JavaScript; the map (self-hosted Leaflet + OpenStreetMap tiles) loads only when it scrolls near view.
(function () {
  "use strict";
  var root = document.querySelector("[data-office-finder]");
  if (!root) return;
  var data = [];
  try { data = JSON.parse(document.getElementById("offices-data").textContent); } catch (e) { return; }
  var byId = {};
  data.forEach(function (o) { byId[o.id] = o; });

  var list = root.querySelector("[data-of-list]");
  var cards = [].slice.call(list.querySelectorAll(".office-card"));
  var search = root.querySelector("[data-of-search]");
  var region = root.querySelector("[data-of-region]");
  var typeBtns = [].slice.call(root.querySelectorAll("[data-of-type]"));
  var count = root.querySelector("[data-of-count]");
  var empty = root.querySelector("[data-of-empty]");
  var nearBtn = root.querySelector("[data-of-near]");
  var mapEl = root.querySelector("[data-of-map]");
  var type = "all";
  var userPos = null;
  var map = null, L = null, markers = {}, userMarker = null;

  var TYPE_GROUP = { pec: ["pec", "office-pec"], district: ["district", "office-pec"], regional: ["regional", "head"] };
  var COLORS = { head: "#F9ED32", regional: "#2B3990", district: "#DD2A1B", pec: "#006838", "office-pec": "#006838" };
  var LABEL = { head: "Head Office", regional: "Regional office", district: "District or municipal office", pec: "Public Employment Centre", "office-pec": "Office and PEC" };
  var track = function (o) { (window.dataLayer = window.dataLayer || []).push(o); };

  function matches(card) {
    var q = search.value.trim().toLowerCase();
    var okQ = !q || q.split(/\s+/).every(function (w) { return card.getAttribute("data-search").indexOf(w) >= 0; });
    var okR = !region.value || card.getAttribute("data-region") === region.value;
    var okT = type === "all" || TYPE_GROUP[type].indexOf(card.getAttribute("data-type")) >= 0;
    return okQ && okR && okT;
  }

  function distanceKm(a, b) {
    var R = 6371, toRad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * toRad, dLng = (b.lng - a.lng) * toRad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function apply(opts) {
    var shown = 0, towns = {};
    if (userPos) {
      cards.sort(function (a, b) { return byId[a.id].d - byId[b.id].d; });
      cards.forEach(function (c) { list.appendChild(c); });
    }
    cards.forEach(function (c) {
      var ok = matches(c);
      c.hidden = !ok;
      if (ok) { shown++; towns[byId[c.id].town] = 1; }
    });
    var total = cards.length;
    count.textContent = shown === total ? "Showing all " + total + " offices" + (userPos ? ", nearest first" : "") : "Showing " + shown + " of " + total + " offices" + (userPos ? ", nearest first" : "");
    empty.hidden = shown > 0;
    if (map) {
      Object.keys(markers).forEach(function (town) {
        var on = !!towns[town];
        if (on && !map.hasLayer(markers[town])) markers[town].addTo(map);
        if (!on && map.hasLayer(markers[town])) map.removeLayer(markers[town]);
      });
      if (opts && opts.fit) fitVisible();
    }
    syncUrl();
  }

  function fitVisible() {
    if (!map) return;
    var pts = cards.filter(function (c) { return !c.hidden; }).map(function (c) { var o = byId[c.id]; return [o.lat, o.lng]; });
    if (userPos) pts.push([userPos.lat, userPos.lng]);
    if (!pts.length) return;
    if (pts.length === 1) map.setView(pts[0], 12);
    else map.fitBounds(pts, { padding: [30, 30], maxZoom: 12 });
  }

  function syncUrl() {
    try {
      var p = new URLSearchParams();
      if (region.value) p.set("region", region.value);
      if (type !== "all") p.set("type", type);
      if (search.value.trim()) p.set("q", search.value.trim());
      var qs = p.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
    } catch (e) {}
  }

  // Deep links: /offices?region=Volta&type=pec&q=ho
  (function readUrl() {
    var p = new URLSearchParams(location.search);
    if (p.get("region") && [].some.call(region.options, function (o) { return o.value === p.get("region"); })) region.value = p.get("region");
    if (p.get("q")) search.value = p.get("q");
    if (TYPE_GROUP[p.get("type")]) type = p.get("type");
    typeBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-of-type") === type)); });
  })();

  var t;
  search.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { apply({ fit: true }); }, 120); });
  search.addEventListener("change", function () { if (search.value.trim()) track({ event: "office_search", query: search.value.trim().slice(0, 60) }); });
  region.addEventListener("change", function () { apply({ fit: true }); track({ event: "office_region", region: region.value || "all" }); });
  typeBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      type = b.getAttribute("data-of-type");
      typeBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      apply({ fit: true });
    });
  });

  // Nearest office
  if (!("geolocation" in navigator)) nearBtn.hidden = true;
  nearBtn.addEventListener("click", function () {
    var label = nearBtn.lastChild;
    var old = label.textContent;
    label.textContent = "Finding you…";
    nearBtn.disabled = true;
    navigator.geolocation.getCurrentPosition(function (pos) {
      userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      data.forEach(function (o) { o.d = distanceKm(userPos, o); });
      cards.forEach(function (c) {
        var el = c.querySelector(".oc-dist");
        var d = byId[c.id].d;
        el.textContent = " · about " + (d < 1 ? "1" : Math.round(d)) + " km away";
        el.hidden = false;
      });
      search.value = ""; region.value = ""; type = "all";
      typeBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-of-type") === "all")); });
      apply();
      label.textContent = "Nearest first";
      nearBtn.disabled = false;
      var first = cards[0];
      first.classList.add("is-nearest");
      track({ event: "office_nearest", office: byId[first.id].n });
      loadMap(function () {
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.circleMarker([userPos.lat, userPos.lng], { radius: 9, color: "#fff", weight: 3, fillColor: "#1a73e8", fillOpacity: 1 }).addTo(map).bindTooltip("You are here");
        var near = cards.slice(0, 3).map(function (c) { var o = byId[c.id]; return [o.lat, o.lng]; });
        near.push([userPos.lat, userPos.lng]);
        map.fitBounds(near, { padding: [40, 40], maxZoom: 12 });
      });
      first.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, function () {
      label.textContent = old;
      nearBtn.disabled = false;
      count.textContent = "We could not get your location. Search for your town instead, or choose your region.";
      search.focus();
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  });

  // "Map" button on each card
  list.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-show-on-map]");
    if (!b) return;
    var card = b.closest(".office-card");
    var o = byId[card.id];
    loadMap(function () {
      map.setView([o.lat, o.lng], 13);
      markers[o.town].openPopup();
      if (window.matchMedia("(max-width: 900px)").matches) mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  list.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-track^='office_']");
    if (a) track({ event: a.getAttribute("data-track"), office: byId[a.closest(".office-card").id].n });
  });

  // ---------- Map (lazy) ----------
  var loading = false, queue = [];
  function loadMap(cb) {
    if (map) { if (cb) cb(); return; }
    if (cb) queue.push(cb);
    if (loading) return;
    loading = true;
    var css = document.createElement("link");
    css.rel = "stylesheet"; css.href = "/js/vendor/leaflet/leaflet.css";
    document.head.appendChild(css);
    var s = document.createElement("script");
    s.src = "/js/vendor/leaflet/leaflet.js";
    s.onload = function () { L = window.L; initMap(); queue.splice(0).forEach(function (f) { f(); }); };
    s.onerror = function () { mapEl.innerHTML = '<p class="of-map-msg">The map could not load. Use the list to call or get directions.</p>'; };
    document.head.appendChild(s);
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function initMap() {
    mapEl.innerHTML = "";
    map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([7.95, -1.0], 6);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.on("focus", function () { map.scrollWheelZoom.enable(); });
    map.on("blur", function () { map.scrollWheelZoom.disable(); });
    var towns = {};
    data.forEach(function (o) { (towns[o.town] = towns[o.town] || []).push(o); });
    Object.keys(towns).forEach(function (town) {
      var group = towns[town];
      var rank = ["head", "regional", "office-pec", "pec", "district"];
      var main = group.slice().sort(function (a, b) { return rank.indexOf(a.t) - rank.indexOf(b.t); })[0];
      var n = group.length;
      var icon = L.divIcon({
        className: "of-pin-wrap",
        html: '<span class="of-pin" style="--pin:' + COLORS[main.t] + '"><span>' + (n > 1 ? n : "") + "</span></span>",
        iconSize: [34, 42], iconAnchor: [17, 40], popupAnchor: [0, -36]
      });
      var html = '<div class="of-pop"><strong class="of-pop-town">' + esc(town) + '</strong><span class="of-pop-region">' + esc(group[0].r) + " Region</span><ul>" +
        group.map(function (o) {
          return '<li><span class="of-pop-type" style="--pin:' + COLORS[o.t] + '">' + esc(LABEL[o.t]) + "</span><b>" + esc(o.n) + "</b>" +
            '<span class="of-pop-actions"><a href="tel:' + esc(o.tel) + '">Call</a><a href="' + esc(o.maps) + '" target="_blank" rel="noopener">Directions</a><a href="#' + esc(o.id) + '" data-goto>Details</a></span></li>';
        }).join("") + "</ul></div>";
      markers[town] = L.marker([main.lat, main.lng], { icon: icon, title: town + ": " + n + (n > 1 ? " offices" : " office"), alt: town, riseOnHover: true }).bindPopup(html, { maxWidth: 300 });
    });
    mapEl.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-goto]");
      if (!a) return;
      e.preventDefault();
      var card = document.getElementById(a.getAttribute("href").slice(1));
      if (card) { card.hidden = false; card.scrollIntoView({ behavior: "smooth", block: "center" }); card.classList.add("is-flash"); setTimeout(function () { card.classList.remove("is-flash"); }, 1600); }
    });
    var sizePins = function () { mapEl.classList.toggle("of-zoomed-out", map.getZoom() < 8); };
    map.on("zoomend", sizePins);
    apply({ fit: true });
    sizePins();
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); loadMap(); } }, { rootMargin: "300px" });
    io.observe(mapEl);
  } else loadMap();

  apply();
})();
