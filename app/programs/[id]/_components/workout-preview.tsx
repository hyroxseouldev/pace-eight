import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface WorkoutPreviewProps {
  workouts: Array<{
    id: string;
    dayNumber: number | null;
    title: string;
  }>;
  programId: string;
}

export function WorkoutPreview({ workouts }: WorkoutPreviewProps) {
  const previewCount = Math.min(workouts.length, 6);
  const remainingCount = workouts.length - previewCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>커리큘럼 미리보기</CardTitle>
        <CardDescription>
          전체 {workouts.length}일 프로그램 중 일부를 미리 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workouts.slice(0, previewCount).map((workout) => (
            <div
              key={workout.id}
              className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="shrink-0">
                  Day {workout.dayNumber || "?"}
                </Badge>
                <span className="font-medium">{workout.title}</span>
              </div>
              <Lock className="size-4 text-muted-foreground" />
            </div>
          ))}

          {remainingCount > 0 && (
            <div className="rounded-lg border border-dashed bg-muted/50 p-6 text-center">
              <p className="mb-1 font-medium">
                +{remainingCount}개의 워크아웃
              </p>
              <p className="text-sm text-muted-foreground">
                구독하고 전체 커리큘럼을 확인하세요
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

