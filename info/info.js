(function(){
  'use strict';

  /*** State ***/
  var state = { code: '', verified: false, tries: 0 };

  /*** Elements ***/
  var chk = document.getElementById('chk');
  var checkBox = document.getElementById('checkBox');
  var captcha = document.getElementById('captcha');
  var canvas = document.getElementById('capCanvas');
  var ctx = canvas.getContext('2d');
  var input = document.getElementById('capInput');
  var btnRefresh = document.getElementById('btnRefresh');
  var btnVerify = document.getElementById('btnVerify');
  var statusText = document.getElementById('statusText');

  /*** Utils ***/
  function rand(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

  /*** Code generation (A–Z, a–z, 2–9; no ambiguous) ***/
  function genCode(){
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    var s = '';
    for (var i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  /*** Draw CAPTCHA on Canvas ***/
  function drawCaptcha(){
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    var w = 500, h = 160;
    canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // background gradient
    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#f8fbff'); grad.addColorStop(1, '#eef2ff');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    // thick dark noise lines
    for (var i = 0; i < 14; i++){
      ctx.lineWidth = rand(3, 6);
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.moveTo(rand(0, w/4), rand(0, h));
      for (var x = 0; x < w; x += rand(40, 90)) { ctx.lineTo(x + rand(-20, 20), rand(0, h)); }
      ctx.stroke();
    }

    // distorted text
    var code = state.code;
    var xPos = 40;
    for (var j = 0; j < code.length; j++){
      var ch = code[j];
      var size = rand(34, 46);
      var angle = rand(-25, 25) * Math.PI / 180;
      var y = rand(h / 2, h - 40);
      ctx.save();
      ctx.translate(xPos, y);
      ctx.rotate(angle);
      ctx.font = '700 ' + size + 'px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
      ctx.fillStyle = pick(['#1f2937', '#111827', '#334155']);
      ctx.shadowColor = 'rgba(0,0,0,.12)';
      ctx.shadowBlur = 2;
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      xPos += size + rand(6, 18);
    }

    // dot noise
    for (var k = 0; k < 300; k++){
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(rand(0, w), rand(0, h), 1, 1);
    }
  }

  function newCaptcha(){
    state.code = genCode();
    drawCaptcha();
  }

  function openCaptcha(){
    captcha.classList.add('open');
    input.value = '';
    statusText.textContent = '미인증 상태입니다.';
    statusText.classList.remove('error');
    newCaptcha();
    setTimeout(function(){ try { input.focus({ preventScroll: true }); } catch(e) { input.focus(); } }, 0);
  }

  function setVerified(ok){
    state.verified = ok;
    chk.checked = ok; chk.disabled = ok;
    checkBox.classList.toggle('checked', ok);
    statusText.classList.remove('error');
    statusText.textContent = ok ? '인증 완료 – 이동합니다…' : '미인증 상태입니다.';
    if (ok) { setTimeout(function(){ window.location.href = '../cctv/cctv.html'; }, 300); }
  }

  function handleVerify(){
    var v = (input.value || '');
    if (v && v === state.code){
      state.tries = 0;
      setVerified(true);
    } else {
      state.tries += 1;
      statusText.textContent = state.tries + '회 틀렸습니다. 다시 시도해주세요.';
      statusText.classList.add('error');
      input.value = '';
      if (state.tries >= 3) { window.location.href = '../login/login.html'; return; }
      newCaptcha();
    }
  }

  /*** Events ***/
  chk.addEventListener('click', function(e){
    if (!state.verified){ e.preventDefault(); openCaptcha(); }
  });

  btnRefresh.addEventListener('click', newCaptcha);
  btnVerify.addEventListener('click', handleVerify);
  input.addEventListener('keydown', function(e){
    if ((e.key === 'Enter' || e.key === 'NumpadEnter') && !e.isComposing && !e.repeat){
      e.preventDefault();
      handleVerify();
    }
  });

  window.addEventListener('resize', function(){ if (captcha.classList.contains('open')) { drawCaptcha(); } });
})();
