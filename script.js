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
})();
