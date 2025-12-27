"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { checkUserSubscription } from "@/app/dashboard/actions";

interface SubscribeButtonProps {
  programId: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline";
  className?: string;
}

export function SubscribeButton({
  programId,
  size = "default",
  variant = "default",
  className,
}: SubscribeButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubscribe() {
    setIsLoading(true);
    try {
      // 구독 여부 확인
      const subscription = await checkUserSubscription(programId);

      if (subscription) {
        toast.info("이미 구독 중인 프로그램입니다");
        router.push("/dashboard");
        return;
      }

      // TODO: 결제 페이지로 이동 (향후 구현)
      // router.push(`/checkout?programId=${programId}`);
      
      // 임시: 로그인 페이지로 이동
      router.push(`/login?redirect=/programs/${programId}`);
      toast.info("로그인 후 구독할 수 있습니다");
    } catch (error) {
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
      ) : (
        "지금 구독하기"
      )}
    </Button>
  );
}

