/* sec-sparkle.js — 미션 섹션 반짝이 (KV 반짝이 톤) */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  Array.prototype.forEach.call(document.querySelectorAll('.sec-sparkle'), init);
  function init(cv) {
  var sec = cv.parentNode, ctx = cv.getContext('2d');
  var TAU = Math.PI * 2, HUES = [224, 232, 240, 322, 328, 335];
  var W = 0, H = 0, DPR = 1, stars = [], flares = {}, on = false, t0 = performance.now();
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function flare(h) {
    if (flares[h]) return flares[h];
    var S = 96, c = document.createElement('canvas'); c.width = c.height = S;
    var g = c.getContext('2d');
    function bar(x0, y0, x1, y1, rx, ry, rw, rh) {
      var lg = g.createLinearGradient(x0, y0, x1, y1);
      lg.addColorStop(0, 'hsla(' + h + ',85%,60%,0)');
      lg.addColorStop(0.46, 'hsla(' + h + ',85%,72%,0.8)');
      lg.addColorStop(0.54, 'hsla(' + h + ',85%,72%,0.8)');
      lg.addColorStop(1, 'hsla(' + h + ',85%,60%,0)');
      g.fillStyle = lg; g.fillRect(rx, ry, rw, rh);
    }
    bar(0, S / 2, S, S / 2, 0, S / 2 - 1.2, S, 2.4);
    bar(S / 2, 0, S / 2, S, S / 2 - 1.2, 0, 2.4, S);
    return (flares[h] = c);
  }
  function build() {
    stars = [];
    var n = Math.round(Math.max(18, Math.min(40, W * H / 45000)));
    for (var i = 0; i < n; i++) stars.push({ x: Math.random(), y: Math.random(), r: rnd(0.7, 2), sp: rnd(1, 3), ph: rnd(0, TAU), h: HUES[Math.floor(Math.random() * HUES.length)] });
  }
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = sec.offsetWidth; H = sec.offsetHeight;
    cv.width = Math.max(1, Math.round(W * DPR)); cv.height = Math.max(1, Math.round(H * DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], tw = Math.pow(0.5 + 0.5 * Math.sin(t * s.sp + s.ph), 3);
      if (tw < 0.05) continue;
      var x = s.x * W, y = s.y * H, r = s.r * 1.6;
      ctx.globalAlpha = tw * 0.7;
      ctx.fillStyle = 'hsl(' + s.h + ',90%,82%)';
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      if (tw > 0.6 && s.r > 1.4) {
        var F = r * 14;
        ctx.globalAlpha = (tw - 0.6) / 0.4 * 0.6;
        ctx.drawImage(flare(s.h), x - F / 2, y - F / 2, F, F);
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  function loop(now) { if (!on) return; draw((now - t0) / 1000); requestAnimationFrame(loop); }
  resize();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
  new IntersectionObserver(function (e) {
    var v = e[0].isIntersecting && !document.hidden;
    if (v && !on) { on = true; requestAnimationFrame(loop); } else if (!v) on = false;
  }).observe(sec);
  }
})();
