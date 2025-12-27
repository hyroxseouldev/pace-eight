import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <FileQuestion className="mx-auto mb-4 size-16 text-muted-foreground" />
        <h1 className="mb-2 text-3xl font-bold">프로그램을 찾을 수 없습니다</h1>
        <p className="mb-8 text-muted-foreground">
          존재하지 않거나 비공개 상태인 프로그램입니다.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">홈으로</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/programs">프로그램 목록</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

