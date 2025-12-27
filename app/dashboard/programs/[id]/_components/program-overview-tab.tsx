"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateProgram, deleteProgram, toggleProgramActive } from "../../../actions";

interface ProgramOverviewTabProps {
  program: {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    price: number;
    thumbnailUrl: string | null;
    difficulty: number | null;
    trainingTime: number | null;
    daysPerWeek: number | null;
    sessionsPerDay: number | null;
    cycleInfo: string | null;
    isActive: boolean;
    createdAt: Date;
  };
}

export function ProgramOverviewTab({ program }: ProgramOverviewTabProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [description, setDescription] = useState(program.description || "");
  const [content, setContent] = useState(program.content || "");

  async function handleUpdate(formData: FormData) {
    setIsUpdating(true);
    try {
      const result = await updateProgram(program.id, formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("프로그램이 업데이트되었습니다!");
      router.refresh();
    } catch {
      toast.error("업데이트에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteProgram(program.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("프로그램이 삭제되었습니다!");
      router.push("/dashboard/programs");
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleActive(checked: boolean) {
    setIsTogglingActive(true);
    try {
      const result = await toggleProgramActive(program.id, checked);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(checked ? "프로그램이 공개되었습니다!" : "프로그램이 비공개되었습니다.");
      router.refresh();
    } catch {
      toast.error("상태 변경에 실패했습니다.");
    } finally {
      setIsTogglingActive(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 공개 상태 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>공개 상태</CardTitle>
              <CardDescription>
                프로그램을 공개하면 회원들이 구독할 수 있습니다.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={program.isActive ? "default" : "secondary"}>
                {program.isActive ? "공개" : "비공개"}
              </Badge>
              <Switch
                checked={program.isActive}
                onCheckedChange={handleToggleActive}
                disabled={isTogglingActive}
              />
              {isTogglingActive && <Spinner className="size-4" />}
            </div>
          </div>
        </CardHeader>
        {program.isActive && (
          <CardContent className="pt-0">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`/programs/${program.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 size-4" />
                판매 페이지 보기
              </a>
            </Button>
          </CardContent>
        )}
      </Card>

      {/* 기본 정보 수정 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>
            프로그램의 기본 정보를 수정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-6">
            <input type="hidden" name="isActive" value={String(program.isActive)} />
            
            <div className="space-y-2">
              <Label htmlFor="title">프로그램 제목</Label>
              <Input
                id="title"
                name="title"
                defaultValue={program.title}
                required
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">간단 설명</Label>
              <RichTextEditor
                content={description}
                onChange={setDescription}
                placeholder="프로그램의 간단한 소개를 작성해주세요."
                editable={!isUpdating}
              />
              <input type="hidden" name="description" value={description} />
              <p className="text-xs text-muted-foreground">
                프로그램 카드에 표시될 간단한 설명입니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">상세 콘텐츠</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="프로그램의 목표, 대상, 준비물, 운동 방법 등 상세한 내용을 작성해주세요."
                editable={!isUpdating}
              />
              <input type="hidden" name="content" value={content} />
              <p className="text-xs text-muted-foreground">
                💡 YouTube 영상과 이미지를 추가하여 더 풍부한 설명을 제공하세요.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">가격 (원)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1000"
                defaultValue={program.price}
                required
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">썸네일 URL</Label>
              <Input
                id="thumbnailUrl"
                name="thumbnailUrl"
                type="url"
                defaultValue={program.thumbnailUrl ?? ""}
                placeholder="https://example.com/image.jpg"
                disabled={isUpdating}
              />
            </div>

            {/* 메타데이터 섹션 */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <h3 className="text-sm font-medium mb-3">프로그램 상세 정보</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  프로그램의 세부 정보를 입력하세요. 이 정보는 필터링 및 상세 페이지에 표시됩니다.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">난이도 (1-5)</Label>
                  <Input
                    id="difficulty"
                    name="difficulty"
                    type="number"
                    min="1"
                    max="5"
                    defaultValue={program.difficulty ?? 3}
                    disabled={isUpdating}
                  />
                  <p className="text-xs text-muted-foreground">
                    1: 매우 쉬움 ~ 5: 매우 어려움
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainingTime">훈련 시간 (분)</Label>
                  <Input
                    id="trainingTime"
                    name="trainingTime"
                    type="number"
                    min="0"
                    defaultValue={program.trainingTime ?? ""}
                    placeholder="60"
                    disabled={isUpdating}
                  />
                  <p className="text-xs text-muted-foreground">
                    1회 운동 시간 (예: 120분)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daysPerWeek">주당 운동 일수</Label>
                  <Input
                    id="daysPerWeek"
                    name="daysPerWeek"
                    type="number"
                    min="1"
                    max="7"
                    defaultValue={program.daysPerWeek ?? ""}
                    placeholder="6"
                    disabled={isUpdating}
                  />
                  <p className="text-xs text-muted-foreground">
                    일주일 중 운동하는 날 (예: 6일)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionsPerDay">하루 세션 수</Label>
                  <Input
                    id="sessionsPerDay"
                    name="sessionsPerDay"
                    type="number"
                    min="1"
                    defaultValue={program.sessionsPerDay ?? 1}
                    disabled={isUpdating}
                  />
                  <p className="text-xs text-muted-foreground">
                    하루에 몇 번 운동하는지 (기본값: 1)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycleInfo">프로그램 기간</Label>
                <Input
                  id="cycleInfo"
                  name="cycleInfo"
                  defaultValue={program.cycleInfo ?? ""}
                  placeholder="예: 8-10주, 12주 완성, 4주 집중"
                  disabled={isUpdating}
                />
                <p className="text-xs text-muted-foreground">
                  프로그램 진행 기간을 자유롭게 입력하세요
                </p>
              </div>
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Spinner className="mr-2" />
                  저장 중...
                </>
              ) : (
                "변경사항 저장"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 위험 구역 */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">위험 구역</CardTitle>
          <CardDescription>
            아래 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 size-4" />
                프로그램 삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 프로그램과 모든 워크아웃이 영구적으로 삭제됩니다.
                  이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Spinner className="mr-2" />
                      삭제 중...
                    </>
                  ) : (
                    "삭제"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

