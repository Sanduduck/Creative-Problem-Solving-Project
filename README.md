# AlleyEye — (대회 제출용) 프로젝트 요약

> **중요:** 이 저장소는 대회 제출용입니다. 제출 전에 아래 체크리스트를 반드시 확인하세요.

## 한 줄 설명
AlleyEye — 드론 기반 이동형 CCTV 웹 프로토타입 모음 (클라이언트 사이드 UI + 스트림 뷰어 · 암호화 툴 포함).

---

## 목차
- [제출 전 체크리스트](#제출-전-체크리스트)
- [폴더 구조 (권장)](#폴더-구조-권장)
- [파일 역할 (간단)](#파일-역할-간단)
- [기능도(다이어그램) 삽입 위치](#기능도다이어그램-삽입-위치)
- [상대경로(링크/이미지) 수정 규칙 & 예시](#상대경로링크이미지-수정-규칙--예시)
- [테스트 & 로컬 실행 방법](#테스트--로컬-실행-방법)
- [제출(패키징) 방법](#제출패키징-방법)
- [주의사항 / 보안 / 금지 코드](#주의사항--보안--금지-코드)

---

## 제출 전 체크리스트
1. **모든 HTML 파일이 올바른 상대경로/절대경로로 JS/CSS/이미지/페이지 링크를 참조하는가?**  
   - 폴더로 분리했으면 `<img>`, `<link>`, `<script>`, `window.location.href` 등 모든 상대경로를 점검.
2. **`en&decode.html` 같은 파일명에 특수문자(& 등)가 없는가?**  
   - 특수문자 → URL 인코딩 문제/혼동 발생. `en-decode.html` 권장.
3. **로컬/서버에서 동작 확인:** `python -m http.server` 등으로 반드시 HTTP로 테스트(파일://는 안 됨).
4. **불필요한 서버코드가 클라이언트에 포함되어 있지 않은가?** (예: `require('mongoose')` 같은 Node 서버 코드)  
   - 있다면 제거. 클라이언트 파일에 서버 라이브러리를 넣으면 제출에서 감점/실패 가능.
5. **이미지 파일이 `images/` 폴더에 모여있는가?** 상대경로가 통일되어 있는가?
6. **기능도(다이어그램) 파일을 repo에 포함했는가?** (`docs/feature-diagram.png` 권장)
7. **브라우저 보안(CORS/mixed content) 관련 안내가 README에 포함되어 있는가?**

---

## 폴더 구조 (권장)
/ (repo root)
├─ index/
│ ├─ index.html
│ ├─ index.css
│ └─ index.js
├─ main/
│ ├─ main.html
│ ├─ main.css
│ └─ main.js
├─ cctv/
│ ├─ cctv.html
│ ├─ cctv.css
│ └─ cctv.js
├─ en-decode/
│ ├─ en-decode.html
│ ├─ en-decode.css
│ └─ en-decode.js
├─ info/
│ ├─ info.html
│ ├─ info.css
│ └─ info.js
├─ login/
│ ├─ login.html
│ ├─ login.css
│ └─ login.js
├─ screen/
│ ├─ screen.html
│ ├─ screen.css
│ └─ screen.js
├─ docs/
│ └─ feature-diagram.png
└─ images/
├─ logo.png
├─ logo2.png
├─ cctv.png
└─ (기타 이미지)

markdown
코드 복사

---

## 파일 역할 (간단)
- `index/` : 인트로(스플래시) → 클릭 시 메인으로 이동. (GSAP 애니메이션)
- `main/` : 프로젝트 소개 / 포트폴리오 페이지.
- `cctv/` : 드론/지도/스트림 뷰어, 캡처·녹화·암호화 UI.
- `en-decode/` : 파일 암호화(.venc) / 복호화 UI (AES-GCM + PBKDF2 + 스테가).
- `info/` : CAPTCHA(“나는 로봇이 아닙니다”) 페이지.
- `login/` : 로그인/회원가입 UI (localStorage 기반).
- `screen/` : Stream Quick Test (MJPEG 이미지 스트림 테스트).
- `images/` : 모든 이미지(logo, placeholder, mockups 등).
- `docs/` : 기능도/다이어그램 (README에 `<img>`로 삽입).

---

## 기능도(다이어그램) 삽입 예시 (README에 넣기)
이미지 파일을 `docs/feature-diagram.png`에 넣고 아래 코드를 README에 추가:

```markdown
## 기능도

아래는 기능 흐름도입니다.

<img src="docs/feature-diagram.png" alt="기능도" width="800" />
상대경로(링크/이미지) 수정 규칙 & 예시
기본 규칙
HTML 파일이 X/X.html (각 폴더에 있음)이고 images/는 repo 루트의 images/라면, HTML에서는 이미지 경로를 ../images/파일.png로 쓰세요.

페이지 이동 예시

예: index/index.html에서 main/main.html로 이동시키려면:

js
코드 복사
// 원래 (루트에 main.html 있었을 때)
window.location.href = 'main.html';

// 폴더 분리 후 (index 폴더에서 main 폴더로 가는 상대경로)
window.location.href = '../main/main.html';
절대경로(호스팅 루트 기준)를 사용하려면:

js
코드 복사
window.location.href = '/main/main.html';
→ 단, GitHub Pages 등 루트가 달라지면 경로가 깨질 수 있음.

이미지 경로 예시

cctv/cctv.html 내:

html
코드 복사
<!-- 원래 -->
<img src="./images/logo.png" alt="logo" />
<!-- 변경 (cctv 폴더에서 images 폴더로 올라가야 함) -->
<img src="../images/logo.png" alt="logo" />
스크립트/스타일 경로

cctv/cctv.html에서 cctv.js와 cctv.css는 같은 폴더에 있으니:

html
코드 복사
<link rel="stylesheet" href="cctv.css">
<script src="cctv.js"></script>
(파일이 같은 폴더에 있기 때문에 ../ 불필요)

en&decode 파일명 문제

파일명에 & 같은 특수문자는 피하세요. 제출 직전에 en&decode.html → en-decode.html로 바꿔서, 내부 링크(en%26decode.html 등)도 같이 바꿔야 오류 없음.

자주 바꿔야 하는 문자열(예시) — 빠른 find/replace
(편집기에서 한 번에 바꾸기 쉬운 대표 항목)

main.html → ../main/main.html (index 폴더 같은 위치에서 참조할 때)

en%26decode.html 또는 en&decode.html → ../en-decode/en-decode.html

./images/... (루트 기준이던 경우) → ../images/... (각 폴더별로 상대경로 맞춤)

window.location.href = 'screen.html' → window.location.href = '../screen/screen.html'

팁: 프로젝트 전체에서 window.location.href = 로 검색하면 이동 관련 경로들을 빠르게 교체할 수 있음.

테스트 & 로컬 실행 방법
루트에서 간단한 HTTP 서버 실행:

bash
코드 복사
python -m http.server 8000
브라우저에서 http://localhost:8000/index/index.html 열기.

각 페이지(인트로 → 메인 → CCTV → 암호화 등) 순서대로 링크/버튼 동작 확인.

스트림 테스트(screen/screen.html)는 네트워크(방화벽/혼합콘텐츠)에 영향을 받음:

HTTPS 페이지에서 HTTP 스트림은 차단됨 → 페이지를 HTTP로 열거나 스트림을 HTTPS로 제공해야 함.

제출(패키징) 방법
루트 폴더가 완성되면 불필요한 파일(개인 키/비밀번호/노트 등) 삭제.

전체 폴더를 ZIP으로 압축:

bash
코드 복사
zip -r alleyeye_submission.zip index main cctv en-decode info login screen images docs
제출 양식(온라인 폼)에 ZIP 업로드.

주의사항 / 보안 / 금지 코드
절대 클라이언트 HTML/JS에 require('mongoose'), DB 접속 문자열, 비밀번호 같은 민감정보를 남기지 마세요. (로그인 HTML에 있던 mongoose 코드 → 삭제)

제출용은 클라이언트 전용 UI 모음입니다. 서버가 필요한 기능(스트림 중계, DB 등)은 별도로 설명서에 적어 심사자에게 안내하세요.

외부 CDN 사용은 허용되지만, 대회 규정에 따라 외부 네트워크를 차단할 수 있으니 필수 라이브러리는 로컬에 포함시키는 편이 안전합니다.

파일명에 공백·특수문자·한글 등은 피하는 게 무난합니다.
