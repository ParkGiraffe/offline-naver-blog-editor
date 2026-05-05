# Smart Giraffe Editor — 설계서

**작성일**: 2026-05-05
**대상**: 박기린(op5321) 네이버 블로그 작성 전용 macOS 데스크톱 에디터

---

## 1. 목적과 범위

오프라인에서 노션 스타일로 블로그 글을 작성하고, 한 번의 버튼 클릭으로 네이버 스마트에디터에 사진과 함께 완벽하게 옮겨 붙이는 데스크톱 앱.

**왜 만드나**
- `~/.claude/skills/blog/` 의 검증된 매크로 파이프라인(`paste_to_naver.py`, `md_to_smarteditor.py`)은 이미 동작하지만, 입력은 마크다운 파일이라 시각 편집이 안 됨.
- 사진을 본문 흐름과 함께 보면서 작성·재배치하고 싶음.
- 매크로 실행을 GUI에서 한 번에 트리거하고 진행 상황을 보고 싶음.

**범위 밖 (YAGNI)**
- 다중 사용자, 동기화, 클라우드 백업
- Windows / Linux 지원 (macOS only)
- 네이버 외 플랫폼 발행
- 자동 SEO·이미지 최적화
- AI 글쓰기 보조 (그건 `/blog` 스킬의 영역)

---

## 2. 시스템 아키텍처

3 레이어 + 외부 매크로 의존:

```
Renderer (React + TipTap)
   ↕ IPC (preload bridge)
Main (Electron Node)
   ↕ child_process
검증된 Python 매크로 (~/.claude/skills/blog/scripts/)
```

- **Renderer**: 화면 그리기와 사용자 입력만. 도메인 로직 없음.
- **Main**: 파일·OS·프로세스 단일 게이트웨이.
- **Python 매크로**: 블랙박스. 입력은 drafts 폴더 경로, 출력은 stdout(진행) + exit code.

**저장 위치 분리**
- 앱 코드: `/Users/bag-yoseb/Desktop/Project/personal/smart-giraffe-editor/`
- 사용자 데이터(drafts, posts, index): 기존 corpus `…/personal/blog/.claude/blog-corpus/` (첫 실행 시 경로 한 번 잡고 settings.json에 저장)

---

## 3. 컴포넌트

**Renderer (`src/renderer/`)**

| 컴포넌트 | 책임 |
|---|---|
| `App.tsx` | 라우팅 (글 목록 ↔ 에디터), 토스트 컨테이너 |
| `DraftsList.tsx` | corpus의 `drafts/`를 mtime 역순으로 나열, 검색·카테고리 필터 |
| `Editor.tsx` | TipTap 인스턴스, 상단 제목 인풋, 메타 ⓘ 버튼, 보내기 버튼 |
| `MetaPanel.tsx` | 슬라이드 패널: 제목 후보 5(라디오), 해시태그, 카테고리(드롭다운) |
| `extensions/SectionHeading.ts` | 노란 형광펜 24px 굵게 노드. `##` 단축키 |
| `extensions/Divider.ts` | 구분선 노드. `---` 단축키 |
| `extensions/PhotoBlock.ts` | 사진 노드. ⌘V 핸들러로 클립보드 이미지 수신 |
| `extensions/SlashMenu.ts` | `/` 입력 시 블록 종류 팝업 |
| `Toast.tsx` | 우상단 작은 알림. 매크로 진행 라인 표시 |

**Main (`src/main/`)**

| 모듈 | 책임 |
|---|---|
| `main.ts` | 앱 부트, 윈도우 생성, IPC 채널 등록 |
| `corpus.ts` | corpus 경로 read/write, drafts/posts/index.json 접근 |
| `draftStore.ts` | draft CRUD: 슬러그 생성, script.md/meta.json/images |
| `serializer.ts` | TipTap JSON ↔ script.md(+frontmatter) 양방향 변환 |
| `clipboardImage.ts` | 클립보드 이미지 추출 → `images/`에 PNG 저장 → 경로 반환 |
| `macroRunner.ts` | `paste_to_naver.py` spawn, stdout 스트림 → renderer IPC |
| `pythonResolver.ts` | 시스템 python3 경로 탐색, 매크로 스크립트 경로 해석 |

**Preload (`src/preload/index.ts`)**
`window.giraffe`로 좁은 IPC 표면 노출:
- `listDrafts()`, `loadDraft(slug)`, `saveDraft(slug, json, meta)`
- `pasteImageFromClipboard(slug)` → 저장된 파일경로 반환
- `runMacro(slug)`, `cancelMacro()`, `onMacroProgress(cb)`
- `getCorpusPath()`, `setCorpusPath(p)`

---

## 4. 데이터 흐름과 파일 포맷

**저장 단위**: `<corpus>/drafts/<slug>/` 폴더 (기존 `/blog` 스킬과 100% 호환)

```
drafts/2026-05-05-poko-47-laplace/
├── script.md       # frontmatter + 본문 마크다운
├── meta.json       # 제목 후보, 해시태그, 카테고리
├── post.html       # md_to_smarteditor.py 산출물 (보내기 직전 재생성)
└── images/
    ├── 1.png
    ├── 2.png
    └── ...
```

**script.md 포맷**
```markdown
---
title: 포코피아 47화 라프라스 등록
category: 포코피아
date: 2026-05-05
---

# 포코피아 47화 라프라스 등록

라프라스를 잡으러 갔습니다.

![](images/1.png)

## 첫 시도

생각보다 어려웠어요. **물타입**이라 약점이 까다롭더라.

---

## 두 번째 시도

[공략 영상](https://example.com)을 참고해서…
```

**TipTap JSON 매핑**
- `paragraph` ↔ `<p>` (본문)
- 커스텀 `sectionHeading` ↔ `## …`
- 커스텀 `divider` ↔ `---`
- 커스텀 `photoBlock` (attrs: `{src, alt}`) ↔ `![alt](images/N.png)`
- 마크: `bold`/`italic`/`underline`/`link`/`highlight`/`textColor` (TipTap 표준 + 커스텀)

**클립보드 이미지 처리**
1. Renderer가 paste 이벤트 감지 → preload 호출
2. Main의 `clipboardImage.ts`가 `clipboard.readImage()` → PNG 버퍼
3. `<corpus>/drafts/<slug>/images/`에 SHA-256 해시 + 카운터 기반 이름으로 저장 (충돌 방지)
4. 저장된 상대 경로(`images/N.png`)를 renderer로 리턴
5. Renderer는 그 경로로 `photoBlock` 노드 삽입

**자동 저장**: 입력 멈춤 후 800ms debounce로 main에 saveDraft. settings.json에 마지막 작업 슬러그 기록.

---

## 5. 매크로 오케스트레이션

**보내기 버튼 클릭 흐름**

1. 현재 TipTap JSON을 `script.md`로 직렬화 → 디스크 저장
2. `meta.json`도 사이드 패널 상태로 갱신 저장
3. Main이 `python3 ~/.claude/skills/blog/scripts/md_to_smarteditor.py <draft>` 실행해서 `post.html` 재생성
4. Main이 `python3 ~/.claude/skills/blog/scripts/paste_to_naver.py <draft>` spawn
5. Python 측은 매 chunk 처리 직전에 fd:3(전용 진행 채널)로 한 줄씩 출력:
   ```
   {"type":"progress","i":4,"n":12,"kind":"image","detail":"images/1.png"}
   ```
   stdout/stderr는 사람이 읽는 기존 print를 위해 그대로 둠. Node는 spawn 시 stdio: `['ignore','pipe','pipe','pipe']`로 fd:3을 추가 파이프로 연다.
6. Main이 fd:3을 line-buffered로 읽어 IPC `macro:progress`로 renderer 전송
7. Renderer 토스트가 `4/12 사진 1 업로드중`처럼 갱신
8. Python exit code 0 → 토스트 `완료 12/12`, 비0 → `실패: 사진 1에서 멈춤` + 로그 모달

**Python 측 확장 (최소)**
- `paste_to_naver.py`에 `--json-progress` 플래그 추가. 기존 인간용 print는 stdout 그대로, 플래그가 있으면 라인당 JSON 한 줄을 fd:3에 별도로 출력 (`os.write(3, line.encode())`).
- `md_to_smarteditor.py`에 인라인 마크 6종(굵게/기울임/밑줄/링크/형광펜/색상) 지원 추가. 본문 reset span 안에 중첩 안전하게.
- 두 스크립트 모두 기존 CLI는 깨뜨리지 않음 — `/blog` 스킬과 공존.

**취소**
- 토스트의 작은 ✕ → main이 child process에 SIGINT → Python 매크로가 시작한 chunk 끝낸 뒤 종료
- 부분 paste된 상태는 사용자가 네이버 측에서 수동 정리

---

## 6. 인라인 스타일 풀세트 처리

TipTap 마크 → HTML 매핑 (검증된 본문 reset span 안쪽에 중첩):

| 마크 | 출력 |
|---|---|
| bold | `<b>…</b>` |
| italic | `<i>…</i>` |
| underline | `<u>…</u>` |
| link | `<a href="…" target="_blank">…</a>` |
| highlight (형광펜) | `<span style="background-color:#fff593;">…</span>` |
| textColor | `<span style="color:…;">…</span>` |

**중첩 규칙**: 본문 단락은 항상 reset span (`font-size:15px;font-weight:normal;background-color:transparent;color:#212529`)으로 감싸고, 그 안에 마크들이 중첩됨. 네이버 sanitizer는 inline `style` 속성만 허용하므로 class는 절대 사용 금지.

**검증**: corpus의 `posts/*.md` 중 무작위 5편을 새 변환기로 돌려서 기존 `paste_to_naver.py` 산출물과 diff. 마크 없는 본문은 byte-exact.

---

## 7. 에러 처리와 테스트 전략

**실패 시나리오와 대응**

| 시나리오 | 대응 |
|---|---|
| corpus 경로가 없거나 이상함 | 첫 실행 화면으로 fallback, 경로 재선택 |
| script.md frontmatter 깨짐 | 에디터 진입 차단, 원본을 외부 편집기로 열라는 안내 |
| 클립보드에 이미지 아님 | paste 무시, 토스트 "클립보드에 이미지 없음" |
| 같은 이름 이미지 충돌 | 해시 + 카운터로 자동 고유화 |
| python3 못 찾음 | 시작 시 검사, 못 찾으면 설정 화면에서 경로 지정 |
| 매크로 중간 실패 | 마지막 성공 chunk index 표시, "이어서" 버튼은 v1 범위 밖 |
| 접근성 권한 없음 | 매크로 시작 전 검사, 시스템 설정 안내 모달 |

**테스트**
- **Main 모듈 단위 테스트** (vitest): `serializer` 양방향 round-trip, `clipboardImage` 해시 충돌, `draftStore` CRUD
- **렌더러 컴포넌트 테스트** (vitest + jsdom): TipTap 확장 노드의 마크다운 단축키, 슬래시 메뉴, ⌘V 핸들러
- **통합 테스트**: 임시 corpus 디렉토리에 mock draft 저장 → main이 `paste_to_naver.py --dry-run`(추가 플래그) 실행 → stdout 라인 카운트 검증
- **수동 회귀**: corpus의 최근 글 1편을 에디터로 열고 다시 저장 → script.md byte-exact (인라인 마크 없는 케이스)

---

## 8. 구현 순서 (참고)

writing-plans 스킬에서 상세화하지만 큰 그림은:

1. Electron + Vite + React + TipTap 부트스트랩
2. `serializer.ts` (TipTap JSON ↔ script.md) — 가장 위험한 부분 먼저
3. corpus / draftStore / preload 계약
4. DraftsList → Editor 라우팅, 자동 저장
5. PhotoBlock + 클립보드 이미지 핸들링
6. SectionHeading + Divider + 인라인 마크 + SlashMenu
7. MetaPanel + 제목 인풋
8. macroRunner + Python 측 `--json-progress` 확장 + Toast
9. `md_to_smarteditor.py` 인라인 마크 6종 확장
10. 에러 케이스 정리, 통합 테스트, 수동 회귀

---

## 9. 결정 요약 (브레인스토밍 결과)

| 항목 | 결정 |
|---|---|
| 매크로 모드 | 완전 자동 (사용자 손 안 댐) |
| 기술 스택 | Electron + React + TipTap |
| 인라인 스타일 | 굵게 / 기울임 / 밑줄 / 링크 / 형광펜 / 색상 |
| 저장 포맷 | `/blog` drafts/ 폴더 100% 호환 |
| 사진 입력 | 클립보드 ⌘V → `images/` 자동 복사 |
| 레이아웃 | 미니멀 단일 글 집중, 글 목록 별도 화면 |
| 블록 추가 | 마크다운 단축키 + `/` 슬래시 메뉴 둘 다 |
| 매크로 실행 중 UI | 우상단 토스트 |
| 제목·메타 | 상단 제목 인풋 + ⓘ 버튼 슬라이드 패널 |
| 매크로 통합 | 기존 `paste_to_naver.py` subprocess + stdout 진행 스트림 |
