/* סרגל נגישות (design-dna B19, ת"י 5568, מדיניות הסטודיו). הקישור הצף להצהרה נשאר ב-HTML ועובד בלי JS;
   הסקריפט הופך אותו לכפתור שפותח את הפאנל. "עצירת אנימציות" נשמרת ומטעינה את העמוד מחדש במצב סטטי. */
(function () {
  "use strict";
  var html = document.documentElement, KEY = "agentsela-a11y";
  var fab = document.querySelector(".fab-a11y"); if (!fab) return;
  var MODES = [
    ["contrast", "ניגודיות גבוהה"], ["gray", "גווני אפור"], ["invert", "היפוך צבעים"], ["links", "הדגשת קישורים"],
    ["font", "גופן קריא"], ["spacing", "ריווח שורות"], ["still", "עצירת אנימציות"]];
  var SCALES = [1, 1.12, 1.25, 1.4];
  var saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  saved.scale = saved.scale || 0;

  var btn = document.createElement("button");
  btn.type = "button"; btn.className = fab.className; btn.innerHTML = fab.innerHTML;
  btn.setAttribute("aria-label", "התאמות נגישות"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "a11y-panel");
  fab.replaceWith(btn);

  var panel = document.createElement("div");
  panel.className = "a11y-panel"; panel.id = "a11y-panel";
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-labelledby", "a11y-title"); panel.setAttribute("aria-modal", "false");
  panel.innerHTML = '<div class="a11y-head"><h2 id="a11y-title">התאמות נגישות</h2><button class="a11y-x" type="button" aria-label="סגירת התאמות הנגישות">&times;</button></div>' +
    '<div class="a11y-opts"><div class="a11y-row"><span id="a11y-size">גודל טקסט</span><button type="button" data-size="-1" aria-describedby="a11y-size">הקטנה</button><button type="button" data-size="1" aria-describedby="a11y-size">הגדלה</button></div>' +
    MODES.map(function (m) { return '<button type="button" data-mode="' + m[0] + '" aria-pressed="false">' + m[1] + "</button>"; }).join("") +
    '<button type="button" data-reset>איפוס הכל</button></div>' +
    '<div class="a11y-foot"><a href="accessibility.html">הצהרת נגישות</a><span>נשמר לביקור הבא</span></div>';
  panel.setAttribute("inert", "");
  var scrim = document.createElement("div"); scrim.className = "a11y-scrim";
  document.body.appendChild(scrim);
  document.body.appendChild(panel);

  var wasStill = !!saved.still;
  function apply() {
    html.style.setProperty("--a11y-scale", SCALES[saved.scale]);
    MODES.forEach(function (m) {
      var on = !!saved[m[0]]; html.classList.toggle("a11y-" + m[0], on);
      var b = panel.querySelector('[data-mode="' + m[0] + '"]'); if (b) b.setAttribute("aria-pressed", String(on));
    });
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
    // הגלילה החלקה והסצנות נבנות בטעינה; כדי לעצור אותן באמת, טוענים מחדש במצב הסטטי
    if (!!saved.still !== wasStill) location.reload();
  }
  function open(o) {
    panel.classList.toggle("open", o); scrim.classList.toggle("open", o); btn.setAttribute("aria-expanded", String(o));
    if (window.__lenis) o ? window.__lenis.stop() : window.__lenis.start();
    if (o) { panel.removeAttribute("inert"); setTimeout(function () { panel.querySelector(".a11y-x").focus(); }, 60); }
    else { panel.setAttribute("inert", ""); btn.focus(); }
  }
  btn.addEventListener("click", function () { open(!panel.classList.contains("open")); });
  panel.querySelector(".a11y-x").addEventListener("click", function () { open(false); });
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") open(false); });
  document.addEventListener("pointerdown", function (e) { if (panel.classList.contains("open") && !panel.contains(e.target) && !btn.contains(e.target)) open(false); });
  panel.querySelectorAll("[data-mode]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-mode"); saved[k] = !saved[k];
      if (k === "gray" && saved.gray) saved.invert = false; if (k === "invert" && saved.invert) saved.gray = false;
      apply();
    });
  });
  panel.querySelectorAll("[data-size]").forEach(function (b) {
    b.addEventListener("click", function () { saved.scale = Math.max(0, Math.min(SCALES.length - 1, saved.scale + (+b.getAttribute("data-size")))); apply(); });
  });
  panel.querySelector("[data-reset]").addEventListener("click", function () { saved = { scale: 0 }; apply(); });
  apply();
})();
