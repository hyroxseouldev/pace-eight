"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createProgram } from "../../actions";

export default function NewProgramPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await createProgram(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("프로그램이 생성되었습니다!");
      router.push(`/dashboard/programs/${result.programId}`);
    } catch {
      toast.error("프로그램 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { title: "프로그램", href: "/dashboard/programs" },
          { title: "새 프로그램" },
        ]}
      />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* 페이지 타이틀 */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">새 프로그램 만들기</h1>
            <p className="text-muted-foreground">
              프로그램 기본 정보를 입력하고 생성하세요
            </p>
          </div>

          {/* 생성 폼 */}
          <Card>
            <CardHeader>
              <CardTitle>프로그램 정보</CardTitle>
              <CardDescription>
                프로그램 제목과 설명을 입력해주세요. 생성 후 워크아웃을 추가할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    프로그램 제목 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="예: 30일 하이록스 기초 완성"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="프로그램에 대한 소개를 작성해주세요"
                    rows={4}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">
                    가격 (원) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    defaultValue="0"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    0원으로 설정하면 무료 프로그램으로 공개됩니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">썸네일 URL</Label>
                  <Input
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    프로그램 대표 이미지 URL을 입력하세요.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Spinner className="mr-2" />
                        생성 중...
                      </>
                    ) : (
                      "프로그램 생성"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

