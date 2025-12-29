/**
 * 토스 페이먼트 SDK 래퍼
 *
 * 클라이언트 사이드에서 토스 페이먼트 결제창을 실행하는 유틸리티
 */

import {
  loadTossPayments,
  TossPaymentsSDK,
} from "@tosspayments/tosspayments-sdk";

let tossPaymentsInstance: TossPaymentsSDK | null = null;

/**
 * 토스 페이먼트 SDK 인스턴스 가져오기
 */
export async function getTossPayments(): Promise<TossPaymentsSDK> {
  if (!tossPaymentsInstance) {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!clientKey) {
      throw new Error("TOSS_CLIENT_KEY 환경변수가 설정되지 않았습니다.");
    }

    tossPaymentsInstance = await loadTossPayments(clientKey);
  }

  return tossPaymentsInstance;
}

/**
 * 토스 페이먼트 결제 실행
 */
export interface ExecuteTossPaymentParams {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  successUrl: string;
  failUrl: string;
}

export interface ExecuteTossPaymentResult {
  success: boolean;
  paymentKey?: string;
  code?: string;
  message?: string;
}

export async function executeTossPayment(
  params: ExecuteTossPaymentParams
): Promise<ExecuteTossPaymentResult> {
  try {
    const tossPayments: TossPaymentsSDK = await getTossPayments();

    const response = await tossPayments.requestPayment("카드", {
      amount: params.amount,
      orderId: params.orderId,
      orderName: params.orderName,
      customerName: params.customerName,
      successUrl: params.successUrl,
      failUrl: params.failUrl,
    });

    // 결제 성공 시 successUrl로 리다이렉트되므로 여기는 도달하지 않음
    return {
      success: true,
      paymentKey: response.paymentKey,
    };
  } catch (error: any) {
    // 결제 실패 또는 취소
    console.error("토스 페이먼트 에러:", error);

    if (error.code === "USER_CANCEL") {
      return {
        success: false,
        code: "USER_CANCEL",
        message: "결제가 취소되었습니다.",
      };
    }

    return {
      success: false,
      code: error.code || "PAYMENT_ERROR",
      message: error.message || "결제 처리 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 토스 페이먼트 결제 금액 포맷
 */
export function formatTossAmount(amount: number): string {
  return `${amount.toLocaleString()}원`;
}
