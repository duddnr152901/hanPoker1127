/* kv-parallax.js — KV 레이어 패럴랙스 (마우스 + 스크롤). 인트로는 CSS(.kv.is-in) */
(function () {
  'use strict';
  var kv = document.getElementById('kv');
  var stage = document.getElementById('kvStage');
  if (!kv || !stage) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mq = window.matchMedia('(max-width: 768px)');
  if (reduce) return;

  var layers = [].slice.call(stage.querySelectorAll('.kvl')).map(function (el) {
    return { el: el, d: parseFloat(el.dataset.depth) || 0 };
  });
  var tx = 0, ty = 0, cx = 0, cy = 0, sy = 0, raf = null;

  function onMove(e) {
    var r = kv.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    kick();
  }
  function onLeave() { tx = 0; ty = 0; kick(); }
  function onScroll() { sy = Math.min(window.scrollY || 0, window.innerHeight * 1.2); kick(); }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }
  function tick() {
    raf = null;
    if (document.body.classList.contains('kv-edit')) return;
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      var x = -cx * L.d * 28;
      var y = -cy * L.d * 16 - sy * L.d * 0.35;
      L.el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
    }
    if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) kick();
  }
  function bind() {
    if (mq.matches) return;
    kv.addEventListener('mousemove', onMove);
    kv.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  bind();
  window.addEventListener('kv-edit-change', function () {
    if (!document.body.classList.contains('kv-edit')) kick();
  });
})();
