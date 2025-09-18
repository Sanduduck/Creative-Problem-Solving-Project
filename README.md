# AlleyEye

### 객체 탐지 기반 드론 감시 시스템 — 대회 제출용 (팀 코드톡톡)

---

## 📌 프로젝트 소개

* 고정형 CCTV의 사각지대를 보완하는 **이동형 CCTV 드론 기반 실시간 감시 프로토타입**입니다.
* 실시간 스트림 관제(지도 + 이미지 스트림), 캡처·녹화, 클라이언트 측 암호화(.venc), 스테가노그래피 기반 키 표현 기능을 포함합니다.
* 창의문제해결 경진대회(심사용) 제출용으로 **간결·직관적 시연**에 초점을 맞춘 데모 저장소입니다.
* 로컬 정적 서버(HTTP)로 실행하여 심사요청 흐름을 즉시 시연할 것을 권장합니다.

---

## 팀원 구성

<div align="center">

|                                                           **팀장: 박동진**                                                          |                                                           **이승헌**                                                           |                                                        **오유진**                                                        |                                                                **김준영**                                                               |
| :----------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------: |
| [<img src="https://avatars.githubusercontent.com/lico0531" height=120 width=120> <br/> @lico0531](https://github.com/Sanduduck) | [<img src="https://avatars.githubusercontent.com/luybnah" height=120 width=120> <br/> @luybnah](https://github.com/lico0531) | [<img src="https://avatars.githubusercontent.com/s2865" height=120 width=120> <br/> @s2865](https://github.com/5u0612) | [<img src="https://avatars.githubusercontent.com/yunseo0227" height=120 width=120> <br/> @yunseo0227](https://github.com/Urban-Potato-717) |

</div>

---

## 📅 개발 기간

* 24/05/25 \~ 진행중 (대회 제출용 브랜치 기준)

---

## 👨‍💻 개발 담당 (요약)

* **박동진 (팀장)** — BackEnd/FrontEnd 통합(웹앱 개발)
* **이승헌** — H/W·IoT
* **오유진** — FrontEnd
* **김준영** — H/W 보조

---

## 🛠️ 사용 기술

* H/W: Raspberry Pi v5 (드론/이동형 CCTV 프로토타입)
* Backend: Flask · Node/React (데모 흐름 일부)
* Frontend: HTML / CSS / JavaScript (심사용 정적 페이지)
* ML: YOLOv8 (객체 탐지) — 모델은 대회 규정상 별도 제공 가능
* Database: MongoDB (시연용 일부 로그 저장)
* 통신: REST API, MQTT(HiveMQ) (필요 시), 외부 OAuth(Kakao) 연동 샘플

---

## 🎯 주요 기능

* **회원가입 / 로그인 / 권한 분기 (관리자/뷰어)** — 클라이언트 localStorage 기반 데모
* **CAPTCHA (info.html)** — Canvas 기반 사용자 검증 흐름
* **관제 대시보드 (cctv.html)**

  * Leaflet 지도에 드론(장치) 마커 표시
  * 지역별 드론 추가/삭제(관리자 전용)
  * MJPEG 이미지 스트림 뷰어, 프레임 캡처, 클라이언트 녹화(MediaRecorder)
  * 캡처/녹화 파일 → \*\*AES-GCM 암호화(.venc)\*\*로 저장
* **암호화 & 스테가툴 (en-decode.html)**

  * AES-GCM(256) + PBKDF2-SHA256(기본 310k iter) 기반 암/복호화
  * 스테가노그래피: 비밀번호 ↔ 사람이 읽기 쉬운 문장(가역/비가역 모드) 변환
* **스트림 테스트 (screen.html)** — 로컬/내부 네트워크 MJPEG 스트림 테스트 페이지

---

## 📂 프로젝트 구조 (권장)

```
/ 📂(repo root)
├─ 📂README.md
├─ 📂main.html, main.css, main.js      # 허브 / 프로젝트 소개 페이지
├─ 📂login.html, login.css, login.js   # 회원가입 / 로그인 (localStorage + PBKDF2)
├─ 📂info.html, info.css, info.js      # CAPTCHA 및 심사용 안내 페이지
├─ 📂cctv.html, cctv.css, cctv.js      # 관제 대시보드 (지도, 스트림, 캡처/녹화, 암호화)
├─ 📂en-decode.html, en-decode.css, en-decode.js  # 암복호화 & 스테가 도구
├─ 📂screen.html, screen.css, screen.js  # 스트림 테스트 (MJPEG)
├─ 📂images/                            # 모든 이미지(logo, 기능도, 스크린샷)
└─ docs/
   └─ 최종 보고서 2차.docx            # 상세 보고서 (제출 파일)
```

**주의사항**

* 모든 이미지는 `./images/`에 넣고 HTML에서 `./images/filename.png`로 참조하세요. (대소문자 구분)

---

## 📷 결과 (시연용 스크린샷 / 기능도)

**main (허브)** <img width="800" alt="main" src="https://github.com/user-attachments/assets/c173e6db-c673-460b-bb90-9995b0b7c19b" />

**login (회원가입 / 로그인 흐름)** <img width="800" alt="login" src="https://github.com/user-attachments/assets/c173e6db-c673-460b-bb90-9995b0b7c19b" />

**cctv (관제 대시보드)** <img width="800" alt="cctv" src="https://github.com/user-attachments/assets/0fcf27e6-67d6-46d5-ba86-e6903e5e3ce1" />

**en-decode (암/복호화 툴)** <img width="600" alt="en-decode" src="https://github.com/user-attachments/assets/075dcd6c-5347-41bf-9bac-57d1d8e33688" />

---

## 🧾 스테가노그래피(자체 제작 알고리즘)  & 암호화 — 기술 상세 (추가)

### 암호화 요약

* **대칭:** AES-GCM (256-bit)
* **키 유도:** PBKDF2-SHA256 (기본 반복수: 310,000 — 데모/심사용)
* **파일 포맷(.venc):** 고유 매직(`VIDENC01`) + 파라미터(alg id, iter, salt len, iv len, name/mime len) + salt + iv + 파일명/메타 + 암호문
* **복호화:** 동일 비밀번호 필요, en-decode 도구에서 복호화 가능

### 스테가노그래피(팀 제작)

* **목적:** 암호(또는 키)를 사람이 읽기 쉬운 문장(또는 단어열)로 변환해 전달성을 높임
* **동작 모드:**

  * **가역 (Reversible)**: 문장 ↔ 원래 비밀번호 상호 변환 가능 (심사/운영용)
  * **비가역 (Irreversible)**: 문장에서 키만 파생, 원본 비밀번호는 복원 불가 (보안 지향)
* **활용 예시:** 캡처 파일 암호화를 위해 운영자가 심사자에게 “가독 문장”으로 비밀번호 전달 → 심사자는 en-decode에서 동일한 문장으로 복호화 / 가역 모드 사용 권장
* **보안 주의:** 실사용 시 키 관리(전달 경로), 반복수, salt/iv 관리 정책을 강화해야 함.

---

## 🔧 파일별 역할 (간단 정리)

* `main.*` — 심사용 허브(소개 + 이동 버튼)
* `login.*` — 로컬 회원가입/로그인 (PBKDF2 localStorage 데모)
* `info.*` — CAPTCHA(사람 검증) / 심사용 플로우 연결
* `cctv.*` — 관제 대시보드(지도, 스트림, 캡처/녹화, 암호화 저장)
* `en-decode.*` — 암복호화 툴 + 스테가 전환 툴
* `screen.*` — 스트림(MJPEG) 연결 테스트 페이지
* `images/` — UI 리소스, 기능도, 스크린샷 등
* `docs/최종 보고서 2차.docx` — 상세 보고서/발표 자료


## ❗ 자주 발생하는 문제 (FAQ)

**Q. 페이지를 폴더로 옮겼더니 이동이 안 됩니다.**

* A: HTML 내부의 `href`, `window.location.href`, 이미지 `src`는 **상대경로 기준**입니다. 파일 이동 시 경로(예: `../main.html`)를 수정하세요.

**Q. 이미지가 보이지 않습니다.**

* A: `images/`에 파일이 있는지, 파일명·대소문자가 일치하는지 확인하세요.

**Q. WebCrypto/crypto.subtle 관련 오류가 발생합니다.**

* A: `crypto.subtle.importKey` 등 WebCrypto 기능은 \*\*HTTPS 환경(또는 localhost)\*\*에서 동작 권장합니다. 로컬 테스트는 `http://localhost`로 실행하거나 최신 브라우저 사용 권장.

**Q. 스트림(CORS) 또는 캡처가 실패합니다.**

* A: 스트림 서버에 `Access-Control-Allow-Origin` 헤더가 필요할 수 있습니다. 또는 HTTPS 페이지에서 HTTP 스트림을 불러오면 Mixed Content로 차단됩니다(HTTPS 페이지는 HTTP 스트림 차단).

---

## 참고자료 / 링크

* `docs/최종 보고서 2차.docx` — 설계·실험·결과 포함(리포지토리 내)
* 블로그(개발 과정): 내부 링크(원팀 블로그) — 필요 시 README에 추가

---


*원하시면 이 문서를 바로 커밋용으로 정리하거나 `docs/`에 복사해 드립니다.*

