"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscribeButton } from "./subscribe-button";

interface MobileCTABarProps {
  program: {
    id: string;
    price: number;
    onSale: boolean;
  };
}

export function MobileCTABar({ program }: MobileCTABarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hero 섹션을 벗어나면 표시
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <Card className="rounded-none border-x-0 border-b-0 p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">
              {program.onSale ? "가격" : "판매 중지"}
            </div>
            <div className="text-xl font-bold">
              {program.onSale ? (
                program.price === 0
                ? "무료"
                  : `₩${program.price.toLocaleString()}/월`
              ) : (
                "구매 불가"
              )}
            </div>
          </div>
          {program.onSale ? (
          <SubscribeButton programId={program.id} className="flex-1" />
          ) : (
            <Button disabled className="flex-1">
              구독 불가
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

