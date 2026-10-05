/* Agent Sela · עמוד הבית. כל התנועה כאן; בלי GSAP (חסום או לא נטען) התוכן מוצג במצב הסופי שלו. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches || doc.classList.contains("a11y-still");
  var HAS_GSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  /* ---------- מגירת הטלפון (MV:b66) ---------- */
  function drawer(root, burger) {
    var panel = root.querySelector(".md-panel"), scrim = root.querySelector(".md-scrim"), closeBtn = root.querySelector(".md-close"), last = null;
    root.querySelectorAll(".md-item").forEach(function (el, i) { el.style.setProperty("--i", i); });
    panel.inert = true;
    function set(open) {
      root.classList.toggle("open", open);
      panel.inert = !open;
      burger.setAttribute("aria-expanded", String(open));
      $("#hd").classList.toggle("menu-open", open);
      doc.style.scrollbarGutter = open ? "stable" : "";
      doc.style.overflow = open ? "hidden" : "";
      if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
      if (open) { last = document.activeElement; setTimeout(function () { closeBtn.focus(); }, 180); }
      else { var to = (last && last !== document.body) ? last : burger; to.focus({ preventScroll: true }); }
    }
    burger.addEventListener("click", function () { set(!root.classList.contains("open")); });
    closeBtn.addEventListener("click", function () { set(false); });
    scrim.addEventListener("click", function () { set(false); });
    root.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    addEventListener("keydown", function (e) {
      if (!root.classList.contains("open")) return;
      if (e.key === "Escape") { set(false); return; }
      if (e.key !== "Tab") return;
      var f = Array.prototype.filter.call(panel.querySelectorAll("a,button"), function (x) { return x.offsetParent !== null; });
      var i = f.indexOf(document.activeElement);
      var n = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i === f.length - 1 ? 0 : i + 1);
      e.preventDefault(); f[n].focus();
    });
  }

  /* ---------- headroom (library/headers.md) ---------- */
  function headroom(el) {
    var tol = 6, last = scrollY, raf = 0;
    function upd() {
      raf = 0;
      var y = scrollY, d = y - last, top = el.offsetHeight + 24;
      el.classList.toggle("is-scrolled", y > 8);
      var hold = el.classList.contains("menu-open") || !!el.querySelector(":focus-visible");
      if (y <= top || hold) { el.classList.remove("is-hidden"); last = y; return; }
      if (Math.abs(d) < tol) return;
      el.classList.toggle("is-hidden", d > 0);
      last = y;
    }
    addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    el.addEventListener("focusin", upd);
    upd();
  }

  drawer($("#md"), $(".burger"));
  // דילוג לתוכן: הפוקוס עובר ל-main גם כשהגלילה החלקה תופסת את העוגן
  $(".skip").addEventListener("click", function (e) { e.preventDefault(); var m = $("#main"); m.focus({ preventScroll: true }); if (window.__lenis) window.__lenis.scrollTo(m, { immediate: true }); else m.scrollIntoView(); });
  headroom($("#hd"));

  /* ---------- פתיחת העמוד: הדר, ההירו, ואז מה שמציץ בתחתית (engine/motion.md 2). WAAPI, כדי שלא תלוי ב-GSAP ---------- */
  function opening() {
    if (!doc.classList.contains("open-anim")) return;
    var E = "cubic-bezier(.2,.6,.2,1)", IO = "cubic-bezier(.76,0,.24,1)";
    function a(el, kf, delay, dur, easing) {
      if (!el) return;
      el.animate(kf, { delay: delay, duration: dur, easing: easing || E, fill: "backwards" });
    }
    var up = function (px) { return [{ opacity: 0, translate: "0 " + px + "px" }, { opacity: 1, translate: "0 0" }]; };
    a($("#hd"), [{ opacity: 0, translate: "0 -18px" }, { opacity: 1, translate: "0 0" }], 0, 600);
    a($(".hero .kicker"), up(20), 80, 560);
    a($(".hl-1"), up(24), 140, 600);
    a($(".strike i"), [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], 520, 420, IO);
    a($(".hl-2"), up(24), 400, 600);
    var p = $(".under path");
    if (p) p.animate([{ strokeDashoffset: 310 }, { strokeDashoffset: 0 }], { delay: 700, duration: 520, easing: E, fill: "backwards" });
    $$(".op-3").forEach(function (el, i) { a(el, up(16), 500 + i * 70, 560); });
    a($(".op-4"), up(16), 640, 560);
    a($(".op-media"), [{ opacity: 0 }, { opacity: 1 }], 60, 800);
    a($(".hero-shot img"), [{ transform: "scale(1.08)" }, { transform: "scale(1)" }], 0, 1600, "cubic-bezier(.2,.6,.2,1)");
    a($(".op-peek"), up(48), 760, 600);
    doc.classList.remove("open-anim");
  }
  opening();

  /* ---------- reveal (engine/motion.md 2) ---------- */
  var reveals = $$(".reveal");
  if (!RM && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  /* ---------- מונים (MV:b02) ---------- */
  var counters = $$("[data-count]");
  function countUp(el) {
    var to = +el.getAttribute("data-count"), t0 = performance.now(), dur = to > 50 ? 1400 : 900;
    (function f(now) {
      var k = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.round(to * e));
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }
  if (!RM && "IntersectionObserver" in window) {
    counters.forEach(function (el) { el.textContent = "0"; });
    var cio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- 02: ארבעת העמודים מתכנסים לראש (MV:lm3) ---------- */
  var pillars = $("[data-converge]");
  if (pillars) {
    if (RM || !("IntersectionObserver" in window)) pillars.classList.add("met");
    else {
      var pio = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { pillars.classList.add("met"); pio.disconnect(); } });
      }, { threshold: 0.28 });
      pio.observe(pillars);
    }
  }

  /* ---------- וואטסאפ צף (b03): אחרי ההירו, ולא ליד הסוגר שיש בו כבר כפתור ---------- */
  var wa = $(".wa-float");
  if (wa && $(".hero") && $(".night") && "IntersectionObserver" in window) {
    var pastHero = false, atNight = false;
    var wset = function () { wa.classList.toggle("is-on", pastHero && !atNight); };
    new IntersectionObserver(function (en) { pastHero = !en[0].isIntersecting; wset(); }).observe($(".hero"));
    new IntersectionObserver(function (en) { atNight = en[0].isIntersecting; wset(); }, { rootMargin: "0px 0px -20% 0px" }).observe($(".night"));
  }

  /* ---------- 01: רגע החתימה. השעון מ-09:00 עד 18:00, הידע יוצא מהדלת, ובסוף מתכנס למוח אחד ---------- */
  var scene = (function () {
    var split = $(".clock-split"), stage = $(".stage"), canvas = $(".dots");
    if (!split || !stage || !canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext("2d"), qs = $$(".q", split), steps = $$(".steps li", stage);
    var hEl = $(".clock-h", stage), mEl = $(".clock-m", stage);
    var W = 0, H = 0, DPR = 1, dots = [], s = 0, shown = "", visible = false, raf = 0, active = -1;

    // אקראי עם זרע, כדי שהסצנה תיראה אותו דבר בכל טעינה
    var seed = 7;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

    function build() {
      seed = 7; dots = [];
      var cols = W < 520 ? 12 : 17, rows = W < 520 ? 7 : 10, n = cols * rows;
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var stay = rnd() < 0.09;
        dots.push({
          hx: 0.14 + (c + 0.2 + rnd() * 0.6) / cols * 0.78,
          hy: 0.4 + (r + 0.2 + rnd() * 0.6) / rows * 0.5,
          L: stay ? 99 : 0.15 + rnd() * 4.75,
          dy: 0.56 + (rnd() - 0.5) * 0.2,
          d: rnd() * 0.42,
          ph: rnd() * 6.28,
          sz: 0.75 + rnd() * 0.6
        });
      }
      // מקום בתוך המוח: חמניה (פיבונאצ'י), לפי סדר אקראי כדי שהזרימה פנימה תהיה מעורבבת
      var order = dots.map(function (_, i) { return i; }).sort(function () { return rnd() - 0.5; });
      order.forEach(function (di, k) {
        var rr = Math.sqrt((k + 0.5) / n), th = k * 2.39996;
        dots[di].bx = rr * Math.cos(th); dots[di].by = rr * Math.sin(th);
      });
    }

    function size() {
      var b = stage.getBoundingClientRect();
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = b.width; H = b.height;
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      build(); draw(performance.now());
    }

    function mix(c1, c2, t) {
      return "rgb(" + Math.round(lerp(c1[0], c2[0], t)) + "," + Math.round(lerp(c1[1], c2[1], t)) + "," + Math.round(lerp(c1[2], c2[2], t)) + ")";
    }
    var DAY_T = [42, 74, 114], DAY_B = [26, 49, 80], NIGHT_T = [11, 22, 38], NIGHT_B = [16, 30, 52];
    var WARM = [246, 231, 200], TURQ = [25, 211, 197];

    function draw(now) {
      if (!W) return;
      var t = now / 1000, day = clamp(s, 0, 5) / 5, conv = clamp(s - 5, 0, 1);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      // שמיים: מאור יום כחול ללילה
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, mix(DAY_T, NIGHT_T, smooth(day)));
      g.addColorStop(1, mix(DAY_B, NIGHT_B, smooth(day)));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // אור החלון החם של היום, שנחלש עד שש
      var warmA = 0.2 * (1 - smooth(day));
      if (warmA > 0.005) {
        var wg = ctx.createRadialGradient(W * 0.86, -H * 0.05, 0, W * 0.86, -H * 0.05, Math.max(W, H) * 0.8);
        wg.addColorStop(0, "rgba(242,183,107," + warmA + ")"); wg.addColorStop(1, "rgba(242,183,107,0)");
        ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H);
      }
      // הדלת: פס אור בקצה, נפתח כשהידע יוצא ונסגר כשהוא חוזר
      var doorA = 0.5 * smooth(clamp(s / 0.6, 0, 1)) * (1 - smooth(conv * 1.4));
      if (doorA > 0.01) {
        var dg = ctx.createRadialGradient(0, H * 0.56, 0, 0, H * 0.56, H * 0.36);
        dg.addColorStop(0, "rgba(242,183,107," + doorA + ")"); dg.addColorStop(1, "rgba(242,183,107,0)");
        ctx.fillStyle = dg; ctx.fillRect(0, 0, W * 0.5, H);
      }
      // המוח: זוהר טורקיז שנדלק כשהנקודות מתכנסות
      var R = Math.min(W, H) * (W < 520 ? 0.3 : 0.24), cx = W * 0.5, cy = H * (W < 520 ? 0.62 : 0.62);
      if (conv > 0.01) {
        var bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.1);
        bg.addColorStop(0, "rgba(25,211,197," + 0.28 * smooth(conv) + ")"); bg.addColorStop(1, "rgba(25,211,197,0)");
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      }
      var base = W < 520 ? 1.5 : 2.1;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        var hx = d.hx * W, hy = d.hy * H, ex = -0.06 * W, ey = d.dy * H;
        var u = smooth((s - d.L) / 0.85), x = hx, y = hy, a = 1;
        if (u > 0) {
          var cxq = (hx + ex) / 2, cyq = Math.min(hy, ey) - H * 0.1, k1 = 1 - u;
          x = k1 * k1 * hx + 2 * k1 * u * cxq + u * u * ex;
          y = k1 * k1 * hy + 2 * k1 * u * cyq + u * u * ey;
          a = 1 - smooth((u - 0.6) / 0.4);
        }
        var c = smooth((conv - d.d) / 0.55);
        if (c > 0) {
          var gone = u >= 1, sx = gone ? ex : x, sy = gone ? ey : y;
          var tx = cx + d.bx * R, ty = cy + d.by * R * 0.92;
          x = lerp(sx, tx, c); y = lerp(sy, ty, c);
          a = gone ? c : Math.max(a, c);
        }
        if (a <= 0.01) continue;
        var tw = RM ? 1 : (c >= 1 ? 0.86 + 0.14 * Math.sin(t * 1.6 + d.ph) : 0.72 + 0.28 * Math.sin(t * 1.3 + d.ph));
        ctx.globalAlpha = a * tw;
        ctx.fillStyle = mix(WARM, TURQ, c);
        ctx.beginPath(); ctx.arc(x, y, base * d.sz * (1 + c * 0.25), 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function setS(v) {
      s = v;
      var mins = Math.round(540 + clamp(s, 0, 5) / 5 * 540), txt = String(Math.floor(mins / 60)).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
      if (txt !== shown) { shown = txt; hEl.textContent = txt.slice(0, 2); mEl.textContent = txt.slice(3); }
      steps.forEach(function (li, i) { li.style.setProperty("--f", clamp(s - i, 0, 1).toFixed(3)); });
      var a2 = clamp(Math.floor(s), 0, qs.length - 1);
      if (a2 !== active) { active = a2; qs.forEach(function (q, i) { q.classList.toggle("is-on", i === a2); }); }
    }

    function loop(now) { raf = 0; draw(now); if (visible && !RM) raf = requestAnimationFrame(loop); }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }

    if ("ResizeObserver" in window) new ResizeObserver(size).observe(stage); else addEventListener("resize", size);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }).observe(stage);
    }

    // נקודות הגבול של כל שאלה, נמדדות ב-refresh ולא בזמן גלילה (gsap/_gsap-core.md, ארבעת החוקים)
    var bounds = [];
    function measure() {
      var top0 = qs[0].offsetTop;
      bounds = qs.map(function (q) { return q.offsetTop - top0; });
      bounds.push(qs[qs.length - 1].offsetTop + qs[qs.length - 1].offsetHeight - top0);
    }
    function fromProgress(p) {
      var y = p * bounds[bounds.length - 1];
      for (var i = 0; i < qs.length; i++) if (y < bounds[i + 1]) {
        var f = (y - bounds[i]) / (bounds[i + 1] - bounds[i]);
        // המוח מסיים להתכנס בשני שלישים של הבלוק האחרון, ונשאר שלם בזמן שהמשפט נקרא
        return i + (i === qs.length - 1 ? Math.min(1, f * 1.5) : f);
      }
      return qs.length;
    }

    return {
      live: function () {
        split.classList.add("scene-live");
        measure();
        ScrollTrigger.create({
          trigger: $(".qs", split), start: "top 60%", end: "bottom 80%",
          onRefresh: function (self) { measure(); setS(fromProgress(self.progress)); kick(); },
          onUpdate: function (self) { setS(fromProgress(self.progress)); kick(); }
        });
      },
      still: function () { setS(6); qs.forEach(function (q) { q.classList.remove("is-on"); }); size(); }
    };
  })();

  /* ---------- שכבת GSAP: גלילה חלקה, סצנות scrub ---------- */
  if (!HAS_GSAP || RM) {
    if (scene) scene.still();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  doc.classList.add("gsap-live");
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  if (typeof window.Lenis === "function") {
    var lenis = new Lenis({ autoRaf: false, lerp: 0.12, anchors: { offset: -88 } });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  if (scene) scene.live();

  var mm = gsap.matchMedia();

  /* מרקי הלוגואים: משוכפל עד שכל חצי ממלא מסך, ומאיץ ומתהפך לפי מהירות הגלילה (MV:b42) */
  var rail = $(".rail");
  if (rail) {
    var items = $$("li", rail);
    var fill = function () {
      var guard = 0;
      while (rail.scrollWidth < innerWidth * 2 && guard++ < 8) items.forEach(function (li) { rail.appendChild(li.cloneNode(true)); });
      $$("li", rail).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.querySelector("img").alt = ""; rail.appendChild(c); });
    };
    fill();
    var half = rail.scrollWidth / 2, x = 0, dir = 1, v = 0, lastY = scrollY;
    addEventListener("resize", function () { half = rail.scrollWidth / 2; });
    gsap.ticker.add(function (time, dt) {
      var y = scrollY, dy = y - lastY; lastY = y;
      if (dy) dir = dy > 0 ? 1 : -1;
      v = lerp(v, Math.min(Math.abs(dy) * 60, 2400), 0.08);
      x -= dir * (38 + v * 0.22) * (dt / 1000);
      if (x <= -half) x += half; if (x > 0) x -= half;
      rail.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
    });
  }

  /* 03: המדרגות שוקעות לעומק והמדדים מתמלאים, בקצב הגלילה */
  var levels = $(".levels");
  if (levels) {
    gsap.fromTo(levels, { "--sink": 0, "--fill": 0 }, {
      "--sink": 1, "--fill": 1, ease: "none",
      scrollTrigger: { trigger: levels, start: "top 88%", end: "top 30%", scrub: true }
    });
  }

  /* 04: עמודות ההמלצות בכיוונים הפוכים (MV:g51), רק במסכים שיש בהם מקום */
  mm.add("(min-width: 768px)", function () {
    var cols = $$(".wall-col");
    var tw = cols.map(function (col, i) {
      var d = i % 2 ? 1 : -1;
      // פיקסל שלם, כדי שהכוכבים והלוגואים לא ייפלו בין שורות פיקסלים (grid-check)
      var h = col.offsetHeight * 0.07;
      return gsap.fromTo(col, { y: h * d }, { y: -h * d, ease: "none", modifiers: { y: function (v) { var r = window.devicePixelRatio || 1; return (Math.round(parseFloat(v) * r) / r) + "px"; } },
        scrollTrigger: { trigger: ".wall", start: "top bottom", end: "bottom top", scrub: true } });
    });
    return function () { tw.forEach(function (t) { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); }); };
  });

  /* הסוגר: הלילה עולה כגיליון מעוגל ומתיישר כשהוא ממלא את המסך (MV:g36) */
  var sheet = $(".night-sheet");
  if (sheet) {
    var r0 = parseFloat(getComputedStyle(sheet).borderTopLeftRadius) || 80;
    gsap.fromTo(sheet, { "--round": r0 + "px" }, { "--round": "0px", ease: "none",
      scrollTrigger: { trigger: sheet, start: "top bottom", end: "top 15%", scrub: true } });
  }

  addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
