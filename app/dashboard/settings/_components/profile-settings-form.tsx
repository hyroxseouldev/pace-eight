"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { updateProfile } from "../../actions";

interface ProfileSettingsFormProps {
  profile: {
    name: string;
    email: string;
    avatarUrl: string;
  };
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(profile.avatarUrl);

  async function handleSubmit(formData: FormData) {
    setIsUpdating(true);
    try {
      const result = await updateProfile(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("프로필이 업데이트되었습니다!");
      router.refresh();
    } catch {
      toast.error("프로필 업데이트에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 프로필 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
          <CardDescription>
            공개 프로필 정보를 수정합니다. 이 정보는 판매 페이지에 노출됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {/* 프로필 사진 미리보기 */}
            <div className="flex items-center gap-4">
              <Avatar className="size-20">
                <AvatarImage src={previewUrl || undefined} alt={profile.name || "Profile"} />
                <AvatarFallback className="text-2xl">
                  {profile.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatarUrl">프로필 사진 URL</Label>
                <Input
                  id="avatarUrl"
                  name="avatarUrl"
                  type="url"
                  defaultValue={profile.avatarUrl}
                  placeholder="https://example.com/avatar.jpg"
                  disabled={isUpdating}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  프로필 사진 URL을 입력하세요.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                name="name"
                defaultValue={profile.name}
                placeholder="홍길동"
                disabled={isUpdating}
              />
              <p className="text-xs text-muted-foreground">
                회원들에게 표시되는 코치 이름입니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                이메일은 변경할 수 없습니다.
              </p>
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

      {/* 계정 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>계정</CardTitle>
          <CardDescription>
            계정 관련 설정입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">로그아웃</p>
              <p className="text-sm text-muted-foreground">
                현재 기기에서 로그아웃합니다.
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/auth/signout">로그아웃</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

