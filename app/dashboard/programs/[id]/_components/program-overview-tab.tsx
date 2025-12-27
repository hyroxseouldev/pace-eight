"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import {
  updateProgram,
  deleteProgram,
  toggleProgramActive,
  updateProgramSaleStatus,
  updateWeeklyCurriculum,
} from "../../../actions";

type WeeklyCurriculumItem = {
  week: number;
  title: string;
  description: string;
};

interface ProgramOverviewTabProps {
  program: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    content: string | null;
    price: number;
    thumbnailUrl: string | null;
    thumbnailImageId: string | null;
    weeklyCurriculum: any[] | null;
    onSale: boolean;
    saleStopReason: string | null;
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
  const [isTogglingSale, setIsTogglingSale] = useState(false);
  const [isUpdatingCurriculum, setIsUpdatingCurriculum] = useState(false);
  const [description, setDescription] = useState(program.description || "");
  const [content, setContent] = useState(program.content || "");
  const [price, setPrice] = useState(program.price);
  const [onSale, setOnSale] = useState(program.onSale);
  const [saleStopReason, setSaleStopReason] = useState(
    program.saleStopReason || ""
  );
  const [curriculum, setCurriculum] = useState<WeeklyCurriculumItem[]>(
    (program.weeklyCurriculum as WeeklyCurriculumItem[]) || []
  );

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

      toast.success(
        checked ? "프로그램이 공개되었습니다!" : "프로그램이 비공개되었습니다."
      );
      router.refresh();
    } catch {
      toast.error("상태 변경에 실패했습니다.");
    } finally {
      setIsTogglingActive(false);
    }
  }

  async function handleToggleSale(checked: boolean) {
    setIsTogglingSale(true);
    try {
      const result = await updateProgramSaleStatus(
        program.id,
        checked,
        saleStopReason
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setOnSale(checked);
      toast.success(
        checked ? "판매가 재개되었습니다!" : "판매가 중지되었습니다."
      );
      router.refresh();
    } catch {
      toast.error("판매 상태 변경에 실패했습니다.");
    } finally {
      setIsTogglingSale(false);
    }
  }

  async function handleUpdateCurriculum() {
    setIsUpdatingCurriculum(true);
    try {
      const result = await updateWeeklyCurriculum(program.id, curriculum);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("커리큘럼이 업데이트되었습니다!");
      router.refresh();
    } catch {
      toast.error("커리큘럼 업데이트에 실패했습니다.");
    } finally {
      setIsUpdatingCurriculum(false);
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
          <>
            <Separator />
            <CardContent className="space-y-6">
              {/* 판매 상태 */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">판매 상태</Label>
                  <p className="text-sm text-muted-foreground">
                    구독 버튼 활성화 여부
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={onSale ? "default" : "outline"}>
                    {onSale ? "판매중" : "판매중지"}
                  </Badge>
                  <Switch
                    checked={onSale}
                    onCheckedChange={handleToggleSale}
                    disabled={isTogglingSale}
                  />
                  {isTogglingSale && <Spinner className="size-4" />}
                </div>
              </div>

              {/* 판매 중지 사유 */}
              {!onSale && (
                <div className="space-y-2">
                  <Label htmlFor="saleStopReason">판매 중지 안내 메시지</Label>
                  <Textarea
                    id="saleStopReason"
                    placeholder="예: 프로그램 업데이트 중입니다. 12월 31일에 재개됩니다."
                    value={saleStopReason}
                    onChange={(e) => setSaleStopReason(e.target.value)}
                    onBlur={() => handleToggleSale(false)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    판매 페이지에 표시될 메시지입니다. 비워두면 기본 메시지가
                    표시됩니다.
                  </p>
                </div>
              )}

              <Separator />

              {/* 판매 페이지 미리보기 */}
              <Button variant="outline" size="sm" asChild className="w-full">
                <a
                  href={`/programs/${program.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 size-4" />
                  판매 페이지 미리보기
                </a>
              </Button>
            </CardContent>
          </>
        )}
      </Card>

      {/* 기본 정보 수정 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>프로그램의 기본 정보를 수정합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-6">
            <input
              type="hidden"
              name="isActive"
              value={String(program.isActive)}
            />

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
              <Label htmlFor="slug">URL 슬러그</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={program.slug}
                placeholder="예: 30-day-hyrox-basic"
                disabled={isUpdating}
              />
              <p className="text-xs text-muted-foreground">
                영어, 숫자, 하이픈만 사용 가능합니다. 판매 페이지 URL에
                사용됩니다.
              </p>
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
                max="10000000"
                placeholder="예: 29900"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                disabled={isUpdating}
              />
              {price > 0 && (
                <p className="text-sm font-medium">
                  표시 가격:{" "}
                  <span className="text-primary">
                    ₩{price.toLocaleString()}
                  </span>
                </p>
              )}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  권장 가격 (클릭하여 선택)
                </p>
                <div className="flex flex-wrap gap-2">
                  {[0, 9900, 19900, 29900, 39900, 49900, 99900].map(
                    (suggested) => (
                      <Button
                        key={suggested}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPrice(suggested)}
                        className="h-8 text-xs"
                        disabled={isUpdating}
                      >
                        {suggested === 0
                          ? "무료"
                          : `${suggested.toLocaleString()}원`}
                      </Button>
                    )
                  )}
                </div>
              </div>
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
                  프로그램의 세부 정보를 입력하세요. 이 정보는 필터링 및 상세
                  페이지에 표시됩니다.
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

      {/* 주차별 커리큘럼 */}
      <Card>
        <CardHeader>
          <CardTitle>주차별 커리큘럼</CardTitle>
          <CardDescription>
            프로그램의 주차별 구성과 목표를 설명하세요. 구독자가 프로그램 흐름을
            이해하는데 도움이 됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {curriculum.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                아직 추가된 주차 정보가 없습니다.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setCurriculum([{ week: 1, title: "", description: "" }])
                }
                disabled={isUpdatingCurriculum}
              >
                <Plus className="mr-2 h-4 w-4" />첫 주차 추가
              </Button>
            </div>
          ) : (
            <>
              {curriculum.map((week, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{week.week}주차</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newCurriculum = curriculum.filter(
                            (_, i) => i !== index
                          );
                          // 주차 번호 재정렬
                          setCurriculum(
                            newCurriculum.map((item, i) => ({
                              ...item,
                              week: i + 1,
                            }))
                          );
                        }}
                        disabled={isUpdatingCurriculum}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>주차 이름</Label>
                      <Input
                        placeholder="예: 기초 체력 다지기"
                        value={week.title}
                        onChange={(e) => {
                          const newCurriculum = [...curriculum];
                          newCurriculum[index].title = e.target.value;
                          setCurriculum(newCurriculum);
                        }}
                        disabled={isUpdatingCurriculum}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>주차 설명</Label>
                      <Textarea
                        placeholder="이 주차의 목표와 특징을 설명하세요"
                        value={week.description}
                        onChange={(e) => {
                          const newCurriculum = [...curriculum];
                          newCurriculum[index].description = e.target.value;
                          setCurriculum(newCurriculum);
                        }}
                        rows={3}
                        disabled={isUpdatingCurriculum}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurriculum([
                      ...curriculum,
                      {
                        week: curriculum.length + 1,
                        title: "",
                        description: "",
                      },
                    ]);
                  }}
                  disabled={isUpdatingCurriculum}
                  className="flex-1"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  주차 추가
                </Button>
                <Button
                  onClick={handleUpdateCurriculum}
                  disabled={isUpdatingCurriculum}
                  className="flex-1"
                >
                  {isUpdatingCurriculum ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      저장 중...
                    </>
                  ) : (
                    "커리큘럼 저장"
                  )}
                </Button>
              </div>
            </>
          )}
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
                  이 프로그램과 모든 워크아웃이 영구적으로 삭제됩니다. 이 작업은
                  되돌릴 수 없습니다.
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
