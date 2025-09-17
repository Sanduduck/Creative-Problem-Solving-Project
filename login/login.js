/* ========= 유틸: hex 변환 ========= */
function toHex(u8){
  return Array.from(u8).map(b => b.toString(16).padStart(2,'0')).join('');
}
function fromHex(hex){
  if(!hex || hex.length % 2) return new Uint8Array();
  const out = new Uint8Array(hex.length/2);
  for(let i=0;i<out.length;i++){ out[i] = parseInt(hex.substr(i*2,2),16); }
  return out;
}
function genSaltHex(len=16){
  const b = new Uint8Array(len);
  (crypto.getRandomValues ? crypto.getRandomValues(b) : b.fill(0));
  return toHex(b);
}
function constantTimeEqual(a,b){
  if(a.length !== b.length) return false;
  let diff = 0;
  for(let i=0;i<a.length;i++){ diff |= a.charCodeAt(i) ^ b.charCodeAt(i); }
  return diff === 0;
}

/* ========= PBKDF2-SHA256 (Web Crypto) ========= */
async function pbkdf2Hex(password, saltHex, iterations=310000, dkLen=32){
  if(!crypto?.subtle) throw new Error('WEBCRYPTO_UNAVAILABLE');
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name:'PBKDF2', hash:'SHA-256', salt: fromHex(saltHex), iterations },
    baseKey,
    dkLen * 8
  );
  return toHex(new Uint8Array(bits));
}

/* ========= (레거시 호환) SHA-256 단순 해시 ========= */
async function sha256(text){
  if(crypto?.subtle){
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return toHex(new Uint8Array(buf));
  }
  return 'plain:' + text; // 구형 브라우저 매우 취약 (데모용)
}

/* ========= localStorage 래퍼 ========= */
const LS_USERS = 'ae_users_v1';
function loadUsers(){
  try{ const raw = localStorage.getItem(LS_USERS); return raw ? JSON.parse(raw) : {}; }
  catch(e){ console.warn('[users] load fail', e); return {}; }
}
function saveUsers(users){
  try{ localStorage.setItem(LS_USERS, JSON.stringify(users)); }
  catch(e){ console.warn('[users] save fail', e); }
}

function normalizeId(id){ return (id||'').trim(); }

/* ========= 라벨 애니메이션 ========= */
function labelUp(input){ input.parentElement.children[0].classList.add("change_label"); }
function labelDown(input){ if(!input.value.trim()){ input.parentElement.children[0].classList.remove("change_label"); } }

/* ========= 패스워드 보기/숨기기 ========= */
const eye_icon_signup = document.getElementById('eye_icon_signup');
const eye_icon_login  = document.getElementById('eye_icon_login');
const sign_up_password = document.getElementById('signup_password');
const login_password   = document.getElementById('login_password');
if(eye_icon_signup){ eye_icon_signup.addEventListener('click', ()=> toggleEye(eye_icon_signup, sign_up_password)); }
if(eye_icon_login){  eye_icon_login .addEventListener('click', ()=> toggleEye(eye_icon_login , login_password )); }
function toggleEye(eye_icon, password){
  if(!eye_icon || !password) return;
  if(eye_icon.classList.contains("fa-eye-slash")){
    eye_icon.classList.remove('fa-eye-slash'); eye_icon.classList.add('fa-eye'); password.type='text';
  }else{
    eye_icon.classList.remove('fa-eye'); eye_icon.classList.add('fa-eye-slash'); password.type='password';
  }
}

/* ========= 폼 전환 + 모드 클래스 ========= */
const to_signup = document.getElementById('to_signup');
const to_login  = document.getElementById('to_login');

function updateModeClass(){
  const signupHidden = document.getElementById('signup').classList.contains('signup_form');
  document.body.classList.toggle('mode-signup', !signupHidden);
  if (!signupHidden) {
    const hero = document.querySelector('#signup .mobile-hero img');
    if (hero) { hero.loading = 'eager'; hero.src = hero.src; }
  }
}
function let_change(){
  const login  = document.getElementById('login');
  const signup = document.getElementById('signup');
  login.classList.toggle('login_form');
  signup.classList.toggle('signup_form');
  const e1=document.getElementById('login-error'); if(e1) e1.style.display='none';
  const e2=document.getElementById('signup-msg');  if(e2) e2.style.display='none';
  updateModeClass();
}
if(to_signup) to_signup.addEventListener('click', let_change);
if(to_login)  to_login .addEventListener('click', let_change);
document.addEventListener('DOMContentLoaded', updateModeClass);

/* ========= Sign Up (PBKDF2-SHA256 저장) ========= */
(function(){
  const form = document.getElementById('signup_form');
  if(!form) return;

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const fname = normalizeId(document.getElementById('fname').value);
    const lname = normalizeId(document.getElementById('lname').value);
    const email = normalizeId(document.getElementById('email_signup').value);
    const pass  = document.getElementById('signup_password').value || '';
    const cpass = document.getElementById('cpass').value || '';
    const msg   = document.getElementById('signup-msg');

    if(!email || !pass || !cpass){
      msg.textContent = '모든 필드를 입력해주세요.'; msg.style.display='block'; return;
    }
    if(pass.length < 4){
      msg.textContent = '비밀번호는 4자 이상으로 설정해주세요.'; msg.style.display='block'; return;
    }
    if(pass !== cpass){
      msg.textContent = '비밀번호가 일치하지 않습니다.'; msg.style.display='block'; return;
    }

    const users = loadUsers();
    if(users[email]){
      msg.textContent = '이미 존재하는 아이디입니다.'; msg.style.display='block'; return;
    }

    try{
      const saltHex = genSaltHex(16);
      const hashHex = await pbkdf2Hex(pass, saltHex);
      users[email] = {
        email, fname, lname, role:'viewer', createdAt: Date.now(),
        passInfo: { alg:'PBKDF2-SHA256', iter:310000, salt:saltHex, hash:hashHex }
      };
      saveUsers(users);

      localStorage.setItem('ae_role','viewer');
      localStorage.setItem('ae_user', email);

      msg.classList.remove('msg-error');
      msg.classList.add('msg-ok');
      msg.textContent = '계정이 생성되었습니다. 로그인 화면으로 이동하세요.';
      msg.style.display='block';
      setTimeout(()=>{ let_change(); }, 1000);
    }catch(err){
      console.error(err);
      msg.textContent = '이 브라우저는 보안 기능(WebCrypto)을 지원하지 않습니다.'; msg.style.display='block';
    }
  });
})();

/* ========= Sign In (PBKDF2-SHA256 검증 + 레거시 마이그레이션) ========= */
(function(){
  const loginForm = document.getElementById('login_form');
  if(!loginForm) return;

  loginForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const id = normalizeId(document.getElementById('email').value);
    const pw = document.getElementById('login_password').value || '';
    const err = document.getElementById('login-error');

    if(!id || !pw){
      err.textContent = '아이디와 비밀번호를 입력하세요.'; err.style.display='block'; return;
    }

    // 관리자 특례
    if(id === 'admin' && pw === 'admin'){
      localStorage.setItem('ae_role','admin');
      localStorage.setItem('ae_user', id);
      err.style.display = 'none';
      window.location.href = '../info/info.html';
      return;
    }

    const users = loadUsers();
    const u = users[id];
    if(!u){ err.textContent = '존재하지 않는 아이디입니다.'; err.style.display='block'; return; }

    try{
      if (u.passInfo && u.passInfo.alg === 'PBKDF2-SHA256'){
        const want = await pbkdf2Hex(pw, u.passInfo.salt, u.passInfo.iter || 310000, 32);
        if(!constantTimeEqual(want, u.passInfo.hash)){
          err.textContent = '비밀번호가 올바르지 않습니다.'; err.style.display='block'; return;
        }
      } else {
        // 레거시(sha256 또는 plain:) 지원 → 성공 시 즉시 PBKDF2로 업그레이드
        const legacy = await sha256(pw);
        if (legacy !== u.passwordHash){
          err.textContent = '비밀번호가 올바르지 않습니다.'; err.style.display='block'; return;
        }
        const saltHex = genSaltHex(16);
        const hashHex = await pbkdf2Hex(pw, saltHex, 310000, 32);
        u.passInfo = { alg:'PBKDF2-SHA256', iter:310000, salt:saltHex, hash:hashHex };
        delete u.passwordHash;
        saveUsers(users);
      }

      localStorage.setItem('ae_role', u.role || 'viewer');
      localStorage.setItem('ae_user', u.email);
      err.style.display = 'none';
      window.location.href = '../info/info.html';
    }catch(err2){
      console.error(err2);
      err.textContent = '이 브라우저는 보안 기능(WebCrypto)을 지원하지 않습니다.'; err.style.display='block';
    }
  });
})();

/* ========= ⚠ 서버 전용(예시) Mongoose 코드 =========
   원본에 있던 require('mongoose')는 브라우저에서 동작하지 않습니다.
   아래 블록은 'window가 없고 require가 있는' 서버(Node) 환경에서만 실행됩니다.
   프론트엔드와 분리된 백엔드 파일로 옮기는 것을 권장합니다. */
(async function(){
  if (typeof window === 'undefined' && typeof require === 'function') {
    try {
      const mongoose = require('mongoose');
      const uri = 'mongodb+srv://admin1234:YOUR_PASSWORD@cluster0.zab9dwo.mongodb.net/mydb?retryWrites=true&w=majority';

      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('MongoDB 연결 성공!');

      const testSchema = new (require('mongoose')).Schema({ name: String, age: Number });
      const Test = mongoose.model('Test', testSchema);

      const doc = new Test({ name: 'Alice', age: 25 });
      await doc.save();
      console.log('문서 추가 완료:', doc);

      const docs = await Test.find();
      console.log('현재 DB 문서:', docs);

      await mongoose.connection.close();
    } catch (err) {
      console.error('서버 전용 Mongoose 예시 실행 실패:', err);
    }
  }
})();
