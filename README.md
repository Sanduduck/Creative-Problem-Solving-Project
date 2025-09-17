# **AlleyEye — 대회 제출용 README**

**프로젝트명:** 객체 탐지 기반 드론 감시 시스템 (팀: 코드톡톡)  
**목적:** 창의문제해결 경진대회 **제출용** 배포·데모 문서  
**주의:** 본 문서는 **대회 심사용**으로 간결하게 정리되어 있습니다. (로컬에서 `http` 서버로 실행 권장)

---

## 🔖 한줄 요약
**사각지대를 감시하는 이동형 CCTV 드론 + 실시간 관제(지도·스트림) + 클라이언트 사이드 파일 암호화(AES-GCM + PBKDF2)** 를 **대회용 프로토타입**으로 구현한 데모 저장소입니다.

---

## 📚 목차
-  **배포 폴더 구조 (추천)**  
-  **빠른 실행 (심사용)**  
-  **주요 기능 (요약)**  
-  **기능도 (대회 제출용 이미지)**  
-  **파일별 역할**  
-  **제출 체크리스트 & 주의사항**  
-  **자주 발생하는 문제 (FAQ)**  

---

## 🗂 배포 폴더 구조 (추천)
/ (repo root)
├─ README.md
├─ main.html
├─ main.css
├─ main.js
├─ login.html
├─ login.css
├─ login.js
├─ info.html
├─ info.css
├─ info.js
├─ cctv.html
├─ cctv.css
├─ cctv.js
├─ en-decode.html # 권장: 'en&decode.html' → 'en-decode.html'
├─ en-decode.css
├─ en-decode.js
├─ screen.html
├─ screen.css
├─ screen.js
├─ images/
│ ├─ logo.png
│ ├─ cctv.png
│ └─ ... (모든 이미지 파일은 여기로)
└─ docs/
└─ 최종 보고서 2차.docx


> **권장 규칙:** 모든 이미지/아이콘은 `./images/` 아래에 두고 HTML에서 `./images/파일명` 형식으로 참조하세요.  
> **중요:** 파일명에 특수문자(`&`, `?` 등) 사용 금지 — **`en&decode.html` → `en-decode.html`** 권장.

---

## ⚡ 빠른 실행 (심사용)

브라우저에서 접속: https://sanduduck.github.io/Creative-Problem-Solving-Project/

시연 흐름(권장): main → login → info(CAPTCHA) → cctv → en-decode → screen

스트림 테스트(로컬 MJPEG): screen.html 에서 스트림 URL 입력 후 Load 클릭

주요 기능 (요약)
main.html

인트로 / 허브 페이지 — 프로젝트 소개 및 각 페이지로 이동

login.html

회원관리(로컬)

가입: PBKDF2-SHA256으로 비밀번호 저장(로컬 localStorage)

로그인: PBKDF2 검증 + 레거시 해시(sha256/plain) → 자동 마이그레이션

info.html

CAPTCHA 인증 (Canvas 기반, 대/소문자 구분) — 사람 인증 후 진행

cctv.html

관제 대시보드 (주요 페이지)

Leaflet 지도에 드론 마커 표시

지역별 드론 리스트 관리(추가/삭제) — 관리자 전용 액션 분리

스트림 뷰어(MJPEG 이미지), 캡처/녹화(클라이언트 측)

캡처/녹화 파일 클라이언트 암호화(.venc) (AES-GCM + PBKDF2)

en-decode.html (권장명: en-decode)

암호화 툴: AES-GCM + PBKDF2(310k) 기반 파일 암/복호화 데모

스테가노그래피: 비밀번호 → 텍스트 (가역 / 비가역 모드 제공)

screen.html

스트림 테스트 페이지 — MJPEG 스트림 연결 확인용

📷 기능도 (대회 제출용 이미지)

README에 직접 보여줄 기능도 이미지를 <img> 태그로 삽입하세요. (심사 시 외부 링크 대신 images/ 내 파일 사용 권장)

# main (허브)
<img width="2346" height="1080" alt="Image" src="https://github.com/user-attachments/assets/c173e6db-c673-460b-bb90-9995b0b7c19b" />

# login (회원가입 / 로그인 흐름)
<img width="2346" height="1080" alt="Image" src="https://github.com/user-attachments/assets/c173e6db-c673-460b-bb90-9995b0b7c19b" />

# cctv (관제 대시보드)
<img width="4735" height="2113" alt="Image" src="https://github.com/user-attachments/assets/0fcf27e6-67d6-46d5-ba86-e6903e5e3ce1" />

# en-decode (암/복호화 툴)
<img width="1819" height="1981" alt="Image" src="https://github.com/user-attachments/assets/075dcd6c-5347-41bf-9bac-57d1d8e33688" />

Tip: GitHub에 올릴 때는 외부 CDN 링크 대신 images/에 복사해 ./images/파일명으로 넣으면 안정적입니다.

🧭 파일별 역할 (한눈에)

main.* — 대회용 허브 (소개 및 이동)

login.* — 로컬 사용자 가입/인증 (심사용)

info.* — CAPTCHA (사람 인증)

cctv.* — 메인 관제: 지도, 스트림, 캡처/녹화, 권한 분기

en-decode.* — 암호화 데모: AES-GCM + PBKDF2 + 스테가

screen.* — 스트림(MJPEG) 연결/테스트 페이지

images/ — 모든 UI/기능도 이미지 저장

docs/최종 보고서 2차.docx — 제출용 최종보고서

📋 제출 체크리스트 & 주의사항 (대회용)

 모든 HTML 파일은 루트(또는 심사자 지정 경로)에 위치 — 상대경로 깨짐 방지

 images/ 폴더에 사용 이미지 전부 저장 (./images/...)

 파일명에 특수문자(&, ?, 공백 등) 사용 금지 — en-decode.html 권장

 window.location.href = 'xxx.html' 같은 링크는 동일 폴더일 때만 작동

예: 파일을 pages/로 옮기면 window.location.href = '../main.html' 로 수정 필요

 실시간 스트림(외부 IP/MJPEG)은 심사 환경에서 차단될 수 있음 → 스크린샷/기능도 필수 첨부

 로컬 실행 권장: python -m http.server 8000 → http://localhost:8000/main.html

 docs/최종 보고서 2차.docx 포함 확인

❗ 자주 발생하는 문제 (FAQ)
Q. HTML을 폴더로 옮겼더니 페이지 이동이 안 돼요.

A. 모든 링크(href, window.location.href, 이미지 src)는 상대경로 기준입니다. 파일 위치를 변경하면 경로를 재설정해야 합니다 (./, ../ 등).

Q. 이미지가 안 보입니다.

A. 이미지 파일이 images/에 있는지, HTML에서 ./images/파일명으로 지정했는지 확인하세요. 대소문자도 구분됩니다.

Q. en&decode.html 파일명이 문제를 일으켜요.

A. 특수문자 & 때문에 압축/서버/OS에서 문제 발생 가능. en-decode.html 로 변경하세요.
