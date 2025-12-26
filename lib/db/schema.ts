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

  // 코치 프로필 추가 필드
  displayName: text("display_name"), // 활동명/별명
  coachingExperience: text("coaching_experience"), // 코칭 경력
  certifications: text("certifications"), // 자격증
  bioShort: text("bio_short"), // 한 줄 소개
  bioLong: text("bio_long"), // 상세 소개
  snsUrl: text("sns_url"), // SNS/웹사이트
  contact: text("contact"), // 연락처
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(), // 온보딩 완료 여부
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
