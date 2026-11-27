/* page.js — 한게임포커 × 피카플레이 이벤트
   ① KV 인트로(이미지 줌아웃 + 락업 페이드업) — 제우스 kv-intro.js 방식, 연기/스크롤 전환 없음
   ② 스크롤 reveal — 제우스 reveal.js 방식(모바일·모션 감소 시 즉시 표시), jQuery 없이 동작
   ③ 백엔드 연동용 상태 API : window.PokerEvent
   ④ 검토용 미리보기 도구(?review=1 일 때만) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

  /* ---------- ① KV 인트로 ---------- */
  var kv = document.getElementById('kv');
  if (kv) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { kv.classList.add('is-in'); });
    });
  }

  /* ---------- ② reveal ---------- */
  var targets = document.querySelectorAll('.reveal');
  if (targets.length && !isMobile && !reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---------- ③ 상태 API ---------- */
  var step1 = document.getElementById('step1');
  var STEP1_STATES = ['guest', 'login', 'linked'];

  // [BACKEND] 로그인/연동 상태 확인 후 호출 : PokerEvent.setStep1State('guest' | 'login' | 'linked')
  function setStep1State(state) {
    if (!step1 || STEP1_STATES.indexOf(state) === -1) return;
    step1.setAttribute('data-state', state);
    syncReview();
  }

  // [BACKEND] 완료한 미션 번호 배열로 호출 : PokerEvent.setMissionsDone([1, 3])
  function setMissionsDone(list) {
    var done = (list || []).map(String);
    Array.prototype.forEach.call(document.querySelectorAll('.mission[data-mission]'), function (el) {
      el.classList.toggle('is-done', done.indexOf(el.getAttribute('data-mission')) !== -1);
    });
    syncReview();
  }

  function getMissionsDone() {
    return Array.prototype.map.call(document.querySelectorAll('.mission.is-done'), function (el) {
      return Number(el.getAttribute('data-mission'));
    });
  }

  // [BACKEND] 버튼 클릭 동작 연결 — 기본은 콘솔 로그만(STEP 02는 링크 이동 유지)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (typeof window.PokerEvent.onAction === 'function') {
      window.PokerEvent.onAction(action, e);
    }
  });

  window.PokerEvent = {
    setStep1State: setStep1State,
    setMissionsDone: setMissionsDone,
    getMissionsDone: getMissionsDone,
    onAction: null
  };

  /* ---------- ④ 검토용 미리보기 도구 ---------- */
  var tool = document.getElementById('reviewTool');
  var reviewOn = /[?&]review=1\b/.test(window.location.search);

  function syncReview() {
    if (!tool || tool.hidden) return;
    var state = step1 ? step1.getAttribute('data-state') : '';
    Array.prototype.forEach.call(tool.querySelectorAll('[data-step1]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-step1') === state));
    });
    var done = getMissionsDone().map(String);
    Array.prototype.forEach.call(tool.querySelectorAll('[data-mission-toggle]'), function (b) {
      b.setAttribute('aria-pressed', String(done.indexOf(b.getAttribute('data-mission-toggle')) !== -1));
    });
  }

  if (tool && reviewOn) {
    tool.hidden = false;
    tool.addEventListener('click', function (e) {
      var s = e.target.getAttribute('data-step1');
      if (s) { setStep1State(s); return; }
      var m = e.target.getAttribute('data-mission-toggle');
      if (m) {
        var done = getMissionsDone();
        var n = Number(m);
        var i = done.indexOf(n);
        if (i === -1) done.push(n); else done.splice(i, 1);
        setMissionsDone(done);
      }
    });
    syncReview();
  } else if (tool) {
    tool.parentNode.removeChild(tool);
    tool = null;
  }
})();
