import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCoachPrograms } from "../actions";

export default async function ProgramsPage() {
  const programs = await getCoachPrograms();

  return (
    <>
      <DashboardHeader
        breadcrumbs={[{ title: "프로그램" }]}
      />
      <div className="flex-1 space-y-6 p-6">
        {/* 페이지 타이틀 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">프로그램</h1>
            <p className="text-muted-foreground">
              운동 프로그램을 만들고 관리하세요
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/programs/new">
              <Plus className="mr-2 size-4" />
              새 프로그램 만들기
            </Link>
          </Button>
        </div>

        {/* 프로그램 목록 */}
        {programs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="size-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                아직 프로그램이 없습니다
              </h3>
              <p className="text-muted-foreground text-center mb-4 max-w-sm">
                첫 번째 운동 프로그램을 만들어 회원들에게 제공해보세요.
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
            {programs.map((program) => (
              <Link
                key={program.id}
                href={`/dashboard/programs/${program.id}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  {program.thumbnailUrl && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
                      <img
                        src={program.thumbnailUrl}
                        alt={program.title}
                        className="size-full object-cover"
                      />
                    </div>
                  )}
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
    </>
  );
}

