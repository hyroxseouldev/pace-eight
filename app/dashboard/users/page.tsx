import { Users, Mail, Calendar, Package } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllSubscribers } from "../actions";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "구독 중", variant: "default" },
  canceled: { label: "해지됨", variant: "secondary" },
  past_due: { label: "결제 실패", variant: "destructive" },
  inactive: { label: "비활성", variant: "outline" },
};

export default async function UsersPage() {
  const subscribers = await getAllSubscribers();

  return (
    <>
      <DashboardHeader
        breadcrumbs={[{ title: "구독자 관리" }]}
      />
      <div className="flex-1 space-y-6 p-6">
        {/* 페이지 타이틀 */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">구독자 관리</h1>
          <p className="text-muted-foreground">
            모든 프로그램의 구독자를 한눈에 관리하세요
          </p>
        </div>

        {/* 통계 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 구독자</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscribers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 구독자</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscribers.filter((s) => s.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">해지 구독자</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscribers.filter((s) => s.status === "canceled").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 구독자 목록 */}
        {subscribers.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="size-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                아직 구독자가 없습니다
              </h3>
              <p className="text-muted-foreground text-center max-w-sm">
                프로그램을 공개하고 회원들이 구독하면 이곳에서 관리할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>구독자 목록</CardTitle>
              <CardDescription>
                총 {subscribers.length}명의 구독자가 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>회원</TableHead>
                    <TableHead>프로그램</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>구독 시작일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={subscriber.user?.avatarUrl ?? undefined}
                              alt={subscriber.user?.name ?? "User"}
                            />
                            <AvatarFallback className="text-xs">
                              {subscriber.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {subscriber.user?.name || "이름 없음"}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="size-3" />
                              {subscriber.user?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="size-3 text-muted-foreground" />
                          <span className="text-sm">
                            {subscriber.program?.title || "알 수 없음"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[subscriber.status]?.variant ?? "outline"}>
                          {statusLabels[subscriber.status]?.label ?? subscriber.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="size-3" />
                          {new Date(subscriber.createdAt).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

