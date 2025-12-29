"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { createPaymentOrder } from "@/app/actions/payment";
import { executeTossPayment } from "@/lib/toss-payments";

interface SubscribeButtonProps {
  programId: string;
  programSlug: string;
  programTitle: string;
  programPrice: number;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline";
  className?: string;
}

export function SubscribeButton({
  programId,
  programSlug,
  programTitle,
  programPrice,
  size = "default",
  variant = "default",
  className,
}: SubscribeButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubscribe() {
    setIsLoading(true);
    try {
      // 로그인 상태 확인
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // 미로그인: 로그인 페이지로 리다이렉트
        const returnUrl = `/programs/${programSlug}`;
        router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
        toast.info("로그인 후 구독할 수 있습니다");
        return;
      }

      // 결제 준비 (Server Action)
      const result = await createPaymentOrder({ programId });

      if (!result.success) {
        toast.error(result.error || "결제 준비에 실패했습니다.");
        return;
      }

      // 무료 프로그램인 경우 바로 대시보드로 이동
      if (result.amount === 0) {
        toast.success("구독이 완료되었습니다!");
        router.push("/dashboard");
        return;
      }

      // 토스 페이먼트 결제창 실행
      if (result.orderId && result.paymentKey && result.amount) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

        const paymentResult = await executeTossPayment({
          amount: result.amount,
          orderId: result.orderId,
          orderName: programTitle,
          customerName: user.email || "구매자",
          successUrl: `${appUrl}/checkout/success`,
          failUrl: `${appUrl}/checkout/fail`,
        });

        if (!paymentResult.success && paymentResult.code !== "USER_CANCEL") {
          toast.error(paymentResult.message || "결제 실패");
        }
      }
    } catch (error) {
      console.error("구독 처리 오류:", error);
      toast.error("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={handleSubscribe}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Spinner className="mr-2" />
          처리 중...
        </>
      ) : programPrice === 0 ? (
        "무료로 시작하기"
      ) : (
        "지금 구독하기"
      )}
    </Button>
  );
}

