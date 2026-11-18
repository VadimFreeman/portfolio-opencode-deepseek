/* ============================================================================
   Vadim Freeman — interactions
   Everything here is optional polish; the page still reads fine without it.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ mark --
     One SVG mark reused in the nav, loader and hero orb.
     Edit the paths here to change the logo everywhere.                       */
  const MARK = `
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="16.5" stroke="currentColor" stroke-opacity=".5" stroke-width="1.4"/>
      <ellipse cx="24" cy="24" rx="21" ry="7" transform="rotate(-28 24 24)" stroke="currentColor" stroke-width="1.4"/>
      <path d="M16.5 18.5 24 30l7.5-11.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="24" cy="24" r="2" fill="currentColor"/>
    </svg>`;
  $$("[data-mark]").forEach((el) => { el.innerHTML = MARK; });

  /* ---------------------------------------------------------------- loader -- */
  const loader = $("#loader");
  const countEl = $(".loader__count", loader || document);
  const barEl = $(".loader__bar i", loader || document);

  const finishLoading = () => {
    if (!loader) return;
    loader.classList.add("is-done");
    document.body.classList.remove("is-locked");
    document.body.classList.add("is-loaded");
    window.setTimeout(() => { loader.style.display = "none"; }, 1100);
  };

  if (!loader || reduceMotion) {
    document.body.classList.remove("is-locked");
    document.body.classList.add("is-loaded");
    if (loader) loader.style.display = "none";
  } else {
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(eased * 100);
      if (countEl) countEl.textContent = `${value}%`;
      if (barEl) barEl.style.width = `${value}%`;

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        window.setTimeout(finishLoading, 180);
      }
    };
    requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------------- cursor -- */
  const cursor = $("#cursor");
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (cursor && finePointer && !reduceMotion) {
    let cx = -100;
    let cy = -100;
    let tx = -100;
    let ty = -100;
    let raf = null;

    const render = () => {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.setProperty("--cx", `${cx}px`);
      cursor.style.setProperty("--cy", `${cy}px`);
      raf = Math.abs(tx - cx) > 0.2 || Math.abs(ty - cy) > 0.2 ? requestAnimationFrame(render) : null;
    };

    window.addEventListener("pointermove", (event) => {
      tx = event.clientX;
      ty = event.clientY;
      cursor.classList.add("is-visible");
      if (!raf) raf = requestAnimationFrame(render);
    }, { passive: true });

    window.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
    window.addEventListener("pointerup", () => cursor.classList.remove("is-down"));
    document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));

    const interactive = "a, button, [data-cursor], summary, input, textarea";
    document.addEventListener("pointerover", (event) => {
      if (event.target.closest(interactive)) cursor.classList.add("is-active");
    });
    document.addEventListener("pointerout", (event) => {
      if (event.target.closest(interactive)) cursor.classList.remove("is-active");
    });
  }

  /* --------------------------------------------------------------- scroll --- */
  const nav = $("#nav");
  const progress = $("#progressBar");

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    if (nav) nav.classList.toggle("is-scrolled", y > 10);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* --------------------------------------------------------------- reveal --- */
  const reveals = $$("[data-reveal]");

  if (reveals.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

      reveals.forEach((el) => revealObserver.observe(el));
    }
  }

  /* ----------------------------------------------------------------- tabs --- */
  const tabs = $$(".tab");
  const panels = $$(".panel");
  const indicator = $(".tabs__indicator");
  const tabList = $(".tabs");

  const moveIndicator = (tab) => {
    if (!tabList || !indicator || !tab) return;
    tabList.style.setProperty("--tab-x", `${tab.offsetLeft}px`);
    tabList.style.setProperty("--tab-w", `${tab.offsetWidth}px`);
  };

  const activateTab = (tab, focus = false) => {
    const name = tab.dataset.tab;
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.id === `panel-${name}`;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
    moveIndicator(tab);
    if (focus) tab.focus();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      const index = tabs.indexOf(tab);
      let next = null;
      if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === "Home") next = tabs[0];
      if (event.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        event.preventDefault();
        activateTab(next, true);
      }
    });
  });

  if (tabs.length) {
    const initial = tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0];
    moveIndicator(initial);
    window.addEventListener("resize", () => moveIndicator(tabs.find((t) => t.getAttribute("aria-selected") === "true")));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => moveIndicator(tabs.find((t) => t.getAttribute("aria-selected") === "true")));
    }
  }

  /* ------------------------------------------------------------- hero orb ---
     Points scattered on a sphere, projected to 2D and slowly rotated.
     Tweak COUNT / RADIUS to change density and size.                         */
  const canvas = $("#orbCanvas");

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const COUNT = 420;
    const RADIUS = 0.94;
    const POINTS = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    // fibonacci sphere — even point distribution
    for (let i = 0; i < COUNT; i += 1) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = i * Math.PI * (3 - Math.sqrt(5));
      POINTS.push({
        x: Math.cos(theta) * r,
        y,
        z: Math.sin(theta) * r,
        s: 0.5 + Math.random() * 1.1
      });
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time) => {
      const t = time * 0.00016;
      const speed = reduceMotion ? 0 : 1;
      pointerX += (targetX - pointerX) * 0.04;
      pointerY += (targetY - pointerY) * 0.04;

      const angleY = t * speed + pointerX * 0.5;
      const angleX = Math.sin(t * 0.7) * 0.22 * speed + pointerY * 0.35;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * RADIUS * 0.42;

      ctx.clearRect(0, 0, width, height);

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const projected = [];

      for (let i = 0; i < POINTS.length; i += 1) {
        const p = POINTS[i];

        // rotate around Y
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        // rotate around X
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const scale = 1.9 / (1.9 + z2 * 0.9);
        const px = cx + x1 * radius * scale;
        const py = cy + y2 * radius * scale;
        const depth = (z2 + 1) / 2; // 0 = far, 1 = near

        projected.push({ px, py, depth, size: p.s * scale });
      }

      // dots
      for (let i = 0; i < projected.length; i += 1) {
        const p = projected[i];
        const alpha = 0.08 + p.depth * 0.55;
        const size = Math.max(0.4, p.size);
        ctx.beginPath();
        ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${i % 9 === 0 ? "242,216,196" : "169,193,255"},${alpha})`;
        ctx.fill();
      }

      // orbit rings
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleY * 0.8);
      ctx.strokeStyle = "rgba(169,193,255,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.06, radius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(242,216,196,0.07)";
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.92, radius * 0.62, Math.PI / 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (!reduceMotion) requestAnimationFrame(draw);
    };

    const visual = canvas.closest(".hero__visual");
    if (visual) {
      visual.addEventListener("pointermove", (event) => {
        const rect = visual.getBoundingClientRect();
        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      }, { passive: true });
      visual.addEventListener("pointerleave", () => { targetX = 0; targetY = 0; });
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------- local time -- */
  const localTime = $("#localTime");
  if (localTime) {
    const format = () => {
      try {
        localTime.textContent = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Europe/Moscow"
        }).format(new Date());
      } catch (error) {
        localTime.textContent = new Date().toTimeString().slice(0, 5);
      }
    };
    format();
    window.setInterval(format, 30000);
  }

  /* --------------------------------------------------------------- copy mail -- */
  const copyButton = $("#copyEmail");
  if (copyButton) {
    const email = copyButton.dataset.email || "";
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(email);
      } catch (error) {
        const holder = document.createElement("textarea");
        holder.value = email;
        document.body.appendChild(holder);
        holder.select();
        document.execCommand("copy");
        holder.remove();
      }
      const original = copyButton.textContent;
      copyButton.textContent = "copied ✓";
      window.setTimeout(() => { copyButton.textContent = original; }, 1800);
    });
  }

  /* --------------------------------------------------------------- telemetry -- */
  // Small console signature. Harmless, and easy to remove.
  console.log("%cVadim Freeman", "color:#a9c1ff;font-weight:700;font-size:14px", "— portfolio 2026");
})();
