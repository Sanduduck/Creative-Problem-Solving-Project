AlleyEye — 대회 제출용 README

프로젝트명: 객체 탐지 기반 드론 감시 시스템 (팀: 코드톡톡)
용도: 창의문제해결 경진대회 제출용 프로토타입 · 심사용 데모
주의: 로컬에서 http 정적 서버로 실행하길 권장합니다.

🔎 한줄 요약

이 프로젝트는 이동형 CCTV 드론 + 실시간 관제(지도·스트림) + 클라이언트 암호화( AES-GCM + PBKDF2 )를 대회용 프로토타입으로 구현한 데모 저장소입니다.

📚 목차

폴더 구조 (권장)

빠른 실행 (심사용)

주요 기능 (요약)

기능도 (제출용 이미지)

파일별 역할

제출 체크리스트 & 주의사항

FAQ (자주 묻는 문제)

📁 폴더 구조 (권장)
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
├─ en-decode.html       # 권장: 'en&decode.html' → 'en-decode.html'
├─ en-decode.css
├─ en-decode.js
├─ screen.html
├─ screen.css
├─ screen.js
├─ images/
│   ├─ logo.png
│   ├─ cctv.png
│   └─ ... (모든 이미지 파일은 여기로)
└─ docs/
    └─ 최종 보고서 2차.docx


권장 규칙

모든 이미지·아이콘은 ./images/에 넣고 HTML에서는 ./images/파일명로 참조하세요.

파일명에 &, 공백, ? 등 특수문자 사용 금지 (en&decode.html → en-decode.html).

▶ 빠른 실행 (심사용)
# 저장소 루트에서 간단한 정적 서버 실행
python -m http.server 8000


접속: http://localhost:8000/main.html

권장 시연 흐름: main → login → info(CAPTCHA) → cctv → en-decode → screen

스트림 테스트: screen.html에서 MJPEG URL 입력 후 Load 클릭

✅ 주요 기능 (요약)
main.html

프로젝트 소개 및 각 페이지로 연결하는 허브

login.html

로컬 회원관리(데모)

회원가입: PBKDF2-SHA256으로 비밀번호 저장 (localStorage)

로그인: PBKDF2 검증 + 레거시 해시(sha256/plain) 자동 마이그레이션

info.html

Canvas 기반 CAPTCHA (대/소문자 구분) — 사람 인증 후 진행

cctv.html (메인 관제 페이지)

Leaflet 지도에 드론 마커 표시

지역별 드론 리스트 관리(추가/삭제) — 관리자 전용 기능

스트림 뷰어 (이미지(MJPEG) 방식), 캡처/녹화(클라이언트)

캡처/녹화 파일 클라이언트 암호화(.venc) — AES-GCM + PBKDF2

en-decode.html (권장명: en-decode)

클라이언트 사이드 파일 암/복호화 데모 (AES-GCM + PBKDF2)

스테가노그래피: PW → 텍스트 (가역 / 비가역)

screen.html

단순 스트림(MJPEG) 연결 테스트 페이지

📷 기능도 (제출용 이미지)

심사 시 안정성 확보 팁: 외부 CDN 링크 대신 images/로 복사해서 ./images/파일명으로 참조하세요.

main (허브)
<img src="https://github.com/user-attachments/assets/c173e6db-c673-460b-bb90-9995b0b7c19b" alt="main" />

login (회원가입 / 로그인)
<img src="https://github.com/user-attachments/assets/c173e6db-c673-460b-bb90-9995b0b7c19b" alt="login" />

cctv (관제 대시보드)
<img src="https://github.com/user-attachments/assets/0fcf27e6-67d6-46d5-ba86-e6903e5e3ce1" alt="cctv" />

en-decode (암/복호화 툴)
<img src="https://github.com/user-attachments/assets/075dcd6c-5347-41bf-9bac-57d1d8e33688" alt="en-decode" />

(원하면 위 URL들을 ./images/... 파일로 교체한 <img> 태그로 바꿔 드립니다.)

🗂 파일별 역할 (간단 요약)

main.* — 대회용 허브(소개 + 이동 버튼)

login.* — 로컬 사용자 가입/인증(심사용)

info.* — CAPTCHA(사람 인증)

cctv.* — 관제 대시보드: 지도, 스트림, 캡처/녹화, 권한 분기

en-decode.* — 암/복호화 데모 및 스테가

screen.* — MJPEG 스트림 테스트 페이지

images/ — UI·기능도 이미지 보관

docs/ — 제출용 최종보고서

✔ 제출 체크리스트 & 주의사항 (대회용)

 모든 HTML 파일은 **루트(또는 심사자 지정 폴더)**에 위치시켜 상대경로 깨짐 방지

 images/ 폴더에 사용 이미지 전부 포함 (./images/...)

 파일명에 특수문자 사용 금지 (en&decode.html → en-decode.html)

 내부 링크(window.location.href = 'xxx.html' 등)는 파일 위치 기준으로 상대경로 조정 필요

예: 파일을 pages/로 옮기면 window.location.href = '../main.html' 로 변경

 실시간 스트림(MJPEG)은 심사 환경에서 차단될 수 있음 → 기능도(이미지)와 docs/최종 보고서 함께 제출 권장

 로컬 실행 권장: python -m http.server 8000 → http://localhost:8000/main.html

 docs/최종 보고서 2차.docx 포함 확인

❓ FAQ (자주 발생 문제)

Q. HTML을 폴더로 옮겼더니 페이지 이동이 안 돼요.

A. 모든 링크(href, window.location.href, 이미지 src)는 상대경로 기준입니다. 파일 위치를 변경하면 경로를 재설정하세요 (./, ../ 등).

Q. 이미지가 안 보입니다.

A. images/ 폴더에 파일이 있는지, HTML에서 ./images/파일명으로 지정했는지 확인하세요. 대소문자도 구분됩니다.

Q. en&decode.html 파일명이 문제를 일으켜요.

A. & 등 특수문자로 인해 서버/압축/OS 문제 발생 가능. **en-decode.html**로 변경하세요.

📦 제출 권장 패키지 이름

AlleyEye_팀_코드톡톡.zip — 루트(HTML들) + images/ + docs/최종 보고서 2차.docx 포함

심사용 한마디:
main.html을 시작점으로 로그인 → CAPTCHA → CCTV 관제 → 암호화 툴 순서로 시연하세요. 네트워크 의존(실시간 스트림)은 환경에 따라 차단될 수 있으니, 기능도 이미지와 최종보고서를 함께 제출해 흐름을 보완하세요.
