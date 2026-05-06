# 코드 작성 원칙

1. 코드 자체가 문서이기 때문에 코드 작성시 가독성을 최우선한다.
2. 작성한 코드는 모두 유지보수 부채로 남기 때문에 최소한의 코드로 구현하거나 검증된 패키지를 활용하며, 패키지의 기본값과 동일한 옵션은 명시하지 않는다.
3. 이름이 코드의 의도를 가장 먼저 드러내기 때문에 구현이 아닌 동작과 도메인이 보이도록 다듬는다.
4. 테스트 제목이 구현에 의존하면 구현이 바뀔 때마다 테스트까지 따라 바뀌기 때문에 도메인 언어로 서술한다.
5. 코드 스멜을 방치할수록 부채가 커지기 때문에 발견 즉시 리팩터링을 한다.
6. 코드 작성은 글쓰기와 같기 때문에 문맥에 맞게 줄을 띄워 논리 흐름과 시각적 편안함을 살린다.

# 저장소 구조

단일 패키지 Electron 데스크탑 앱이다. 디렉토리는 책임 단위로 나뉜다.

| 경로                | 역할                                            |
|-------------------|-----------------------------------------------|
| `src/main/`       | Electron 메인 프로세스. 파일·OS·서브프로세스 단일 게이트웨이.       |
| `src/preload/`    | `window.giraffe` 브릿지. IPC 표면을 좁게 노출한다.         |
| `src/renderer/`   | React UI. 도메인 로직 없음 — 모두 `window.giraffe` 경유. |
| `src/shared/`     | 메인·렌더러 양쪽이 import 가능한 순수 모듈 (zod 스키마, URL 빌더). |
| `tests/main/`     | Vitest. 메인 모듈과 시리얼라이저 단위·통합 테스트.               |
| `scripts/patches/`| 외부 의존(`~/.claude/skills/blog/scripts/`)에 적용한 diff 백업. |

# 기술 스택

| 분류             | 기술                                |
|----------------|-----------------------------------|
| Language       | TypeScript                        |
| App Shell      | Electron                          |
| Build          | Vite (electron-vite)              |
| UI             | React                             |
| Editor         | TipTap (ProseMirror)              |
| Validation     | zod                               |
| Persistence    | electron-store, gray-matter, fs   |
| Test           | Vitest                            |
| External macro | Python 3 (`paste_to_naver.py`)    |

# 개발 환경

- 패키지 매니저는 pnpm만 사용한다.
- `pnpm dev`로 메인·preload·renderer를 동시에 빌드하고 Electron을 띄운다.
- `pnpm test`로 Vitest 전체 실행, `pnpm test:watch`로 개발 중 파일 감시.
- `pnpm build`로 `out/`에 프로덕션 번들 생성.

# 외부 의존

- `~/.claude/skills/blog/scripts/paste_to_naver.py` — 네이버 SmartEditor 자동 paste 매크로. 사용자 보유 자산이며 본 앱이 spawn한다. 패치는 `scripts/patches/` 아래 diff로 보존한다.
- 데이터(`drafts/`, `posts/`, `images/`, `style-guide.md`)는 첫 실행 시 사용자가 지정한 corpus 폴더에 저장된다. 앱 코드 폴더에는 사용자 데이터를 두지 않는다.

# 패키지 추가

- AI 에이전트가 새 패키지를 추가할 때는 먼저 사용자에게 제안하고 승인을 받는다.
- 사용자가 작성한 코드를 AI 에이전트가 다른 패키지로 대체할 수 있으면 사용자에게 제안하고 승인을 받는다.
- AI 에이전트는 공신력 있거나 유명한 패키지를 추천한다.
