# 프로그램 슬러그(Slug) 기능 구현

## 개요

프로그램 URL을 더 SEO 친화적이고 읽기 쉽게 만들기 위해 슬러그 기능을 구현했습니다. 슬러그는 영어와 숫자만 사용하며, 사용자가 직접 편집할 수 있습니다.

## 주요 변경사항

### 1. 데이터베이스 스키마 (`lib/db/schema.ts`)

```typescript
slug: text("slug").notNull().unique()
```

- **타입**: `text` (가변 길이 문자열)
- **제약조건**: `NOT NULL`, `UNIQUE`
- **용도**: SEO 친화적 URL 생성

### 2. 슬러그 유틸리티 함수 (`lib/utils/slug.ts`)

#### `generateSlug(title: string): string`
- 제목에서 영어/숫자만 추출하여 슬러그 생성
- 한글 및 특수문자는 제거
- 공백을 하이픈(`-`)으로 변환
- 예: "30일 하이록스 Basic" → "30-basic"

#### `generateUniqueSlug(title, programId?, customSlug?): Promise<string>`
- 고유한 슬러그 생성 (중복 시 숫자 추가)
- `customSlug`가 제공되면 우선 사용
- 제목에서 슬러그를 생성할 수 없으면 타임스탬프 기반 슬러그 생성

#### `isValidSlug(slug: string): boolean`
- 슬러그 유효성 검증
- 정규식: `/^[a-z0-9]+(-[a-z0-9]+)*$/`
- 허용: 영문 소문자, 숫자, 하이픈
- 길이: 1-100자

#### `ensureValidSlug(slug, fallback?): string`
- 빈 슬러그나 유효하지 않은 슬러그 처리
- 대체값 생성: `{fallback}-{timestamp}`

### 3. Server Actions (`app/dashboard/actions.ts`)

#### `createProgram(formData)`
```typescript
const customSlug = formData.get("slug") as string;
const slug = await generateUniqueSlug(title.trim(), undefined, customSlug);
```

#### `updateProgram(programId, formData)`
```typescript
const customSlug = formData.get("slug") as string;
const slug = await generateUniqueSlug(title.trim(), programId, customSlug);
```

#### `getProgramForSaleBySlug(slug)`
```typescript
const program = await db.query.programs.findFirst({
  where: and(eq(programs.slug, slug), eq(programs.isActive, true)),
  with: {
    coach: true,
    workouts: { orderBy: [workouts.dayNumber] },
  },
});
```

### 4. URL 라우팅

#### 변경 전: `/programs/[id]`
```
/programs/65a679ca-5dc1-4886-9266-eb7967ac106e
```

#### 변경 후: `/programs/[slug]`
```
/programs/30-day-hyrox-basic
```

### 5. UI 변경사항

#### 프로그램 생성 폼 (`app/dashboard/programs/new/page.tsx`)

```tsx
<div className="space-y-2">
  <Label htmlFor="slug">
    URL 슬러그 (선택사항)
  </Label>
  <Input
    id="slug"
    name="slug"
    placeholder="예: 30-day-hyrox-basic (영어, 숫자, 하이픈만 가능)"
  />
  <p className="text-xs text-muted-foreground">
    비워두면 제목에서 자동으로 생성됩니다. 영어와 숫자만 사용 가능합니다.
  </p>
</div>
```

#### 프로그램 수정 폼 (`app/dashboard/programs/[id]/_components/program-overview-tab.tsx`)

```tsx
<div className="space-y-2">
  <Label htmlFor="slug">URL 슬러그</Label>
  <Input
    id="slug"
    name="slug"
    defaultValue={program.slug}
    placeholder="예: 30-day-hyrox-basic"
  />
  <p className="text-xs text-muted-foreground">
    영어, 숫자, 하이픈만 사용 가능합니다. 판매 페이지 URL에 사용됩니다.
  </p>
</div>
```

#### 판매 페이지 미리보기 링크

```tsx
<a href={`/programs/${program.slug}`} target="_blank">
  판매 페이지 미리보기
</a>
```

### 6. 마이그레이션 (`supabase/migrations/add_program_slug.sql`)

```sql
-- Add slug column
ALTER TABLE programs ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS programs_slug_unique ON programs(slug);

-- Backfill existing programs
UPDATE programs 
SET slug = CASE
  -- If title contains English, generate from title
  WHEN REGEXP_REPLACE(LOWER(title), '[^a-z0-9\s-]', '', 'g') != '' THEN
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(LOWER(title), '[^a-z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  -- Otherwise, use program ID
  ELSE 'program-' || REPLACE(id::text, '-', '')
END
WHERE slug IS NULL;

-- Make NOT NULL
ALTER TABLE programs ALTER COLUMN slug SET NOT NULL;
```

## 사용 방법

### 1. 프로그램 생성 시

**자동 슬러그 생성:**
- 제목만 입력하면 슬러그가 자동으로 생성됩니다
- 예: "30일 하이록스 Basic" → `30-basic`

**커스텀 슬러그 지정:**
- "URL 슬러그" 필드에 원하는 슬러그 입력
- 예: `hyrox-beginner-program`
- 중복되면 자동으로 숫자 추가: `hyrox-beginner-program-1`

### 2. 프로그램 수정 시

- "URL 슬러그" 필드에서 슬러그 수정 가능
- 변경 시 판매 페이지 URL도 함께 변경됨
- 중복 체크 후 저장

### 3. 판매 페이지 접근

**변경 전:**
```
/programs/65a679ca-5dc1-4886-9266-eb7967ac106e
```

**변경 후:**
```
/programs/30-day-hyrox-basic
```

## 슬러그 규칙

### ✅ 허용
- 영문 소문자: `a-z`
- 숫자: `0-9`
- 하이픈: `-`
- 예: `30-day-program`, `hyrox-2024`, `beginner-training`

### ❌ 불허
- 한글: `가-힣`
- 특수문자: `!@#$%^&*()`
- 대문자: `A-Z` (자동으로 소문자 변환)
- 공백: ` ` (하이픈으로 변환)
- 연속 하이픈: `--` (하나로 합침)

## 에러 처리

### 1. 빈 슬러그
- 제목에서 슬러그를 생성할 수 없는 경우
- 대체값: `program-{timestamp}`

### 2. 중복 슬러그
- 기존 슬러그와 중복 시 숫자 추가
- 예: `hyrox-basic` → `hyrox-basic-1` → `hyrox-basic-2`

### 3. 유효하지 않은 슬러그
- 클라이언트 측: input validation
- 서버 측: `isValidSlug()` 검증 후 정제

## 주의사항

### 1. URL 변경
- 슬러그 변경 시 판매 페이지 URL이 변경됩니다
- 공유된 링크가 무효화될 수 있습니다
- 변경 전 신중히 고려해주세요

### 2. SEO 영향
- 슬러그는 검색 엔진 최적화에 중요합니다
- 의미 있는 키워드를 포함하는 것이 좋습니다
- 예: `hyrox-training`, `beginner-workout`

### 3. 한글 제목 처리
- 한글만 있는 제목은 슬러그 생성이 어렵습니다
- 영어 슬러그를 직접 입력하는 것을 권장합니다
- 예: "30일 하이록스" → 슬러그: `30-day-hyrox`

## 마이그레이션 적용

```bash
# 로컬 환경
npx supabase db push --local

# 프로덕션
npx supabase db push
```

## 관련 파일

- `lib/db/schema.ts` - 데이터베이스 스키마
- `lib/utils/slug.ts` - 슬러그 유틸리티 함수
- `app/dashboard/actions.ts` - Server Actions
- `app/programs/[slug]/page.tsx` - 판매 페이지
- `app/dashboard/programs/new/page.tsx` - 프로그램 생성 폼
- `app/dashboard/programs/[id]/_components/program-overview-tab.tsx` - 프로그램 수정 폼
- `supabase/migrations/add_program_slug.sql` - 마이그레이션 파일

## 향후 개선사항

1. **Transliteration**: 한글을 로마자로 자동 변환 (예: "하이록스" → "hyrox")
2. **Slug History**: 이전 슬러그로의 리다이렉트 지원
3. **Bulk Update**: 여러 프로그램의 슬러그를 한 번에 업데이트
4. **Preview**: 슬러그 입력 시 실시간 URL 미리보기

