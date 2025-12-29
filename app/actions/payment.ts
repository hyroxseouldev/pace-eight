"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { programs, subscriptions, paymentOrders, profiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// ==================== 결제 준비 ====================

export interface CreatePaymentOrderResult {
  success: boolean;
  orderId?: string;
  paymentKey?: string;
  amount?: number;
  error?: string;
}

/**
 * 결제 주문 생성 (토스 페이먼트 결제 준비)
 */
export async function createPaymentOrder(params: {
  programId: string;
}): Promise<CreatePaymentOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const { programId } = params;

  try {
    // 프로그램 정보 확인
    const program = await db.query.programs.findFirst({
      where: eq(programs.id, programId),
    });

    if (!program) {
      return { success: false, error: "존재하지 않는 프로그램입니다." };
    }

    // 판매 가능 상태 확인
    if (!program.onSale) {
      return {
        success: false,
        error: program.saleStopReason || "현재 판매 중지된 프로그램입니다.",
      };
    }

    // 이미 구독 중인지 확인
    const existingSubscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, user.id),
        eq(subscriptions.programId, programId),
        eq(subscriptions.status, "active")
      ),
    });

    if (existingSubscription) {
      return { success: false, error: "이미 구독 중인 프로그램입니다." };
    }

    // 무료 프로그램인 경우 바로 구독 생성
    if (program.price === 0) {
      await db.insert(subscriptions).values({
        userId: user.id,
        programId: programId,
        status: "active",
        paymentMethod: "free",
        paymentAmount: 0,
      });

      revalidatePath("/dashboard");
      return {
        success: true,
        orderId: "free-" + crypto.randomUUID(),
        amount: 0,
      };
    }

    // 주문 ID 생성
    const orderId = crypto.randomUUID();
    const paymentKey = `payment_${orderId}_${Date.now()}`;

    // 결제 주문 정보 임시 저장
    await db.insert(paymentOrders).values({
      orderId,
      programId,
      userId: user.id,
      paymentKey,
      amount: program.price,
      status: "ready",
    });

    return {
      success: true,
      orderId,
      paymentKey,
      amount: program.price,
    };
  } catch (error) {
    console.error("결제 준비 오류:", error);
    return { success: false, error: "결제 준비에 실패했습니다." };
  }
}

// ==================== 결제 승인 ====================

export interface ApprovePaymentResult {
  success: boolean;
  error?: string;
}

/**
 * 결제 승인 (토스 페이먼트로부터 결제 완료 후 호출)
 */
export async function approvePayment(params: {
  orderId: string;
  paymentKey: string;
  amount: number;
}): Promise<ApprovePaymentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const { orderId, paymentKey, amount } = params;

  try {
    // 결제 주문 정보 조회
    const order = await db.query.paymentOrders.findFirst({
      where: eq(paymentOrders.orderId, orderId),
    });

    if (!order) {
      return { success: false, error: "결제 주문을 찾을 수 없습니다." };
    }

    // 사용자 권한 확인
    if (order.userId !== user.id) {
      return { success: false, error: "접근 권한이 없습니다." };
    }

    // 금액 검증
    if (order.amount !== amount) {
      return { success: false, error: "결제 금액이 일치하지 않습니다." };
    }

    // 이미 완료된 주문인지 확인
    if (order.status === "completed") {
      return { success: false, error: "이미 처리된 결제입니다." };
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
      const errorData = await response.json().catch(() => ({}));
      console.error("토스 페이먼트 승인 실패:", errorData);
      return { success: false, error: "결제 승인에 실패했습니다." };
    }

    const paymentData = await response.json();

    // 결제 성공 처리
    if (paymentData.status === "DONE") {
      // 결제 주문 상태 업데이트
      await db
        .update(paymentOrders)
        .set({
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(paymentOrders.orderId, orderId));

      // 구독 레코드 생성
      const [newSubscription] = await db
        .insert(subscriptions)
        .values({
          userId: user.id,
          programId: order.programId,
          status: "active",
          paymentOrderId: order.id,
          paymentMethod: paymentData.method || "card",
          paymentAmount: amount,
          currentPeriodEnd: calculateNextPeriodEnd(), // 30일 후
        })
        .returning();

      revalidatePath("/dashboard");
      revalidatePath(`/programs/[slug]`);

      return { success: true };
    } else {
      return { success: false, error: "결제가 완료되지 않았습니다." };
    }
  } catch (error) {
    console.error("결제 승인 오류:", error);
    return { success: false, error: "결제 승인에 실패했습니다." };
  }
}

// ==================== 결제 조회 ====================

export interface PaymentOrderInfo {
  id: string;
  orderId: string;
  programId: string;
  amount: number;
  status: string;
  program?: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
  };
}

/**
 * 결제 주문 정보 조회
 */
export async function getPaymentOrder(orderId: string): Promise<PaymentOrderInfo | null> {
  try {
    const order = await db.query.paymentOrders.findFirst({
      where: eq(paymentOrders.orderId, orderId),
      with: {
        program: true,
      },
    });

    if (!order) {
      return null;
    }

    return {
      id: order.id,
      orderId: order.orderId,
      programId: order.programId,
      amount: order.amount,
      status: order.status,
      program: order.program
        ? {
            id: order.program.id,
            title: order.program.title,
            thumbnailUrl: order.program.thumbnailUrl,
          }
        : undefined,
    };
  } catch (error) {
    console.error("결제 주문 조회 오류:", error);
    return null;
  }
}

/**
 * 사용자의 결제 주문 목록 조회
 */
export async function getUserPaymentOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  try {
    const orders = await db.query.paymentOrders.findMany({
      where: eq(paymentOrders.userId, user.id),
      with: {
        program: true,
      },
      orderBy: [paymentOrders.createdAt],
    });

    return orders;
  } catch (error) {
    console.error("결제 주문 목록 조회 오류:", error);
    return [];
  }
}

// ==================== 유틸리티 ====================

/**
 * 다음 결제일 계산 (30일 후)
 */
function calculateNextPeriodEnd(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
}

/**
 * 사용자의 구독 목록 조회
 */
export async function getUserSubscriptions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  try {
    const subs = await db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, user.id),
      with: {
        program: {
          with: {
            coach: true,
          },
        },
        paymentOrder: true,
      },
      orderBy: [subscriptions.createdAt],
    });

    return subs;
  } catch (error) {
    console.error("구독 목록 조회 오류:", error);
    return [];
  }
}

/**
 * 프로그램 구매 가능 여부 확인
 */
export async function canPurchaseProgram(programId: string): Promise<{
  canPurchase: boolean;
  reason?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { canPurchase: false, reason: "로그인이 필요합니다." };
  }

  try {
    // 프로그램 정보 확인
    const program = await db.query.programs.findFirst({
      where: eq(programs.id, programId),
    });

    if (!program) {
      return { canPurchase: false, reason: "존재하지 않는 프로그램입니다." };
    }

    // 판매 가능 상태 확인
    if (!program.onSale) {
      return {
        canPurchase: false,
        reason: program.saleStopReason || "현재 판매 중지된 프로그램입니다.",
      };
    }

    // 이미 구독 중인지 확인
    const existingSubscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, user.id),
        eq(subscriptions.programId, programId),
        eq(subscriptions.status, "active")
      ),
    });

    if (existingSubscription) {
      return { canPurchase: false, reason: "이미 구독 중인 프로그램입니다." };
    }

    return { canPurchase: true };
  } catch (error) {
    console.error("구매 가능 여부 확인 오류:", error);
    return { canPurchase: false, reason: "오류가 발생했습니다." };
  }
}
