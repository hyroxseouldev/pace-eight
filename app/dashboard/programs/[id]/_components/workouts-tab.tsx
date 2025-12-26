"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Dumbbell, Video, GripVertical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
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
import { createWorkout, updateWorkout, deleteWorkout } from "../../../actions";

interface Workout {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  dayNumber: number | null;
}

interface WorkoutsTabProps {
  program: {
    id: string;
    workouts: Workout[] | undefined;
  };
}

export function WorkoutsTab({ program }: WorkoutsTabProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const workouts = program.workouts || [];
  const nextDayNumber = workouts.length > 0 
    ? Math.max(...workouts.map(w => w.dayNumber || 0)) + 1 
    : 1;

  async function handleCreate(formData: FormData) {
    setIsCreating(true);
    try {
      const result = await createWorkout(program.id, formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("워크아웃이 추가되었습니다!");
      setCreateDialogOpen(false);
      router.refresh();
    } catch {
      toast.error("워크아웃 추가에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingWorkout) return;
    
    setIsUpdating(true);
    try {
      const result = await updateWorkout(editingWorkout.id, formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("워크아웃이 수정되었습니다!");
      setEditingWorkout(null);
      router.refresh();
    } catch {
      toast.error("워크아웃 수정에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete(workoutId: string) {
    setDeletingId(workoutId);
    try {
      const result = await deleteWorkout(workoutId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("워크아웃이 삭제되었습니다!");
      router.refresh();
    } catch {
      toast.error("워크아웃 삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* 워크아웃 추가 버튼 */}
      <div className="flex justify-end">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              워크아웃 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 워크아웃 추가</DialogTitle>
              <DialogDescription>
                Day {nextDayNumber}에 새로운 운동을 추가합니다.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <input type="hidden" name="dayNumber" value={nextDayNumber} />
              
              <div className="space-y-2">
                <Label htmlFor="create-title">운동 제목</Label>
                <Input
                  id="create-title"
                  name="title"
                  placeholder="예: 하체 근지구력 훈련"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-description">운동 내용</Label>
                <Textarea
                  id="create-description"
                  name="description"
                  placeholder="운동 루틴 상세 내용을 작성하세요&#10;&#10;예:&#10;- 스쿼트 5x10&#10;- 런지 3x12&#10;- 플랭크 3x60초"
                  rows={6}
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-videoUrl">영상 URL (선택)</Label>
                <Input
                  id="create-videoUrl"
                  name="videoUrl"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  disabled={isCreating}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
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
      </div>

      {/* 워크아웃 목록 */}
      {workouts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="size-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              아직 워크아웃이 없습니다
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              첫 번째 운동을 추가해보세요!
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              워크아웃 추가
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <Card key={workout.id} className="overflow-hidden">
              <div className="flex items-start gap-4 p-4">
                {/* 드래그 핸들 (향후 Drag & Drop 구현 예정) */}
                <div className="hidden cursor-grab text-muted-foreground/50 pt-1">
                  <GripVertical className="size-5" />
                </div>

                {/* Day 번호 */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  {workout.dayNumber || "-"}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{workout.title}</h4>
                      {workout.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 whitespace-pre-line">
                          {workout.description}
                        </p>
                      )}
                    </div>
                    {workout.videoUrl && (
                      <Badge variant="outline" className="shrink-0">
                        <Video className="mr-1 size-3" />
                        영상
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-1">
                  <Dialog
                    open={editingWorkout?.id === workout.id}
                    onOpenChange={(open) => !open && setEditingWorkout(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingWorkout(workout)}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>워크아웃 수정</DialogTitle>
                        <DialogDescription>
                          Day {editingWorkout?.dayNumber} 운동을 수정합니다.
                        </DialogDescription>
                      </DialogHeader>
                      {editingWorkout && (
                        <form action={handleUpdate} className="space-y-4">
                          <input
                            type="hidden"
                            name="dayNumber"
                            value={editingWorkout.dayNumber || ""}
                          />

                          <div className="space-y-2">
                            <Label htmlFor="edit-title">운동 제목</Label>
                            <Input
                              id="edit-title"
                              name="title"
                              defaultValue={editingWorkout.title}
                              required
                              disabled={isUpdating}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-description">운동 내용</Label>
                            <Textarea
                              id="edit-description"
                              name="description"
                              defaultValue={editingWorkout.description || ""}
                              rows={6}
                              disabled={isUpdating}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-videoUrl">영상 URL</Label>
                            <Input
                              id="edit-videoUrl"
                              name="videoUrl"
                              type="url"
                              defaultValue={editingWorkout.videoUrl || ""}
                              disabled={isUpdating}
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingWorkout(null)}
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
                        <AlertDialogTitle>워크아웃 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{workout.title}"을(를) 삭제하시겠습니까?
                          이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(workout.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deletingId === workout.id ? (
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
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

