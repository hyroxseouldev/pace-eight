# 프로그램 판매 페이지 PRD

> **목표**: 유저가 프로그램에 관심을 갖고 구독하고 싶게 만드는 매력적인 판매 페이지 구현

## 📌 개요

### 목적

- 프로그램의 가치를 명확하게 전달
- 구매 전환율 극대화
- 코치의 전문성과 프로그램의 퀄리티 강조
- 구독 결정에 필요한 모든 정보 제공

### 페이지 경로

- `/programs/[id]` - 공개된 프로그램 상세 페이지
- 비공개 프로그램은 404 또는 "준비 중" 메시지

---

## 🎨 페이지 구조

### 1. Hero Section (Above the Fold)

**목표**: 3초 안에 프로그램의 핵심 가치 전달

#### 레이아웃

```
┌─────────────────────────────────────────────────┐
│  [썸네일 이미지 - 큰 배경]                        │
│                                                  │
│  프로그램 제목                                    │
│  간단 설명 (description)                         │
│                                                  │
│  [난이도 ⭐⭐⭐] [주 6일] [60분/회] [8-10주]      │
│                                                  │
│  월 ₩99,000                                      │
│  [지금 구독하기 CTA 버튼]                         │
│                                                  │
│  코치: [아바타] 홍길동 코치                       │
└─────────────────────────────────────────────────┘
```

#### 활용 데이터

- `thumbnailUrl`: 배경 또는 대표 이미지
- `title`: 프로그램 제목
- `description`: 간단한 소개 (HTML 렌더링)
- `difficulty`: 난이도 표시 (별점 또는 숫자)
- `daysPerWeek`: 주당 운동 일수
- `trainingTime`: 1회 운동 시간
- `cycleInfo`: 프로그램 기간
- `price`: 월 구독료
- `coach`: 코치 정보 (profiles 테이블 조인)

#### 기능

- 스크롤 시 sticky CTA 버튼
- 모바일: 하단 고정 CTA 바

---

### 2. 프로그램 하이라이트 섹션

**목표**: 프로그램의 주요 특징과 차별점 강조

#### 필요한 추가 필드

```typescript
// programs 테이블에 추가 권장
highlights: string[] // ["초보자도 쉽게", "체계적인 프로그램", "1:1 피드백"]
targetAudience: string // "하이록스 입문자"
goals: string[] // ["기초 체력 향상", "하이록스 대회 준비"]
```

#### 레이아웃

```
┌─────────────────────────────────────────────────┐
│  이런 분들께 추천합니다                           │
│                                                  │
│  [아이콘] 하이록스를 시작하고 싶은 입문자          │
│  [아이콘] 체계적인 훈련이 필요한 분               │
│  [아이콘] 대회 준비가 필요한 분                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  프로그램 특징                                    │
│                                                  │
│  [카드1] 체계적인 커리큘럼                        │
│  [카드2] 전문 코치의 가이드                       │
│  [카드3] 단계별 난이도 조절                       │
└─────────────────────────────────────────────────┘
```

---

### 3. 프로그램 상세 정보 섹션

**목표**: 프로그램에 대한 깊이 있는 이해 제공

#### 활용 데이터

- `content`: 위지윅 에디터로 작성된 상세 HTML 콘텐츠
  - 프로그램 소개
  - 훈련 방법
  - 기대 효과
  - 준비물
  - 주의사항 등

#### 레이아웃

```
┌─────────────────────────────────────────────────┐
│  프로그램 상세                                    │
│                                                  │
│  [탭: 소개 | 커리큘럼 | 코치 소개]                │
│                                                  │
│  [Tab 1: 소개]                                   │
│  - content 필드 렌더링 (Prose 스타일)             │
│  - 이미지, 영상 포함                              │
│                                                  │
│  [Tab 2: 커리큘럼]                               │
│  - 워크아웃 목록 (Day 1, Day 2...)               │
│  - 각 Day의 제목만 표시 (상세 내용은 구독 후)     │
│                                                  │
│  [Tab 3: 코치 소개]                              │
│  - 코치 프로필                                    │
│  - 경력, 자격증                                   │
│  - SNS 링크                                      │
└─────────────────────────────────────────────────┘
```

---

### 4. 워크아웃 미리보기 섹션

**목표**: 프로그램 구성을 한눈에 보여주기

#### 활용 데이터

- `workouts`: 워크아웃 목록 (Day 정보)
- 각 Day의 `title`만 표시
- 총 Day 수 강조

#### 레이아웃

```
┌─────────────────────────────────────────────────┐
│  커리큘럼 미리보기                                │
│                                                  │
│  총 30일 프로그램                                 │
│                                                  │
│  [Day 1] 하체 근지구력 훈련                       │
│  [Day 2] 상체 & 코어 강화                        │
│  [Day 3] 컨디셔닝 & 러닝                         │
│  ...                                             │
│  [더 보기 버튼] - 구독하고 전체 보기              │
└─────────────────────────────────────────────────┘
```

---

### 5. 코치 소개 섹션

**목표**: 코치의 전문성과 신뢰도 강조

#### 활용 데이터 (profiles 테이블)

- `displayName`: 코치 활동명
- `avatarUrl`: 프로필 사진
- `bioShort`: 한 줄 소개
- `bioLong`: 상세 소개
- `coachingExperience`: 코칭 경력
- `certifications`: 자격증
- `snsUrl`: SNS/웹사이트

#### 레이아웃

```
┌─────────────────────────────────────────────────┐
│  코치 소개                                       │
│                                                  │
│  [프로필 사진]  홍길동 코치                       │
│                하이록스 전문 트레이너              │
│                                                  │
│  "10년 경력의 하이록스 전문가입니다"              │
│                                                  │
│  📋 경력                                         │
│  - 국가대표 트레이너 (2018-2022)                 │
│  - 하이록스 대회 우승 3회                         │
│                                                  │
│  🏆 자격증                                       │
│  - NSCA-CSCS                                    │
│  - CrossFit Level 2                             │
│                                                  │
│  🔗 [Instagram] [YouTube]                       │
└─────────────────────────────────────────────────┘
```

---

### 6. 가격 및 구독 섹션

**목표**: 명확한 가격 정보와 구독 프로세스 안내

#### 활용 데이터

- `price`: 월 구독료
- `type`: 프로그램 운영 방식

#### 레이아웃

```
┌─────────────────────────────────────────────────┐
│  구독 정보                                       │
│                                                  │
│  ┌─────────────────────────────┐                │
│  │  월 구독                     │                │
│  │  ₩99,000 / 월               │                │
│  │                              │                │
│  │  ✓ 전체 워크아웃 접근         │                │
│  │  ✓ 코치 피드백 (선택)         │                │
│  │  ✓ 운동 기록 관리             │                │
│  │  ✓ 언제든지 해지 가능         │                │
│  │                              │                │
│  │  [지금 구독하기]             │                │
│  └─────────────────────────────┘                │
│                                                  │
│  📝 구독 후 이용 방법                            │
│  1. 구독하기 버튼 클릭                           │
│  2. 결제 정보 입력                               │
│  3. 대시보드에서 운동 시작                       │
└─────────────────────────────────────────────────┘
```

---

### 7. 사회적 증거 섹션 (향후)

**목표**: 신뢰도 향상

#### 필요한 추가 테이블

```sql
CREATE TABLE program_reviews (
  id UUID PRIMARY KEY,
  program_id UUID REFERENCES programs(id),
  user_id UUID REFERENCES profiles(id),
  rating INTEGER, -- 1-5
  comment TEXT,
  created_at TIMESTAMP
);
```

#### 레이아웃

```
┌─────────────────────────────────────────────────┐
│  수강생 후기                                     │
│                                                  │
│  ⭐⭐⭐⭐⭐ 4.8 / 5.0 (156명)                     │
│                                                  │
│  [후기 카드 1]                                   │
│  "체계적이고 따라하기 쉬웠어요!"                  │
│  - 김철수 님                                     │
│                                                  │
│  [후기 카드 2]                                   │
│  [후기 카드 3]                                   │
└─────────────────────────────────────────────────┘
```

---

### 8. FAQ 섹션

**목표**: 구매 전 의문 해소

```
┌─────────────────────────────────────────────────┐
│  자주 묻는 질문                                   │
│                                                  │
│  Q: 초보자도 할 수 있나요?                        │
│  A: 네, 난이도별로 구성되어...                   │
│                                                  │
│  Q: 환불이 가능한가요?                           │
│  A: 구독 후 7일 이내...                          │
│                                                  │
│  Q: 운동 장비가 필요한가요?                       │
│  A: 기본적으로...                                │
└─────────────────────────────────────────────────┘
```

---

## 🗄️ 필요한 데이터베이스 변경

### 1. programs 테이블 추가 필드 (선택적)

```sql
ALTER TABLE programs
ADD COLUMN highlights TEXT[], -- 프로그램 하이라이트 (배열)
ADD COLUMN target_audience TEXT, -- 대상 유저
ADD COLUMN goals TEXT[], -- 프로그램 목표 (배열)
ADD COLUMN requirements TEXT, -- 준비물/요구사항
ADD COLUMN expected_results TEXT, -- 기대 효과
ADD COLUMN video_url TEXT; -- 소개 영상 URL
```

**또는** JSON 필드로 통합:

```sql
ALTER TABLE programs
ADD COLUMN metadata JSONB; -- 유연한 메타데이터 저장

-- 예시 구조:
{
  "highlights": ["초보자 친화적", "체계적인 프로그램"],
  "targetAudience": "하이록스 입문자",
  "goals": ["기초 체력 향상", "대회 준비"],
  "requirements": "요가매트, 덤벨",
  "expectedResults": "8주 후 기초 체력 30% 향상",
  "videoUrl": "https://youtube.com/..."
}
```

### 2. 구독자 수 및 통계 (선택적)

```sql
ALTER TABLE programs
ADD COLUMN subscriber_count INTEGER DEFAULT 0, -- 구독자 수
ADD COLUMN avg_rating DECIMAL(3,2), -- 평균 평점
ADD COLUMN review_count INTEGER DEFAULT 0; -- 리뷰 수
```

---

## 🎯 핵심 기능

### 1. 공개/비공개 처리

- `isActive = false`: 404 또는 "준비 중" 페이지
- `isActive = true`: 판매 페이지 표시

### 3. 구독 플로우

```
판매 페이지 → [구독하기]
  → 로그인/회원가입 (미로그인 시)
  → 결제 정보 입력 (포트원 연동)
  → 구독 완료
  → 대시보드로 이동
```

### 4. 반응형 디자인

- 모바일: 하단 고정 CTA
- 태블릿/데스크톱: 우측 sticky 사이드바 (가격 정보 + CTA)

---

## 🎨 UI/UX 가이드

### 디자인 원칙

1. **명확성**: 가격, 포함 내용, 구독 방법이 명확
2. **신뢰성**: 코치 정보, 리뷰, 자격증으로 신뢰 구축
3. **긴급성**: "지금 시작하세요" 등 CTA 문구
4. **접근성**: 큰 텍스트, 명확한 대비, 모바일 최적화

### 컬러 사용

- Primary CTA: 강렬한 색상 (예: 주황, 파랑)
- 가격: 강조 폰트 크기
- 코치 정보: 신뢰감 있는 레이아웃

### 이미지 최적화

- 썸네일: 최소 1920x1080 권장
- WebP 포맷 사용
- Lazy loading 적용

---

## 📱 반응형 레이아웃

### Mobile (< 768px)

- 세로 스크롤 중심
- 하단 고정 CTA 바
- 탭 대신 아코디언

### Tablet (768px - 1024px)

- 2단 그리드
- Sticky 사이드바 (가격 정보)

### Desktop (> 1024px)

- 3단 그리드
- Sticky 사이드바 (가격 + 코치 정보)
- 넓은 컨텐츠 영역

---

## 🔧 기술 스택

### Frontend

- Next.js 14 (App Router)
- TailwindCSS
- Shadcn/ui 컴포넌트
- RichTextViewer (content 렌더링)

### Backend

- Server Actions (구독 처리)
- Supabase (인증, DB)
- 포트원 (결제)

---

## 📊 성공 지표

### 핵심 KPI

1. **페이지 체류 시간**: 평균 3분 이상
2. **구독 전환율**: 5% 이상
3. **스크롤 깊이**: 70% 이상
4. **CTA 클릭률**: 10% 이상

### 추적 이벤트

- `view_program`: 페이지 뷰
- `click_subscribe_cta`: CTA 클릭
- `start_checkout`: 결제 시작
- `complete_subscription`: 구독 완료

---

## 🚀 구현 우선순위

### Phase 1: MVP (필수)

1. ✅ Hero Section (기본 정보)
2. ✅ 프로그램 상세 (content 렌더링)
3. ✅ 워크아웃 미리보기
4. ✅ 코치 소개
5. ✅ 가격 및 CTA
6. ✅ 구독 플로우 (간단 버전)

### Phase 2: 개선

1. ⬜ 프로그램 하이라이트 (metadata 추가)
2. ⬜ 탭 네비게이션
3. ⬜ FAQ 섹션
4. ⬜ 반응형 최적화
5. ⬜ SEO 최적화

### Phase 3: 고도화

1. ⬜ 리뷰/평점 시스템
2. ⬜ 소개 영상
3. ⬜ 프로그램 비교
4. ⬜ 추천 프로그램
5. ⬜ A/B 테스트

---

## 🎬 개발 가이드

### 1. 페이지 생성

```bash
app/programs/[id]/page.tsx
```

### 2. Server Component로 데이터 패칭

```typescript
async function getProgramForSale(programId: string) {
  return db.query.programs.findFirst({
    where: and(
      eq(programs.id, programId),
      eq(programs.isActive, true) // 공개된 프로그램만
    ),
    with: {
      coach: true,
      workouts: {
        orderBy: [workouts.dayNumber],
        limit: 10, // 미리보기는 10개만
      },
    },
  });
}
```

### 3. 컴포넌트 구조

```
page.tsx (Server Component)
├── ProgramHero
├── ProgramHighlights
├── ProgramContent (Tabs)
│   ├── AboutTab (content 렌더링)
│   ├── CurriculumTab (workouts)
│   └── CoachTab (coach info)
├── WorkoutPreview
├── PricingSection
└── FAQSection
```

### 4. CTA 처리

```typescript
"use client";

async function handleSubscribe(programId: string) {
  // 로그인 체크
  const user = await getUser();
  if (!user) {
    router.push(`/login?redirect=/programs/${programId}`);
    return;
  }

  // 이미 구독 중인지 체크
  const existing = await checkSubscription(programId);
  if (existing) {
    router.push("/dashboard");
    return;
  }

  // 결제 페이지로 이동
  router.push(`/checkout?programId=${programId}`);
}
```

---

## 📝 부족한 부분 및 제안

### 1. 프로그램 메타데이터 부족

현재 테이블에는 기본 정보만 있습니다. 다음 필드 추가를 권장합니다:

- `highlights`: 프로그램 주요 특징
- `targetAudience`: 대상 유저
- `goals`: 프로그램 목표
- `videoUrl`: 소개 영상

### 5. 이미지 최적화

- 썸네일 이미지 업로드 기능
- 이미지 CDN
- 반응형 이미지

---

## 🎯 결론

프로그램 판매 페이지는 **전환율**이 핵심입니다.

- 명확한 가치 제안
- 신뢰할 수 있는 정보
- 쉬운 구독 프로세스

위 PRD를 기반으로 Phase 1부터 단계적으로 구현하면, 매력적이고 전환율 높은 판매 페이지를 만들 수 있습니다!
