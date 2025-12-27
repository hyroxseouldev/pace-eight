"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { SubscribeButton } from "./subscribe-button";

interface PricingSectionProps {
  program: {
    id: string;
    title: string;
    price: number;
  };
}

export function PricingSection({ program }: PricingSectionProps) {
  return (
    <div className="sticky top-4">
      <Card>
        <CardHeader>
          <CardTitle>구독 정보</CardTitle>
          <CardDescription>프로그램 구독하고 시작하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 가격 */}
          <div>
            <div className="mb-4 text-center">
              {program.price === 0 ? (
                <div className="text-4xl font-bold text-primary">무료</div>
              ) : (
                <div>
                  <span className="text-4xl font-bold">
                    ₩{program.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground"> / 월</span>
                </div>
              )}
            </div>
          </div>

          {/* 포함 내용 */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>전체 워크아웃 접근</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>운동 기록 관리</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>진행상황 추적</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>언제든지 해지 가능</span>
            </div>
          </div>

          {/* CTA 버튼 */}
          <SubscribeButton programId={program.id} className="w-full" size="lg" />

          {/* 이용 안내 */}
          <div className="space-y-2 border-t pt-4 text-xs text-muted-foreground">
            <p className="font-medium">📝 구독 후 이용 방법</p>
            <ol className="space-y-1 pl-4">
              <li>1. 구독하기 버튼 클릭</li>
              <li>2. 결제 정보 입력</li>
              <li>3. 대시보드에서 운동 시작</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

