/* kv-orbs.js — KV 배경 장식 파티클 (캐릭터 뒤). 마우스 반응 없음, 배경 톤(블루·퍼플·마젠타)으로 은은하게 */
(function () {
  'use strict';
  var cv = document.getElementById('kvOrbs');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var stage = cv.parentNode.parentNode.parentNode; // .kv__stage
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mq = window.matchMedia('(max-width: 768px)');
  var TAU = Math.PI * 2;
  var HUES = [224, 232, 240, 322, 328, 335];
  var COUNT = 46;
  var W = 0, H = 0, DPR = 1, orbs = [], stars = [], sprites = {}, flares = {}, raf = 0, t0 = performance.now(), visible = true;

  function flare(h) {
    if (flares[h]) return flares[h];
    var S = 96, c = document.createElement('canvas');
    c.width = c.height = S;
    var g = c.getContext('2d');
    function bar(x0, y0, x1, y1, rx, ry, rw, rh) {
      var lg = g.createLinearGradient(x0, y0, x1, y1);
      lg.addColorStop(0, 'hsla(' + h + ',85%,60%,0)');
      lg.addColorStop(0.46, 'hsla(' + h + ',85%,70%,0.8)');
      lg.addColorStop(0.54, 'hsla(' + h + ',85%,70%,0.8)');
      lg.addColorStop(1, 'hsla(' + h + ',85%,60%,0)');
      g.fillStyle = lg; g.fillRect(rx, ry, rw, rh);
    }
    bar(0, S / 2, S, S / 2, 0, S / 2 - 1.2, S, 2.4);
    bar(S / 2, 0, S / 2, S, S / 2 - 1.2, 0, 2.4, S);
    return (flares[h] = c);
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function sprite(h) {
    if (sprites[h]) return sprites[h];
    var S = 96, c = document.createElement('canvas');
    c.width = c.height = S;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grd.addColorStop(0, 'hsla(' + h + ',75%,58%,0.8)');
    grd.addColorStop(0.15, 'hsla(' + h + ',72%,46%,0.5)');
    grd.addColorStop(0.4, 'hsla(' + h + ',70%,36%,0.18)');
    grd.addColorStop(0.7, 'hsla(' + h + ',70%,30%,0.05)');
    grd.addColorStop(1, 'hsla(' + h + ',70%,28%,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, S, S);
    return (sprites[h] = c);
  }

  function build() {
    orbs = [];
    for (var i = 0; i < COUNT; i++) {
      var d = Math.random();
      orbs.push({
        h: HUES[Math.floor(Math.random() * HUES.length)],
        bx: Math.random(), by: Math.random(),
        ax: rnd(10, 40) * (0.4 + d), ay: rnd(10, 40) * (0.4 + d),
        sx: rnd(0.04, 0.14), sy: rnd(0.04, 0.14),
        px: rnd(0, TAU), py: rnd(0, TAU),
        size: (6 + 22 * d * d) * rnd(0.8, 1.2),
        ps: rnd(0.4, 1.2), pp: rnd(0, TAU),
        op: rnd(0.45, 0.8) * (0.6 + 0.4 * d)
      });
    }
    stars = [];
    for (var s = 0; s < 140; s++) {
      stars.push({ x: Math.random(), y: Math.random() * 0.85, r: rnd(0.8, 2.4), sp: rnd(1.2, 3.5), ph: rnd(0, TAU), h: HUES[Math.floor(Math.random() * HUES.length)] });
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.offsetWidth; H = stage.offsetHeight;
    cv.width = Math.max(1, Math.round(W * DPR));
    cv.height = Math.max(1, Math.round(H * DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!raf) draw(0);
  }

  function draw(t) {
    var k = W / 1920;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var s = 0; s < stars.length; s++) {
      var st = stars[s], tw = Math.pow(0.5 + 0.5 * Math.sin(t * st.sp + st.ph), 3);
      if (tw < 0.05) continue;
      var sr = st.r * k * 2;
      ctx.globalAlpha = tw;
      ctx.fillStyle = 'hsl(' + st.h + ',85%,68%)';
      ctx.beginPath(); ctx.arc(st.x * W, st.y * H, sr, 0, TAU); ctx.fill();
      if (tw > 0.6 && st.r > 1.3) {
        var F = sr * 18;
        ctx.globalAlpha = (tw - 0.6) / 0.4;
        ctx.drawImage(flare(st.h), st.x * W - F / 2, st.y * H - F / 2, F, F);
      }
    }
    for (var i = 0; i < orbs.length; i++) {
      var o = orbs[i];
      var x = o.bx * W + Math.sin(t * o.sx + o.px) * o.ax * k;
      var y = o.by * H + Math.cos(t * o.sy + o.py) * o.ay * k;
      var p = 0.5 + 0.5 * Math.sin(t * o.ps + o.pp);
      var r = o.size * (0.6 + 0.5 * p) * k;
      var D = r * 3.2;
      ctx.globalAlpha = o.op * (0.4 + 0.6 * p);
      ctx.drawImage(sprite(o.h), x - D / 2, y - D / 2, D, D);
      if (p > 0.6) {
        var F2 = r * 8;
        ctx.globalAlpha = Math.min(1, o.op * ((p - 0.6) / 0.4) * 1.3);
        ctx.drawImage(flare(o.h), x - F2 / 2, y - F2 / 2, F2, F2);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (!visible || mq.matches) return;
    draw((now - t0) / 1000);
  }

  build();
  resize();
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; });
  if (!REDUCED) raf = requestAnimationFrame(loop);
})();
