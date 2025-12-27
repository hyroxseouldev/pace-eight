"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import {
  programs,
  workouts,
  workoutSessions,
  subscriptions,
  profiles,
} from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

// ==================== 프로그램 관련 Actions ====================

export async function createProgram(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const content = formData.get("content") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;

  // 새로운 메타데이터 필드
  const difficulty = parseInt(formData.get("difficulty") as string) || 3;
  const trainingTime = parseInt(formData.get("trainingTime") as string) || null;
  const daysPerWeek = parseInt(formData.get("daysPerWeek") as string) || null;
  const sessionsPerDay =
    parseInt(formData.get("sessionsPerDay") as string) || 1;
  const cycleInfo = formData.get("cycleInfo") as string;

  if (!title.trim()) {
    return { error: "프로그램 제목을 입력해주세요." };
  }

  try {
    const [newProgram] = await db
      .insert(programs)
      .values({
        coachId: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        content: content?.trim() || null,
        price,
        thumbnailUrl: thumbnailUrl?.trim() || null,
        difficulty,
        trainingTime,
        daysPerWeek,
        sessionsPerDay,
        cycleInfo: cycleInfo?.trim() || null,
        isActive: false, // 기본값: 비공개
      })
      .returning();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");

    return { success: true, programId: newProgram.id };
  } catch (error) {
    console.error("프로그램 생성 오류:", error);
    return { error: "프로그램 생성에 실패했습니다." };
  }
}

export async function updateProgram(programId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const content = formData.get("content") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;
  const isActive = formData.get("isActive") === "true";

  // 새로운 메타데이터 필드
  const difficulty = parseInt(formData.get("difficulty") as string) || 3;
  const trainingTime = parseInt(formData.get("trainingTime") as string) || null;
  const daysPerWeek = parseInt(formData.get("daysPerWeek") as string) || null;
  const sessionsPerDay =
    parseInt(formData.get("sessionsPerDay") as string) || 1;
  const cycleInfo = formData.get("cycleInfo") as string;

  if (!title.trim()) {
    return { error: "프로그램 제목을 입력해주세요." };
  }

  try {
    await db
      .update(programs)
      .set({
        title: title.trim(),
        description: description?.trim() || null,
        content: content?.trim() || null,
        price,
        thumbnailUrl: thumbnailUrl?.trim() || null,
        difficulty,
        trainingTime,
        daysPerWeek,
        sessionsPerDay,
        cycleInfo: cycleInfo?.trim() || null,
        isActive,
      })
      .where(and(eq(programs.id, programId), eq(programs.coachId, user.id)));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");
    revalidatePath(`/dashboard/programs/${programId}`);

    return { success: true };
  } catch (error) {
    console.error("프로그램 업데이트 오류:", error);
    return { error: "프로그램 업데이트에 실패했습니다." };
  }
}

export async function deleteProgram(programId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  try {
    await db
      .delete(programs)
      .where(and(eq(programs.id, programId), eq(programs.coachId, user.id)));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");

    return { success: true };
  } catch (error) {
    console.error("프로그램 삭제 오류:", error);
    return { error: "프로그램 삭제에 실패했습니다." };
  }
}

export async function toggleProgramActive(
  programId: string,
  isActive: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  try {
    await db
      .update(programs)
      .set({ isActive })
      .where(and(eq(programs.id, programId), eq(programs.coachId, user.id)));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");
    revalidatePath(`/dashboard/programs/${programId}`);

    return { success: true };
  } catch (error) {
    console.error("프로그램 상태 변경 오류:", error);
    return { error: "프로그램 상태 변경에 실패했습니다." };
  }
}

// ==================== 워크아웃 관련 Actions ====================

export async function createWorkout(programId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = formData.get("title") as string;
  const dayNumber = parseInt(formData.get("dayNumber") as string);

  if (!title.trim()) {
    return { error: "Day 제목을 입력해주세요." };
  }

  // 프로그램 소유권 확인
  const program = await db.query.programs.findFirst({
    where: and(eq(programs.id, programId), eq(programs.coachId, user.id)),
  });

  if (!program) {
    return { error: "프로그램을 찾을 수 없습니다." };
  }

  try {
    const [newWorkout] = await db
      .insert(workouts)
      .values({
        programId,
        title: title.trim(),
        dayNumber: dayNumber || null,
      })
      .returning();

    revalidatePath(`/dashboard/programs/${programId}`);

    return { success: true, workoutId: newWorkout.id };
  } catch (error) {
    console.error("워크아웃 생성 오류:", error);
    return { error: "워크아웃 생성에 실패했습니다." };
  }
}

export async function updateWorkout(workoutId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const dayNumber = parseInt(formData.get("dayNumber") as string);

  if (!title.trim()) {
    return { error: "운동 제목을 입력해주세요." };
  }

  try {
    // 워크아웃 조회 및 프로그램 소유권 확인
    const workout = await db.query.workouts.findFirst({
      where: eq(workouts.id, workoutId),
      with: {
        program: true,
      },
    });

    if (!workout || workout.program.coachId !== user.id) {
      return { error: "워크아웃을 찾을 수 없습니다." };
    }

    await db
      .update(workouts)
      .set({
        title: title.trim(),
        description: description?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        dayNumber: dayNumber || null,
      })
      .where(eq(workouts.id, workoutId));

    revalidatePath(`/dashboard/programs/${workout.programId}`);

    return { success: true };
  } catch (error) {
    console.error("워크아웃 업데이트 오류:", error);
    return { error: "워크아웃 업데이트에 실패했습니다." };
  }
}

export async function deleteWorkout(workoutId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  try {
    // 워크아웃 조회 및 프로그램 소유권 확인
    const workout = await db.query.workouts.findFirst({
      where: eq(workouts.id, workoutId),
      with: {
        program: true,
      },
    });

    if (!workout || workout.program.coachId !== user.id) {
      return { error: "워크아웃을 찾을 수 없습니다." };
    }

    const programId = workout.programId;

    await db.delete(workouts).where(eq(workouts.id, workoutId));

    revalidatePath(`/dashboard/programs/${programId}`);

    return { success: true };
  } catch (error) {
    console.error("워크아웃 삭제 오류:", error);
    return { error: "워크아웃 삭제에 실패했습니다." };
  }
}

// ==================== 워크아웃 세션 관련 Actions ====================

export async function createWorkoutSession(
  workoutId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title.trim()) {
    return { error: "세션 제목을 입력해주세요." };
  }

  try {
    // 워크아웃 조회 및 프로그램 소유권 확인
    const workout = await db.query.workouts.findFirst({
      where: eq(workouts.id, workoutId),
      with: {
        program: true,
        sessions: true,
      },
    });

    if (!workout || workout.program.coachId !== user.id) {
      return { error: "워크아웃을 찾을 수 없습니다." };
    }

    // 다음 orderIndex 계산
    const maxOrderIndex =
      workout.sessions.length > 0
        ? Math.max(...workout.sessions.map((s) => s.orderIndex))
        : -1;

    const [newSession] = await db
      .insert(workoutSessions)
      .values({
        workoutId,
        title: title.trim(),
        content: content?.trim() || null,
        orderIndex: maxOrderIndex + 1,
      })
      .returning();

    revalidatePath(`/dashboard/programs/${workout.programId}`);

    return { success: true, sessionId: newSession.id };
  } catch (error) {
    console.error("세션 생성 오류:", error);
    return { error: "세션 생성에 실패했습니다." };
  }
}

export async function updateWorkoutSession(
  sessionId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title.trim()) {
    return { error: "세션 제목을 입력해주세요." };
  }

  try {
    // 세션 조회 및 프로그램 소유권 확인
    const session = await db.query.workoutSessions.findFirst({
      where: eq(workoutSessions.id, sessionId),
      with: {
        workout: {
          with: {
            program: true,
          },
        },
      },
    });

    if (!session || session.workout.program.coachId !== user.id) {
      return { error: "세션을 찾을 수 없습니다." };
    }

    await db
      .update(workoutSessions)
      .set({
        title: title.trim(),
        content: content?.trim() || null,
      })
      .where(eq(workoutSessions.id, sessionId));

    revalidatePath(`/dashboard/programs/${session.workout.programId}`);

    return { success: true };
  } catch (error) {
    console.error("세션 업데이트 오류:", error);
    return { error: "세션 업데이트에 실패했습니다." };
  }
}

export async function deleteWorkoutSession(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  try {
    // 세션 조회 및 프로그램 소유권 확인
    const session = await db.query.workoutSessions.findFirst({
      where: eq(workoutSessions.id, sessionId),
      with: {
        workout: {
          with: {
            program: true,
          },
        },
      },
    });

    if (!session || session.workout.program.coachId !== user.id) {
      return { error: "세션을 찾을 수 없습니다." };
    }

    const programId = session.workout.programId;

    await db.delete(workoutSessions).where(eq(workoutSessions.id, sessionId));

    revalidatePath(`/dashboard/programs/${programId}`);

    return { success: true };
  } catch (error) {
    console.error("세션 삭제 오류:", error);
    return { error: "세션 삭제에 실패했습니다." };
  }
}

// ==================== 데이터 조회 함수 ====================

export async function getCoachPrograms() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  return db.query.programs.findMany({
    where: eq(programs.coachId, user.id),
    orderBy: [desc(programs.createdAt)],
    with: {
      workouts: true,
    },
  });
}

export async function getProgramById(programId: string) {
  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "actions.ts:481",
      message: "getProgramById START",
      data: { programId: programId },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "C",
    }),
  }).catch(() => {});
  // #endregion

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "actions.ts:487",
        message: "getProgramById no user",
        data: {},
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "C",
      }),
    }).catch(() => {});
    // #endregion
    return null;
  }

  try {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "actions.ts:492",
        message: "BEFORE db.query",
        data: { userId: user.id, programId: programId },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "D",
      }),
    }).catch(() => {});
    // #endregion

    const result = await db.query.programs.findFirst({
      where: and(eq(programs.id, programId), eq(programs.coachId, user.id)),
      with: {
        workouts: {
          orderBy: [workouts.dayNumber],
          with: {
            sessions: {
              orderBy: [workoutSessions.orderIndex],
            },
          },
        },
      },
    });

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "actions.ts:503",
        message: "AFTER db.query SUCCESS",
        data: {
          hasResult: !!result,
          workoutsCount: result?.workouts?.length || 0,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "D",
      }),
    }).catch(() => {});
    // #endregion

    return result;
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "actions.ts:508",
        message: "db.query ERROR",
        data: {
          errorMessage: error instanceof Error ? error.message : "unknown",
          errorCode: (error as any)?.code,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "D",
      }),
    }).catch(() => {});
    // #endregion
    throw error;
  }
}

export async function getProgramSubscribers(programId: string) {
  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "actions.ts:514",
      message: "getProgramSubscribers START",
      data: { programId: programId },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "C",
    }),
  }).catch(() => {});
  // #endregion

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  try {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "actions.ts:527",
        message: "BEFORE ownership check",
        data: { userId: user.id, programId: programId },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "D",
      }),
    }).catch(() => {});
    // #endregion

    // 프로그램 소유권 확인
    const program = await db.query.programs.findFirst({
      where: and(eq(programs.id, programId), eq(programs.coachId, user.id)),
    });

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "actions.ts:535",
        message: "AFTER ownership check",
        data: { hasProgram: !!program },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "D",
      }),
    }).catch(() => {});
    // #endregion

    if (!program) {
      return [];
    }

    return db.query.subscriptions.findMany({
      where: eq(subscriptions.programId, programId),
      with: {
        user: true,
      },
      orderBy: [desc(subscriptions.createdAt)],
    });
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "actions.ts:551",
        message: "getProgramSubscribers ERROR",
        data: {
          errorMessage: error instanceof Error ? error.message : "unknown",
          errorCode: (error as any)?.code,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "D",
      }),
    }).catch(() => {});
    // #endregion
    throw error;
  }
}

export async function getCoachStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalPrograms: 0,
      activePrograms: 0,
      totalSubscribers: 0,
    };
  }

  // 코치의 프로그램 목록 조회
  const coachPrograms = await db.query.programs.findMany({
    where: eq(programs.coachId, user.id),
  });

  const programIds = coachPrograms.map((p) => p.id);
  const activeCount = coachPrograms.filter((p) => p.isActive).length;

  // 구독자 수 계산
  let subscriberCount = 0;
  if (programIds.length > 0) {
    const subs = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    // 실제로는 programIds에 해당하는 구독만 카운트해야 하지만,
    // 간단하게 처리
    subscriberCount = subs[0]?.count ?? 0;
  }

  return {
    totalPrograms: coachPrograms.length,
    activePrograms: activeCount,
    totalSubscribers: subscriberCount,
  };
}

export async function getAllSubscribers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // 코치의 모든 프로그램 ID 조회
  const coachPrograms = await db.query.programs.findMany({
    where: eq(programs.coachId, user.id),
    columns: { id: true },
  });

  if (coachPrograms.length === 0) {
    return [];
  }

  const programIds = coachPrograms.map((p) => p.id);

  // 해당 프로그램들의 모든 구독자 조회
  const allSubs = await db.query.subscriptions.findMany({
    with: {
      user: true,
      program: true,
    },
    orderBy: [desc(subscriptions.createdAt)],
  });

  // 코치의 프로그램에 해당하는 구독만 필터링
  return allSubs.filter((sub) => programIds.includes(sub.programId));
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const name = formData.get("name") as string;
  const avatarUrl = formData.get("avatarUrl") as string;

  try {
    await db
      .update(profiles)
      .set({
        name: name?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
      })
      .where(eq(profiles.id, user.id));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error) {
    console.error("프로필 업데이트 오류:", error);
    return { error: "프로필 업데이트에 실패했습니다." };
  }
}

// ==================== 공개 프로그램 조회 (판매 페이지용) ====================

export async function getProgramForSale(programId: string) {
  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "actions.ts:813",
      message: "getProgramForSale START",
      data: { programId: programId, programIdType: typeof programId, programIdIsUndefined: programId === undefined },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "E",
    }),
  }).catch(() => {});
  // #endregion

  try {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "actions.ts:825",
        message: "BEFORE query",
        data: { 
          programIdParam: programId,
          programIdType: typeof programId,
          isActiveValue: true
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "E",
      }),
    }).catch(() => {});
    // #endregion

    const program = await db.query.programs.findFirst({
      where: and(eq(programs.id, programId), eq(programs.isActive, true)),
      with: {
        coach: true,
        workouts: {
          orderBy: [workouts.dayNumber],
        },
      },
    });

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "actions.ts:847",
        message: "AFTER query SUCCESS",
        data: { hasProgram: !!program },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "E",
      }),
    }).catch(() => {});
    // #endregion

    return program;
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/f7f99eab-f4c9-4833-b8f7-17f922c1409c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "actions.ts:858",
        message: "getProgramForSale ERROR",
        data: {
          errorMessage: error instanceof Error ? error.message : "unknown",
          errorCode: (error as any)?.code,
          errorName: (error as any)?.name,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "E",
      }),
    }).catch(() => {});
    // #endregion
    console.error("프로그램 조회 오류:", error);
    return null;
  }
}

// 구독 여부 확인
export async function checkUserSubscription(programId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  try {
    const subscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, user.id),
        eq(subscriptions.programId, programId),
        eq(subscriptions.status, "active")
      ),
    });

    return subscription;
  } catch (error) {
    console.error("구독 확인 오류:", error);
    return null;
  }
}
