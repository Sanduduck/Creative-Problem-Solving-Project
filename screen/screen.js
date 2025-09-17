// ====== 환경에 맞게 기본값만 바꿔주세요 ======
const DEFAULT_STREAM_URL = 'http://192.168.137.98:5002/video_feed';

const $img    = document.getElementById('stream');
const $url    = document.getElementById('url');
const $status = document.getElementById('status');
const $btnLoad= document.getElementById('btnLoad');
const $btnBust= document.getElementById('btnBust');

// 혼합 콘텐츠(HTTPS 페이지 ↔ HTTP 스트림) 차단 감지
function isMixedBlocked(u){
  try{
    const x = new URL(u, location.href);
    return location.protocol === 'https:' && x.protocol === 'http:';
  }catch{
    return false;
  }
}

function bust(url){
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_t=${Date.now()}`;
}

function setStatus(msg, cls){
  $status.className = 'note ' + (cls || '');
  $status.textContent = msg;
}

function loadStream(url){
  if(!url){ setStatus('URL이 비었습니다.', 'bad'); return; }

  if(isMixedBlocked(url)){
    setStatus('HTTPS 페이지에서 HTTP 스트림이 차단되었습니다. 페이지를 HTTP로 열거나, HTTPS 프록시를 사용하세요.', 'bad');
  }else{
    setStatus('스트림 연결 시도 중…', '');
  }

  // 이미지로 MJPEG 시도
  $img.onload  = () => setStatus('연결 성공 (MJPEG img 로드)', 'ok');
  $img.onerror = () => {
    setStatus('연결 실패. URL과 네트워크를 확인하세요. 루트(/)는 404가 정상이며 /video_feed만 사용합니다.', 'bad');
    // 실패 시 기본 안내 이미지(옵션)
    // $img.src = './images/cctv.png';
  };

  $img.src = bust(url);
}

// 초기값 셋업 & 이벤트
$url.value = DEFAULT_STREAM_URL;
setStatus('URL을 확인했어요. 불러오기를 눌러 테스트하세요.');
$btnLoad.onclick = () => loadStream($url.value.trim());
$btnBust.onclick = () => {
  if($img.src) $img.src = bust($img.src.split('?')[0]);
};

// 페이지가 HTTP인 경우 자동 로드, HTTPS면 수동 로드 유도
if(location.protocol === 'http:'){
  loadStream(DEFAULT_STREAM_URL);
}else{
  setStatus('현재 페이지는 HTTPS입니다. HTTP 스트림은 브라우저가 차단할 수 있어요. 필요시 HTTP로 페이지를 열어 테스트하세요.', 'bad');
}
