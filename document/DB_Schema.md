3일 안에 개발을 완료하기 위해 가장 효율적이고 확장성 있는 **Drizzle ORM 스키마**를 설계했습니다. Supabase Auth와 연동을 고려하여 `profiles` 테이블을 구성하고, 하이록스 프로그램의 핵심인 '날짜별 운동'과 '구독 상태'를 관리하는 구조입니다.

```jsx
import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. 유저 역할 (코치 vs 구독자)
export const userRoleEnum = pgEnum("user_role", ["coach", "subscriber"]);

// 2. 프로그램 운영 방식 (미래 확장성 대비)
export const programTypeEnum = pgEnum("program_type", [
  "relative", // Day 1, Day 2... (현재 주력)
  "calendar", // 2025-01-01 고정 날짜
  "weekly", // 매주 월요일 반복
]);

// 3. 구독 상태 (한국형 정기결제 상태 관리)
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active", // 구독 중
  "canceled", // 해지됨
  "past_due", // 결제 실패
  "inactive", // 비활성
]);

// --- 테이블 설계 ---

// [Profiles] Supabase Auth 유저와 연동되는 기본 정보
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(), // Supabase Auth의 UUID 사용
  email: text("email").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").default("subscriber").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// [Programs] 코치가 만든 프로그램 (판매 단위)
export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  coachId: uuid("coach_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: programTypeEnum("type").default("relative").notNull(), // 운영 방식
  price: integer("price").notNull(), // 원 단위 가격
  thumbnailUrl: text("thumbnail_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// [Workouts] 날짜별 상세 운동 루틴 (유연한 구조)
export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  programId: uuid("program_id")
    .references(() => programs.id, { onDelete: "cascade" })
    .notNull(),

  // 운영 방식에 따라 선택적으로 채워지는 필드들
  dayNumber: integer("day_number"), // Relative용: 1, 2, 3...
  scheduledDate: timestamp("scheduled_date"), // Calendar용: 2025-12-25
  dayOfWeek: integer("day_of_week"), // Weekly용: 0(일) ~ 6(토)

  title: text("title").notNull(),
  description: text("description"), // 마크다운 형식 권장
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// [Subscriptions] 구독 및 결제 관리 (포트원 등 연동 시 핵심)
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => profiles.id)
    .notNull(),
  programId: uuid("program_id")
    .references(() => programs.id)
    .notNull(),
  status: subscriptionStatusEnum("status").default("inactive").notNull(),

  // 결제 관련 필수 정보
  billingKey: text("billing_key"), // 정기 결제를 위한 빌링키
  customerUid: text("customer_uid"), // 상점 내 유저 고유 ID
  currentPeriodEnd: timestamp("current_period_end"), // 다음 결제일

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// [WorkoutLogs] 유저의 운동 완료 체크 및 기록
export const workoutLogs = pgTable("workout_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id),
  workoutId: uuid("workout_id").references(() => workouts.id),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  record: text("record"), // 예: "12:30", "100kg" 등 유저가 남긴 기록
});

// --- 관계 설정 (Drizzle Relations) ---

export const profilesRelations = relations(profiles, ({ many }) => ({
  programs: many(programs),
  subscriptions: many(subscriptions),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  coach: one(profiles, {
    fields: [programs.coachId],
    references: [profiles.id],
  }),
  workouts: many(workouts),
}));

export const workoutsRelations = relations(workouts, ({ one }) => ({
  program: one(programs, {
    fields: [workouts.programId],
    references: [programs.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(profiles, {
    fields: [subscriptions.userId],
    references: [profiles.id],
  }),
  program: one(programs, {
    fields: [subscriptions.programId],
    references: [programs.id],
  }),
}));
```

---

### 💡 스키마 설계 포인트 (3일 완성 전략)

1. **Supabase Auth 통합**: `profiles.id`를 `uuid`로 설정하여 Supabase의 `auth.users` 테이블과 연동하기 쉽게 만들었습니다. 사용자가 가입하면 DB 트리거 등을 통해 `profiles`에 바로 데이터를 넣어주면 됩니다.
2. **`dayNumber` 중심 스케줄링**: 날짜(Date)를 고정하지 않고 **Day 1, Day 2...** 형식을 사용했습니다. 그래야 유저가 구독을 시작한 시점부터 1일 차 운동을 순차적으로 보여주기 쉽습니다.
3. **한국형 결제(정기 결제) 대비**: `subscriptions` 테이블에 `billing_key` 필드를 두어 포트원에서 발급받은 정기 결제 키를 저장할 수 있게 했습니다. `current_period_end`를 통해 구독 만료일만 체크하면 서비스 접근 권한 제어가 가능합니다.
4. **확장성**: `workout_logs`를 통해 유저가 자신의 기록(무게, 시간 등)을 남길 수 있게 하여, 추후에 코치가 피드백을 주는 기능을 추가하기 용이합니다.

### 🚀 다음 추천 단계

이제 이 스키마를 기반으로 **Supabase 프로젝트에 테이블을 생성**하고, `npx drizzle-kit push`를 실행하여 DB를 동기화하세요.

혹시 코치가 운동 정보를 입력할 때 사용할 **"Day별 운동 입력 UI" (Shadcn UI 기반)** 구성 코드가 필요하신가요?

### 📋 스키마 핵심 요약

1. **유연한 워크아웃 설계**: `workouts` 테이블 하나에서 `dayNumber`, `scheduledDate`, `dayOfWeek`를 모두 가지고 있습니다. **지금은 `dayNumber`만 사용**해서 코딩하고, 나중에 `type`에 따라 로직만 추가하면 됩니다.
2. **포트원(Portone) 최적화**: `subscriptions` 테이블에 `billingKey`와 `currentPeriodEnd`를 미리 넣어두었습니다. 한국형 구독 SaaS 연동 시 빌링키 저장 공간이 반드시 필요합니다.
3. **Supabase Auth 연동**: `profiles` 테이블의 `id`를 `uuid`로 설정하여, Supabase Auth 가입 시 생성되는 `user_id`를 그대로 외래키로 사용할 수 있게 했습니다.
4. **기록(Logging) 기능**: `workoutLogs`를 통해 하이록스 선수들이 자신의 기록을 아카이브할 수 있는 기반을 마련했습니다.

### 🛠 다음 단계 (Day 1 작업 추천)

1. 이 코드를 프로젝트에 넣고 `npx drizzle-kit generate:pg` 및 `npx drizzle-kit push:pg`로 DB에 적용하세요.
2. Supabase 대시보드에서 `auth.users`에 유저가 생성될 때 `public.profiles` 테이블에도 행이 자동으로 추가되도록 **Database Trigger**를 설정하면 매우 편해집니다. (필요하시면 이 SQL 쿼리도 짜드릴 수 있습니다.)
