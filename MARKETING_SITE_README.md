# 마케팅 사이트 구현 완료

## 개요

하이록스(Hyrox) 스타일의 고강도 피트니스 마케팅 사이트가 성공적으로 구축되었습니다.

## 구현된 기능

### 1. 브랜드 테마
- **컬러 시스템**: Volt Yellow (#D2FF00), Pure Black, Dark Grey
- **타이포그래피**: Extra Bold 헤딩, 깔끔한 본문
- **일관된 디자인**: Tailwind CSS 변수로 전체 테마 통일

### 2. 페이지 구조
- **Route Groups**: `app/(marketing)/` 폴더로 독립적인 마케팅 사이트 구성
- **SEO 최적화**: Metadata, OpenGraph 태그 설정
- **반응형 레이아웃**: 모바일/태블릿/데스크톱 완벽 지원

### 3. 섹션별 구현

#### Hero Section
- 풀스크린 배경 이미지 (Unsplash)
- 강렬한 메인 카피와 서브 카피
- 2개의 CTA 버튼 (회원가입, 프로그램 보기)
- 스크롤 다운 인디케이터
- Framer Motion 애니메이션

#### Service Intro Section
- 3가지 핵심 포인트 카드
  - Systematic Program
  - Daily Coaching
  - Data Driven
- 아이콘과 호버 효과
- 반응형 그리드 레이아웃

#### Social Proof Section
- 고객 후기 슬라이더 (Embla Carousel)
- 자동 슬라이드 기능
- 터치 스와이프 지원
- 통계 카운터 (훈련 완료 횟수, 회원 수, 만족도)

#### Footer
- 브랜드 정보 및 사업자 정보
- 바로가기 링크
- 법적 정보 (이용약관, 개인정보처리방침)
- 소셜 미디어 링크

### 4. 공통 컴포넌트
- **SectionContainer**: 일관된 섹션 레이아웃
- **CTAButton**: Volt Yellow 스타일의 버튼 (Primary/Secondary)
- **AnimatedElement**: 스크롤 기반 페이드인 애니메이션

## 기술 스택

- **Framework**: Next.js 16.1 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Carousel**: Embla Carousel React
- **Icons**: Lucide React
- **Images**: Next.js Image Optimization

## 파일 구조

```
app/
├── (marketing)/
│   ├── layout.tsx              # SEO + 마케팅 레이아웃
│   └── page.tsx                # 랜딩 페이지
│
components/marketing/
├── section-container.tsx       # 공통 섹션 컨테이너
├── animated-element.tsx        # 애니메이션 래퍼
├── cta-button.tsx              # CTA 버튼
├── hero-section.tsx            # Hero 섹션
├── service-intro-section.tsx  # 서비스 소개
├── social-proof-section.tsx   # 고객 후기
└── footer.tsx                  # 푸터
```

## 반응형 브레이크포인트

- **모바일**: < 640px
- **태블릿**: 640px - 1024px
- **데스크톱**: > 1024px

### 반응형 최적화 사항

1. **Hero Section**
   - 모바일: 텍스트 크기 축소, 버튼 세로 정렬
   - 데스크톱: 큰 텍스트, 버튼 가로 정렬

2. **Service Intro**
   - 모바일: 1단 세로 스택
   - 태블릿: 2단 그리드
   - 데스크톱: 3단 그리드

3. **Social Proof**
   - 모바일: 1개 카드 표시
   - 태블릿: 2개 카드 표시
   - 데스크톱: 3개 카드 표시

4. **Footer**
   - 모바일: 1단 세로 스택
   - 데스크톱: 4단 그리드

## 사용 방법

### 개발 서버 실행

```bash
pnpm dev
```

메인 페이지가 마케팅 사이트로 표시됩니다: `http://localhost:3000`

### 기존 페이지 접근

- 로그인: `/login`
- 회원가입: `/signup`
- 계정: `/account`

## 플레이스홀더 콘텐츠

현재 사용 중인 플레이스홀더:

1. **이미지**: Unsplash (고강도 운동 이미지)
2. **고객 후기**: 4개의 샘플 텍스트
3. **통계 수치**: 임의의 숫자 (50,000+, 1,200+, 4.8/5.0)
4. **사업자 정보**: 샘플 정보

## 다음 단계

1. **콘텐츠 교체**
   - 실제 운동 이미지/영상으로 교체
   - 실제 고객 후기로 교체
   - 실제 통계 데이터 연동

2. **추가 섹션**
   - Pricing Plan 섹션
   - Program Preview 섹션

3. **통합**
   - 결제 시스템 연동
   - 유저 웹(Shop) 연결
   - 코치 관리 시스템 연동

## 성능 최적화

- ✅ Next.js Image 최적화
- ✅ Framer Motion 동적 import
- ✅ 컴포넌트 코드 분할
- ✅ 폰트 최적화 (next/font)
- ✅ 반응형 이미지 (sizes 속성)

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)
- 모바일 브라우저 (iOS Safari, Chrome Mobile)

## 문제 해결

### 이미지가 로드되지 않는 경우
Next.js의 `next.config.ts`에 Unsplash 도메인을 추가하세요:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
  ],
}
```

### 애니메이션이 작동하지 않는 경우
Framer Motion이 설치되어 있는지 확인하세요:

```bash
pnpm add framer-motion
```

### Carousel이 작동하지 않는 경우
Embla Carousel 패키지를 설치하세요:

```bash
pnpm add embla-carousel-autoplay
```

## 라이선스

© 2025 PACE. All rights reserved.

