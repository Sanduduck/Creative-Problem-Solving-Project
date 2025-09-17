AlleyEye — 대회 제출용 README

프로젝트명: 객체 탐지 기반 드론 감시 시스템 (팀: 코드톡톡)
목적: 창의문제해결 경진대회 제출용 배포·데모 문서
주의: 본 문서는 대회 심사용으로 간결하게 정리되어 있습니다. (로컬에서 http 서버로 실행 권장)

🚩 한줄 요약

사각지대를 감시하는 이동형 CCTV 드론 + 실시간 관제(지도·스트림) + 클라이언트 사이드 파일 암호화( AES-GCM + PBKDF2 )를 대회용 프로토타입으로 구현한 데모 저장소입니다.

목차

배포 폴더 구조 (추천)

빠른 실행 (심사용)

주요 기능 (요약)

기능도 (대회 제출용 이미지)

파일별 역할

제출 체크리스트 & 주의사항

배포 폴더 구조 (추천)
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
├─ en-decode.html        # 권장: 'en&decode.html' → 'en-decode.html'
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


권장 규칙: 모든 이미지/아이콘은 ./images/ 아래에 두고 HTML에서 ./images/파일명 형식으로 참조하세요.
중요: 파일명에 & 같은 특수문자 사용은 피하세요 (en&decode.html → en-decode.html).

빠른 실행 (심사용)

저장소 루트에서 간단한 정적 서버 실행:

python -m http.server 8000


브라우저에서 접속: http://localhost:8000/main.html

흐름: main → login → info(CAPTCHA) → cctv → en-decode → screen

스트림 테스트(로컬 MJPEG): screen.html 에서 스트림 URL 입력 후 Load 클릭

주요 기능 (요약)

인트로 / 네비게이션 (main.html) — 프로젝트 소개 및 페이지 연결

회원관리 (로컬) (login.html)

회원가입: PBKDF2-SHA256으로 비밀번호 저장(로컬 localStorage)

로그인: PBKDF2 검증 + 레거시 hash 마이그레이션 지원

CAPTCHA 인증 (info.html) — Canvas 기반 사용자 검증(대/소문자 구분)

관제 대시보드 (cctv.html)

Leaflet 지도에 드론 마커 표시

드론 리스트(지역별) 관리, 추가/삭제(관리자 권한)

스트림 뷰어(이미지 기반 MJPEG), 캡처/녹화(클라이언트 녹화)

캡처/녹화 파일 클라이언트 암호화 (.venc) 기능

암호화 툴 (en-decode.html)

AES-GCM + PBKDF2(310k) 기반 파일 암/복호화 데모

스테가노그래피(PW → 텍스트): 가역/비가역 모드 제공

스트림 테스트 (screen.html) — MJPEG 스트림 연결 테스트 페이지

기능도 (대회 제출용 이미지)

README에 직접 보여줄 기능도 이미지를 <img> 태그로 삽입하세요. (대회 제출 시 심사 자료 이미지 링크로 대체 가능)

main (허브)
<img width="2346" height="1080" alt="Image" src="https://github.com/user-attachments/assets/c173e6db-c673-460b-bb90-9995b0b7c19b" />

login (회원가입 / 로그인 흐름)
<img width="2346" height="1080" alt="Image" src="https://github.com/user-attachments/assets/c173e6db-c673-460b-bb90-9995b0b7c19b" />

cctv (관제 대시보드)
<img width="4735" height="2113" alt="Image" src="https://github.com/user-attachments/assets/0fcf27e6-67d6-46d5-ba86-e6903e5e3ce1" />

en-decode (암/복호화 툴)
<img width="1819" height="1981" alt="Image" src="https://github.com/user-attachments/assets/075dcd6c-5347-41bf-9bac-57d1d8e33688" />

Tip: GitHub 상에서 외부 CDN 이미지 대신 리포지토리의 images/로 복사해 참조하면 안정적입니다.

파일별 역할 (간략)

main.* — 대회용 허브 페이지 (프로젝트 요약, 이동 버튼)

login.* — 로컬 사용자 가입/인증 데모 (심사용)

info.* — CAPTCHA(사람 인증) — 심사 흐름 연결 체크

cctv.* — 메인 관제: 지도, 스트림, 캡처/녹화, 권한 분기

en-decode.* — 암호화 데모: AES-GCM + PBKDF2 + 스테가

screen.* — 스트림(MJPEG) 연결/테스트 페이지

images/ — 모든 UI/기능도 이미지 저장

docs/최종 보고서 2차.docx — 제출용 최종보고서

제출 체크리스트 & 주의사항 (대회용)

 모든 HTML 파일은 **루트(혹은 심사자 명시 경로)**에 위치시켜 상대경로 깨짐 방지

 images/ 폴더에 사용 이미지 전부 저장 (./images/...)

 파일명에 특수문자(&, ? 등) 사용 금지 — en&decode.html → en-decode.html 권장

 main.html 등에서 window.location.href = 'xxx.html' 같은 링크는 동일한 폴더일 때만 작동. 폴더 변경 시 상대경로 수정 필요

예: 파일을 pages/로 옮기면 window.location.href = '../main.html' 로 바꿔야 함

 스트림(외부 IP/MJPEG)은 심사환경 네트워크 제한으로 접근 불가할 수 있음 — 스크린샷/기능도로 보조 설명 필수

 로컬 실행 권장: python -m http.server 8000 → http://localhost:8000/main.html

 docs/최종 보고서 2차.docx 포함 확인

자주 발생하는 문제 (FAQ)

Q. HTML을 폴더로 옮겼더니 페이지 이동이 안 돼요.
→ A. 모든 링크(HTML 내부 href, window.location.href, 이미지 src)는 상대경로 기준입니다. 파일 위치를 변경하면 경로을 재설정해야 합니다 (./, ../ 등).

Q. 이미지가 안 보입니다.
→ A. 이미지 파일이 images/에 있는지, HTML에서 ./images/파일명으로 맞게 지정했는지 확인하세요. 대소문자도 구분됩니다.

Q. en&decode.html 파일명이 문제를 일으켜요.
→ A. 특수문자 & 때문에 압축/서버/OS에서 문제 발생 가능. en-decode.html로 변경하세요.

제출 문구 (권장)

제출용: AlleyEye_팀_코드톡톡.zip — 루트(HTML들) + images/ + docs/최종 보고서 2차.docx 포함

마무리(심사용 한마디)

이 저장소는 대회 제출용 프로토타입입니다. 심사시는 main.html을 시작점으로 하여 로그인 → CAPTCHA → CCTV 관제 → 암호화 툴 순으로 시연해 주세요. 네트워크 의존 요소(실시간 스트림)는 환경에 따라 연결이 제한될 수 있으니, 기능도 이미지와 docs/최종 보고서 2차.docx를 함께 제출하여 흐름을 보완해 주세요.

Good luck — 팀 코드톡톡
