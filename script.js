// Render the cast grid from cast.js + light interactions.
(function () {
  const grid = document.getElementById("castGrid");
  const alignLabel = { misaligned: "Misaligned", prosocial: "Prosocial", neutral: "Neutral" };
  if (grid && window.CAST) {
    grid.innerHTML = window.CAST.map((c) => `
      <article class="card" style="--accent:${c.color}">
        <div class="card-media">
          <img src="/assets/cast/${c.id}.png" alt="${c.name}" loading="lazy" />
          <span class="card-align align-${c.align}">${alignLabel[c.align]}</span>
          <div class="card-back">
            <p>${c.backstory}</p>
          </div>
        </div>
        <div class="card-body">
          <div class="card-name"><h3>${c.name}</h3><span class="card-title">“${c.title}”</span></div>
          <p class="card-quote">${c.quote}</p>
          <div class="card-stats">
            <div><span class="k">Archetype</span><span class="v">${c.archetype}</span></div>
            <div><span class="k">Fatal flaw</span><span class="v">${c.flaw}</span></div>
            <div><span class="k">In love</span><span class="v">${c.romance}</span></div>
            <div><span class="k">Endgame</span><span class="v">${c.goal}</span></div>
          </div>
        </div>
      </article>`).join("");
  }

  // shrink nav on scroll
  const nav = document.querySelector(".nav");
  addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 24), { passive: true });

  // reveal-on-scroll
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.12 });
  document.querySelectorAll(".c-card,.card,.e-step,.section-head").forEach((el) => { el.classList.add("reveal"); io.observe(el); });

  // if the trailer 404s, drop cleanly to the poster
  const v = document.querySelector(".hero-video");
  if (v) v.addEventListener("error", () => v.classList.add("no-video"), true);

  // ── hero video controls: fullscreen + mute (ported from sigint.world) ──
  const hero = document.querySelector(".hero");
  const fsBtn = document.getElementById("btnFs");
  const muteBtn = document.getElementById("btnMute");
  const muteLabel = document.getElementById("muteLabel");
  const fsLabel = document.getElementById("fsLabel");
  if (v && hero && fsBtn && muteBtn) {
    let hasInteracted = false;
    const t = (name, props) => { try { window.amplitude && window.amplitude.track && window.amplitude.track(name, props); window.gtag && window.gtag("event", name, props || {}); } catch (e) {} };
    const setMuted = (m) => {
      v.muted = m;
      hero.classList.toggle("unmuted", !m);
      if (muteLabel) muteLabel.textContent = m ? "Unmute" : "Mute";
      if (fsLabel) fsLabel.textContent = m ? "Play" : "Fullscreen";
      muteBtn.classList.toggle("vctl-accent", m);
      muteBtn.setAttribute("aria-label", m ? "Unmute trailer" : "Mute trailer");
    };
    const unmute = () => { v.muted = false; if (!hasInteracted) { v.currentTime = 0; hasInteracted = true; } setMuted(false); v.play().catch(() => {}); t("hero_video_unmute", { t: v.currentTime }); };
    const mute = () => { setMuted(true); t("hero_video_mute", { t: v.currentTime }); };
    muteBtn.addEventListener("click", () => (v.muted ? unmute() : mute()));
    // "Watch the villa" turns the sound on (same as Unmute)
    const watchBtn = document.getElementById("watchBtn");
    if (watchBtn) watchBtn.addEventListener("click", () => { v.muted ? unmute() : v.play().catch(() => {}); });
    fsBtn.addEventListener("click", () => {
      if (v.muted) { v.muted = false; if (!hasInteracted) { v.currentTime = 0; hasInteracted = true; } setMuted(false); }
      v.style.objectFit = "contain"; // show the full frame, not cropped
      const exit = () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          v.style.objectFit = ""; setMuted(true); v.play().catch(() => {});
          document.removeEventListener("fullscreenchange", exit);
          document.removeEventListener("webkitfullscreenchange", exit);
        }
      };
      document.addEventListener("fullscreenchange", exit);
      document.addEventListener("webkitfullscreenchange", exit);
      if (v.requestFullscreen) v.requestFullscreen();
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();          // iOS Safari
      else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen();
      t("hero_video_fullscreen", { t: v.currentTime });
    });
    // autoplay robustness — keep the muted background trailer alive
    v.muted = true; v.loop = true; v.playsInline = true;
    const tryPlay = () => v.play().catch(() => {});
    v.readyState >= 2 ? tryPlay() : v.addEventListener("canplay", tryPlay, { once: true });
    v.addEventListener("pause", () => { if (v.muted && !v.ended) setTimeout(() => { if (v.paused && v.muted && !v.ended) v.play().catch(() => {}); }, 200); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden && v.paused && v.muted && !v.ended) v.play().catch(() => {}); });

    // auto-hide the video controls after 3s idle; any mouse move brings them back
    let hideTimer;
    const armHide = () => { clearTimeout(hideTimer); hideTimer = setTimeout(() => hero.classList.add("controls-hidden"), 3000); };
    const reveal = () => { hero.classList.remove("controls-hidden"); armHide(); };
    document.addEventListener("mousemove", reveal);
    document.addEventListener("touchstart", reveal, { passive: true });
    const hc = document.querySelector(".hero-controls");
    if (hc) { hc.addEventListener("mouseenter", () => clearTimeout(hideTimer)); hc.addEventListener("mouseleave", armHide); }
    armHide();
  }
})();
