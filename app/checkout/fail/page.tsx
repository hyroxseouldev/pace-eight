import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { XCircle, ArrowRight, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CheckoutFailPageProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
    orderId?: string;
  }>;
}

export default async function CheckoutFailPage({
  searchParams,
}: CheckoutFailPageProps) {
  const { code, message, orderId } = await searchParams;

  // 에러 메시지 결정
  const getErrorMessage = () => {
    if (message) {
      return message;
    }
    switch (code) {
      case "USER_CANCEL":
        return "결제가 취소되었습니다.";
      case "PAYMENT_PROCESSING_FAILED":
        return "결제 처리에 실패했습니다.";
      case "INVALID_PAYMENT_AMOUNT":
        return "결제 금액이 유효하지 않습니다.";
      default:
        return "결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.";
    }
  };

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { title: "프로그램", href: "/programs" },
          { title: "결제 실패" },
        ]}
      />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* 실패 메시지 */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                    <XCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">결제에 실패했습니다</h1>
                  <p className="text-muted-foreground">{getErrorMessage()}</p>
                </div>

                {/* 에러 정보 (디버깅용) */}
                {code && (
                  <div className="rounded-lg bg-muted/50 p-3 text-left">
                    <p className="text-xs text-muted-foreground">
                      에러 코드: {code}
                    </p>
                    {orderId && (
                      <p className="text-xs text-muted-foreground">
                        주문 ID: {orderId.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                )}

                {/* 안내 메시지 */}
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 text-left">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                    💡 다시 시도해보세요
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    일시적인 오류일 수 있습니다. 잠시 후 다시 시도하거나,
                    고객센터에 문의해주세요.
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
              onClick={() => window.history.back()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
