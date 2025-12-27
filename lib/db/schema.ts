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

// 4. 이미지 타입 (이미지 분류용)
export const imageTypeEnum = pgEnum("image_type", [
  "profile", // 프로필 이미지
  "program", // 프로그램 썸네일
  "editor", // 위지윅 에디터 콘텐츠
  "workout", // 운동 기록 사진 (향후)
  "other", // 기타
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
  type: programTypeEnum("type").default("relative").notNull(),
  price: integer("price").notNull(),
  thumbnailUrl: text("thumbnail_url"),

  // MVP용 메타데이터: 필터링 및 상세 정보 표시용
  difficulty: integer("difficulty").default(3), // 1~5점 척도
  trainingTime: integer("training_time"), // 분 단위 (예: 120)
  daysPerWeek: integer("days_per_week"), // 주당 일수 (예: 6)
  sessionsPerDay: integer("sessions_per_day").default(1), // 하루 세션 수
  cycleInfo: text("cycle_info"), // "8-10주" 등 자유로운 텍스트 정보

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// [Workouts] 날짜별 상세 운동 루틴 (Day 정보만 담당)
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// [WorkoutSessions] Day 안의 개별 세션 (Warm-up, Main, Cool-down 등)
export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutId: uuid("workout_id")
    .references(() => workouts.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(), // 예: "Warm-up", "Strength Training"
  content: text("content"), // 위지윅 에디터 HTML 저장
  orderIndex: integer("order_index").default(0).notNull(), // 정렬 순서
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

// [Images] 이미지 스토리지 메타데이터
export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Storage 정보
  storagePath: text("storage_path").notNull(), // 버킷 내 전체 경로
  bucket: text("bucket").notNull(), // 버킷 이름
  publicUrl: text("public_url").notNull(), // 공개 URL

  // 파일 메타데이터
  originalName: text("original_name").notNull(), // 원본 파일명
  fileName: text("file_name").notNull(), // 저장된 파일명 (UUID)
  mimeType: text("mime_type").notNull(), // MIME type
  size: integer("size").notNull(), // 파일 크기 (bytes)

  // 분류 및 소유권
  type: imageTypeEnum("type").default("other").notNull(),
  uploadedBy: uuid("uploaded_by")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),

  // 사용처 연결 (Polymorphic 대신 선택적 FK)
  profileId: uuid("profile_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  programId: uuid("program_id").references(() => programs.id, {
    onDelete: "set null",
  }),
  workoutSessionId: uuid("workout_session_id").references(
    () => workoutSessions.id,
    { onDelete: "set null" }
  ),

  // 관리 필드
  isUsed: boolean("is_used").default(true).notNull(), // 실제 사용 여부

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- 관계 설정 (Drizzle Relations) ---

export const profilesRelations = relations(profiles, ({ many }) => ({
  programs: many(programs),
  subscriptions: many(subscriptions),
  uploadedImages: many(images),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  coach: one(profiles, {
    fields: [programs.coachId],
    references: [profiles.id],
  }),
  workouts: many(workouts),
  images: many(images),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  program: one(programs, {
    fields: [workouts.programId],
    references: [programs.id],
  }),
  sessions: many(workoutSessions),
}));

export const workoutSessionsRelations = relations(
  workoutSessions,
  ({ one, many }) => ({
    workout: one(workouts, {
      fields: [workoutSessions.workoutId],
      references: [workouts.id],
    }),
    images: many(images),
  })
);

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

export const imagesRelations = relations(images, ({ one }) => ({
  uploader: one(profiles, {
    fields: [images.uploadedBy],
    references: [profiles.id],
  }),
  profile: one(profiles, {
    fields: [images.profileId],
    references: [profiles.id],
  }),
  program: one(programs, {
    fields: [images.programId],
    references: [programs.id],
  }),
  workoutSession: one(workoutSessions, {
    fields: [images.workoutSessionId],
    references: [workoutSessions.id],
  }),
}));
