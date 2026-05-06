# offline-naver-blog-editor

네이버 블로그 글을 노션 스타일로 오프라인에서 작성하고, 한 번의 버튼 클릭으로 SmartEditor에 사진까지 그대로 붙여넣는 macOS 데스크탑 에디터.

블로그 작성을 도와주는 공식 [`/blog`](https://github.com/ParkGiraffe) Claude Code 스킬과 같은 corpus 폴더를 공유하기 때문에, 스킬이 만들어둔 초안을 그대로 열어서 다듬을 수도 있고, 새 글을 직접 쓸 수도 있다.

## 주요 기능

- TipTap 기반 미니멀 단일 글 집중 레이아웃
- 마크다운 단축키 + `/` 슬래시 메뉴로 섹션 헤딩·구분선·사진 블록 추가
- 이미지: 클립보드 ⌘V·Finder 드래그앤드롭 모두 지원, 자동으로 글의 `images/`로 복사
- 인라인 마크 풀세트(굵게/기울임/밑줄/형광펜/색/링크), 텍스트 선택 시 floating 툴바
- 800ms debounce 자동 저장
- 카테고리·해시태그·제목 후보를 우측 슬라이드 패널에서 편집
- 보내기 한 번 클릭으로 검증된 매크로 spawn → 5초 카운트다운 → 네이버 SmartEditor에 본문 + 사진 자동 paste
- 우상단 토스트로 매크로 진행 상황 실시간 표시

## 사전 요구사항

- macOS (Apple Silicon 기준; Intel도 빌드 가능하지만 미검증)
- Node.js 22 + pnpm
- Python 3 — 매크로 실행용. `python3` 명령으로 잡혀야 함
- [블로그 corpus 폴더](https://github.com/ParkGiraffe) — `/blog-learn` 스킬이 만들어두는 디렉토리
- `~/.claude/skills/blog/scripts/paste_to_naver.py` — 매크로 본체. 본 앱이 spawn한다

## 1. 개발 모드로 실행

가장 빠르게 띄우는 방식. Vite HMR이 적용돼서 코드 바꾸면 즉시 반영된다.

```bash
git clone https://github.com/ParkGiraffe/offline-naver-blog-editor.git
cd offline-naver-blog-editor
pnpm install
pnpm dev
```

처음 실행하면 Electron 바이너리(~100MB)가 다운로드된 뒤 윈도우가 뜬다. Setup 화면에서 corpus 경로를 입력하고 저장하면 글 목록 화면으로 들어간다.

## 2. 빌드만 하고 싶을 때

번들만 만들고 실제 앱으로 묶지는 않는다. 디버깅·CI에서 타입 체크 정도로 쓴다.

```bash
pnpm build
```

산출물은 `out/` 아래 main / preload / renderer 세 묶음이다.

## 3. `.app` 만들기

배포 가능한 macOS 앱 번들을 만든다.

```bash
pnpm package
```

산출물은 `dist/mac-arm64/Smart Giraffe Editor.app` (~240MB). Finder에서 `/Applications`로 드래그하면 끝. DMG·zip 등 추가 포맷이 필요하면 `package.json`의 `build.mac.target`을 `dir` 대신 `dmg`/`zip`으로 바꾸면 된다.

설치 후 첫 실행 때 Gatekeeper 경고가 뜨는데, 우클릭 → 열기로 한 번만 허용하면 그 뒤로는 그냥 더블클릭으로 실행된다. 코드사인이 self-signed라 그렇다 — Apple Developer 계정으로 정식 사인하려면 `electron-builder`의 코드사인 설정을 추가해야 한다.

## 첫 실행 셋업 (1회)

1. **Corpus 경로 지정** — Setup 화면에 `/blog-corpus` 폴더 절대 경로 입력. 예: `/Users/bag-yoseb/Desktop/Project/personal/blog/.claude/blog-corpus`
2. **macOS 손쉬운 사용 권한** — 시스템 설정 → 개인정보 보호 및 보안 → 손쉬운 사용에 `Smart Giraffe Editor` 추가. 매크로의 `osascript`로 ⌘+V를 자동 전송하기 위해 필요. 권한 없이도 클립보드는 채워지지만 자동 paste는 동작하지 않는다.

## 디렉토리

```
src/
├── main/         Electron 메인 프로세스 — 파일·OS·서브프로세스 게이트웨이
├── preload/      contextBridge로 좁은 IPC 표면(window.giraffe) 노출
├── renderer/     React UI — 도메인 로직 없음, 모두 window.giraffe 경유
└── shared/       메인·렌더러 양쪽이 import 가능한 순수 모듈

tests/main/        Vitest 단위·통합 테스트
scripts/patches/   외부 매크로(`paste_to_naver.py`)에 적용한 diff 백업
docs/superpowers/  설계 명세 + 구현 플랜
```

## 테스트

```bash
pnpm test         # 35개 테스트 1회 실행
pnpm test:watch   # 파일 감시 모드
```

## 라이선스

MIT.
