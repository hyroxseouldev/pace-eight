하이록스(Hyrox) 코칭 서비스처럼 전문가가 개입하는 플랫폼이라면 **단건 판매**와 **구독** 외에도 **'기간제 패키지(Pass)'**와 **'추가 옵션(Add-on)'** 개념이 반드시 필요합니다.

3일 안에 구현해야 하므로, 데이터 확장이 용이하면서도 로직이 꼬이지 않는 **TypeScript 타입 구조**를 제안해 드립니다.

---

### 1. 프로그램 판매 유형 (Sales Type)

프로그램의 성격에 따라 4가지 타입으로 분류하는 것을 추천합니다.

- **`SINGLE` (단건):** 일회성 결제로 평생 소장 (예: 하이록스 기초 가이드 PDF)
- **`SUBSCRIPTION` (구독):** 정기 결제 (예: 매주 업데이트되는 훈련 루틴)
- **`PASS` (기간제):** 정해진 기간 동안만 이용 (예: 하이록스 대회 대비 12주 캠프)
- **`ADDON` (추가 옵션):** 기존 프로그램에 붙이는 유료 서비스 (예: 1:1 자세 교정 피드백 1회권)

---

### 2. 추천 TypeScript 타입 정의

이 구조는 토스 페이먼츠의 `billingKey` 방식과 일반 결제를 모두 수용할 수 있도록 설계되었습니다.

```typescript
// 1. 프로그램의 대분류
type ProgramType = "SINGLE" | "SUBSCRIPTION" | "PASS" | "ADDON";

// 2. 할인 정책 타입 (복잡한 경우의 수를 상쇄)
interface DiscountPolicy {
  type: "PERCENT" | "FIXED"; // 퍼센트 할인 혹은 고정 금액 할인
  value: number; // 20 (%) 또는 5000 (원)
  target: "FIRST_MONTH" | "ALL_TIME" | "ANNUAL"; // 첫 달만, 평생, 연간 결제 시
}

// 3. 프로그램 기본 타입
interface Program {
  id: string;
  coachId: string;
  type: ProgramType;
  title: string;
  description: string;

  // 가격 정보
  basePrice: number; // 원래 가격
  discountPolicy?: DiscountPolicy;

  // 타입별 상세 설정
  durationDays?: number; // PASS 타입일 때 (예: 90일)
  billingCycle?: "MONTHLY" | "YEARLY"; // SUBSCRIPTION 타입일 때

  createdAt: Date;
}

// 4. 결제/구독 상태 관리를 위한 타입
interface UserAccess {
  id: string;
  userId: string;
  programId: string;
  type: ProgramType;

  status: "ACTIVE" | "EXPIRED" | "CANCELED" | "PAST_DUE";

  startDate: Date;
  endDate?: Date; // SINGLE 외에는 모두 종료일이 존재함

  // 구독용 데이터 (토스 빌링 연동 시)
  billingKey?: string;
  nextBillingDate?: Date;
  nextBillingAmount?: number; // 첫 달 할인 후 정상가로 전환될 때 사용
}
```

---

### 3. 왜 'PASS'와 'ADDON'이 필요한가요?

1. **PASS (기간제):** 하이록스는 대회 시즌이 뚜렷합니다. "시즌 대비 3개월 집중반" 같은 상품은 구독보다 **3개월치 금액을 한 번에 받고 접근 권한을 90일간 주는 것**이 벤더(코치) 정산과 운영 면에서 훨씬 깔끔합니다.
2. **ADDON (추가 옵션):** 코치들이 단순히 루틴만 파는 게 아니라 "영상 피드백 1회권" 등을 추가로 팔고 싶어 할 것입니다. 이를 별도 프로그램으로 관리하면 수익 모델이 훨씬 다양해집니다.

---

### 4. 첫 달 할인 데이터 처리 팁 (3일 완성용)

할인 경우의 수가 많을 때 코드로 모든 로직을 짜면 밤을 새워야 합니다. **"최종 결제 금액을 계산하는 유틸 함수"** 하나에 집중하세요.

```typescript
function calculateFinalPrice(program: Program): number {
  const { basePrice, discountPolicy } = program;

  if (!discountPolicy) return basePrice;

  if (discountPolicy.type === "PERCENT") {
    return basePrice * (1 - discountPolicy.value / 100);
  }

  return Math.max(0, basePrice - discountPolicy.value);
}
```

---

### 💡 추가로 고려하면 좋은 것

- **`CoachCommission` (수수료):** 벤더형이므로 코치별로 수수료율이 다를 수 있습니다. `Coach` 테이블에 `commissionRate` 타입을 미리 넣어두세요.
- **`RefundPolicy` (환불 규정):** 구독 상품은 '중도 해지 시 일할 계산'인지, '다음 결제일부터 중단'인지 타입을 명시해두어야 나중에 분쟁이 없습니다. (3일 내라면 '다음 결제일부터 중단'이 구현하기 제일 쉽습니다.)

**이제 이 타입들을 기반으로 DB(Prisma 등) 스키마를 바로 생성하시겠어요? 아니면 토스 결제 요청 시 이 타입들을 어떻게 활용하는지 예시 코드가 필요하신가요?**
