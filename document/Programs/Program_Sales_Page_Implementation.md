# 프로그램 판매 페이지 구현 완료

> **목표 달성**: 유저가 프로그램에 관심을 갖고 구독하고 싶게 만드는 매력적인 판매 페이지 구현 ✅

## 📌 구현 개요

### 완성된 페이지 경로
- **판매 페이지**: `/programs/[id]`
- **Not Found**: `/programs/[id]/not-found`

### 구현 범위
✅ **Phase 1 MVP** 완료
- Hero Section (기본 정보, 메타데이터, CTA)
- 프로그램 상세 (Tabs: 소개, 커리큘럼, 코치)
- 워크아웃 미리보기
- 코치 소개 섹션
- 가격 및 CTA (Desktop Sticky, Mobile Bottom Bar)
- FAQ 섹션

---

## 🎨 구현된 페이지 구조

### 1. Hero Section
**위치**: 페이지 상단
**파일**: `app/programs/[id]/_components/program-hero.tsx`

**포함 요소**:
- 프로그램 제목 (큰 타이포그래피)
- 간단 설명 (description HTML 렌더링)
- 메타데이터 배지:
  - 난이도 (별점)
  - 주당 일수
  - 훈련 시간
  - 프로그램 기간
- 가격 (₩ 표시, 무료는 "무료" 텍스트)
- CTA 버튼 ("지금 구독하기")
- 코치 정보 (아바타 + 이름 + 한줄소개)

**특징**:
- 그라데이션 배경
- 썸네일 이미지 블러 처리 배경 (선택적)
- 난이도 별점 시각화

---

### 2. 프로그램 상세 정보 (Tabs)
**위치**: 메인 콘텐츠 영역
**파일**: `app/programs/[id]/_components/program-content.tsx`

**3개 탭 구성**:

#### Tab 1: 프로그램 소개
- `content` 필드 HTML 렌더링
- Prose 스타일 적용
- 이미지/영상 포함 가능

#### Tab 2: 커리큘럼
- 전체 워크아웃 수 표시
- Day 목록 (최대 10개 미리보기)
- 각 Day: 배지(Day 번호) + 제목
- 잠금 아이콘 ("구독 후 확인")
- 더 많은 Day가 있을 경우 안내 메시지

#### Tab 3: 코치 소개
- 프로필 사진 (Avatar)
- 이름 + 한줄소개
- 상세 소개 (bioLong)
- 경력 (coachingExperience)
- 자격증 (certifications)
- SNS 링크 (snsUrl)

---

### 3. 워크아웃 미리보기
**위치**: 메인 콘텐츠 영역
**파일**: `app/programs/[id]/_components/workout-preview.tsx`

**포함 요소**:
- 전체 워크아웃 수 표시
- 최대 6개 Day 미리보기
- 각 Day: Day 번호 배지 + 제목 + 잠금 아이콘
- 나머지 Day 수 표시

---

### 4. 코치 소개 섹션
**위치**: 메인 콘텐츠 영역
**파일**: `app/programs/[id]/_components/coach-section.tsx`

**포함 요소**:
- 코치 프로필 (아바타 + 이름 + 한줄소개)
- 경력
- 자격증
- SNS 링크 버튼

---

### 5. 가격 및 CTA 섹션
**위치**: 우측 사이드바 (Desktop), 하단 고정 (Mobile)
**파일**: 
- `app/programs/[id]/_components/pricing-section.tsx` (Desktop Sticky)
- `app/programs/[id]/_components/mobile-cta-bar.tsx` (Mobile)

**포함 요소**:
- 가격 표시 (큰 폰트)
- 포함 내용:
  - ✓ 전체 워크아웃 접근
  - ✓ 운동 기록 관리
  - ✓ 진행상황 추적
  - ✓ 언제든지 해지 가능
- CTA 버튼
- 이용 안내

**기능**:
- Desktop: Sticky 사이드바 (스크롤 시 고정)
- Mobile: 하단 고정 바 (스크롤 400px 이후 표시)

---

### 6. FAQ 섹션
**위치**: 메인 콘텐츠 하단
**파일**: `app/programs/[id]/_components/faq-section.tsx`

**포함 질문**:
1. 초보자도 할 수 있나요?
2. 환불이 가능한가요?
3. 운동 장비가 필요한가요?
4. 하루에 얼마나 시간을 투자해야 하나요?
5. 프로그램을 중간에 변경할 수 있나요?
6. 코치와 직접 소통할 수 있나요?

**UI**: Accordion 컴포넌트 사용

---

## 🔧 기술 구현

### Server Actions
**파일**: `app/dashboard/actions.ts`

```typescript
// 공개 프로그램 조회 (판매 페이지용)
export async function getProgramForSale(programId: string)

// 구독 여부 확인
export async function checkUserSubscription(programId: string)
```

### 구독 버튼 로직
**파일**: `app/programs/[id]/_components/subscribe-button.tsx`

**플로우**:
1. 클릭 시 구독 여부 확인
2. 이미 구독 중이면 → 대시보드로 이동
3. 미구독 시 → 로그인 페이지로 이동 (향후 결제 페이지로 변경)

**TODO**: 결제 시스템 연동 (포트원)

---

## 📱 반응형 디자인

### Mobile (< 768px)
- 세로 스크롤
- 하단 고정 CTA 바
- Tabs 전체 너비

### Tablet & Desktop (> 768px)
- 2/3단 그리드 레이아웃
- 우측 Sticky 사이드바
- 넓은 콘텐츠 영역

---

## 🎨 UI/UX 특징

### 디자인 원칙
1. **명확성**: 가격, 포함 내용, 구독 방법 명확
2. **신뢰성**: 코치 정보, 프로그램 구성 투명하게 공개
3. **접근성**: 큰 텍스트, 명확한 대비, 모바일 최적화

### 컬러 사용
- Primary CTA: 강렬한 색상
- 가격: 강조 폰트 크기
- 메타데이터: Badge 컴포넌트

### 아이콘 사용
- Lucide Icons (Star, Calendar, Clock, Dumbbell, Lock, Check 등)

---

## 📂 파일 구조

```
app/programs/[id]/
├── page.tsx                              # 메인 페이지 (Server Component)
├── not-found.tsx                         # 404 페이지
└── _components/
    ├── program-hero.tsx                  # Hero Section
    ├── program-content.tsx               # 상세 정보 (Tabs)
    ├── workout-preview.tsx               # 워크아웃 미리보기
    ├── coach-section.tsx                 # 코치 소개
    ├── pricing-section.tsx               # 가격 & CTA (Desktop)
    ├── mobile-cta-bar.tsx                # 모바일 하단 CTA
    ├── subscribe-button.tsx              # 구독 버튼 (Client)
    └── faq-section.tsx                   # FAQ
```

---

## 🗄️ 활용 데이터

### programs 테이블
- ✅ `title`: 프로그램 제목
- ✅ `description`: 간단 설명 (HTML)
- ✅ `content`: 상세 콘텐츠 (HTML)
- ✅ `price`: 가격
- ✅ `thumbnailUrl`: 썸네일
- ✅ `difficulty`: 난이도
- ✅ `trainingTime`: 훈련 시간
- ✅ `daysPerWeek`: 주당 일수
- ✅ `cycleInfo`: 프로그램 기간
- ✅ `isActive`: 공개 여부

### profiles 테이블 (코치 정보)
- ✅ `displayName`: 활동명
- ✅ `avatarUrl`: 프로필 사진
- ✅ `bioShort`: 한줄소개
- ✅ `bioLong`: 상세 소개
- ✅ `coachingExperience`: 경력
- ✅ `certifications`: 자격증
- ✅ `snsUrl`: SNS 링크

### workouts 테이블
- ✅ `dayNumber`: Day 번호
- ✅ `title`: 워크아웃 제목

---

## ✅ 완료된 기능

### Phase 1: MVP
1. ✅ Hero Section - 프로그램 정보, 메타데이터, CTA
2. ✅ 프로그램 상세 - Tabs (소개, 커리큘럼, 코치)
3. ✅ 워크아웃 미리보기 - Day 목록 일부 표시
4. ✅ 코치 소개 - 경력, 자격증, SNS
5. ✅ 가격 및 CTA - Sticky 사이드바, 모바일 하단 바
6. ✅ FAQ - 자주 묻는 질문
7. ✅ 반응형 디자인 - Mobile/Desktop 최적화
8. ✅ 구독 버튼 - 로직 구현 (로그인 체크, 구독 확인)
9. ✅ Not Found 페이지

---

## 🚧 향후 개선 사항

### Phase 2: 개선
1. ⬜ 프로그램 하이라이트 섹션 (metadata 필드 추가 필요)
2. ⬜ 소개 영상 (videoUrl 필드)
3. ⬜ SEO 최적화 (메타 태그, Open Graph)
4. ⬜ 이미지 최적화 (WebP, Lazy loading)

### Phase 3: 고도화
1. ⬜ 리뷰/평점 시스템 (program_reviews 테이블)
2. ⬜ 구독자 수 표시
3. ⬜ 추천 프로그램
4. ⬜ 프로그램 비교
5. ⬜ 결제 시스템 연동 (포트원)

---

## 🔗 연동 필요 사항

### 1. 결제 시스템
**현재 상태**: 로그인 페이지로 리다이렉트
**향후**: 
- 포트원 SDK 연동
- 체크아웃 페이지 구현
- 결제 완료 후 구독 생성
- 구독 완료 페이지

### 2. 인증 시스템
**현재**: Supabase Auth 사용
**기능**:
- 로그인/회원가입 후 판매 페이지로 돌아오기
- redirect 파라미터 활용

### 3. 대시보드 연동
**연동됨**:
- 프로그램 개요 탭에서 "판매 페이지 미리보기" 링크
- 이미 구독 중이면 대시보드로 이동

---

## 🎯 사용 방법

### 1. 판매 페이지 접근
```
/programs/[programId]
```

### 2. 코치가 판매 페이지 미리보기
1. 대시보드 → 프로그램 → 특정 프로그램 선택
2. "개요" 탭
3. 공개 상태 ON 상태에서
4. "판매 페이지 미리보기" 버튼 클릭

### 3. 유저가 구독하기
1. 판매 페이지 방문
2. "지금 구독하기" 버튼 클릭
3. 로그인/회원가입 (미로그인 시)
4. 결제 진행 (향후 구현)
5. 대시보드에서 프로그램 시작

---

## 📊 성공 지표 (향후 추적)

### KPI
- 페이지 체류 시간
- 구독 전환율
- 스크롤 깊이
- CTA 클릭률

### 추적 이벤트 (향후 구현)
- `view_program`: 페이지 뷰
- `click_subscribe_cta`: CTA 클릭
- `start_checkout`: 결제 시작
- `complete_subscription`: 구독 완료

---

## 🐛 알려진 제한사항

1. **결제 시스템 미구현**: 현재는 로그인 페이지로만 리다이렉트
2. **프로그램 하이라이트 없음**: metadata 필드 추가 필요
3. **리뷰/평점 시스템 없음**: program_reviews 테이블 필요
4. **SEO 최적화 없음**: 메타 태그, 구조화된 데이터 추가 필요
5. **구독자 수 표시 없음**: subscriber_count 필드 필요

---

## 🎉 결론

프로그램 판매 페이지 **Phase 1 MVP**가 완성되었습니다!

### 주요 성과
✅ 매력적인 Hero Section
✅ 상세한 프로그램 정보 (Tabs)
✅ 워크아웃 미리보기
✅ 코치 전문성 강조
✅ 명확한 가격 정보 및 CTA
✅ FAQ로 의문 해소
✅ 반응형 디자인 (Mobile/Desktop)

### 다음 단계
1. 결제 시스템 연동 (포트원)
2. 프로그램 메타데이터 추가 (highlights, targetAudience, goals)
3. 리뷰/평점 시스템
4. SEO 최적화

이제 유저들이 프로그램을 발견하고 구독할 수 있는 완성도 높은 판매 페이지를 갖추었습니다! 🚀

