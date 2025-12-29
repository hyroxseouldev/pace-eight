import { notFound, redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getPaymentOrder } from "@/app/actions/payment";
import { CheckCircle, ArrowRight, Home, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
    paymentKey?: string;
    amount?: string;
  }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { orderId, paymentKey, amount } = await searchParams;

  if (!orderId) {
    redirect("/programs");
  }

  // 인증 상태 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/checkout/success");
  }

  // 결제 주문 정보 조회
  const order = await getPaymentOrder(orderId);

  if (!order || order.status !== "completed") {
    redirect("/checkout/fail");
  }

  // 권한 확인
  // 프로그램 정보가 있으면 직접 확인, 아니면 userId를 통해 확인
  // 여기서는 간단히 처리

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { title: "프로그램", href: "/programs" },
          { title: "결제 완료" },
        ]}
      />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* 성공 메시지 */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">결제가 완료되었습니다!</h1>
                  <p className="text-muted-foreground">
                    프로그램 구매가 성공적으로 완료되었습니다
                  </p>
                </div>

                {/* 주문 정보 */}
                <div className="rounded-lg bg-muted/50 p-4 text-left space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">주문 번호</span>
                    <span className="font-mono font-medium">{orderId.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">결제 금액</span>
                    <span className="font-semibold">
                      {order.amount.toLocaleString()}원
                    </span>
                  </div>
                  {order.program && (
                    <>
                      <div className="border-t pt-3 mt-3">
                        <p className="text-xs text-muted-foreground mb-1">구매하신 프로그램</p>
                        <p className="font-medium">{order.program.title}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* 안내 메시지 */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-left">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    🎉 이제 서비스를 이용할 수 있습니다!
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    대시보드에서 구매한 프로그램을 확인하고 시작하세요
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = "/programs")}
            >
              <Home className="mr-2 h-4 w-4" />
              프로그램 둘러보기
            </Button>
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/dashboard")}
            >
              대시보드로 이동
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
