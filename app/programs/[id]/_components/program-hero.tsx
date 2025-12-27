import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Dumbbell, Star } from "lucide-react";
import { SubscribeButton } from "./subscribe-button";

interface ProgramHeroProps {
  program: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    thumbnailUrl: string | null;
    difficulty: number | null;
    trainingTime: number | null;
    daysPerWeek: number | null;
    cycleInfo: string | null;
  };
  coach: {
    id: string;
    name: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bioShort: string | null;
  };
}

export function ProgramHero({ program, coach }: ProgramHeroProps) {
  const renderDifficulty = (level: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`size-4 ${
          i < level
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted text-muted"
        }`}
      />
    ));
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Thumbnail Background (optional) */}
      {program.thumbnailUrl && (
        <div className="absolute inset-0 opacity-10">
          <img
            src={program.thumbnailUrl}
            alt=""
            className="size-full object-cover blur-3xl"
          />
        </div>
      )}

      <div className="container relative mx-auto px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* 프로그램 제목 */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl">
            {program.title}
          </h1>

          {/* 간단 설명 */}
          {program.description && (
            <div
              className="prose prose-lg mx-auto mb-8 text-muted-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: program.description }}
            />
          )}

          {/* 메타데이터 배지 */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            {program.difficulty && (
              <Badge variant="outline" className="gap-1 px-4 py-2 text-sm">
                <span className="flex gap-0.5">
                  {renderDifficulty(program.difficulty)}
                </span>
                <span className="ml-1">난이도</span>
              </Badge>
            )}
            {program.daysPerWeek && (
              <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
                <Calendar className="size-4" />
                주 {program.daysPerWeek}일
              </Badge>
            )}
            {program.trainingTime && (
              <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
                <Clock className="size-4" />
                {program.trainingTime}분/회
              </Badge>
            )}
            {program.cycleInfo && (
              <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
                <Dumbbell className="size-4" />
                {program.cycleInfo}
              </Badge>
            )}
          </div>

          {/* 가격 */}
          <div className="mb-8">
            <div className="text-5xl font-bold">
              {program.price === 0 ? (
                <span className="text-primary">무료</span>
              ) : (
                <>
                  <span className="text-primary">
                    ₩{program.price.toLocaleString()}
                  </span>
                  <span className="text-2xl font-normal text-muted-foreground">
                    {" "}
                    / 월
                  </span>
                </>
              )}
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="mb-12 flex justify-center">
            <SubscribeButton programId={program.id} size="lg" />
          </div>

          {/* 코치 정보 */}
          <div className="flex items-center justify-center gap-3 border-t pt-8">
            <Avatar className="size-12">
              <AvatarImage src={coach.avatarUrl || undefined} />
              <AvatarFallback>
                {(coach.displayName || coach.name || "C")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="font-semibold">
                {coach.displayName || coach.name || "코치"}
              </div>
              {coach.bioShort && (
                <div className="text-sm text-muted-foreground">
                  {coach.bioShort}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

