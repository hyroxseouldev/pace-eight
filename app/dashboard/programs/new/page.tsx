"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
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
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createProgram } from "../../actions";

type WeeklyCurriculumItem = {
  week: number;
  title: string;
  description: string;
};

export default function NewProgramPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState(0);
  const [curriculum, setCurriculum] = useState<WeeklyCurriculumItem[]>([]);

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
            <h1 className="text-2xl font-bold tracking-tight">
              새 프로그램 만들기
            </h1>
            <p className="text-muted-foreground">
              프로그램 기본 정보를 입력하고 생성하세요
            </p>
          </div>

          {/* 생성 폼 */}
          <Card>
            <CardHeader>
              <CardTitle>프로그램 정보</CardTitle>
              <CardDescription>
                프로그램 제목과 설명을 입력해주세요. 생성 후 워크아웃을 추가할
                수 있습니다.
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
                  <Label htmlFor="slug">URL 슬러그 (선택사항)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    placeholder="예: 30-day-hyrox-basic (영어, 숫자, 하이픈만 가능)"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    비워두면 제목에서 자동으로 생성됩니다. 영어와 숫자만 사용
                    가능합니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">프로그램 간단 설명</Label>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="프로그램의 간단한 소개를 작성해주세요."
                    editable={!isLoading}
                  />
                  <input type="hidden" name="description" value={description} />
                  <p className="text-xs text-muted-foreground">
                    프로그램 카드에 표시될 간단한 설명입니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">프로그램 상세 콘텐츠</Label>
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="프로그램의 목표, 대상, 준비물, 운동 방법 등 상세한 내용을 작성해주세요. 이미지와 영상도 추가할 수 있습니다."
                    editable={!isLoading}
                  />
                  <input type="hidden" name="content" value={content} />
                  <p className="text-xs text-muted-foreground">
                    💡 YouTube 영상과 이미지를 추가하여 더 풍부한 설명을
                    제공하세요.
                  </p>
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
                    max="10000000"
                    placeholder="예: 29900"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    disabled={isLoading}
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
                            disabled={isLoading}
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
                    placeholder="https://example.com/image.jpg"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    프로그램 대표 이미지 URL을 입력하세요.
                  </p>
                </div>

                {/* 메타데이터 섹션 */}
                <div className="space-y-4 border-t pt-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">
                      프로그램 상세 정보
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      프로그램의 세부 정보를 입력하세요. 이 정보는 필터링 및
                      상세 페이지에 표시됩니다.
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
                        placeholder="3"
                        defaultValue="3"
                        disabled={isLoading}
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
                        placeholder="60"
                        disabled={isLoading}
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
                        placeholder="6"
                        disabled={isLoading}
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
                        placeholder="1"
                        defaultValue="1"
                        disabled={isLoading}
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
                      placeholder="예: 8-10주, 12주 완성, 4주 집중"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      프로그램 진행 기간을 자유롭게 입력하세요
                    </p>
                  </div>
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

          {/* 주차별 커리큘럼 (선택사항) */}
          <Card>
            <CardHeader>
              <CardTitle>주차별 커리큘럼 (선택사항)</CardTitle>
              <CardDescription>
                프로그램의 주차별 구성과 목표를 설명하세요. 구독자가 프로그램
                흐름을 이해하는데 도움이 됩니다.
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
                    disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

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
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    주차 추가
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
