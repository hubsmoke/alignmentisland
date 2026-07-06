// Analytics loader, Google Analytics 4 + Amplitude (PROXIED via same-origin rewrites
// in vercel.json, so ad-blockers that block amplitude.com don't kill tracking).
// Keys live in window.__ANALYTICS__ (set in index.html). No-ops on placeholders,
// so the site is safe to deploy before the real keys are dropped in.
(function () {
  var cfg = window.__ANALYTICS__ || {};

  // shared tracker, fires to BOTH Amplitude and GA4; safe before/while they load.
  window.aiTrack = function (name, props) {
    try { window.amplitude && window.amplitude.track && window.amplitude.track(name, props || {}); } catch (e) {}
    try { window.gtag && window.gtag("event", name, props || {}); } catch (e) {}
  };
  window.aiIdentify = function (email) {
    try {
      if (window.amplitude) {
        window.amplitude.setUserId && window.amplitude.setUserId(email);
        if (window.amplitude.Identify) { var id = new window.amplitude.Identify().set("email", email); window.amplitude.identify(id); }
      }
    } catch (e) {}
  };

  // ── Google Analytics 4 ──
  if (cfg.ga && cfg.ga.indexOf("G-") === 0) {
    var g = document.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=" + cfg.ga;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", cfg.ga);
  }

  // ── Amplitude (proxied) ──
  // SDK loads from /c/* (→ cdn.amplitude.com) and events POST to /i/2/httpapi
  // (→ api2.amplitude.com/2/httpapi), both same-origin, so blockers can't see them.
  if (cfg.amplitude && cfg.amplitude.length >= 24) {
    var a = document.createElement("script");
    a.src = "/c/script/" + cfg.amplitude + ".js";
    a.onload = function () {
      if (window.amplitude && window.amplitude.init) {
        window.amplitude.init(cfg.amplitude, {
          serverUrl: location.origin + "/i/2/httpapi",
          autocapture: { attribution: true, pageViews: true, sessions: true, formInteractions: true, fileDownloads: true, elementInteractions: true },
        });
      }
    };
    document.head.appendChild(a);
  }
})();
