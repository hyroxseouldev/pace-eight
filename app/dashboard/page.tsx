import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Users, TrendingUp, Plus, ChevronRight } from "lucide-react";
import {
  getUserSession,
  checkOnboardingCompleted,
} from "@/lib/supabase/auth-helpers";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCoachPrograms, getCoachStats } from "./actions";

export default async function DashboardPage() {
  // Proxy에서 이미 검증된 유저 세션 가져오기
  const { user } = await getUserSession();

  if (!user) {
    redirect("/login");
  }

  // 온보딩 완료 여부 확인 (auth-helpers 사용)
  const isCompleted = await checkOnboardingCompleted(user.id);

  if (!isCompleted) {
    redirect("/onboarding");
  }

  const [programs, stats] = await Promise.all([
    getCoachPrograms(),
    getCoachStats(),
  ]);

  return (
    <>
      <DashboardHeader />
      <div className="flex-1 space-y-6 p-6">
        {/* 페이지 타이틀 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
            <p className="text-muted-foreground">
              프로그램과 구독자를 한눈에 관리하세요
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/programs/new">
              <Plus className="mr-2 size-4" />새 프로그램 만들기
            </Link>
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                전체 프로그램
              </CardTitle>
              <Package className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPrograms}</div>
              <p className="text-xs text-muted-foreground">
                공개 중: {stats.activePrograms}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 구독자</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
              <p className="text-xs text-muted-foreground">활성 구독자 수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                이번 달 예상 수익
              </CardTitle>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                결제 연동 후 확인 가능
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 프로그램 목록 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">내 프로그램</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/programs">
                전체 보기
                <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          {programs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="size-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  아직 프로그램이 없습니다
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  첫 번째 운동 프로그램을 만들어보세요!
                </p>
                <Button asChild>
                  <Link href="/dashboard/programs/new">
                    <Plus className="mr-2 size-4" />
                    프로그램 만들기
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {programs.slice(0, 6).map((program) => (
                <Link
                  key={program.id}
                  href={`/dashboard/programs/${program.id}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-1">
                          {program.title}
                        </CardTitle>
                        <Badge
                          variant={program.isActive ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {program.isActive ? "공개" : "비공개"}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {program.description || "설명 없음"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>워크아웃 {program.workouts?.length || 0}개</span>
                        <span>
                          {program.price === 0
                            ? "무료"
                            : `₩${program.price.toLocaleString()}/월`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
