"use client";

import { Users, Mail, Calendar, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Subscriber {
  id: string;
  status: "active" | "canceled" | "past_due" | "inactive";
  createdAt: Date;
  paymentAmount: number;
  paymentMethod: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  } | null;
}

interface SubscribersTabProps {
  subscribers: Subscriber[];
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "구독 중", variant: "default" },
  canceled: { label: "해지됨", variant: "secondary" },
  past_due: { label: "결제 실패", variant: "destructive" },
  inactive: { label: "비활성", variant: "outline" },
};

const paymentMethodLabels: Record<string, string> = {
  card: "신용카드",
  transfer: "계좌이체",
  free: "무료",
};

export function SubscribersTab({ subscribers }: SubscribersTabProps) {
  if (subscribers.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            아직 구독자가 없습니다
          </h3>
          <p className="text-muted-foreground text-center max-w-sm">
            프로그램을 공개하고 판매 페이지를 공유하면 회원들이 구독할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>회원</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>결제 금액</TableHead>
            <TableHead>결제 수단</TableHead>
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
                <Badge variant={statusLabels[subscriber.status]?.variant ?? "outline"}>
                  {statusLabels[subscriber.status]?.label ?? subscriber.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {subscriber.paymentAmount === 0
                    ? "무료"
                    : `₩${subscriber.paymentAmount.toLocaleString()}`
                  }
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CreditCard className="size-3" />
                  <span className="text-sm">
                    {paymentMethodLabels[subscriber.paymentMethod || ""] || subscriber.paymentMethod || "-"}
                  </span>
                </div>
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
    </Card>
  );
}

