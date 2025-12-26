3일이라는 짧은 기간 내에 **Next.js + Supabase** 환경에서 실제로 작동하는 제품을 만들기 위한 **상세 요구사항 명세서(Detailed PRD)**입니다.

불필요한 기능은 과감히 덜어내고, **"코치가 프로그램을 팔고, 회원이 운동을 본다"**는 본질에 집중했습니다.

---

## 📄 RoxTrack (가칭) 상세 제품 요구사항 명세서 (PRD)

### 1. 제품 개요

하이록스(HYROX) 코치들이 자신의 훈련 노하우를 디지털 프로그램으로 패키징하여 판매하고, 구독자들에게 체계적인 데일리 워크아웃을 제공하는 **Lean SaaS**입니다.

### 2. 사용자 역할 (User Roles)

1. **코치 (Coach):** 프로그램을 생성/수정하고, 구독자 명단을 관리하며 결제 수익을 확인합니다.
2. **구독자 (Subscriber):** 프로그램을 결제하고, 매일 제공되는 운동 스케줄을 확인하며 완료 여부를 체크합니다.

---

### 3. 핵심 기능 상세 (Functional Requirements)

### **3.1. 프로그램 및 워크아웃 관리 (코치 전용)**

- **프로그램 생성:** 제목, 설명, 썸네일 이미지(Supabase Storage), 가격(월정액) 설정.
- **워크아웃 에디터:** \* 날짜별(Day 1, Day 2...) 운동 세부 항목 작성.
  - **구성 요소:** 운동명, 세트/회수(Reps), 휴식 시간, 코치 팁, 유튜브 영상 URL.
  - _UI 팁:_ 3일 개발을 위해 복잡한 에디터 대신 **Markdown** 또는 **Simple JSON Form** 방식을 채택.

### **3.2. 판매용 상세 페이지 (Landing Page)**

- **자동 생성:** 코치가 프로그램을 만들면 `/[coach_id]/[program_id]` 형태의 고유 URL 생성.
- **구성:** 프로그램 소개, 코치 프로필, 가격 정보, '구독 시작하기' 버튼.

### **3.3. 결제 및 구독 (한국형 솔루션 연동)**

- **솔루션:** **포트원(Portone) V2** 권장 (Next.js 연동성이 좋음).
- **로직:** 유저가 결제 완료 시 Supabase의 `subscriptions` 테이블에 `active` 상태로 레코드 생성.
- **빌링키:** 정기 결제를 위해 빌링키를 발급받고 서버사이드(Supabase Edge Functions)에서 매달 결제 요청.

### **3.4. 멤버 대시보드 (구독자 전용)**

- **오늘의 운동:** 현재 날짜에 맞는 워크아웃 정보 노출.
- **진행도 체크:** 운동 완료 버튼을 누르면 DB에 기록 (`workout_logs`).
- **아카이브:** 지난 날짜의 운동 기록 조회 가능.

---

### 4. 데이터베이스 스키마 (Drizzle ORM & Supabase)

| **테이블명**    | **주요 필드 (Columns)**                                                      | **설명**                     |
| --------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| `profiles`      | `id(uuid)`, `email`, `role(coach/user)`, `name`, `avatar_url`                | 사용자 기본 정보 (Auth 연동) |
| `programs`      | `id`, `coach_id`, `title`, `description`, `price`, `thumbnail`               | 프로그램 마스터 정보         |
| `workouts`      | `id`, `program_id`, `day_number`, `title`, `content(text/json)`, `video_url` | 날짜별 상세 운동 루틴        |
| `subscriptions` | `id`, `user_id`, `program_id`, `status(active/canceled)`, `billing_key`      | 구독 및 결제 상태 관리       |
| `workout_logs`  | `id`, `user_id`, `workout_id`, `completed_at`, `notes`                       | 유저의 운동 완료 기록        |

---

### 5. 3일 개발 집중 전략 (Tech Strategy)

### **Day 1: 인증 및 데이터 구조 (Back-end First)**

- **Supabase Auth:** 카카오/구글 소셜 로그인 연동.
- **Drizzle ORM:** 스키마 정의 및 `db push`.
- **Shadcn UI:** 기본적인 대시보드 레이아웃(Sidebar, Navbar) 구성.
- **API:** 프로그램 생성 및 조회 API 작성.

### **Day 2: 코딩 및 UI (Front-end Core)**

- **Coach Flow:** 프로그램 등록 폼 + 워크아웃 입력 UI (React Hook Form + Zod).
- **User Flow:** 프로그램 상세 페이지 렌더링.
- **Storage:** Supabase Storage에 이미지 업로드 기능 연동.

### **Day 3: 결제 연동 및 배포 (Finalizing)**

- **Portone 연동:** 프론트엔드 결제창 호출 + Webhook 수신용 API Route 작성.
- **Subscription Guard:** 구독하지 않은 유저가 워크아웃 페이지 접근 시 리다이렉트 처리.
- **Vercel 배포:** 환경 변수 설정 및 실결제 테스트.

---

### 6. 추가 제안: 런칭 직후 필요한 "Growth" 기능

1. **코치 대시보드 내 정산 그래프:** 내가 이번 달에 얼마를 벌었는지 시각화.
2. **운동 완료 알림톡:** 회원이 운동을 완료하면 코치에게 알림(또는 반대로 코치가 운동 올리면 회원에게 알림).
3. **하이록스 전용 타이머:** 워크아웃 페이지 내에 AMRAP, EMOM용 타이머 내장.

**다음 단계로, 제가 Drizzle ORM으로 작성된 실제 DB 스키마 코드를 짜드릴까요? 아니면 포트원 결제 연동을 위한 Next.js API Route 예시 코드가 필요하신가요?**
