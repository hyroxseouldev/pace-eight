"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, List, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProgramContentProps {
  program: {
    id: string;
    content: string | null;
    workouts: Array<{
      id: string;
      dayNumber: number | null;
      title: string;
    }>;
  };
  coach: {
    id: string;
    name: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bioShort: string | null;
    bioLong: string | null;
    coachingExperience: string | null;
    certifications: string | null;
    snsUrl: string | null;
  };
}

export function ProgramContent({ program, coach }: ProgramContentProps) {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <TabsList className="h-auto w-full justify-start rounded-none border-b-0 bg-transparent p-0">
            <TabsTrigger
              value="about"
              className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <FileText className="size-4" />
              프로그램 소개
            </TabsTrigger>
            <TabsTrigger
              value="curriculum"
              className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <List className="size-4" />
              커리큘럼
            </TabsTrigger>
            <TabsTrigger
              value="coach"
              className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <User className="size-4" />
              코치 소개
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-6">
          {/* Tab 1: 프로그램 소개 */}
          <TabsContent value="about" className="mt-0">
            {program.content ? (
              <div
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: program.content }}
              />
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                프로그램 상세 정보가 준비 중입니다.
              </div>
            )}
          </TabsContent>

          {/* Tab 2: 커리큘럼 */}
          <TabsContent value="curriculum" className="mt-0">
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold">
                  전체 {program.workouts.length}일 프로그램
                </h3>
                <p className="text-sm text-muted-foreground">
                  구독하시면 모든 워크아웃의 상세 내용을 확인할 수 있습니다.
                </p>
              </div>

              <div className="space-y-2">
                {program.workouts.slice(0, 10).map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="shrink-0">
                        Day {workout.dayNumber || "?"}
                      </Badge>
                      <span className="font-medium">{workout.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      구독 후 확인
                    </span>
                  </div>
                ))}

                {program.workouts.length > 10 && (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="mb-2 text-sm text-muted-foreground">
                      {program.workouts.length - 10}개의 워크아웃이 더 있습니다
                    </p>
                    <p className="text-xs text-muted-foreground">
                      구독하고 전체 커리큘럼을 확인하세요
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: 코치 소개 */}
          <TabsContent value="coach" className="mt-0">
            <div className="space-y-6">
              {/* 코치 기본 정보 */}
              <div className="flex items-start gap-4">
                <Avatar className="size-20">
                  <AvatarImage src={coach.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    {(coach.displayName || coach.name || "C")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="mb-1 text-xl font-bold">
                    {coach.displayName || coach.name || "코치"}
                  </h3>
                  {coach.bioShort && (
                    <p className="text-muted-foreground">{coach.bioShort}</p>
                  )}
                </div>
              </div>

              {/* 상세 소개 */}
              {coach.bioLong && (
                <div>
                  <h4 className="mb-2 font-semibold">소개</h4>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {coach.bioLong}
                  </p>
                </div>
              )}

              {/* 경력 */}
              {coach.coachingExperience && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-semibold">
                    📋 경력
                  </h4>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {coach.coachingExperience}
                  </p>
                </div>
              )}

              {/* 자격증 */}
              {coach.certifications && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-semibold">
                    🏆 자격증
                  </h4>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {coach.certifications}
                  </p>
                </div>
              )}

              {/* SNS 링크 */}
              {coach.snsUrl && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-semibold">
                    🔗 SNS
                  </h4>
                  <Button variant="outline" asChild>
                    <Link
                      href={coach.snsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      프로필 방문하기
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}

