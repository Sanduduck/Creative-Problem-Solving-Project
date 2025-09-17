// ===================== cctv.html - JavaScript only (with minimal notification addition) =====================

/* ====== 공통 팝업 유틸: alert → 커스텀 팝업으로 표시, confirm 대체 제공 ====== */
(function(){
  function showPopup(message, opts={}) {
    const { title = '', okText = '확인', closeOnBackdrop = true, zIndex = 10050 } = opts;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
      background:rgba(0,0,0,.35); z-index:${zIndex}; padding:16px;
    `;

    const box = document.createElement('div');
    box.classList.add('popup-box');

    if (title) {
      const h = document.createElement('div');
      h.textContent = title;
      h.style.cssText = 'font-weight:700; font-size:18px; margin-bottom:8px;';
      box.appendChild(h);
    }

    const msg = document.createElement('div');
    msg.textContent = String(message ?? '');
    msg.style.cssText = 'white-space:pre-wrap; word-break:break-word; margin:6px 0 16px;';
    box.appendChild(msg);

    const btn = document.createElement('button');
    btn.textContent = okText;
    btn.style.cssText = `
      padding:10px 18px; border:none; border-radius:10px; background:#000; color:#fff;
      font-size:14px; cursor:pointer; min-width:96px;
    `;
    btn.addEventListener('click', () => { try { document.body.removeChild(overlay); } catch(_) {} });
    box.appendChild(btn);

    overlay.appendChild(box);
    if (closeOnBackdrop) {
      overlay.addEventListener('click', (e)=>{ if (e.target === overlay) { try { document.body.removeChild(overlay); } catch(_) {} }});
    }
    document.body.appendChild(overlay);
    btn.focus?.();
  }

  function showConfirm(message, opts={}) {
    return new Promise((resolve)=>{
      const { title = '', okText = '확인', cancelText = '취소', zIndex = 10050 } = opts;

      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
        background:rgba(0,0,0,.35); z-index:${zIndex}; padding:16px;
      `;

      const box = document.createElement('div');
      box.style.cssText = `
        background:#fff; border-radius:14px; padding:20px 22px; max-width:520px; width:100%;
        box-shadow:0 12px 36px rgba(0,0,0,.25); text-align:center; font-size:16px; line-height:1.6;
      `;

      if (title) {
        const h = document.createElement('div');
        h.textContent = title;
        h.style.cssText = 'font-weight:700; font-size:18px; margin-bottom:8px;';
        box.appendChild(h);
      }

      const msg = document.createElement('div');
      msg.textContent = String(message ?? '');
      msg.style.cssText = 'white-space:pre-wrap; word-break:break-word; margin:6px 0 16px;';
      box.appendChild(msg);

      const row = document.createElement('div');
      row.style.cssText = 'display:flex; gap:8px; justify-content:center;';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = cancelText;
      cancelBtn.style.cssText = `
        padding:10px 18px; border:1px solid #ddd; border-radius:10px; background:#fff; color:#333;
        font-size:14px; cursor:pointer; min-width:96px;
      `;

      const okBtn = document.createElement('button');
      okBtn.textContent = okText;
      okBtn.style.cssText = `
        padding:10px 18px; border:none; border-radius:10px; background:#000; color:#fff;
        font-size:14px; cursor:pointer; min-width:96px;
      `;

      cancelBtn.onclick = ()=>{ try{ document.body.removeChild(overlay);}catch(_){} resolve(false); };
      okBtn.onclick     = ()=>{ try{ document.body.removeChild(overlay);}catch(_){} resolve(true);  };

      row.appendChild(cancelBtn);
      row.appendChild(okBtn);
      box.appendChild(row);

      overlay.appendChild(box);
      overlay.addEventListener('click', (e)=>{ if(e.target===overlay){ cancelBtn.click(); }});
      document.body.appendChild(overlay);
      okBtn.focus?.();
    });
  }

  window.showPopup = showPopup;
  window.showConfirm = showConfirm;

  const _origAlert = window.alert ? window.alert.bind(window) : null;
  window.alert = function(msg){
    try { showPopup(msg); } catch(e){ _origAlert && _origAlert(msg); }
  };

  // ✅ showNotice도 동일 팝업 스타일로 통일 (동작 동일, 표시만 팝업)
  window.showNotice = (m)=> showPopup(m);
})();

/* ====== 이하 기존 JS 원본 유지 ====== */

const DEFAULT_STREAM_URL = 'http://192.168.137.98:5002/video_feed';

const regionData = {};

let regionOrder = Object.keys(regionData);
let regionSortMode = 'insert';
let currentRegion = null;
const markersById = new Map();

const map = L.map('map').setView([37.5665, 126.9780], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const blackIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:[25,41], iconAnchor:[12,41], popupAnchor:[1,-34], shadowSize:[41,41]
});
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:[25,41], iconAnchor:[12,41], popupAnchor:[1,-34], shadowSize:[41,41]
});

/* ===== [NEW] Stream state + Notification helper (JS-only, minimal addition) ===== */
const _streamStateById = new Map(); // id -> 'connected' | 'disconnected'
function _notify(title, body) {
  try {
    if (!('Notification' in window)) { showNotice(body); return; }
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '../images/logo2.png' });
      return;
    }
    if (Notification.permission !== 'denied') {
      Notification.requestPermission()
        .then(perm => {
          if (perm === 'granted') new Notification(title, { body, icon: '../images/logo2.png' });
          else showNotice(body);
        })
        .catch(() => showNotice(body));
      return;
    }
    showNotice(body);
  } catch { showNotice(body); }
}
/* ===== End of minimal addition ===== */

function getRole(){ return localStorage.getItem('ae_role') === 'admin' ? 'admin' : 'viewer'; }
function isAdmin(){ return getRole() === 'admin'; }

function applyRoleUI() {
  const admin = isAdmin();
  document.querySelectorAll('.forms input, .forms select, .forms .btn').forEach(el=>{ el.disabled = !admin; });
  document.querySelectorAll('.delete-btn').forEach(btn=>{ btn.style.display = admin ? '' : 'none'; });
}

function normalizeName(s){
  return (s ?? '').toString().normalize('NFKC').toLowerCase().replace(/\s+/g, '');
}
function regionExists(name){
  const t = normalizeName(name);
  return Object.keys(regionData).some(r => normalizeName(r) === t);
}
function droneNameExists(name){
  const t = normalizeName(name);
  for (const region in regionData){
    const drones = regionData[region] || [];
    if (drones.some(d => normalizeName(d.name) === t)) return true;
  }
  return false;
}

function addDroneToMap(drone) {
  const marker = L.marker([drone.lat, drone.lng], { icon: blackIcon }).addTo(map);
  marker.on('click', () => {
    displayDroneInfo(drone);
    map.setView([drone.lat, drone.lng], 18);
  });
  markersById.set(drone.id, marker);
}
function removeDroneFromMap(droneId) {
  const marker = markersById.get(droneId);
  if (marker) { map.removeLayer(marker); markersById.delete(droneId); }
}
function onStreamConnected(drone) {
  const m = markersById.get(drone.id);
  if (m) m.setIcon(redIcon);
}
function onStreamDisconnected(drone) {
  const m = markersById.get(drone.id);
  if (m) m.setIcon(blackIcon);
}

function getRegionList() {
  const names = Object.keys(regionData);
  if (regionSortMode === 'insert') {
    const extra = names.filter(n => !regionOrder.includes(n));
    return [...regionOrder, ...extra];
  }
  if (regionSortMode === 'insertDesc') {
    const base = getRegionListForInsertOnly();
    return base.slice().reverse();
  }
  if (regionSortMode === 'alpha') {
    return names.slice().sort((a,b)=>a.localeCompare(b, 'ko'));
  }
  if (regionSortMode === 'alphaDesc') {
    return names.slice().sort((a,b)=>b.localeCompare(a, 'ko'));
  }
  return names;
}
function getRegionListForInsertOnly() {
  const names = Object.keys(regionData);
  const extra = names.filter(n => !regionOrder.includes(n));
  return [...regionOrder, ...extra];
}

function renderRegionNames() {
  const list = document.getElementById('drone-list');
  list.innerHTML = '';
  const regions = getRegionList();
  regions.forEach(region => {
    const li = document.createElement('li');
    li.className = 'drone-item';
    li.innerHTML = `
      <span class="drone-name">${region}</span>
      <button class="delete-btn" title="Delete Region">×</button>
    `;
    li.querySelector('.drone-name').onclick = () => displayRegion(region);
    li.querySelector('.delete-btn').onclick = (e) => {
      e.stopPropagation();
      deleteRegion(region);
    };
    list.appendChild(li);
  });

  document.querySelectorAll('.sort-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.mode === regionSortMode);
  });
  applyRoleUI();
}

function renderRegionList(region) {
  const list = document.getElementById('drone-list');
  list.innerHTML = '';
  (regionData[region] || []).forEach(drone => {
    const li = document.createElement('li');
    li.className = 'drone-item';
    li.innerHTML = `
      <span class="drone-name">${drone.name}</span>
      <button class="delete-btn" title="Delete">×</button>
    `;
    li.querySelector('.drone-name').onclick = () => {
      displayDroneInfo(drone);
      map.setView([drone.lat, drone.lng], 18);
    };
    li.querySelector('.delete-btn').onclick = (e) => {
      e.stopPropagation();
      deleteDrone(region, drone.id);
    };
    list.appendChild(li);
  });
  applyRoleUI();
}

// displayRegion
function displayRegion(region) {
  currentRegion = region;
  renderRegionList(region);
  document.getElementById('back-button').style.display = 'block';

  const drones = regionData[region] || [];
  if (drones.length > 0) {
    const bounds = L.latLngBounds(drones.map(d => [d.lat, d.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }
}

function getStreamUrl(drone) {
  const base = drone.stream || DEFAULT_STREAM_URL;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}_t=${Date.now()}`;
}

function displayDroneInfo(drone) {
  const display = document.getElementById('drone-display');
  const streamUrl = getStreamUrl(drone);

  display.innerHTML = `
    <p>${drone.name} <img src="../images/logo2.png" alt="logo" class="inline-logo" /> (${drone.lat}, ${drone.lng})</p>
    <img src="${streamUrl}" id="cctv-image" alt="Live CCTV Stream" crossorigin="anonymous" />
  `;

  document.getElementById('back-button').style.display = 'block';

  const img = document.getElementById('cctv-image');

  // ✅ displayDroneInfo(drone) 안에서 img 이벤트 등록 부분 교체
  img.addEventListener('load', () => {
    const streamBase = streamUrl.split('?')[0];
    const imgSrcBase = (img.currentSrc || img.src).split('?')[0];
    const isRealStream = imgSrcBase.indexOf(streamBase) === 0;

    if (isRealStream) {
      onStreamConnected(drone);
      if (_streamStateById.get(drone.id) !== 'connected') {
        _notify('드론 스트림 연결', `${drone.name}의 실시간 영상이 연결되었습니다.`);
      }
      _streamStateById.set(drone.id, 'connected');
    }
  });

  img.addEventListener('error', () => {
    showNotice('스트림에 연결할 수 없습니다. (임시 이미지로 표시)');
    img.src = '../images/cctv.png';
    onStreamDisconnected(drone);
    _streamStateById.set(drone.id, 'disconnected');
  }, { once: true });

  img.addEventListener('click', (e) => {
    if (!img.classList.contains('cctv-expanded')) {
      toggleCCTVZoom();
      return;
    }
    window.location.href = '../screen/screen.html';
  });

}

function toggleCCTVZoom() {
  const img = document.getElementById('cctv-image');
  const overlay = document.querySelector('.cctv-overlay');

  if (img.classList.contains('cctv-expanded')) {
    img.classList.remove('cctv-expanded');
    stopRecorder();
    removeControls();
    if (overlay) overlay.remove();
  } else {
    img.classList.add('cctv-expanded');
    if (!overlay) {
      const newOverlay = document.createElement('div');
      newOverlay.className = 'cctv-overlay';
      newOverlay.onclick = toggleCCTVZoom;
      document.body.appendChild(newOverlay);
    }
    createControlsForImage(img);
    startRecorderFromImage(img);
  }
}

function createControlsForImage(img) {
  removeControls();

  const controls = document.createElement('div');
  controls.id = 'cctv-controls';
  controls.className = 'cctv-controls';
  controls.innerHTML = `   
    <button type="button" class="cctv-btn" id="btn-capture">캡쳐</button>
    <button type="button" class="cctv-btn" id="btn-save">지금까지 녹화 저장</button>
  `;
  controls.addEventListener('click', e => e.stopPropagation());
  controls.addEventListener('mousedown', e => e.stopPropagation());
  document.body.appendChild(controls);

  positionControls(img, controls);
  requestAnimationFrame(() => positionControls(img, controls));

  controls._onResize = () => positionControls(img, controls);
  window.addEventListener('resize', controls._onResize);
  window.addEventListener('scroll', controls._onResize, { passive: true });

  controls._onTransitionEnd = (e) => {
    if (e.propertyName === 'transform') positionControls(img, controls);
  };
  img.addEventListener('transitionend', controls._onTransitionEnd);

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => positionControls(img, controls));
    ro.observe(img);
    controls._ro = ro;
  }

  controls._settleTimer = setTimeout(() => positionControls(img, controls), 450);

  document.getElementById('btn-capture').onclick = (e)=>{ 
    e.stopPropagation(); 
    captureCurrentFrameEncrypted(); 
  };
  document.getElementById('btn-save').onclick = async (e)=>{
    e.stopPropagation();
    try { await saveRecordingEncrypted(); } catch(err){ console.error(err); }
  };
}

function positionControls(img, controls) {
  if (!img || !controls) return;
  const r = img.getBoundingClientRect();
  controls.style.left = '50%';
  const top = Math.min(
    window.innerHeight - (controls.offsetHeight || 0) - 12,
    r.bottom + 12
  );
  controls.style.top = `${Math.max(12, top)}px`;
}

function removeControls() {
  const controls = document.getElementById('cctv-controls');
  if (!controls) return;
  window.removeEventListener('resize', controls._onResize);
  window.removeEventListener('scroll', controls._onResize);
  const img = document.getElementById('cctv-image');
  if (img && controls._onTransitionEnd) {
    img.removeEventListener('transitionend', controls._onTransitionEnd);
  }
  if (controls._ro && controls._ro.disconnect) {
    controls._ro.disconnect();
  }
  if (controls._settleTimer) {
    clearTimeout(controls._settleTimer);
  }
  controls.remove();
}

function deleteDrone(region, id) {
  if (!isAdmin()) { showNotice('권한이 없습니다. (관리자 전용)'); return; }
  regionData[region] = (regionData[region] || []).filter(d => d.id !== id);
  removeDroneFromMap(id);
  renderRegionList(region);
  document.getElementById('drone-display').innerHTML = '';
  saveAll();
}

function deleteRegion(region) {
  if (!isAdmin()) { showNotice('권한이 없습니다. (관리자 전용)'); return; }
  (regionData[region] || []).forEach(drone => removeDroneFromMap(drone.id));
  delete regionData[region];
  regionOrder = regionOrder.filter(r => r !== region);
  if (currentRegion === region) {
    currentRegion = null;
    document.getElementById('back-button').style.display = 'none';
    document.getElementById('drone-display').innerHTML = '';
  }
  renderRegionNames();
  updateRegionDropdown();
  saveAll();
}

function goBack() {
  currentRegion = null;
  document.getElementById('drone-display').innerHTML = '';
  renderRegionNames();
  document.getElementById('back-button').style.display = 'none';
}

function searchDrone() {
  const input = document.getElementById('search-bar').value.trim();
  if (!input) {
    alert('Please enter a drone ID or name.');
    return;
  }

  const numericId = parseInt(input);
  let found = null;

  if (!isNaN(numericId)) {
    for (const region in regionData) {
      found = (regionData[region] || []).find(d => d.id === numericId);
      if (found) break;
    }
  }

  if (!found) {
    const normalizedInput = normalizeName(input);
    for (const region in regionData) {
      found = (regionData[region] || []).find(d => normalizeName(d.name) === normalizedInput);
      if (found) break;
    }
  }

  if (found) {
    displayDroneInfo(found);
    map.setView([found.lat, found.lng], 18);
    document.getElementById('back-button').style.display = 'block';
  } else {
    alert('Not found');
  }
}

function checkEnter(e) { if (e.key === 'Enter') searchDrone(); }

function getNextDroneId() {
  let max = 0;
  for (const region in regionData) {
    (regionData[region] || []).forEach(d => { if (d.id > max) max = d.id; });
  }
  return max + 1;
}

// showNotice는 위에서 팝업으로 대체됨 (기능 유지, 표시만 통일)

/* ===== 기존 addDrone() 교체 버전 (지역명-좌표 불일치 시 추가 중단) ===== */
async function addDrone() {
  if (!isAdmin()) { showNotice('권한이 없습니다. (관리자 전용)'); return; }

  const name   = (document.getElementById('add-name').value || '').trim();
  const latStr = document.getElementById('add-lat').value;
  const lngStr = document.getElementById('add-lng').value;
  const region = document.getElementById('add-region').value;
  const err    = document.getElementById('add-error');

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (!name || isNaN(lat) || isNaN(lng) || !region) {
    err.innerText = 'Fill all fields';
    err.style.display = 'block';
    return;
  }
  if (droneNameExists(name)) {
    err.innerText = '이미 같은 이름의 드론이 존재합니다.';
    err.style.display = 'block';
    return;
  }

  try {
    const inferred = await getRegionNameFromCoords(lat, lng);
    if (inferred) {
      const selNorm = normalizeName(region);
      const infNorm = normalizeName(inferred);
      if (selNorm !== infNorm) {
        err.innerText = `현재 좌표는 '${inferred}'(으)로 인식됩니다. 선택한 지역과 다릅니다.`;
        err.style.display = 'block';
        return;
      }
    } else {
      err.innerText = '좌표로부터 지역을 확인할 수 없습니다. 좌표를 다시 선택하거나 지역을 확인해주세요.';
      err.style.display = 'block';
      return;
    }
  } catch (e) {
    err.innerText = '지역 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    err.style.display = 'block';
    return;
  }

  err.style.display = 'none';
  const newDrone = { id: getNextDroneId(), name, lat, lng };
  (regionData[region] || (regionData[region] = [])).push(newDrone);

  addDroneToMap(newDrone);
  if (currentRegion === region) renderRegionList(region); else renderRegionNames();

  showNotice('드론이 추가되었습니다.');
  document.getElementById('add-name').value = '';
  document.getElementById('add-lat').value  = '';
  document.getElementById('add-lng').value  = '';

  saveAll();
}

function addRegion() {
  if (!isAdmin()) { showNotice('권한이 없습니다. (관리자 전용)'); return; }
  const name = (document.getElementById('region-name').value || '').trim();
  const err  = document.getElementById('region-error');

  if (!name) { err.innerText = 'Region name is required'; err.style.display = 'block'; return; }
  if (regionExists(name)) { err.innerText = '이미 추가된 지역입니다.'; err.style.display = 'block'; return; }

  err.style.display = 'none';
  regionData[name] = [];
  regionOrder.push(name);
  renderRegionNames();
  updateRegionDropdown();
  document.getElementById('region-name').value = '';
  saveAll();
}

function updateRegionDropdown() {
  const sel = document.getElementById('add-region');
  sel.innerHTML = '';
  Object.keys(regionData).forEach(r => {
    const opt = document.createElement('option');
    opt.value = r; opt.innerText = r; sel.appendChild(opt);
  });
}

document.getElementById('decode-btn')?.addEventListener('click', () => {
  window.location.href = '../en&decode/en%26decode.html';
});

document.getElementById('sort-controls').addEventListener('click', (e)=>{
  const btn = e.target.closest('.sort-btn');
  if (!btn) return;
  regionSortMode = btn.dataset.mode;
  renderRegionNames();
});

const LS_KEYS = {
  data:  'ae_regionData_v1',
  order: 'ae_regionOrder_v1'
};

function saveAll(){
  try{
    localStorage.setItem(LS_KEYS.data,  JSON.stringify(regionData));
    localStorage.setItem(LS_KEYS.order, JSON.stringify(regionOrder));
  }catch(e){ console.warn('[persist] save failed', e); }
}

function loadAll(){
  try{
    const d = localStorage.getItem(LS_KEYS.data);
    const o = localStorage.getItem(LS_KEYS.order);
    if (d){
      const parsed = JSON.parse(d);
      if (parsed && typeof parsed === 'object'){
        Object.keys(regionData).forEach(k => delete regionData[k]);
        Object.keys(parsed).forEach(k => regionData[k] = parsed[k]);
      }
    }
    if (o){
      const arr = JSON.parse(o);
      if (Array.isArray(arr)) regionOrder = arr;
    }
  }catch(e){ console.warn('[persist] load failed', e); }
}

window.onload = () => {
  loadAll();
  renderRegionNames();
  for (const region in regionData) {
    (regionData[region] || []).forEach(drone => addDroneToMap(drone));
  }
  updateRegionDropdown();
  applyRoleUI();

  const _regionNameInput = document.getElementById('region-name');
  if (_regionNameInput) {
    _regionNameInput.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') { e.preventDefault(); addRegion(); }});
  }
  ['add-name','add-lat','add-lng','add-region'].forEach(id=>{
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') { e.preventDefault(); addDrone(); }});
  });
};

/* ===== Recording / Capture + Encryption ===== */
const MAGIC = new TextEncoder().encode('VIDENC01');
const ALG_ID = 1;
const DEFAULT_ITERS = 310000;

function u32(n){ const b=new Uint8Array(4); new DataView(b.buffer).setUint32(0,n,true); return b; }
function concatBytes(...arrs){
  let len=0; for(const a of arrs) len+=a.byteLength||a.length;
  const out=new Uint8Array(len); let off=0;
  for(const a of arrs){ const v=a instanceof Uint8Array? a : new Uint8Array(a); out.set(v, off); off+=v.byteLength; }
  return out;
}
async function deriveKey(password, salt, iterations=DEFAULT_ITERS){
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', hash:'SHA-256', salt, iterations },
    keyMaterial,
    { name:'AES-GCM', length:256 },
    false,
    ['encrypt','decrypt']
  );
}
async function encryptBlobToVenc(blob, filename, password){
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await deriveKey(password, salt, DEFAULT_ITERS);

  const pt   = new Uint8Array(await blob.arrayBuffer());
  const ct   = new Uint8Array(await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, pt));

  const enc = new TextEncoder();
  const nameBytes = enc.encode(filename || 'capture.png');
  const mimeBytes = enc.encode(blob.type || 'image/png');

  const header = concatBytes(
    MAGIC,
    u32(ALG_ID), u32(DEFAULT_ITERS),
    u32(salt.byteLength), u32(iv.byteLength),
    u32(nameBytes.byteLength), u32(mimeBytes.byteLength),
    salt, iv, nameBytes, mimeBytes
  );
  return new Blob([header, ct], { type:'application/octet-stream' });
}

function askPassword(purposeText){
  const pw = prompt(`${purposeText}에 사용할 비밀번호를 입력하세요\n(en&decode.html에서 복호화 시 동일 비밀번호 필요)`);
  if (!pw) {
    showNotice('암호가 필요합니다.');
    throw new Error('password_cancelled');
  }
  return pw;
}

const rec = { canvas:null, ctx:null, stream:null, recorder:null, chunks:[], rafId:null };

function supportsMime(m){
  return typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m);
}

function startRecorderFromImage(img){
  stopRecorder();
  if(!img || !img.complete || img.naturalWidth === 0){
    showNotice('이미지 로딩 중입니다. 잠시 후 다시 시도하세요.');
    return;
  }
  const cw = img.naturalWidth, ch = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d', { willReadFrequently:true });

  function draw(){
    try{ ctx.drawImage(img, 0, 0, cw, ch); }
    catch(e){ console.error('drawImage error (CORS?)', e); showNotice('CORS 문제로 녹화/캡처가 제한됩니다. 서버에 Access-Control-Allow-Origin 헤더를 설정하세요.'); stopRecorder(); return; }
    rec.rafId = requestAnimationFrame(draw);
  }
  rec.canvas = canvas; rec.ctx = ctx;
  const stream = canvas.captureStream(30); rec.stream = stream;
  let mime = 'video/webm;codecs=vp9'; if (!supportsMime(mime)) mime = 'video/webm;codecs=vp8'; if (!supportsMime(mime)) mime = 'video/webm';
  try{
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
    recorder.ondataavailable = (e)=>{ if(e.data && e.data.size>0) rec.chunks.push(e.data); };
    recorder.start(1000); rec.recorder = recorder; draw();
  }catch(e){ console.error('MediaRecorder 시작 실패', e); showNotice('브라우저가 MediaRecorder를 지원하지 않거나 권한 문제가 있습니다.'); stopRecorder(); }
}

function stopRecorder(){
  try{
    if(rec.rafId){ cancelAnimationFrame(rec.rafId); rec.rafId = null; }
    if(rec.recorder && rec.recorder.state !== 'inactive'){ rec.recorder.stop(); }
    if(rec.stream){ rec.stream.getTracks().forEach(t=>t.stop()); }
  }catch(e){}
  rec.recorder = null; rec.stream = null; rec.canvas = null; rec.ctx = null;
}

async function captureCurrentFrameEncrypted(){
  try{
    const img = document.getElementById('cctv-image');
    if(!img){ showNotice('이미지가 없습니다.'); return; }
    if(!img.complete || img.naturalWidth === 0){ showNotice('프레임 로딩 중입니다. 잠시 후 다시 시도하세요.'); return; }

    const canvas = document.createElement('canvas');
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently:true });
    try{ ctx.drawImage(img, 0, 0); }
    catch(e){ console.error('drawImage error (CORS?)', e); showNotice('CORS 문제로 캡처가 제한됩니다. 서버에 CORS 헤더를 설정하세요.'); return; }

    const pngBlob = await new Promise((resolve)=> canvas.toBlob(resolve, 'image/png', 0.92));
    if(!pngBlob){ showNotice('캡처 실패(캔버스)'); return; }

    const pw = askPassword('캡처 파일 암호화');
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    const baseName = `capture_${ts}.png`;
    const vencBlob = await encryptBlobToVenc(pngBlob, baseName, pw);

    const a = document.createElement('a');
    a.href = URL.createObjectURL(vencBlob);
    a.download = baseName + '.venc';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    showNotice('캡처 저장 완료(암호화).');
  }catch(err){
    if (err?.message !== 'password_cancelled') { console.error(err); showNotice('캡처 오류: ' + (err?.message || String(err))); }
  }
}

async function saveRecordingEncrypted(){
  try{
    if (!rec) { showNotice('녹화 상태가 없습니다.'); return; }
    await new Promise(resolve=>{
      if (rec.recorder && rec.recorder.state !== 'inactive') { rec.recorder.onstop = resolve; try { rec.recorder.stop(); } catch(e){ resolve(); } }
      else { resolve(); }
    });

    const blob = new Blob(rec.chunks.slice(), { type:'video/webm' });
    rec.chunks.length = 0;

    if (!blob || blob.size === 0) {
      showNotice('저장할 녹화 데이터가 없습니다.');
      const img = document.getElementById('cctv-image');
      if (img) startRecorderFromImage(img);
      return;
    }

    const pw = askPassword('녹화 파일 암호화');
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    const baseName = `record_${ts}.webm`;
    const vencBlob = await encryptBlobToVenc(blob, baseName, pw);

    const a = document.createElement('a');
    a.href = URL.createObjectURL(vencBlob);
    a.download = baseName + '.venc';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    showNotice('녹화 저장 완료(암호화).');

    const img = document.getElementById('cctv-image');
    if (img) startRecorderFromImage(img);
  }catch(err){
    if (err?.message !== 'password_cancelled') { console.error(err); showNotice('녹화 저장 오류: ' + (err?.message || String(err))); }
  }
}

/* ===== Reverse Geocoding (global) ===== */
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT_CONTACT = 'DroneCCTVViewer/1.0 (your-email@example.com)';

const _revCache = new Map();
function _cacheKey(lat, lng) {
  const kLat = (Math.round(lat * 20000) / 20000).toFixed(5);
  const kLng = (Math.round(lng * 20000) / 20000).toFixed(5);
  return `${kLat},${kLng}`;
}

async function getRegionNameFromCoords(lat, lng) {
  const key = _cacheKey(lat, lng);
  if (_revCache.has(key)) return _revCache.get(key);

  const url = `${NOMINATIM_BASE}?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=10&accept-language=ko`;
  let region = null;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT_CONTACT } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const addr = data.address || {};

    const cityLike = addr.city || addr.municipality || addr.town || addr.city_district || addr.county || addr.region;
    const stateLike = addr.state || addr.province;
    region = normalizeKoreanRegion(cityLike || stateLike || null);
  } catch (e) {
    console.warn('Reverse geocode failed:', e);
  }
  _revCache.set(key, region);
  return region;
}

function normalizeKoreanRegion(name) {
  if (!name || typeof name !== 'string') return null;
  let s = name.trim();

  s = s.replace(/특별시$/,'')
       .replace(/광역시$/,'')
       .replace(/특별자치시$/,'')
       .replace(/특별자치도$/,'')
       .replace(/자치시$/,'')
       .replace(/자치도$/,'')
       .replace(/도$/,'')
       .replace(/시$/,'')
       .replace(/군$/,'')
       .replace(/구$/,'');

  const map = { '서울':'서울','부산':'부산','대전':'대전','대구':'대구','광주':'광주','인천':'인천','울산':'울산','세종':'세종','제주':'제주' };
  if (map[s]) return map[s];
  return s || name;
}

// ======= Map coordinate pick handler (desktop: right-click, mobile: tap) =======
async function handleMapCoordinatePick(e) {
  const { lat, lng } = e.latlng;
  const latInp    = document.getElementById('add-lat');
  const lngInp    = document.getElementById('add-lng');
  const nameInp   = document.getElementById('add-name');
  const regionSel = document.getElementById('add-region');

  // 1) 좌표 입력
  if (latInp) latInp.value = lat.toFixed(6);
  if (lngInp) lngInp.value = lng.toFixed(6);

  // 2) 기본 이름/현재 Region 선선택 (기존 로직 유지)
  if (nameInp && !nameInp.value.trim()) {
    nameInp.value = `Drone ${getNextDroneId()}`;
  }
  if (regionSel && currentRegion && [...regionSel.options].some(o => o.value === currentRegion)) {
    regionSel.value = currentRegion;
  }

  // 3) 역지오코딩으로 좌표의 실제 지역 확인
  const inferred = await getRegionNameFromCoords(lat, lng);

  // 정규화 비교 함수
  const eq = (a, b) => normalizeName(a || '') === normalizeName(b || '');

  if (inferred) {
    const hasRegion = Object.keys(regionData).some(r => r === inferred);

    if (!hasRegion) {
       showNotice(`${inferred} 지역을 먼저 추가해주세요.`);
        return;
    }

    if (regionSel && regionSel.value && !eq(regionSel.value, inferred)) {
      alert(`현재 좌표와 지역의 좌표가 다릅니다. (추천: ${inferred})`);
      return;
    }

    if (regionSel && !regionSel.value) {
      regionSel.value = inferred;
    }

    showNotice(`좌표가 성공적으로 입력되었습니다.\n(${lat.toFixed(6)}, ${lng.toFixed(6)})`);
  } else {
    showNotice('좌표는 입력되었으나 지역 확인에 실패했습니다. 지역을 수동으로 선택해 주세요.');
  }
}

// Bind for desktop (right-click) and mobile (tap/click)
map.on('contextmenu', handleMapCoordinatePick);
const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
if (isTouch) {
  map.on('click', handleMapCoordinatePick);
}

/* ===== 모바일 바텀시트 토글 (폭 90% 버튼: 올라가기/내려가기) ===== */
(function(){
  const panel = document.getElementById('right-panel');
  const toggleBtn = document.getElementById('mobile-toggle');
  const overlay = document.getElementById('panel-overlay');

  if(!panel || !toggleBtn || !overlay) return;

  function isMobile(){ return window.matchMedia('(max-width: 768px)').matches; }

  function setBtnState(isOpen){
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    toggleBtn.querySelector('.icon').textContent  = isOpen ? '▼' : '▲';
    toggleBtn.querySelector('.label').textContent = isOpen ? '내려가기' : '올라가기';
  }

  function showToggle(){ toggleBtn.style.display = 'inline-flex'; }
  function hideToggle(){ toggleBtn.style.display = 'none'; }

  function openPanel(){
    if(!isMobile()) return;
    if (panel.classList.contains('open')) return;

    panel.classList.add('open');
    overlay.hidden = false;
    requestAnimationFrame(()=> overlay.classList.add('show'));
    setBtnState(true);

    const onEnd = (e)=>{
      if(e.propertyName !== 'transform') return;
      panel.removeEventListener('transitionend', onEnd);
      hideToggle();
    };
    panel.addEventListener('transitionend', onEnd);
    setTimeout(()=>{ if (panel.classList.contains('open')) hideToggle(); }, 320);

    const firstInput = panel.querySelector('input,select,button');
    if(firstInput){ firstInput.focus({preventScroll:true}); }
  }

  function closePanel(){
    if(!panel.classList.contains('open')) return;

    panel.classList.remove('open');
    overlay.classList.remove('show');
    setBtnState(false);

    showToggle();

    setTimeout(()=> overlay.hidden = true, 200);
  }

  function togglePanel(){
    if(panel.classList.contains('open')) closePanel(); else openPanel();
  }

  toggleBtn.addEventListener('click', togglePanel);
  overlay.addEventListener('click', closePanel);

  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });

  window.addEventListener('resize', ()=>{
    if(!isMobile()){
      closePanel();
    }else{
      if (panel.classList.contains('open')) { hideToggle(); setBtnState(true); }
      else { showToggle(); setBtnState(false); }
    }
  });

  let startY = null;
  panel.addEventListener('touchstart', (e)=>{ startY = e.touches?.[0]?.clientY ?? null; }, {passive:true});
  panel.addEventListener('touchmove', (e)=>{
    if(startY==null) return;
    const dy = (e.touches?.[0]?.clientY ?? 0) - startY;
    if(dy > 40){ closePanel(); startY = null; }
  }, {passive:true});

  showToggle();
  setBtnState(false);
})();
