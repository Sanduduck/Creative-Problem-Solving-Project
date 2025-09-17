// ---------- Helpers ----------
const $ = (s)=>document.querySelector(s);
const logEl = $('#log');
const progEl = $('#prog');
function log(msg, isErr=false){ if(logEl){ logEl.textContent = msg; logEl.classList.toggle('err', !!isErr); } }
function setProg(v){ if(progEl){ progEl.value = Math.max(0, Math.min(1, v)); } }

// ---------- File header layout ----------
// [MAGIC(8)] [u32 algId] [u32 iterations] [u32 saltLen] [u32 ivLen] [u32 nameLen] [u32 mimeLen]
// [salt] [iv] [nameUtf8] [mimeUtf8] [ciphertext(AES-GCM)]
const MAGIC = new TextEncoder().encode('VIDENC01'); // 8 bytes
const ALG_ID = 1; // 1 = AES-GCM-256
const DEFAULT_ITERS = 310000;

function u32(n){ const b=new Uint8Array(4); new DataView(b.buffer).setUint32(0,n,true); return b; }
function rU32(u8,off){ return new DataView(u8.buffer,u8.byteOffset,u8.byteLength).getUint32(off,true); }
function concatBytes(...arrs){ let len=0; for(const a of arrs) len+=a.byteLength||a.length; const out=new Uint8Array(len); let off=0; for(const a of arrs){ const v=a instanceof Uint8Array? a : new Uint8Array(a); out.set(v, off); off+=v.byteLength||v.length; } return out; }
function sliceU8(u8, off, len){ return new Uint8Array(u8.buffer, u8.byteOffset+off, len); }
function equalBytes(a,b){ if(a.byteLength!==b.byteLength) return false; for(let i=0;i<a.byteLength;i++){ if(a[i]!==b[i]) return false; } return true; }

// ---------- Crypto ----------
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

async function encryptFile(file, password, onProgress){
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await deriveKey(password, salt, DEFAULT_ITERS);

  onProgress?.(0.05);
  const pt = new Uint8Array(await file.arrayBuffer());
  onProgress?.(0.2);

  const ct = new Uint8Array(await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, pt));
  onProgress?.(0.9);

  const enc = new TextEncoder();
  const nameBytes = enc.encode(file.name || 'file');
  const mimeBytes = enc.encode(file.type || 'application/octet-stream');

  const header = concatBytes(
    MAGIC,
    u32(ALG_ID), u32(DEFAULT_ITERS),
    u32(salt.byteLength), u32(iv.byteLength),
    u32(nameBytes.byteLength), u32(mimeBytes.byteLength),
    salt, iv, nameBytes, mimeBytes
  );

  const blob = new Blob([header, ct], { type:'application/octet-stream' });
  onProgress?.(1);
  return { blob, suggestedName: (file.name || 'file') + '.venc' };
}

async function decryptFile(file, password, onProgress){
  const u8 = new Uint8Array(await file.arrayBuffer());
  let off = 0;

  const magic = sliceU8(u8, off, MAGIC.byteLength); off += MAGIC.byteLength;
  if(!equalBytes(magic, MAGIC)) throw new Error('잘못된 파일 형식(매직 헤더 불일치)');

  const algId = rU32(u8, off); off += 4;
  const iterations = rU32(u8, off); off += 4;
  const saltLen = rU32(u8, off); off += 4;
  const ivLen   = rU32(u8, off); off += 4;
  const nameLen = rU32(u8, off); off += 4;
  const mimeLen = rU32(u8, off); off += 4;

  if(algId !== ALG_ID) throw new Error('지원하지 않는 알고리즘');

  const salt = sliceU8(u8, off, saltLen); off += saltLen;
  const iv   = sliceU8(u8, off, ivLen);   off += ivLen;
  const nameBytes = sliceU8(u8, off, nameLen); off += nameLen;
  const mimeBytes = sliceU8(u8, off, mimeLen); off += mimeLen;
  const ct = sliceU8(u8, off, u8.byteLength - off);

  const dec = new TextDecoder();
  const origName = dec.decode(nameBytes);
  const origMime = dec.decode(mimeBytes) || 'application/octet-stream';

  const key = await deriveKey(password, salt, iterations);
  onProgress?.(0.5);
  let ptBuf;
  try{
    ptBuf = await crypto.subtle.decrypt({ name:'AES-GCM', iv }, key, ct);
  }catch(e){
    throw new Error('복호화 실패: 비밀번호가 틀렸거나 파일이 손상되었습니다.');
  }

  const blob = new Blob([ptBuf], { type: origMime });
  onProgress?.(1);

  const suggestedName = origName && origName.trim() ? origName : (file.name.replace(/\.venc$/i,'') || 'file.bin');
  return { blob, suggestedName };
}

// ---------- Stego dictionaries (확장, 이모지 없음) ----------
const PW_BUCKETS = {
  0: [
    ["네","그래","맞아","응","혹시","진짜","약간","오늘","지금","바로","정말","좋아","아하","그럼","거의","대충","방금","어제","내일","곧","완료","보류","취소","진행","확인","메모","저장","중요","주의","갱신","동기화","백업"],
    ["ㅇㅋ","ㄱㄱ","ㄴㄴ","ㄷㄷ","헉","흠","ㅋ","ㅋㅋ","ㅋㅋㅋ","ㅠ","ㅠㅠ","ㅎㅇ","ㅂㅂ","ㄹㅇ","ㅇㅈ","ㅊㅋ","ㅊㅊ"],
    ["了解","確認","完了","保留","注意","緊急","更新","同期","保存","試験","成功","失敗","変更","予定","重要"],
    ["はい","うん","たぶん","そう","まあ","なるほど","ちょっと","ほんと","いいね","すぐ","ゆっくり","メモ","로그","テスト","モデル"],
    ["确认","完成","进行","保存","更新","同步","重要","注意","测试","成功","失败","计划","备份","恢复","提交","回滚"]
  ],
  1: [
    ["ok","okay","right","maybe","sure","fine","note","check","soon","next","wait","hold","start","done","ready","retry","merge","sync","draft","final","wip","todo","ping","review","ship","push","pull","build","fix","hotfix","issue","update","stable","alpha","beta","fast","slow","clean","safe"],
    ["ναι","όχι","ίσως","εντάξει","οκ","τέλος","δοκιμή","γρήγορα","αργά","σταθερό","σφάλμα","ενημέρωση"],
    ["да","нет","может","ок","верно","готово","быстро","медленно","ошибка","правка","стабильно","тест","обновить"],
    ["კი","არა","შესაძლოა","კარგი","მზად","ტესტი","განახლება","შეცდომა","შენახვა","გაყოფა"],
    ["այո","ոչ","միգուցե","լավ","պատրաստ","թեստ","թարմացում","սխալ","պահպանել","նախագիծ"]
  ],
  2: [
    ["हाँ","नहीं","शायद","ठीक","पक्का","पुष्टि","टेस्ट","सफल","विफल","योजना","अद्यतन","सहेजें","स्थिति","चेतावनी"],
    ["হ্যাঁ","না","সম্ভবত","ঠিক","পরীক্ষা","আপডেট","সংরক্ষণ","সফল","ব্যর্থ","সতর্কতা"],
    ["ਹਾਂ","ਨਹੀਂ","ਸ਼ਾਇਦ","ਠੀਕ","ਟੈਸਟ","ਅੱਪਡੇਟ","ਸੰਭਾਲੋ","ਸਫਲ","ਅਸਫਲ"],
    ["હા","ના","કદાચ","ઓકે","પરિક્ષણ","અપડેટ","સાચવો","સફળ","અસફળ"],
    ["ஆம்","இல்லை","சரி","சோதனை","புதுப்பிப்பு","சேமிக்க","வெற்றி","தோல்வி"],
    ["అవును","కాదు","బహుశా","సరే","పరీక్ష","నవీకరణ","భద్రపరచు","విజయం","విఫలం"],
    ["ಹೌದು","ಇಲ್ಲ","ಬಹುಶಃ","ಸರಿಯಾಗಿದೆ","ಪರೀಕ್ಷೆ","ನವೀಕರಣ","ಉಳಿಸಿ","ಯಶಸ್ವಿ","ವಿಫಲ"],
    ["അതെ","ഇല്ല","ബഹുശ","ശരി","ടെസ്റ്റ്","അപ്ഡേറ്റ്","സേവ്","വിജയം","പരാജയം"],
    ["ඔව්","නැහැ","හැකි","හරි","පරීක්ෂණය","යාවත්කාලීන","සුරකින්න","සාර්ථක","අසාර්ථක"],
    ["ใช่","ไม่","อาจจะ","โอเค","ทดสอบ","อัพเดต","บันทึก","สำเร็จ","ล้มเหลว","เตือน"],
    ["ແມ່ນ","ບໍ່","ອາດຈະ","ຕົกລົง","ທົດລອງ","ປັບປຸງ","ບັນທຶກ","ສຳເລັດ","ລົ້ມເຫຼວ"],
    ["បាទ","ទេ","ប្រហែល","យល់ព្រម","សាកល្បង","បច្ចុប្បន្នភាព","រក្សាទុក","ជោគជ័យ","បរាជ័យ"],
    ["ဟုတ်","မဟုတ်","ဖြစ်နိုင်","အိုကေ","စမ်းသပ်","အပ်ဒိတ်","သိမ်း","အောင်မြင်","မအောင်မြင်"]
  ],
  3: [
    ["نعم","لا","حسنًا","صحيح","ربما","الآن","تم","قريبًا","بطيء","سريع","تجربة","تحديث","نسخ","تحذير","خطأ","حفظ","مزامنة"],
    ["بله","خیر","شاید","باشه","آزمایش","به‌روزرسانی","ذخیره","موفق","ناموفق","هشدار"],
    ["כן","לא","טוב","נכון","אולי","עכשיו","בוצע","טיוטה","עדכון","בדיקה","שגיאה","קבוע"],
    ["አዎን","አይ","ምናልባት","እሺ","ሙከራ","ዝመና","ተቀምጥ","ተሳክቷል","አልተሳካም","ማስጠንቀቂያ"],
    ["ཡིན","མ་རེད","དངོས་པོ","འོ་ན","ཚོད་ལྟ","གསར་སྒྱུར","ཉར","སྐྱེལ་ལྡན","ཕམ་པ"],
    ["token","signal","model","server","client","cache","secure","proto","demo","log","trace","event"]
  ]
};

// ---------- Stego core ----------
// 데코: 구두점만 (이모지 없음)
const PW_DECOS = { punct: [".",",","!","?","…","·","—",":",";"] };
function decorateToken(tok, rnd){
  const r=rnd()%100;
  if(/[a-z]/i.test(tok) && r<12){ tok = (rnd()%2)? tok.toUpperCase() : (tok[0].toUpperCase()+tok.slice(1)); }
  if ((/^[가-힣]+$/.test(tok) || /^[\u3040-\u30FF]+$/.test(tok)) && r>=12 && r<20){ tok += (rnd()%2?"!":"~"); }
  if (r>=20 && r<28){ tok += PW_DECOS.punct[rnd()%PW_DECOS.punct.length]; }
  return tok;
}

async function sha256(u8){ const d=await crypto.subtle.digest('SHA-256',u8); return new Uint8Array(d); }
function toU64(le8,off){ let v=0n; for(let i=0;i<8;i++){ v|=BigInt(le8[off+i])<<(8n*BigInt(i)); } return v; }
function xs128p(seedBytes){
  let s0=toU64(seedBytes,0), s1=toU64(seedBytes,8); if(s0===0n&&s1===0n) s1=1n;
  return ()=>{ let x=s0,y=s1; s0=y; x^=x<<23n; x^=x>>17n; x^=y^(y>>26n); s1=x; return Number((x+y)&0xFFFF_FFFFn)>>>0; };
}

const STEGO_OPTS_DEFAULT = { maxTokens: 260, noRepeatWindow: 5, bucketWeights:[1,1,1,1], crossMixPercent:60, newlineEvery:26 };

// 비가역(표현) — 다양한 언어 섞기 + 데코 (짧은 비번도 생성되도록 최소 1토큰 보장)
async function bytesToStegoV2(u8, opts=STEGO_OPTS_DEFAULT){
  if(!u8 || !u8.length) return '';
  const seedIn = new Uint8Array(u8.length + 4);
  seedIn.set(u8, 0);
  new DataView(seedIn.buffer).setUint32(u8.length, (u8.length*2654435761)>>>0, true);
  const seed = await sha256(seedIn);
  const rnd = xs128p(seed);

  const bits = Array.from(u8, b => b.toString(2).padStart(8,'0')).join('');
  const want = Math.max(1, Math.min(opts.maxTokens, Math.ceil(bits.length/2))); // ★ 최소 1개

  const W = opts.bucketWeights||[1,1,1,1];
  const sumW = W.reduce((a,b)=>a+b,0);

  const out = [];
  const recent = [];
  let bi = 0;

  for (let i=0;i<want;i++){
    let b2;
    if (bi+2 <= bits.length){ b2 = parseInt(bits.slice(bi, bi+2), 2); bi+=2; }
    else { b2 = rnd() & 3; }

    if ((rnd()%100) < (opts.crossMixPercent ?? 40)){
      if (sumW>0){
        const pick = rnd()%sumW;
        let acc=0, chosen=0;
        for(let k=0;k<4;k++){ acc+=W[k]; if(pick<acc){ chosen=k; break; } }
        b2 = chosen;
      }else{
        b2 = rnd() & 3;
      }
    }

    const lists = PW_BUCKETS[b2];
    const which = rnd()%lists.length;
    let word = lists[which][rnd()%lists[which].length];

    let guard=0;
    while (recent.includes(word) && guard<6){
      const alt = (which + 1 + (rnd()%lists.length)) % lists.length;
      word = lists[alt][rnd()%lists[alt].length];
      guard++;
    }
    recent.push(word);
    if (recent.length > (opts.noRepeatWindow||4)) recent.shift();

    word = decorateToken(word, rnd);
    out.push(word);

    const nlEvery = opts.newlineEvery ?? 28;
    if (nlEvery>0 && (i%nlEvery)===nlEvery-1 && (rnd()%100)<45) out.push("\n");
    else if ((rnd()%100)<14) out.push(" ");
  }

  return out.join(' ').replace(/\s+\n/g,"\n").trim();
}

// ---------- Reversible stego (가역) ----------
const REV_MAGIC = new Uint8Array([0x53,0x54]); // "ST"

function encodeReversibleStego(password){
  const enc = new TextEncoder();
  const pwBytes = enc.encode(password);
  if (pwBytes.length > 65535) throw new Error('비밀번호가 너무 깁니다(최대 65535 바이트).');
  const header = new Uint8Array(4);
  header.set(REV_MAGIC,0);
  new DataView(header.buffer).setUint16(2, pwBytes.length, true); // length LE
  const all = concatBytes(header, pwBytes); // [ST|len|data]

  // 각 바이트→2비트×4 → 해당 버킷에서 토큰 선택(데코/믹스 없음)
  const seedIn = new Uint8Array([...all, 0,1,2,3]); // 선택 다양화용, 복호와 무관
  const rnd = xs128p(seedIn);
  const words = [];
  for (const b of all){
    for (let shift=6; shift>=0; shift-=2){
      const v = (b>>shift) & 0b11;
      const lists = PW_BUCKETS[v];
      const which = rnd()%lists.length;
      const word = lists[which][rnd()%lists[which].length];
      words.push(word);
    }
  }
  // 공백/줄바꿈만 가독성용
  const out = [];
  for(let i=0;i<words.length;i++){
    out.push(words[i]);
    if ((i%28)===27) out.push("\n"); else out.push(" ");
  }
  return out.join('').trim();
}

// 토큰 정규화 + 역매핑
const REVERSE_MAP = new Map();
function normToken(t){
  if(!t) return '';
  t = t.normalize('NFKC');              // 폭/조합 정규화
  t = t.replace(/[.,!?…·—:;]+$/u, '');  // 끝 구두점 제거
  t = t.replace(/\d+$/u, '');           // 끝 숫자 꼬리 제거
  if (/[A-Za-z]/.test(t)) t = t.toLowerCase(); // 라틴은 소문자화
  return t.trim();
}
(function buildReverse(){
  for (let b=0;b<4;b++){
    for (const list of PW_BUCKETS[b]){
      for (const w of list){
        const key = normToken(w);
        if(!REVERSE_MAP.has(key)) REVERSE_MAP.set(key, b);
      }
    }
  }
})();

function decodeReversibleStegoToPassword(text){
  if(!text || !text.trim()) throw new Error('스테가 텍스트가 비었습니다.');
  const rawTokens = text.split(/\s+/);
  const bits = [];
  for (const t of rawTokens){
    const k = normToken(t);
    if(!k) continue;
    const b = REVERSE_MAP.get(k);
    if (b===undefined) continue; // 가독성용 낯선 단어는 무시
    bits.push(b);
  }
  // 헤더 4바이트가 필요 → 2비트 페어 16개(=단어 16개) 미만이면 부족
  if (bits.length < 16) throw new Error('스테가 데이터가 너무 짧거나 형식이 올바르지 않습니다.');

  // 2비트→바이트(4개 2비트 = 1바이트)
  const bytes = [];
  for (let i=0;i+3<bits.length; i+=4){
    const byte = (bits[i]<<6) | (bits[i+1]<<4) | (bits[i+2]<<2) | bits[i+3];
    bytes.push(byte);
  }
  const u8 = new Uint8Array(bytes);
  if (u8.length < 4 || u8[0]!==REV_MAGIC[0] || u8[1]!==REV_MAGIC[1]) {
    throw new Error('가역 스테가 헤더가 없습니다(표현 모드이거나 손상됨).');
  }
  const len = new DataView(u8.buffer).getUint16(2, true);
  const body = u8.slice(4, 4+len);
  if (body.length !== len) throw new Error('스테가 길이가 일치하지 않습니다.');
  return new TextDecoder().decode(body);
}

// ---------- Clipboard with toast ----------
async function copyToClipboard(text){
  try {
    // 1) 기본: Clipboard API (포커스 안 뺏음)
    if (navigator.clipboard && window.isSecureContext !== false) {
      await navigator.clipboard.writeText(text);
    } else {
      // 2) Fallback: 선택/복사 후 포커스/선택 범위 복원
      const active = document.activeElement;
      let sel = null;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        sel = {
          el: active,
          start: active.selectionStart,
          end: active.selectionEnd,
          dir: active.selectionDirection
        };
      }

      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.pointerEvents = 'none';
      ta.style.left = '-9999px';     // 화면 밖
      document.body.appendChild(ta);

      // 주의: ta.focus() 하지 않음 — select()만으로 복사 가능
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);

      // 포커스/선택 복원 → IME(한/영키) 정상 동작
      if (sel && sel.el) {
        sel.el.focus();
        try { sel.el.setSelectionRange(sel.start, sel.end, sel.dir || 'none'); } catch {}
      } else if (active && typeof active.focus === 'function') {
        active.focus();
      }
    }

    // 토스트 표시는 그대로
    const toast = document.getElementById('copyToast');
    if (toast) {
      toast.classList.add('show');
      toast.textContent = '복사되었습니다!';
      setTimeout(() => toast.classList.remove('show'), 2000);
    }
    return true;
  } catch (e) {
    log('복사 실패: ' + (e.message || e), true);
    return false;
  }
}
// ---------- UI wiring ----------
const modeSel = $('#mode');
const fileInput = $('#file');
const runBtn = $('#runBtn');
const dl = $('#dl');
const pwInput = $('#pw');
const fileLabel = $('#fileLabel');
const drop = $('#dropzone');
const fileInfo = $('#fileInfo');
const resultInfo = $('#resultInfo');
const previewVideo = $('#previewVideo');
const previewImage = $('#previewImage');
const pwStegoBox = $('#pwStegoBox');

const stegoModeSel = $('#stegoMode');
const stegoIn = $('#stegoIn');
const stegoOut = $('#stegoOut');
const stegoDecBtn = $('#stegoDecBtn');

let lastURL = null;

function refreshLabels(){
  if(!modeSel) return;
  if(modeSel.value === 'enc'){
    if(fileLabel) fileLabel.textContent = '영상/이미지 파일';
    if(fileInput) fileInput.accept = 'video/*,image/*';
    if(drop){
      const strong = drop.querySelector('.dz-text strong'); const sub = drop.querySelector('.dz-sub');
      if(strong) strong.textContent = '여기로 파일 드래그';
      if(sub) sub.textContent = '또는 클릭하여 선택 (mp4, webm, png, jpg)';
    }
  } else {
    if(fileLabel) fileLabel.textContent = '암호화 파일(.venc)';
    if(fileInput) fileInput.accept = '.venc,application/octet-stream';
    if(drop){
      const strong = drop.querySelector('.dz-text strong'); const sub = drop.querySelector('.dz-sub');
      if(strong) strong.textContent = '.venc 파일 드래그';
      if(sub) sub.textContent = '또는 클릭하여 선택';
    }
  }
}
modeSel?.addEventListener('change', refreshLabels);
refreshLabels();

function setSelectedFile(file){
  if(!file || !fileInput || !fileInfo) return;
  const dt = new DataTransfer();
  dt.items.add(file);
  fileInput.files = dt.files;
  fileInfo.textContent = `선택됨: ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`;
}

if (drop){
  drop.addEventListener('click', ()=> fileInput?.click());
  drop.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); fileInput?.click(); }});
  ['dragenter','dragover'].forEach(ev=> drop.addEventListener(ev, (e)=>{ e.preventDefault(); e.stopPropagation(); drop.classList.add('dragover'); }));
  ;['dragleave','dragend','mouseout'].forEach(ev=> drop.addEventListener(ev, ()=> drop.classList.remove('dragover')));
  drop.addEventListener('drop', (e)=>{
    e.preventDefault(); e.stopPropagation(); drop.classList.remove('dragover');
    const file = e.dataTransfer?.files?.[0];
    if(!file){ return; }
    const mode = modeSel?.value;
    if(mode==='enc'){
      const t = (file.type||'');
      if(!(t.startsWith('video') || t.startsWith('image'))){ log('영상/이미지 파일이 아닙니다. 계속 시도할 수는 있지만 실패할 수 있어요.', true); }
    }else{
      if(!/\.venc$/i.test(file.name)){ log('.venc 파일을 넣어주세요 (암호화된 파일).', true); }
    }
    setSelectedFile(file);
  });
}
fileInput?.addEventListener('change', ()=>{ const f=fileInput.files?.[0]; if(f) setSelectedFile(f); });

// 실행 버튼
runBtn?.addEventListener('click', async ()=>{
  if(dl) dl.style.display='none';
  if(lastURL){ URL.revokeObjectURL(lastURL); lastURL=null; }
  if(previewVideo){ previewVideo.style.display='none'; previewVideo.removeAttribute('src'); }
  if(previewImage){ previewImage.style.display='none'; previewImage.removeAttribute('src'); }
  if(resultInfo) resultInfo.textContent='';

  const mode = modeSel?.value;
  const file = fileInput?.files && fileInput.files[0];
  const pw = pwInput?.value || '';

  if(!file){ log('파일을 선택하세요.', true); return; }
  if(!pw){ log('비밀번호를 입력하세요.', true); return; }
  if(!window.crypto?.subtle){ log('이 브라우저는 WebCrypto(SubtleCrypto)를 지원하지 않습니다.', true); return; }

  if(runBtn) runBtn.disabled = true; setProg(0); log('처리 중…');
  try{
    if(mode==='enc'){
      const { blob, suggestedName } = await encryptFile(file, pw, setProg);
      const url = URL.createObjectURL(blob); lastURL = url;
      if(dl){ dl.href = url; dl.download = suggestedName; dl.textContent = '암호화 파일 다운로드'; dl.style.display = 'inline-flex'; }
      log('암호화 완료');
      if(resultInfo) resultInfo.textContent = `암호화 완료 · 파일명: ${suggestedName} · 크기: ${formatBytes(blob.size)}`;
    }else{
      const { blob, suggestedName } = await decryptFile(file, pw, setProg);
      const url = URL.createObjectURL(blob); lastURL = url;
      if(dl){ dl.href = url; dl.download = suggestedName; dl.textContent = '복호화 파일 다운로드'; dl.style.display = 'inline-flex'; }
      log('복호화 완료');
      if((blob.type||'').startsWith('video')){ if(previewVideo){ previewVideo.src = url; previewVideo.style.display = 'block'; } }
      else if ((blob.type||'').startsWith('image')) { if(previewImage){ previewImage.src = url; previewImage.style.display = 'block'; } }
      if(resultInfo) resultInfo.textContent = `복호화 완료 · 파일명: ${suggestedName} · 크기: ${formatBytes(blob.size)} · 타입: ${blob.type||'application/octet-stream'}`;
    }
  }catch(e){
    console.error(e);
    log(e.message || String(e), true);
  }finally{
    if(runBtn) runBtn.disabled = false;
  }
});

// ---------- PW → Stego (IME 안전 처리) ----------
let stegoDebounce = 0;
let isComposing = false;

pwInput?.addEventListener('compositionstart', () => { isComposing = true; });
pwInput?.addEventListener('compositionend', () => {
  isComposing = false;
  triggerStegoFromPw();
});

function isExpressive(){ return (stegoModeSel?.value === 'expressive'); }

function triggerStegoFromPw(forceExpressive=null){
  const pw = pwInput?.value || '';
  if(!pw){ if(pwStegoBox) pwStegoBox.textContent = '—'; return; }
  (async()=>{
    try{
      let stego;
      const expressive = (forceExpressive===null)
        ? isExpressive()
        : !!forceExpressive;

      if (expressive){
        stego = await bytesToStegoV2(new TextEncoder().encode(pw), { ...STEGO_OPTS_DEFAULT, crossMixPercent:60 });
      }else{
        stego = encodeReversibleStego(pw);
      }
      if(pwStegoBox) pwStegoBox.textContent = stego || '—';
      await copyToClipboard(stego);
    }catch(err){
      log(err.message||String(err), true);
    }
  })();
}

pwInput?.addEventListener('input', ()=>{
  if (isComposing) return;
  clearTimeout(stegoDebounce);
  stegoDebounce = setTimeout(()=> triggerStegoFromPw(), 120);
});

pwInput?.addEventListener('keydown', (e)=>{
  if(e.key==='Enter' && !isComposing){ triggerStegoFromPw(); }
});

// 스테가 복호화
stegoDecBtn?.addEventListener('click', ()=>{
  const text = stegoIn?.value || '';
  try{
    const pw = decodeReversibleStegoToPassword(text);
    if(stegoOut) stegoOut.value = pw;
    copyToClipboard(pw);
    log('스테가 텍스트를 비밀번호로 복호화했습니다.');
  }catch(e){
    log(e.message || String(e), true);
    if(stegoOut) stegoOut.value = '';
  }
});

function formatBytes(bytes){
  if(bytes === 0) return '0 B';
  const k = 1024; const sizes = ['B','KB','MB','GB','TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
