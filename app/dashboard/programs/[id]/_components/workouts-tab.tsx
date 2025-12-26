"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Dumbbell,
  ChevronRight,
  Calendar,
  ListOrdered,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { RichTextEditor, RichTextViewer } from "@/components/ui/rich-text-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import {
  createWorkout,
  deleteWorkout,
  createWorkoutSession,
  updateWorkoutSession,
  deleteWorkoutSession,
} from "../../../actions";

interface WorkoutSession {
  id: string;
  title: string;
  content: string | null;
  orderIndex: number;
}

interface Workout {
  id: string;
  title: string;
  dayNumber: number | null;
  sessions?: WorkoutSession[];
}

interface WorkoutsTabProps {
  program: {
    id: string;
    workouts: Workout[] | undefined;
  };
}

export function WorkoutsTab({ program }: WorkoutsTabProps) {
  const router = useRouter();
  const workouts = program.workouts || [];
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    workouts[0]?.id || null
  );
  const [isCreatingDay, setIsCreatingDay] = useState(false);
  const [createDayDialogOpen, setCreateDayDialogOpen] = useState(false);

  const selectedWorkout = workouts.find((w) => w.id === selectedWorkoutId);
  const nextDayNumber =
    workouts.length > 0 ? Math.max(...workouts.map((w) => w.dayNumber || 0)) + 1 : 1;

  // Day 생성
  async function handleCreateDay(formData: FormData) {
    setIsCreatingDay(true);
    try {
      const result = await createWorkout(program.id, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("새 Day가 추가되었습니다!");
      setCreateDayDialogOpen(false);
      router.refresh();
    } catch {
      toast.error("Day 추가에 실패했습니다.");
    } finally {
      setIsCreatingDay(false);
    }
  }

  // Day 삭제
  async function handleDeleteDay(workoutId: string) {
    try {
      const result = await deleteWorkout(workoutId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Day가 삭제되었습니다!");
      setSelectedWorkoutId(workouts[0]?.id || null);
      router.refresh();
    } catch {
      toast.error("Day 삭제에 실패했습니다.");
    }
  }

  if (workouts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">아직 워크아웃이 없습니다</h3>
          <p className="text-muted-foreground text-center mb-4">
            첫 번째 Day를 추가하고 세션을 구성해보세요!
          </p>
          <Dialog open={createDayDialogOpen} onOpenChange={setCreateDayDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                첫 Day 추가하기
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 Day 추가</DialogTitle>
                <DialogDescription>Day {nextDayNumber}를 추가합니다.</DialogDescription>
              </DialogHeader>
              <form action={handleCreateDay} className="space-y-4">
                <input type="hidden" name="dayNumber" value={nextDayNumber} />
                <div className="space-y-2">
                  <Label htmlFor="create-day-title">Day 제목</Label>
                  <Input
                    id="create-day-title"
                    name="title"
                    placeholder="예: 하체 집중 훈련"
                    required
                    disabled={isCreatingDay}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDayDialogOpen(false)}
                    disabled={isCreatingDay}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isCreatingDay}>
                    {isCreatingDay ? (
                      <>
                        <Spinner className="mr-2" />
                        추가 중...
                      </>
                    ) : (
                      "추가"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* 좌측: Day 리스트 */}
      <div className="col-span-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">DAYS</h3>
          <Dialog open={createDayDialogOpen} onOpenChange={setCreateDayDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 size-3" />
                Day 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 Day 추가</DialogTitle>
                <DialogDescription>Day {nextDayNumber}를 추가합니다.</DialogDescription>
              </DialogHeader>
              <form action={handleCreateDay} className="space-y-4">
                <input type="hidden" name="dayNumber" value={nextDayNumber} />
                <div className="space-y-2">
                  <Label htmlFor="create-day-title">Day 제목</Label>
                  <Input
                    id="create-day-title"
                    name="title"
                    placeholder="예: 하체 집중 훈련"
                    required
                    disabled={isCreatingDay}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDayDialogOpen(false)}
                    disabled={isCreatingDay}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isCreatingDay}>
                    {isCreatingDay ? (
                      <>
                        <Spinner className="mr-2" />
                        추가 중...
                      </>
                    ) : (
                      "추가"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          {workouts.map((workout) => (
            <button
              key={workout.id}
              onClick={() => setSelectedWorkoutId(workout.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all hover:bg-accent",
                selectedWorkoutId === workout.id && "border-primary bg-accent"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                  {workout.dayNumber}
                </div>
                <div>
                  <p className="font-medium text-sm">{workout.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {workout.sessions?.length || 0}개 세션
                  </p>
                </div>
              </div>
              <ChevronRight
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  selectedWorkoutId === workout.id && "text-primary"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 우측: 선택된 Day의 세션 관리 */}
      <div className="col-span-8">
        {selectedWorkout ? (
          <SessionManager
            workout={selectedWorkout}
            onDelete={() => handleDeleteDay(selectedWorkout.id)}
          />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Day를 선택해주세요</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// 세션 관리 컴포넌트
function SessionManager({
  workout,
  onDelete,
}: {
  workout: Workout;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sessionContent, setSessionContent] = useState("");

  const sessions = workout.sessions || [];

  // 세션 생성
  async function handleCreateSession(formData: FormData) {
    setIsCreating(true);
    try {
      const result = await createWorkoutSession(workout.id, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("세션이 추가되었습니다!");
      setCreateDialogOpen(false);
      setSessionContent("");
      router.refresh();
    } catch {
      toast.error("세션 추가에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  }

  // 세션 수정
  async function handleUpdateSession(formData: FormData) {
    if (!editingSession) return;
    setIsUpdating(true);
    try {
      const result = await updateWorkoutSession(editingSession.id, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("세션이 수정되었습니다!");
      setEditingSession(null);
      setSessionContent("");
      router.refresh();
    } catch {
      toast.error("세션 수정에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }

  // 세션 삭제
  async function handleDeleteSession(sessionId: string) {
    try {
      const result = await deleteWorkoutSession(sessionId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("세션이 삭제되었습니다!");
      router.refresh();
    } catch {
      toast.error("세션 삭제에 실패했습니다.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              Day {workout.dayNumber}: {workout.title}
            </CardTitle>
            <CardDescription>
              {sessions.length}개의 세션으로 구성되어 있습니다
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 size-4" />
                  세션 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>새 세션 추가</DialogTitle>
                  <DialogDescription>
                    Day {workout.dayNumber}에 새로운 세션을 추가합니다.
                  </DialogDescription>
                </DialogHeader>
                <form action={handleCreateSession} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-session-title">세션 제목</Label>
                    <Input
                      id="create-session-title"
                      name="title"
                      placeholder="예: Warm-up, Main Workout, Cool-down"
                      required
                      disabled={isCreating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-session-content">세션 내용</Label>
                    <RichTextEditor
                      content={sessionContent}
                      onChange={setSessionContent}
                      placeholder="운동 루틴을 상세히 작성하세요. 이미지와 YouTube 영상도 추가할 수 있습니다."
                      editable={!isCreating}
                    />
                    <input type="hidden" name="content" value={sessionContent} />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCreateDialogOpen(false);
                        setSessionContent("");
                      }}
                      disabled={isCreating}
                    >
                      취소
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Spinner className="mr-2" />
                          추가 중...
                        </>
                      ) : (
                        "추가"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="mr-2 size-4" />
                  Day 삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Day 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    Day {workout.dayNumber}과 모든 세션을 삭제하시겠습니까? 이 작업은
                    되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed rounded-lg py-12">
            <ListOrdered className="size-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">세션이 없습니다</h3>
            <p className="text-muted-foreground text-center mb-4">
              첫 번째 세션을 추가해보세요!
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              세션 추가
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((session, index) => (
                <Card key={session.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="shrink-0">
                          #{index + 1}
                        </Badge>
                        <h4 className="font-medium">{session.title}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dialog
                          open={editingSession?.id === session.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingSession(null);
                              setSessionContent("");
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingSession(session);
                                setSessionContent(session.content || "");
                              }}
                            >
                              <Edit2 className="size-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>세션 수정</DialogTitle>
                              <DialogDescription>
                                {session.title} 세션을 수정합니다.
                              </DialogDescription>
                            </DialogHeader>
                            {editingSession && (
                              <form action={handleUpdateSession} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-session-title">세션 제목</Label>
                                  <Input
                                    id="edit-session-title"
                                    name="title"
                                    defaultValue={editingSession.title}
                                    required
                                    disabled={isUpdating}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="edit-session-content">세션 내용</Label>
                                  <RichTextEditor
                                    content={sessionContent}
                                    onChange={setSessionContent}
                                    editable={!isUpdating}
                                  />
                                  <input type="hidden" name="content" value={sessionContent} />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingSession(null);
                                      setSessionContent("");
                                    }}
                                    disabled={isUpdating}
                                  >
                                    취소
                                  </Button>
                                  <Button type="submit" disabled={isUpdating}>
                                    {isUpdating ? (
                                      <>
                                        <Spinner className="mr-2" />
                                        저장 중...
                                      </>
                                    ) : (
                                      "저장"
                                    )}
                                  </Button>
                                </div>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>세션 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{session.title}"을(를) 삭제하시겠습니까? 이 작업은
                                되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSession(session.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  {session.content && (
                    <CardContent className="pt-0">
                      <RichTextViewer content={session.content} />
                    </CardContent>
                  )}
                </Card>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
