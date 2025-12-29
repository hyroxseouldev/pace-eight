# 프로그램 구매 시스템 PRD

> **목표**: 유저가 프로그램을 간단하고 원활하게 구매할 수 있는 결제 시스템 구현

## 📌 개요

### 목적

- 간단하고 직관적인 구매 플로우 제공
- 토스 페이먼트 연동을 통한 안전한 결제 처리
- 구매 후 즉시 서비스 이용 가능
- 코치가 구매 내역을 쉽게 확인 및 관리

### 핵심 가치

- **단순함**: 최소한의 단계로 구매 완료
- **보안**: 토스 페이먼트의 검증된 결제 시스템 활용
- **신뢰**: 구매 내역 투명성 제공

---

## 🎯 구매 플로우

### 전체 플로우 다이어그램

```
[프로그램 판매 페이지]
    ↓
[구매 버튼 클릭]
    ↓
[로그인 체크] → 미로그인 시 → [로그인 페이지]
    ↓ (로그인 완료)
[결제 준비 (Server Action)]
    ↓
[토스 페이먼트 결제창 바로 실행]
    ↓
[결제 완료 페이지]
    ↓
[대시보드로 이동]
```

### 핵심 특징

- **간단한 플로우**: 별도 결제 페이지 없이 바로 결제 실행
- **높은 전환율**: 추가 단계 제거로 이탈률 감소
- **신속한 구매**: 유저가 프로그램을 즉시 구매 가능

---

## 📱 상세 기능 명세

### 1. 프로그램 구매 버튼 (시점)

#### 페이지

- `/programs/[id]` - 프로그램 판매 페이지

#### 기능

- **CTA 버튼**: "구매하기" / "구독하기" 버튼 표시
- **버튼 위치**:
  - Hero Section: "지금 구독하기" 버튼
  - Pricing Section: 구독 정보 영역 내 CTA
  - Mobile: 하단 고정 CTA 바

#### 동작

```typescript
async function handlePurchase(programId: string) {
  // 1. 로그인 상태 체크
  const user = await getCurrentUser();

  if (!user) {
    // 미로그인: 로그인 페이지로 리다이렉트
    const returnUrl = `/programs/${programId}`;
    router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
    return;
  }

  // 2. 이미 구매했는지 체크
  const existingSubscription = await checkExistingSubscription(
    programId,
    user.id
  );

  if (existingSubscription) {
    // 이미 구매한 경우: 대시보드로 이동
    toast.success("이미 구매한 프로그램입니다. 대시보드로 이동합니다.");
    router.push("/dashboard");
    return;
  }

  // 3. 결제 준비 (Server Action)
  const { paymentKey, orderId, amount } = await createPaymentOrder({
    programId,
  });

  // 4. 토스 페이먼트 결제창 바로 실행
  try {
    const result = await executeTossPayment({
      paymentKey,
      orderId,
      amount,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      failUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/fail`,
    });

    if (result.success) {
      // 결제 성공 시 페이지 이동은 토스가 처리
      // successUrl로 자동 리다이렉트됨
    } else {
      toast.error("결제가 실패했습니다. 다시 시도해주세요.");
    }
  } catch (error) {
    toast.error("결제 처리 중 오류가 발생했습니다.");
  }
}
```

---

### 2. 로그인/회원가입 플로우

#### 페이지 경로

- `/login` - 로그인 페이지
- `/signup` - 회원가입 페이지

#### 리다이렉트 처리

```typescript
// 로그인 페이지
export default function LoginPage({ searchParams }: PageProps) {
  const { redirect } = searchParams;

  // 로그인 성공 시
  const handleLoginSuccess = async () => {
    if (redirect) {
      router.push(decodeURIComponent(redirect));
    } else {
      router.push("/dashboard");
    }
  };

  return <LoginForm onSuccess={handleLoginSuccess} />;
}
```

#### 쿼리 파라미터

- `redirect`: 로그인 후 이동할 URL (프로그램 상세 페이지 URL)

---

### 3. 결제 (토스 페이먼트)

#### 결제 방식

- **토스 페이먼트** 연동
- **바로 결제 실행**: 별도 결제 페이지 없이 바로 결제창 실행
- **결제 수단**: 신용카드 (초기), 추후 가상계좌, 카카오페이 등 추가

#### 결제 프로세스

```
[클라이언트]           [서버]              [토스 페이먼트]
    │                    │                        │
    │─ 구매 버튼 클릭 ───│                        │
    │                    │                        │
    │─ 결제 준비 요청 ───→│                        │
    │                    │─ API Key 생성 ────→    │
    │                    │←─ paymentKey ───────    │
    │←─ orderId, ────────│                        │
    │   paymentKey        │                        │
    │                    │                        │
    │─ 토스 결제창 실행 ──→                        │
    │←─────── 유저 결제 ──→                        │
    │                    │                        │
    │←─────── 리다이렉트 ─→                        │
    │   (success/fail)    │                        │
    │                    │                        │
    │─ 결제 승인 요청 ───→│                        │
    │                    │─ 결제 승인 ─────────→   │
    │                    │←─ 결제 결과 ────────    │
    │←─ 성공/실패 ────────│                        │
```

#### 토스 페이먼트 SDK 사용

```typescript
// lib/toss-payments.ts
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

let tossPayments: any = null;

export async function getTossPayments() {
  if (!tossPayments) {
    tossPayments = await loadTossPayments(
      process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
    );
  }
  return tossPayments;
}

export async function executeTossPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
  successUrl: string;
  failUrl: string;
}) {
  const tossPayments = await getTossPayments();

  try {
    const response = await tossPayments.requestPayment("카드", {
      amount: params.amount,
      orderId: params.orderId,
      orderName: "프로그램 구매",
      customerName: "구매자",
      successUrl: params.successUrl,
      failUrl: params.failUrl,
    });

    return { success: true, response };
  } catch (error) {
    console.error("토스 페이먼트 에러:", error);
    return { success: false, error };
  }
}
```

#### API 구조

##### 1. 결제 준비 (Server Action)

```typescript
// app/actions/payment.ts
"use server";

import { db } from "@/lib/db";
import { programs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createPaymentOrder(params: {
  programId: string;
  amount: number;
}) {
  const { programId, amount } = params;

  // 프로그램 정보 확인
  const program = await db.query.programs.findFirst({
    where: eq(programs.id, programId),
  });

  if (!program) {
    throw new Error("존재하지 않는 프로그램입니다.");
  }

  // 금액 검증
  if (program.price !== amount) {
    throw new Error("결제 금액이 일치하지 않습니다.");
  }

  // 주문 ID 생성 (UUID)
  const orderId = crypto.randomUUID();

  // 토스 페이먼트 결제 준비 API 호출
  const response = await fetch(
    "https://api.tosspayments.com/v1/payments/ready",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${process.env.TOSS_PAYMENTS_SECRET_KEY}:`
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        method: "card",
        amount: amount,
        orderId: orderId,
        orderName: program.title,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        failUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/fail`,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("결제 준비에 실패했습니다.");
  }

  const data = await response.json();

  // 결제 주문 정보 임시 저장 (Redis 또는 DB)
  await savePaymentOrder({
    orderId,
    programId,
    amount,
    paymentKey: data.paymentKey,
    status: "ready",
  });

  return {
    orderId,
    paymentKey: data.paymentKey,
    amount: data.totalAmount,
  };
}
```

##### 2. 결제 승인 (Server Action)

```typescript
export async function approvePayment(params: {
  orderId: string;
  paymentKey: string;
  amount: number;
}) {
  const { orderId, paymentKey, amount } = params;

  // 결제 주문 정보 조회
  const order = await getPaymentOrder(orderId);

  if (!order) {
    throw new Error("결제 주문을 찾을 수 없습니다.");
  }

  // 금액 검증
  if (order.amount !== amount) {
    throw new Error("결제 금액이 일치하지 않습니다.");
  }

  // 토스 페이먼트 결제 승인 API 호출
  const response = await fetch(
    `https://api.tosspayments.com/v1/payments/${paymentKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${process.env.TOSS_PAYMENTS_SECRET_KEY}:`
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        orderId: orderId,
        amount: amount,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("결제 승인에 실패했습니다.");
  }

  const paymentData = await response.json();

  // 결제 성공 처리
  if (paymentData.status === "DONE") {
    // 구독 레코드 생성
    await createSubscription({
      userId: order.userId,
      programId: order.programId,
      status: "active",
      paymentKey,
      currentPeriodEnd: calculateNextPeriodEnd(), // 30일 후
    });

    // 주문 상태 업데이트
    await updatePaymentOrder(orderId, {
      status: "completed",
    });
  }

  return paymentData;
}
```

---

### 4. 결제 완료 페이지

#### 페이지 경로

- `/checkout/success` - 결제 성공 페이지
- `/checkout/fail` - 결제 실패 페이지

#### 결제 성공 페이지 구성

```
┌─────────────────────────────────────────────────┐
│                                                  │
│           ✅ 결제가 완료되었습니다!              │
│                                                  │
│  ────────────────────────────────────────      │
│                                                  │
│  주문 번호: ORDER-12345                          │
│  결제 금액: ₩99,000                              │
│  결제 방법: 신용카드                              │
│                                                  │
│  ────────────────────────────────────────      │
│                                                  │
│  🎉 이제 서비스를 이용할 수 있습니다!             │
│                                                  │
│  구매하신 프로그램                                │
│  [썸네일] 하이록스 입문 30일 챌린지              │
│                                                  │
│  ────────────────────────────────────────      │
│                                                  │
│  [대시보드로 이동] [구매 내역 확인]                │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### 동작

```typescript
// Server Component
async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { orderId } = searchParams;

  if (!orderId) {
    redirect("/programs");
  }

  const user = await getCurrentUser();
  const order = await getPaymentOrder(orderId);

  if (!order || order.status !== "completed") {
    redirect("/checkout/fail");
  }

  const program = await getProgramById(order.programId);

  return (
    <div>
      <SuccessMessage />
      <OrderSummary order={order} program={program} />
      <ActionButtons />
    </div>
  );
}
```

#### 버튼 동작

```typescript
// 대시보드로 이동
function handleGoToDashboard() {
  router.push("/dashboard");
}

// 구매 내역 확인
function handleViewPurchaseHistory() {
  router.push("/dashboard/my-programs");
}
```

---

### 5. 코치 대시보드 - 구매 내역

#### 페이지 경로

- `/dashboard/programs/[id]/subscribers` - 프로그램 구매자 목록

#### 기능

- **구매자 목록**: 프로그램을 구매한 유저 리스트
- **구매 정보**:
  - 유저 이름
  - 구매일
  - 구독 상태 (active/canceled)
  - 결제 금액

#### 페이지 구성

```
┌─────────────────────────────────────────────────┐
│  구독자 목록 (12명)                              │
├─────────────────────────────────────────────────┤
│                                                  │
│  [검색] [필터: 전체/활성/해지]                    │
│                                                  │
│  ┌──────────────────────────────────────────┐ │
│  │ 이름    구매일     상태      결제 금액      │ │
│  ├──────────────────────────────────────────┤ │
│  │ 홍길동  2025-01-15  활성     ₩99,000      │ │
│  │ 김철수  2025-01-14  활성     ₩99,000      │ │
│  │ 이영희  2025-01-10  해지     ₩99,000      │ │
│  │ ...                                   │ │
│  └──────────────────────────────────────────┘ │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### 데이터 조회

```typescript
// Server Component
async function SubscribersTab({ programId }: Props) {
  const user = await getCurrentUser();
  const program = await getProgramWithCoach(programId);

  // 코치 권한 체크
  if (program.coachId !== user.id) {
    redirect("/dashboard");
  }

  const subscribers = await getProgramSubscribers(programId);

  return (
    <div>
      <SubscribersList subscribers={subscribers} />
    </div>
  );
}
```

---

## 🗄️ 데이터베이스 스키마 업데이트

### 1. payment_orders 테이블 (결제 주문 관리)

```sql
-- 결제 주문 정보 (임시 저장)
CREATE TABLE payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL, -- 토스 페이먼트 주문 ID
  program_id UUID REFERENCES programs(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  payment_key TEXT NOT NULL, -- 토스 페이먼트 payment key
  amount INTEGER NOT NULL, -- 결제 금액 (원 단위)
  status TEXT NOT NULL, -- ready/completed/failed/canceled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. subscriptions 테이블 업데이트

```sql
-- 구독 정보 (기존 테이블에 추가)
ALTER TABLE subscriptions
ADD COLUMN payment_order_id UUID REFERENCES payment_orders(id),
ADD COLUMN payment_method TEXT, -- 카드/계좌 등
ADD COLUMN payment_amount INTEGER NOT NULL, -- 실제 결제 금액
ADD COLUMN canceled_at TIMESTAMP, -- 해지일
ADD COLUMN cancel_reason TEXT; -- 해지 사유
```

### 3. Drizzle ORM 스키마

```typescript
// lib/db/schema.ts

export const paymentOrders = pgTable("payment_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: text("order_id").unique().notNull(),
  programId: uuid("program_id")
    .references(() => programs.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => profiles.id)
    .notNull(),
  paymentKey: text("payment_key").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull(), // ready/completed/failed/canceled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => profiles.id)
    .notNull(),
  programId: uuid("program_id")
    .references(() => programs.id)
    .notNull(),
  status: subscriptionStatusEnum("status").default("inactive").notNull(),
  billingKey: text("billing_key"),
  customerUid: text("customer_uid"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // 추가 필드
  paymentOrderId: uuid("payment_order_id").references(paymentOrders.id),
  paymentMethod: text("payment_method"),
  paymentAmount: integer("payment_amount").notNull(),
  canceledAt: timestamp("canceled_at"),
  cancelReason: text("cancel_reason"),
});
```

---

## 🔐 환경 변수 설정

### `.env.local`

```env
# 토스 페이먼트
TOSS_PAYMENTS_SECRET_KEY=your_secret_key
TOSS_PAYMENTS_CLIENT_KEY=your_client_key

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎨 UI/UX 가이드

### 디자인 원칙

1. **명확성**: 결제 정보를 명확하게 표시
2. **신뢰성**: 결제 수단 보안 강조
3. **간단함**: 최소한의 단계로 구매 완료
4. **피드백**: 결제 상태 명확한 안내

### 반응형 디자인

- **Mobile**: 세로 스크롤, 큰 버튼
- **Tablet/Desktop**: 카드 형태 레이아웃

### 컬러

- **Primary CTA**: 결제 버튼 (파랑 또는 초록)
- **Success**: 성공 메시지 (초록)
- **Error**: 실패 메시지 (빨강)

---

## 🚀 구현 우선순위

### Phase 1: MVP (필수)

1. ✅ 구매 버튼 → 토스 결제창 바로 실행
2. ✅ 로그인 체크 및 리다이렉트
3. ✅ 결제 준비 Server Action 구현
4. ✅ 토스 페이먼트 SDK 연동
5. ✅ 결제 완료 페이지
6. ✅ 구독 레코드 생성
7. ✅ 코치 대시보드 구매 내역

### Phase 2: 개선

1. ⬜ 결제 실패 처리 개선
2. ⬜ 중복 결제 방지
3. ⬜ 결제 히스토리 페이지
4. ⬜ 구매자 리스트 필터링/검색

### Phase 3: 고도화

1. ⬜ 다양한 결제 수단 (가상계좌, 카카오페이)
2. ⬜ 정기 결제 자동 갱신
3. ⬜ 환불 기능
4. ⬜ 영수증 발급

---

## 📊 성공 지표

### 핵심 KPI

1. **구매 전환율**: 판매 페이지 방문 → 구매 완료
2. **결제 성공률**: 결제 시도 → 결제 성공
3. **이탈률**: 각 단계별 이탈률 (로그인, 결제)
4. **평균 구매 시간**: 프로그램 상세 → 구매 완료

### 추적 이벤트

```typescript
// 이벤트 추적
analytics.track("click_purchase_button", {
  programId,
  programTitle,
});

analytics.track("start_checkout", {
  orderId,
  programId,
  amount,
});

analytics.track("complete_payment", {
  orderId,
  programId,
  amount,
  paymentMethod,
});

analytics.track("view_purchase_success", {
  orderId,
  programId,
});
```

---

## 🔧 기술 스택

### Frontend

- Next.js 14 (App Router)
- Shadcn/ui 컴포넌트
- React Hook Form
- Zod (검증)

### Backend

- Server Actions (결제 처리)
- Drizzle ORM (데이터베이스)
- Supabase (인증)

### Payment

- 토스 페이먼트 (결제 PG사)

---

## 🎯 개발 가이드

### 1. 파일 구조

```bash
# 페이지
app/checkout/success/page.tsx    # 결제 성공 페이지
app/checkout/fail/page.tsx       # 결제 실패 페이지

# Server Actions
app/actions/payment.ts            # 결제 준비, 승인 로직

# 유틸리티
lib/toss-payments.ts             # 토스 페이먼트 SDK 래퍼
lib/db/schema.ts                # payment_orders 테이블
```

### 2. 결제 플로우 테스트

1. 프로그램 판매 페이지에서 "구매하기" 클릭
2. 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
3. 로그인 후 다시 프로그램 페이지로 이동
4. "구매하기" 클릭 시 토스 결제창 바로 실행
5. 결제 완료 후 success 페이지로 자동 리다이렉트
6. 결제 실패 시 fail 페이지로 이동
7. 대시보드에서 구매한 프로그램 확인
8. 코치 대시보드에서 구매 내역 확인

---

## 📝 주의사항

### 보안

- 결제 금액 검증 필수 (클라이언트 → 서버)
- 토스 페이먼트 Secret Key 서버 사이드에서만 관리
- 결제 정보 암호화 전송

### 에러 처리

- 결제 실패 시 명확한 에러 메시지
- 네트워크 오류 처리
- 중복 결제 방지

### UX

- 결제 진행 중 로딩 표시
- 결제 시간 초과 처리
- 결제 완료 후 명확한 안내

---

## 🎬 다음 단계

1. **데이터베이스 마이그레이션**: `payment_orders` 테이블 생성
2. **토스 페이먼트 계정**: API 키 발급 및 환경 변수 설정
3. **결제 페이지 UI**: 기본 레이아웃 구현
4. **Server Actions**: 결제 준비, 승인 로직 구현
5. **테스트**: 실제 결제 테스트 (테스트 모드)

---

## 📚 참고 자료

- [토스 페이먼트 API 문서](https://docs.tosspayments.com/reference)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Drizzle ORM 문서](https://orm.drizzle.team/)
