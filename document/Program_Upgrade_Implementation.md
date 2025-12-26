# 프로그램 기능 고도화 구현 완료

## ✅ 구현 완료 사항

### 1. 데이터베이스 스키마 변경
- ✅ `workout_sessions` 테이블 추가 (lib/db/schema.ts)
- ✅ `workouts` 테이블 간소화 (Day 정보만 담당)
- ✅ 관계 설정 완료 (workouts -> sessions)

### 2. 위지윅 에디터 컴포넌트
- ✅ `RichTextEditor` 컴포넌트 개발 (components/ui/rich-text-editor.tsx)
- ✅ `RichTextViewer` 컴포넌트 개발 (읽기 전용)
- ✅ 기능:
  - 텍스트 서식 (Bold, Italic, Heading)
  - 목록 (Bullet, Numbered)
  - 링크, 이미지, YouTube 영상 삽입
  - Undo/Redo

### 3. 프로그램 생성/수정 페이지
- ✅ 프로그램 설명에 RichTextEditor 적용 (app/dashboard/programs/new/page.tsx)
- ✅ 기존 Textarea를 에디터로 교체

### 4. 워크아웃 관리 UI 개편
- ✅ 좌측: Day 리스트 (app/dashboard/programs/[id]/_components/workouts-tab.tsx)
- ✅ 우측: 선택된 Day의 세션 관리
- ✅ 세션 CRUD 기능 완료
- ✅ 세션별 위지윅 에디터 적용

### 5. Server Actions
- ✅ `createWorkoutSession` - 세션 생성
- ✅ `updateWorkoutSession` - 세션 수정
- ✅ `deleteWorkoutSession` - 세션 삭제
- ✅ `createWorkout` - Day 생성 (간소화)
- ✅ `getProgramById` - 세션 데이터 포함하도록 수정

### 6. 스타일링
- ✅ Prose 클래스 추가 (app/globals.css)
- ✅ 에디터 콘텐츠 렌더링 스타일 완료

---

## 📦 설치 필요 패키지

프로젝트를 실행하기 전에 다음 패키지들을 설치해야 합니다:

```bash
# Tiptap 에디터 관련
pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-youtube @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
```

---

## 🗄️ 데이터베이스 마이그레이션

Supabase에 새 테이블을 생성해야 합니다:

### 방법 1: Supabase Dashboard에서 직접 실행

1. Supabase Dashboard → SQL Editor로 이동
2. `supabase/migrations/add_workout_sessions.sql` 파일 내용 복사
3. 실행

### 방법 2: SQL 직접 실행

```sql
-- 워크아웃 세션 테이블 생성
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_workout_sessions_workout_id ON workout_sessions(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_order_index ON workout_sessions(order_index);
```

---

## 🚀 사용 방법

### 1. 프로그램 생성
1. 대시보드 → 프로그램 → "새 프로그램 만들기"
2. 제목, **위지윅 에디터로 상세 설명** 작성
3. 가격, 썸네일 입력 후 생성

### 2. Day 추가
1. 프로그램 상세 → 워크아웃 탭
2. "Day 추가" 버튼 클릭
3. Day 제목 입력 (예: "하체 집중 훈련")

### 3. 세션 추가
1. 좌측에서 Day 선택
2. "세션 추가" 버튼 클릭
3. 세션 제목 입력 (예: "Warm-up", "Main Workout")
4. **위지윅 에디터로 운동 루틴 작성**
   - 이미지 추가: 툴바의 이미지 아이콘 클릭
   - YouTube 영상 추가: 툴바의 YouTube 아이콘 클릭

### 4. 세션 수정/삭제
- 각 세션 카드의 수정/삭제 버튼 사용

---

## 📁 주요 파일 구조

```
/Users/sunmkim/Dev2026/pace-8/
├── lib/db/schema.ts                    # DB 스키마 (workout_sessions 추가)
├── components/ui/
│   └── rich-text-editor.tsx            # 위지윅 에디터 컴포넌트
├── app/dashboard/
│   ├── actions.ts                      # Server Actions (세션 CRUD 추가)
│   └── programs/
│       ├── new/page.tsx                # 프로그램 생성 (에디터 적용)
│       └── [id]/_components/
│           └── workouts-tab.tsx        # 워크아웃 관리 (멀티 세션)
├── app/globals.css                     # Prose 스타일 추가
└── supabase/migrations/
    └── add_workout_sessions.sql        # DB 마이그레이션 파일
```

---

## 🎯 다음 단계 (선택사항)

1. **이미지 업로드**: Supabase Storage 연동하여 직접 업로드 기능 추가
2. **Drag & Drop**: 세션 순서 변경 기능 (dnd-kit 라이브러리)
3. **템플릿**: 자주 사용하는 세션 템플릿 저장 기능
4. **유저 뷰**: 구독자가 보는 프로그램 상세 페이지 개발

---

## 🐛 트러블슈팅

### 에디터가 렌더링되지 않는 경우
- Tiptap 패키지가 설치되었는지 확인
- 브라우저 콘솔에서 에러 확인

### DB 에러 발생 시
- `workout_sessions` 테이블이 생성되었는지 확인
- Supabase Dashboard → Database → Tables에서 확인

### 스타일이 적용되지 않는 경우
- `app/globals.css`에 prose 스타일이 추가되었는지 확인
- 개발 서버 재시작 (`pnpm dev`)

---

## 📝 참고 사항

- 에디터는 HTML 형식으로 저장됩니다
- YouTube URL은 자동으로 임베드됩니다
- 이미지는 현재 URL 입력 방식입니다 (향후 업로드 기능 추가 예정)
- 세션은 `orderIndex`로 정렬됩니다

