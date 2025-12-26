# 코치 회원가입 플로우 (Coach Signup Flow)

## 1. 개요 (Overview)

하이록스 코치들이 PACE 플랫폼에 가입하여 자신의 프로그램을 판매할 수 있도록 하는 전문가 온보딩 프로세스입니다.

## 2. 회원가입 단계 (Signup Steps)

### Step 1: 이메일 인증 (Email Authentication)

- **목적**: 기본 계정 생성 및 이메일 인증
- **입력 필드**:
  - 이메일 주소 (필수)
  - 비밀번호 (필수, 최소 8자)
  - 비밀번호 확인 (필수)
- **동작**:
  - Supabase Auth로 계정 생성
  - 이메일 인증 링크 발송
  - 인증 완료 후 Step 2로 이동

### Step 2: 코치 프로필 작성 (Coach Profile Setup)

- **목적**: 코치의 전문성과 신뢰도를 보여줄 수 있는 기본 정보 수집
- **입력 필드**:

#### 2.1. 기본 정보

1. **이름** (필수)

   - 질문: "코치님의 이름을 알려주세요"
   - 플레이스홀더: "홍길동"
   - 최대 길이: 50자

2. **활동명 / 별명** (선택)
   - 질문: "회원들에게 보여질 활동명이 있다면 알려주세요"
   - 플레이스홀더: "예: 하이록스킹, 코치K"
   - 최대 길이: 30자
   - 도움말: "입력하지 않으면 이름이 표시됩니다"

#### 2.2. 전문성 정보

3. **코칭 경력** (필수)

   - 질문: "코칭 경력이 얼마나 되셨나요?"
   - 선택지 (Select):
     - 1년 미만
     - 1-3년
     - 3-5년
     - 5-10년
     - 10년 이상

4. **전문 분야** (필수, 다중 선택 가능)

   - 질문: "전문으로 코칭하시는 분야를 선택해주세요 (중복 선택 가능)"
   - 체크박스:
     - ⬜ 하이록스 (HYROX)
     - ⬜ 크로스핏 (CrossFit)
     - ⬜ 기능성 트레이닝 (Functional Training)
     - ⬜ 근력 트레이닝 (Strength Training)
     - ⬜ 지구력 트레이닝 (Endurance Training)
     - ⬜ 재활 트레이닝 (Rehabilitation)
     - ⬜ 기타
   - 최소 1개 선택 필수

5. **자격증** (선택)
   - 질문: "보유하신 자격증이 있다면 입력해주세요"
   - 플레이스홀더: "예: 생활체육지도자 2급, NSCA-CPT, CrossFit Level 1"
   - 최대 길이: 200자
   - 도움말: "여러 개인 경우 쉼표(,)로 구분해주세요"

#### 2.3. 소개 및 연락처

6. **한 줄 소개** (필수)

   - 질문: "코치님을 한 줄로 소개한다면?"
   - 플레이스홀더: "예: 하이록스 세계 대회 출전 경험을 바탕으로 과학적인 트레이닝을 제공합니다"
   - 최대 길이: 100자

7. **상세 소개** (선택)

   - 질문: "코치님의 이야기를 자유롭게 작성해주세요"
   - Textarea
   - 플레이스홀더:
     ```
     - 코칭 철학
     - 주요 경력 및 성과
     - 회원들에게 전하고 싶은 메시지
     ```
   - 최대 길이: 1000자

8. **프로필 사진 URL** (선택)

   - 질문: "프로필 사진 URL을 입력해주세요"
   - 플레이스홀더: "https://example.com/profile.jpg"
   - 도움말: "추후 파일 업로드 기능이 추가될 예정입니다"

9. **SNS 또는 웹사이트** (선택)

   - 질문: "Instagram, 블로그 등 링크를 입력해주세요"
   - 플레이스홀더: "https://instagram.com/yourhandle"
   - 도움말: "회원들이 코치님에 대해 더 알아볼 수 있습니다"

10. **연락처** (선택)
    - 질문: "회원들이 문의할 수 있는 연락처를 입력해주세요"
    - 플레이스홀더: "010-1234-5678 또는 카카오톡 ID"
    - 최대 길이: 50자

#### 2.4. 약관 동의

11. **이용 약관 동의** (필수)
    - ☑ 서비스 이용약관에 동의합니다
    - ☑ 개인정보 처리방침에 동의합니다
    - ☐ (선택) 마케팅 정보 수신에 동의합니다

---

## 3. 데이터베이스 스키마 수정 (Database Schema Updates)

기존 `profiles` 테이블에 다음 필드 추가 필요:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coaching_experience TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialties TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certifications TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio_short TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio_long TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sns_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
```

## 4. 사용자 경험 (User Experience)

### 4.1. 진행 상황 표시

- **Progress Bar**: 상단에 진행률 표시 (Step 1 → Step 2)
- **Step Indicator**: "1단계: 계정 생성" → "2단계: 프로필 작성"

### 4.2. 저장 및 이탈 방지

- 자동 저장 기능 (Draft 저장)
- 페이지 이탈 시 경고 메시지
- "나중에 완성하기" 버튼 제공

### 4.3. 완료 후 동작

- 환영 메시지 표시
- 대시보드로 자동 이동
- 첫 프로그램 만들기 안내

---

## 5. 기술 구현 사항 (Technical Implementation)

### 5.1. 페이지 구조

```
/signup
  - page.tsx (Step 1: 이메일 회원가입)

/signup/profile (또는 /onboarding)
  - page.tsx (Step 2: 코치 프로필 작성)
```

### 5.2. Server Actions

- `signupWithEmail(formData)`: 이메일 계정 생성
- `completeCoachProfile(formData)`: 코치 프로필 저장
- `checkOnboardingStatus()`: 온보딩 완료 여부 확인

### 5.3. Middleware 처리

- 온보딩 미완료 시 `/signup/profile`로 리다이렉트
- 온보딩 완료 후 `/dashboard` 접근 가능

---

## 6. 검증 규칙 (Validation Rules)

### 필수 필드 검증

- 이메일: 유효한 이메일 형식
- 비밀번호: 최소 8자, 영문+숫자 조합 권장
- 이름: 최소 2자
- 코칭 경력: 선택 필수
- 전문 분야: 최소 1개 선택
- 한 줄 소개: 최소 10자

### 선택 필드 검증

- URL 필드: 유효한 URL 형식 (입력 시)
- 연락처: 한국 전화번호 또는 자유 형식

---

## 7. UI/UX 참고사항

### 디자인 원칙

- **명확한 레이블**: 각 입력 필드의 목적을 명확히 전달
- **도움말 제공**: 플레이스홀더와 도움말로 입력 예시 제공
- **시각적 피드백**: 입력 검증 결과를 실시간으로 표시
- **모바일 최적화**: 반응형 디자인 적용

### 톤앤매너

- 전문적이지만 친근한 톤
- "코치님" 호칭 사용
- 격려하는 메시지 ("멋진 프로필이 완성되고 있어요!")

---

## 8. 추후 개선 사항 (Future Enhancements)

1. **파일 업로드 기능**: Supabase Storage 연동하여 프로필 사진 직접 업로드
2. **자격증 검증**: 자격증 번호 입력 및 검증 시스템
3. **포트폴리오**: 코칭 영상, 회원 후기 등록
4. **소셜 로그인**: 카카오, 네이버, 구글 로그인 지원
5. **코치 승인 시스템**: 관리자 승인 후 프로그램 판매 가능
