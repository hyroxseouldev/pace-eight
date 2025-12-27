# 코치 프로그램 기능 고도화 (Editor & Multi-Session) PRD

## 1. 개요 (Overview)
코치가 더 풍부한 콘텐츠를 제공할 수 있도록 **위지윅 에디터(WYSIWYG Editor)**를 도입하고, 워크아웃의 구조를 **멀티 세션(Multi-Session)** 형태로 고도화하여 체계적인 훈련 프로그램을 제공합니다.

## 2. 주요 변경 사항 (Key Changes)

### 2.1. 위지윅 에디터 도입 (Tiptap)
- **대상:** 
  1. 프로그램 상세 설명 (Program Description)
  2. 워크아웃 세션 내용 (Session Content)
- **기능:**
  - 기본 텍스트 서식 (Bold, Italic, List 등)
  - **이미지 업로드** (Supabase Storage 연동)
  - **유튜브 영상 임베드** (운동 자세 가이드 등)
  - 링크 삽입

### 2.2. 워크아웃 구조 개편 (Multi-Session Workout)
- **기존:** Day 1 = 운동 1개 (단일 텍스트)
- **변경:** Day 1 = 여러 개의 세션 (Session) 포함 가능
  - 예: 오전 세션(Morning Session), 오후 세션(Afternoon Session), 웜업(Warm-up), 본운동(Main Workout), 쿨다운(Cool-down) 등
- **구조:**
  `Program` (1) -> `Workouts` (N, Day별) -> `WorkoutSessions` (N, 세션별)

---

## 3. 상세 기능 명세 (Functional Requirements)

### 3.1. 프로그램 상세 설명 에디터
- **위치:** 프로그램 생성/수정 페이지
- **기능:**
  - 기존 `textarea`를 `Tiptap Editor`로 교체.
  - 프로그램의 목표, 대상, 준비물 등을 사진과 영상으로 풍부하게 설명 가능.

### 3.2. 워크아웃 관리 (Day & Session)
- **위치:** 프로그램 관리 -> 워크아웃 탭
- **UI 구조:**
  - **좌측:** Day 리스트 (Day 1, Day 2...)
  - **우측:** 해당 Day의 세션 리스트 및 에디터
- **세션(Session) 기능:**
  - **세션 추가:** "세션 추가하기" 버튼으로 여러 개 생성 가능.
  - **세션 제목:** 예: "Warm-up", "Conditioning", "Strength"
  - **세션 내용:** 위지윅 에디터로 운동 루틴 작성 (표, 체크리스트 활용).
  - **순서 변경:** 세션 간 순서 변경 (Drag & Drop 또는 위/아래 버튼).

### 3.3. 유저 뷰 (User View)
- **프로그램 상세 페이지:** 에디터로 작성된 풍부한 HTML 콘텐츠 렌더링.
- **워크아웃 페이지:**
  - Day 선택 시 해당 날짜의 모든 세션을 아코디언(Accordion) 또는 리스트 형태로 보여줌.
  - 각 세션의 영상/이미지/텍스트를 깔끔하게 표시.

---

## 4. 데이터베이스 스키마 변경 (DB Schema Changes)

### 4.1. `programs` 테이블
- `description` 필드 타입을 `text` (HTML 저장)로 유지하되, 에디터 데이터 저장을 고려.

### 4.2. `workout_sessions` 테이블 신규 생성
기존 `workouts` 테이블의 역할을 분리하거나 확장해야 함.

**기존 `workouts` (Day 정보 유지):**
- `id`, `program_id`, `day_number`, `title` (Day 제목, 예: "하체 집중 훈련")

**신규 `workout_sessions` (세부 운동 정보):**
- `id` (uuid, PK)
- `workout_id` (FK -> workouts.id)
- `title` (text, 예: "Part A: Strength")
- `content` (text, HTML/JSON 저장 - 위지윅 에디터 내용)
- `order_index` (integer, 정렬 순서)
- `created_at`

*(기존 `workouts` 테이블의 `content`, `video_url` 필드는 `workout_sessions`로 이관)*

---

## 5. 기술 스택 (Tech Stack)

- **Editor:** Tiptap (Headless, Shadcn UI와 통합 용이)
  - `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-youtube`, `@tiptap/extension-image`
- **Styling:** Tailwind CSS Typography (`prose` 클래스 활용)
- **Storage:** Supabase Storage (이미지 업로드용)

---

## 6. 개발 단계 (Milestones)

### Step 1: 에디터 컴포넌트 개발
- Tiptap 기반의 재사용 가능한 `RichTextEditor` 컴포넌트 개발.
- 툴바 (Bold, Italic, Image, Youtube) 구현.

### Step 2: DB 마이그레이션
- `workout_sessions` 테이블 생성.
- 기존 `workouts` 데이터 마이그레이션 (기존 데이터를 첫 번째 세션으로 이동).

### Step 3: 프로그램 관리 페이지 개편
- 프로그램 설명 부분에 에디터 적용.
- 워크아웃 관리 UI를 "Day -> Session" 계층 구조로 변경.

### Step 4: 유저 뷰 적용
- 저장된 HTML 컨텐츠를 보여줄 `Viewer` 컴포넌트 개발 및 적용.

