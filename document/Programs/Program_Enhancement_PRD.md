# 프로그램 기능 향상 PRD

## 문서 정보

- **작성일**: 2025-12-27
- **버전**: 1.0
- **상태**: Draft

## 목차

1. [개요](#개요)
2. [배경 및 목표](#배경-및-목표)
3. [기능 요구사항](#기능-요구사항)
4. [기술 스펙](#기술-스펙)
5. [데이터 모델](#데이터-모델)
6. [UI/UX 설계](#uiux-설계)
7. [구현 우선순위](#구현-우선순위)

---

## 개요

프로그램의 시각적 표현력과 정보 구조화, 그리고 판매 관리를 개선하기 위해 다음 핵심 기능을 추가합니다:

1. **썸네일 업로드 기능**: 프로그램 대표 이미지를 직접 업로드하여 관리
2. **주차별 커리큘럼 정보**: 프로그램의 주차별 구성을 체계적으로 설명
3. **판매 상태 관리**: 공개 상태와 독립적으로 판매를 제어
4. **가격 입력 개선**: 자유로운 가격 설정 지원

이를 통해 코치는 프로그램을 더 매력적으로 표현하고, 유연하게 판매를 관리하며, 구독자는 프로그램 구조를 명확히 이해할 수 있습니다.

---

## 배경 및 목표

### 배경

**현재 문제점:**

- 프로그램 썸네일을 URL로만 입력 가능 → 외부 이미지 의존, 관리 어려움
- 프로그램의 전체 구조(주차별 흐름)를 표현할 방법이 없음
- 판매 페이지에서 "몇 주차에 무엇을 하는지" 알기 어려움
- 공개/비공개 상태만 있어 일시적 판매 중지가 어려움 (예: 업데이트 중, 시즌 오프)
- 가격 입력 시 1000원 단위로만 제한되어 자유로운 가격 설정 불가 (예: 29,900원)

**개선 필요성:**

- 이미지 업로드 시스템(`lib/storage`)이 이미 구현되어 있음
- 판매 페이지 완성도를 높이기 위한 콘텐츠 강화 필요
- 코치가 프로그램 기획 의도를 명확히 전달할 수 있어야 함

### 목표

1. **썸네일 업로드**

   - Supabase Storage를 활용한 직접 업로드
   - 이미지 미리보기 및 교체 지원
   - 자동 리사이징 및 최적화 (향후)

2. **주차별 커리큘럼**

   - 프로그램의 단계적 구조 표현
   - 각 주차의 목표와 특징 설명
   - 판매 페이지에서 시각적으로 표현

3. **판매 상태 관리**

   - 공개 상태와 독립적인 판매 상태
   - 판매중 / 판매중지 토글
   - 판매중지 시 안내 메시지 표시

4. **가격 입력 개선**

   - 모든 정수 가격 입력 가능
   - 천 단위 구분 쉼표 자동 표시
   - 권장 가격 템플릿 제공

5. **UX 개선**
   - 프로그램 생성/수정 시 직관적인 UI
   - 판매 페이지에서 커리큘럼 강조
   - 모바일 최적화된 레이아웃

---

## 기능 요구사항

### 1. 썸네일 업로드 기능

#### 1.1 코치 대시보드 (프로그램 생성/수정)

**필수 기능:**

- [x] 이미지 파일 선택 (드래그 앤 드롭 또는 파일 선택)
- [x] 이미지 미리보기 표시
- [x] 업로드 진행 상태 표시
- [x] 기존 썸네일 교체
- [x] 썸네일 삭제

**제약 조건:**

- 파일 형식: JPEG, PNG, WebP
- 최대 크기: 5MB
- 권장 비율: 16:9 (1920x1080 권장)

**에러 처리:**

- 파일 크기 초과 시 에러 메시지
- 지원하지 않는 형식 업로드 시 에러 메시지
- 업로드 실패 시 재시도 옵션

#### 1.2 기존 URL 입력 방식 유지

- URL 직접 입력도 계속 지원 (하위 호환성)
- 업로드와 URL 입력 중 선택 가능
- 우선순위: 업로드 이미지 > URL 입력

#### 1.3 판매 페이지 및 프로그램 목록

- 썸네일 자동 표시
- 이미지 로딩 최적화 (lazy loading)
- fallback 이미지 지원

### 2. 판매 상태 관리

#### 2.1 개념 정리

**공개 상태 (`isActive`)**:

- 프로그램이 판매 페이지에 표시되는지 여부
- `true`: 판매 페이지 접근 가능
- `false`: 판매 페이지 접근 불가 (404)

**판매 상태 (`onSale`)**:

- 공개된 프로그램의 구매 가능 여부
- `true`: 구독 버튼 활성화, 구매 가능
- `false`: 구독 버튼 비활성화, "현재 판매중지" 표시

**조합 시나리오:**

| isActive | onSale | 결과                                                         |
| -------- | ------ | ------------------------------------------------------------ |
| false    | -      | 판매 페이지 접근 불가 (개발 중)                              |
| true     | true   | 정상 판매 중                                                 |
| true     | false  | 판매 페이지는 보이지만 구매 불가 (업데이트 중, 시즌 오프 등) |

#### 2.2 사용 사례

**판매 중지가 필요한 경우:**

- ✅ 프로그램 대대적 개편 중
- ✅ 시즌 오프 기간 (예: 연말연시)
- ✅ 코치 개인 사정으로 일시 중단
- ✅ 버그 수정 중
- ✅ 가격 변경 전 대기

**UI 요구사항:**

- [x] 공개 상태와 판매 상태를 분리하여 표시
- [x] 토글 스위치로 간편하게 전환
- [x] 판매중지 시 이유 메모 입력 (선택)
- [x] 판매중지 안내 메시지 템플릿

#### 2.3 판매 페이지 표시

**판매 중:**

```tsx
<Button size="lg" className="w-full">
  ₩{program.price.toLocaleString()} 구독하기
</Button>
```

**판매 중지:**

```tsx
<div className="rounded-lg border-2 border-warning bg-warning/10 p-6 text-center">
  <AlertCircle className="mx-auto h-12 w-12 text-warning mb-4" />
  <h3 className="font-semibold text-lg mb-2">현재 판매중지</h3>
  <p className="text-muted-foreground">
    {program.saleStopReason || "이 프로그램은 현재 구매하실 수 없습니다."}
  </p>
  <Button variant="outline" className="mt-4" disabled>
    구독 불가
  </Button>
</div>
```

### 3. 가격 입력 개선

#### 3.1 현재 문제

```tsx
// 현재: step="1000"으로 인해 1000원 단위만 입력 가능
<Input
  type="number"
  step="1000" // ❌ 문제
  min="0"
/>
```

**발생 문제:**

- 23,900원 → 입력 불가
- 49,500원 → 입력 불가
- 오직 10,000원, 20,000원, 30,000원만 가능

#### 3.2 개선 사항

```tsx
// 개선: step 제거하여 모든 정수 입력 가능
<Input type="number" min="0" placeholder="예: 29900" />
```

**추가 기능:**

- 실시간 포맷팅: `29900` 입력 → `29,900원` 표시
- 권장 가격 버튼: `[19,900] [29,900] [49,900] [99,900]`
- 입력 검증: 음수 방지, 최대값 제한

#### 3.3 UI 설계

```tsx
<div className="space-y-2">
  <Label htmlFor="price">가격 (원)</Label>
  <Input
    id="price"
    name="price"
    type="number"
    min="0"
    max="10000000"
    placeholder="예: 29900"
    value={price}
    onChange={(e) => setPrice(Number(e.target.value))}
  />
  {/* 실시간 미리보기 */}
  {price > 0 && (
    <p className="text-sm text-muted-foreground">
      표시 가격: ₩{price.toLocaleString()}
    </p>
  )}

  {/* 권장 가격 */}
  <div className="flex gap-2">
    <span className="text-sm text-muted-foreground">권장:</span>
    {[19900, 29900, 49900, 99900].map((suggested) => (
      <Button
        key={suggested}
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setPrice(suggested)}
      >
        {suggested.toLocaleString()}원
      </Button>
    ))}
  </div>
</div>
```

### 4. 주차별 커리큘럼 정보

#### 2.1 데이터 구조

각 주차 정보는 다음을 포함:

```typescript
{
  week: number,        // 주차 번호 (1, 2, 3, ...)
  title: string,       // 주차 이름 (예: "기초 체력 다지기")
  description: string  // 주차 설명 (예: "기본 동작 익히기와 체력 테스트")
}
```

**예시:**

```json
[
  {
    "week": 1,
    "title": "기초 체력 다지기",
    "description": "기본 동작을 익히고 현재 체력 수준을 파악합니다. 부상 예방을 위한 워밍업과 스트레칭을 배웁니다."
  },
  {
    "week": 2,
    "title": "기본 동작 마스터",
    "description": "하이록스 핵심 8가지 동작의 정확한 폼을 배웁니다. 각 동작별 주의사항과 흔한 실수를 교정합니다."
  },
  {
    "week": 3,
    "title": "강도 높이기",
    "description": "동작에 익숙해지면서 운동 강도를 점차 높입니다. 세트당 반복 횟수와 무게를 증가시킵니다."
  }
]
```

#### 4.2 코치 대시보드 (프로그램 생성/수정)

**필수 기능:**

- [x] 주차 추가/삭제/수정
- [x] 주차 순서 변경 (드래그 앤 드롭)
- [x] 실시간 미리보기
- [x] 주차 정보 유효성 검증

**UI 요구사항:**

- 접고 펼치기 가능한 아코디언 UI
- 각 주차별 입력 폼
- 주차 번호 자동 정렬
- 빈 주차 삭제 경고

#### 2.3 판매 페이지

**표시 방식:**

- 타임라인 형태로 시각화
- 각 주차 카드 스타일
- 아이콘 및 색상으로 차별화
- 모바일에서 스크롤 가능한 카드 레이아웃

**예시 레이아웃:**

```
┌─────────────────────────────────┐
│  📅 프로그램 커리큘럼            │
├─────────────────────────────────┤
│  [1주차] 기초 체력 다지기        │
│  기본 동작을 익히고...          │
├─────────────────────────────────┤
│  [2주차] 기본 동작 마스터        │
│  하이록스 핵심 8가지...         │
├─────────────────────────────────┤
│  [3주차] 강도 높이기             │
│  동작에 익숙해지면서...         │
└─────────────────────────────────┘
```

---

## 기술 스펙

### 1. 썸네일 업로드

#### 1.1 사용 기술

**기존 시스템 활용:**

- `lib/storage/upload.ts` - 이미지 업로드 로직
- `lib/storage/replace.ts` - 썸네일 교체
- `lib/storage/delete.ts` - 썸네일 삭제
- Supabase Storage - 파일 저장소
- PostgreSQL `images` 테이블 - 메타데이터 관리

#### 1.2 업로드 플로우

```typescript
// 1. 클라이언트에서 파일 선택
const file: File = // ... from input

// 2. Server Action 호출
const result = await uploadProgramThumbnail(programId, file);

// 3. 내부적으로 lib/storage 사용
import { uploadImage } from "@/lib/storage";

const uploadResult = await uploadImage(file, {
  imageType: "program",
  uploadedBy: userId,
  programId: programId,
  folder: "programs",
  maxSizeMB: 5,
});

// 4. programs 테이블 업데이트
await db.update(programs)
  .set({
    thumbnailUrl: uploadResult.publicUrl,
    thumbnailImageId: uploadResult.id // 새 필드
  })
  .where(eq(programs.id, programId));
```

#### 1.3 교체 로직

```typescript
import { replaceImage } from "@/lib/storage";

// 기존 썸네일 ID로 교체
await replaceImage(oldThumbnailImageId, newFile, {
  imageType: "program",
  uploadedBy: userId,
  programId: programId,
});
```

### 2. 주차별 커리큘럼

#### 2.1 데이터 저장 방식

**Option A: JSONB 컬럼 (권장)**

```sql
ALTER TABLE programs
ADD COLUMN weekly_curriculum JSONB;
```

**장점:**

- 간단한 구조
- 주차 수가 유동적
- 전체 커리큘럼을 한 번에 조회 가능

**단점:**

- JSONB 내부 검색 어려움 (현재는 필요 없음)

**Option B: 별도 테이블**

```sql
CREATE TABLE program_weeks (
  id UUID PRIMARY KEY,
  program_id UUID REFERENCES programs(id),
  week_number INTEGER,
  title TEXT,
  description TEXT
);
```

**장점:**

- 정규화된 구조
- 주차별 개별 쿼리 가능

**단점:**

- 추가 테이블 관리
- 조회 시 JOIN 필요

**선택: Option A (JSONB)** - 현재 요구사항에 적합

#### 2.2 Drizzle ORM 스키마

```typescript
// lib/db/schema.ts
export const programs = pgTable("programs", {
  // ... 기존 필드
  thumbnailImageId: uuid("thumbnail_image_id").references(() => images.id, {
    onDelete: "set null",
  }),
  weeklyCurriculum: jsonb("weekly_curriculum").$type<WeeklyCurriculumItem[]>(),
});

// 타입 정의
export type WeeklyCurriculumItem = {
  week: number;
  title: string;
  description: string;
};
```

#### 2.3 Server Actions

```typescript
// app/dashboard/actions.ts

export async function updateWeeklyCurriculum(
  programId: string,
  curriculum: WeeklyCurriculumItem[]
) {
  // 1. 유효성 검증
  validateCurriculum(curriculum);

  // 2. 업데이트
  await db
    .update(programs)
    .set({ weeklyCurriculum: curriculum })
    .where(eq(programs.id, programId));
}
```

---

## 데이터 모델

### 1. 스키마 변경

```typescript
// lib/db/schema.ts

export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  coachId: uuid("coach_id")
    .references(() => profiles.id)
    .notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  content: text("content"),

  // 🆕 썸네일 관련
  thumbnailUrl: text("thumbnail_url"), // 기존 (URL 입력 또는 업로드된 URL)
  thumbnailImageId: uuid("thumbnail_image_id").references(() => images.id, {
    onDelete: "set null",
  }), // 🆕 업로드된 이미지 ID

  // 🆕 주차별 커리큘럼
  weeklyCurriculum: jsonb("weekly_curriculum").$type<WeeklyCurriculumItem[]>(),

  // 🆕 판매 상태
  onSale: boolean("on_sale").default(true).notNull(), // 판매 가능 여부
  saleStopReason: text("sale_stop_reason"), // 판매 중지 사유 (선택)

  type: programTypeEnum("type").default("relative").notNull(),
  price: integer("price").notNull(),
  difficulty: integer("difficulty").default(3),
  trainingTime: integer("training_time"),
  daysPerWeek: integer("days_per_week"),
  sessionsPerDay: integer("sessions_per_day").default(1),
  cycleInfo: text("cycle_info"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### 2. 타입 정의

```typescript
// types/program.ts

export interface WeeklyCurriculumItem {
  week: number;
  title: string;
  description: string;
}

export interface ProgramWithThumbnail {
  // ... 기존 필드
  thumbnailUrl: string | null;
  thumbnailImageId: string | null;
  thumbnailImage?: {
    id: string;
    publicUrl: string;
    originalName: string;
  };
  weeklyCurriculum: WeeklyCurriculumItem[] | null;
}
```

### 3. 마이그레이션

```sql
-- supabase/migrations/add_program_enhancements.sql

-- 썸네일 이미지 ID 연결
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS thumbnail_image_id UUID
REFERENCES images(id) ON DELETE SET NULL;

-- 주차별 커리큘럼 JSONB
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS weekly_curriculum JSONB;

-- 판매 상태
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS on_sale BOOLEAN DEFAULT TRUE NOT NULL;

ALTER TABLE programs
ADD COLUMN IF NOT EXISTS sale_stop_reason TEXT;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_programs_thumbnail_image
ON programs(thumbnail_image_id);

CREATE INDEX IF NOT EXISTS idx_programs_on_sale
ON programs(on_sale) WHERE is_active = TRUE;

-- 코멘트
COMMENT ON COLUMN programs.thumbnail_image_id IS '업로드된 썸네일 이미지 ID (images 테이블 참조)';
COMMENT ON COLUMN programs.weekly_curriculum IS '주차별 커리큘럼 정보 [{"week":1,"title":"...","description":"..."}]';
COMMENT ON COLUMN programs.on_sale IS '판매 가능 여부 (true: 구매 가능, false: 판매 중지)';
COMMENT ON COLUMN programs.sale_stop_reason IS '판매 중지 사유 (판매 중지 시 표시할 메시지)';
```

---

## UI/UX 설계

### 1. 프로그램 생성/수정 페이지

#### 1.1 공개 및 판매 상태 섹션

```tsx
<Card>
  <CardHeader>
    <CardTitle>프로그램 상태</CardTitle>
    <CardDescription>
      프로그램의 공개 여부와 판매 상태를 관리하세요
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* 공개 상태 */}
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-base">공개 상태</Label>
        <p className="text-sm text-muted-foreground">
          판매 페이지 접근 가능 여부
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "공개" : "비공개"}
        </Badge>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>
    </div>

    {/* 판매 상태 */}
    {isActive && (
      <>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">판매 상태</Label>
            <p className="text-sm text-muted-foreground">
              구독 버튼 활성화 여부
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={onSale ? "default" : "warning"}>
              {onSale ? "판매중" : "판매중지"}
            </Badge>
            <Switch checked={onSale} onCheckedChange={setOnSale} />
          </div>
        </div>

        {/* 판매 중지 사유 */}
        {!onSale && (
          <div className="space-y-2">
            <Label htmlFor="saleStopReason">판매 중지 안내 메시지</Label>
            <Textarea
              id="saleStopReason"
              placeholder="예: 프로그램 업데이트 중입니다. 12월 31일에 재개됩니다."
              value={saleStopReason}
              onChange={(e) => setSaleStopReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              판매 페이지에 표시될 메시지입니다. 비워두면 기본 메시지가
              표시됩니다.
            </p>
          </div>
        )}
      </>
    )}
  </CardContent>
</Card>
```

#### 1.2 가격 입력 섹션

```tsx
<div className="space-y-2">
  <Label htmlFor="price">
    가격 (원) <span className="text-destructive">*</span>
  </Label>
  <Input
    id="price"
    name="price"
    type="number"
    min="0"
    max="10000000"
    placeholder="예: 29900"
    value={price}
    onChange={(e) => setPrice(Number(e.target.value))}
    required
  />

  {/* 실시간 미리보기 */}
  {price > 0 && (
    <p className="text-sm font-medium">
      표시 가격: <span className="text-primary">₩{price.toLocaleString()}</span>
    </p>
  )}

  {/* 권장 가격 */}
  <div className="space-y-2">
    <p className="text-xs text-muted-foreground">권장 가격 (클릭하여 선택)</p>
    <div className="flex flex-wrap gap-2">
      {[9900, 19900, 29900, 39900, 49900, 99900].map((suggested) => (
        <Button
          key={suggested}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPrice(suggested)}
          className="h-8 text-xs"
        >
          {suggested.toLocaleString()}원
        </Button>
      ))}
    </div>
  </div>
</div>
```

#### 1.3 썸네일 업로드 섹션

```tsx
<Card>
  <CardHeader>
    <CardTitle>프로그램 썸네일</CardTitle>
    <CardDescription>
      프로그램을 대표하는 이미지를 업로드하세요. 16:9 비율 권장 (1920x1080)
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Tabs defaultValue="upload">
      <TabsList>
        <TabsTrigger value="upload">이미지 업로드</TabsTrigger>
        <TabsTrigger value="url">URL 입력</TabsTrigger>
      </TabsList>

      <TabsContent value="upload">
        {/* 썸네일이 있으면 표시 */}
        {thumbnailUrl && (
          <div className="relative aspect-video">
            <img src={thumbnailUrl} alt="썸네일" />
            <Button variant="destructive" size="sm">
              삭제
            </Button>
          </div>
        )}

        {/* 업로드 영역 */}
        <div className="border-2 border-dashed rounded-lg p-8">
          <Input type="file" accept="image/*" />
          <p className="text-sm text-muted-foreground">
            또는 이미지를 드래그 앤 드롭하세요
          </p>
        </div>
      </TabsContent>

      <TabsContent value="url">
        <Input
          placeholder="https://example.com/image.jpg"
          value={thumbnailUrl}
        />
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>
```

#### 1.4 주차별 커리큘럼 섹션

```tsx
<Card>
  <CardHeader>
    <CardTitle>주차별 커리큘럼</CardTitle>
    <CardDescription>
      프로그램의 주차별 구성과 목표를 설명하세요. 구독자가 프로그램 흐름을
      이해하는데 도움이 됩니다.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {curriculum.map((week, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge>{week.week}주차</Badge>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>주차 이름</Label>
              <Input placeholder="예: 기초 체력 다지기" value={week.title} />
            </div>
            <div>
              <Label>주차 설명</Label>
              <Textarea
                placeholder="이 주차의 목표와 특징을 설명하세요"
                value={week.description}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addWeek}>
        <Plus className="mr-2 h-4 w-4" />
        주차 추가
      </Button>
    </div>
  </CardContent>
</Card>
```

### 2. 판매 페이지

#### 2.1 판매 상태에 따른 CTA

```tsx
{
  program.onSale ? (
    // 판매 중
    <SubscribeButton program={program} />
  ) : (
    // 판매 중지
    <Card className="border-warning bg-warning/5">
      <CardContent className="p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-warning mb-4" />
        <h3 className="font-semibold text-lg mb-2">현재 판매 중지</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {program.saleStopReason || "이 프로그램은 현재 구매하실 수 없습니다."}
        </p>
        <Button variant="outline" disabled className="w-full">
          구독 불가
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### 2.2 Hero 섹션 (썸네일 배경)

```tsx
<div
  className="relative h-[400px] bg-cover bg-center"
  style={{ backgroundImage: `url(${program.thumbnailUrl})` }}
>
  <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
  <div className="relative container mx-auto px-4 py-16">
    <h1>{program.title}</h1>
    {/* ... */}
  </div>
</div>
```

#### 2.3 커리큘럼 타임라인

```tsx
<Card>
  <CardHeader>
    <CardTitle>📅 프로그램 커리큘럼</CardTitle>
    <CardDescription>주차별로 어떻게 진행되는지 확인하세요</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-6">
      {weeklyCurriculum.map((week) => (
        <div key={week.week} className="flex gap-4">
          {/* 타임라인 라인 */}
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              {week.week}
            </div>
            {week.week < weeklyCurriculum.length && (
              <div className="h-full w-0.5 bg-border mt-2" />
            )}
          </div>

          {/* 콘텐츠 */}
          <div className="flex-1 pb-8">
            <h3 className="font-semibold text-lg mb-2">{week.title}</h3>
            <p className="text-muted-foreground">{week.description}</p>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

### 3. 프로그램 카드 (목록)

```tsx
<Card>
  {/* 썸네일 */}
  <div className="aspect-video w-full overflow-hidden rounded-t-xl">
    <img
      src={program.thumbnailUrl || "/placeholder.jpg"}
      alt={program.title}
      className="h-full w-full object-cover"
    />
  </div>

  <CardHeader>
    <CardTitle>{program.title}</CardTitle>
    {/* 주차 정보 표시 */}
    {program.weeklyCurriculum && (
      <Badge variant="outline">
        {program.weeklyCurriculum.length}주 프로그램
      </Badge>
    )}
  </CardHeader>
</Card>
```

---

## 구현 우선순위

### Phase 1: 핵심 기능 (필수)

1. **데이터베이스 마이그레이션**

   - `thumbnail_image_id` 컬럼 추가
   - `weekly_curriculum` JSONB 컬럼 추가
   - `on_sale` BOOLEAN 컬럼 추가
   - `sale_stop_reason` TEXT 컬럼 추가
   - 인덱스 생성

2. **스키마 및 타입 정의**

   - Drizzle 스키마 업데이트
   - TypeScript 타입 정의
   - 판매 상태 관련 타입 추가

3. **썸네일 업로드 - 백엔드**

   - Server Action: `uploadProgramThumbnail`
   - Server Action: `deleteProgramThumbnail`
   - `lib/storage` 통합

4. **판매 상태 관리 - 백엔드**

   - Server Action: `updateProgramSaleStatus`
   - 판매 상태 토글 로직
   - 판매 중지 사유 저장

5. **판매 상태 관리 - 프론트엔드**

   - 공개/판매 상태 토글 UI
   - 판매 중지 사유 입력 폼
   - 상태별 Badge 표시

6. **가격 입력 개선**

   - Input step 제거
   - 권장 가격 버튼 추가
   - 실시간 포맷팅 표시

7. **썸네일 업로드 - 프론트엔드**

   - 파일 선택 UI
   - 미리보기 표시
   - 업로드 진행 상태
   - 프로그램 생성/수정 폼 통합

8. **주차별 커리큘럼 - 백엔드**

   - Server Action: `updateWeeklyCurriculum`
   - 유효성 검증 로직

9. **주차별 커리큘럼 - 프론트엔드**
   - 주차 추가/삭제/수정 UI
   - 프로그램 생성/수정 폼 통합

### Phase 2: 판매 페이지 통합 (필수)

10. **판매 페이지 개선**

    - Hero 섹션에 썸네일 배경 적용
    - 커리큘럼 타임라인 섹션 추가
    - 판매 상태별 CTA 분기 처리
    - 모바일 최적화

11. **프로그램 목록 개선**
    - 썸네일 표시
    - 주차 정보 뱃지
    - 판매 상태 표시

### Phase 3: UX 개선 (선택)

12. **이미지 최적화**

    - Next.js Image 컴포넌트 적용
    - lazy loading
    - 반응형 이미지 크기

13. **드래그 앤 드롭**

    - 썸네일 드래그 앤 드롭 업로드
    - 주차 순서 드래그 앤 드롭 변경

14. **실시간 미리보기**

    - 썸네일 변경 시 즉시 반영
    - 커리큘럼 편집 시 미리보기

15. **판매 분석**
    - 판매 상태별 전환율 추적
    - 판매 중지 기간 분석

---

## 성공 지표

### 정량적 지표

1. **기능 사용률**

   - 썸네일 업로드 사용 프로그램 비율 > 80%
   - 커리큘럼 작성 프로그램 비율 > 60%
   - 판매 상태 관리 사용 프로그램 비율 > 30%

2. **성능**

   - 썸네일 업로드 시간 < 3초 (5MB 이미지 기준)
   - 판매 페이지 로딩 시간 < 2초

3. **에러율**
   - 업로드 실패율 < 1%
   - 이미지 표시 실패율 < 0.5%

### 정성적 지표

1. **코치 피드백**

   - 썸네일 업로드 사용 편의성
   - 커리큘럼 작성 직관성

2. **구독자 피드백**
   - 프로그램 이해도 향상
   - 판매 페이지 만족도

---

## 리스크 및 대응

### 1. 기술적 리스크

**리스크: 대용량 이미지 업로드 시 성능 저하**

- **대응**: 클라이언트에서 사전 리사이징
- **대응**: 진행률 표시로 사용자 피드백

**리스크: Supabase Storage 용량 제한**

- **대응**: 이미지 압축 및 최적화
- **대응**: 사용하지 않는 이미지 정기 정리

### 2. 사용성 리스크

**리스크: 코치가 커리큘럼 작성을 어려워함**

- **대응**: 예시 템플릿 제공
- **대응**: 자동 생성 기능 (AI 활용, Phase 3)

**리스크: 모바일에서 이미지 업로드 UX 저하**

- **대응**: 모바일 최적화된 UI
- **대응**: 카메라 직접 촬영 지원

**리스크: 판매 상태 혼동 (공개 vs 판매)**

- **대응**: 명확한 라벨과 설명 제공
- **대응**: 시각적 피드백 (Badge 색상 구분)
- **대응**: 상태 조합별 결과 미리보기

**리스크: 가격 입력 실수 (0 누락 등)**

- **대응**: 실시간 포맷팅으로 확인 가능
- **대응**: 권장 가격 버튼으로 정확한 입력 유도
- **대응**: 저장 전 확인 모달

---

## 참고 자료

### 기존 구현

- `lib/storage/` - 이미지 업로드 시스템
- `lib/db/schema.ts` - 데이터베이스 스키마
- `app/programs/[slug]/page.tsx` - 판매 페이지
- `app/dashboard/programs/` - 프로그램 관리

### 관련 문서

- [Program Upgrade PRD](./Program_Upgrade_PRD.md)
- [Program Sales Page PRD](./Program_Sales_Page_PRD.md)
- [Slug Feature Implementation](./Slug_Feature_Implementation.md)

### 참고 링크

- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Drizzle ORM JSONB](https://orm.drizzle.team/docs/column-types/pg#jsonb)
