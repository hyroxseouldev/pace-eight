"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Dumbbell } from "lucide-react";
import { completeCoachProfile } from "../actions";

interface CoachOnboardingFormProps {
  userId: string;
}

export default function CoachOnboardingForm({ userId }: CoachOnboardingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await completeCoachProfile(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success("프로필이 완료되었습니다!");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* 로고 및 타이틀 */}
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="size-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            코치 프로필 작성
          </h1>
          <p className="mt-2 text-muted-foreground">
            하이록스 전문 코치로 활동하기 위한 프로필을 작성해주세요
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
              1
            </div>
            <span className="text-sm text-muted-foreground">계정 생성</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              2
            </div>
            <span className="text-sm font-medium">프로필 작성</span>
          </div>
        </div>

        {/* 프로필 작성 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>
              필수 정보를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              {/* 필수 필드 */}
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="홍길동"
                  required
                  minLength={2}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">활동명 (선택)</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="Coach Kim"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coachingExperience">코칭 경력 *</Label>
                <select
                  id="coachingExperience"
                  name="coachingExperience"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={isLoading}
                >
                  <option value="">선택해주세요</option>
                  <option value="1-3년">1-3년</option>
                  <option value="3-5년">3-5년</option>
                  <option value="5-10년">5-10년</option>
                  <option value="10년 이상">10년 이상</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bioShort">한 줄 소개 *</Label>
                <Textarea
                  id="bioShort"
                  name="bioShort"
                  placeholder="하이록스 전문 코치입니다. 30일 컨디션 업 시스템으로 도와드립니다."
                  required
                  minLength={10}
                  maxLength={100}
                  rows={2}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  최소 10자, 최대 100자
                </p>
              </div>

              {/* 선택 필드 */}
              <div className="space-y-2">
                <Label htmlFor="certifications">자격증 (선택)</Label>
                <Textarea
                  id="certifications"
                  name="certifications"
                  placeholder="예: Hyrox Level 1, CrossFit L2, NSCA-CSCS"
                  rows={2}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bioLong">상세 소개 (선택)</Label>
                <Textarea
                  id="bioLong"
                  name="bioLong"
                  placeholder="코칭 철학, 트레이닝 방식, 성공 사례 등을 자유롭게 작성해주세요"
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="snsUrl">SNS/웹사이트 (선택)</Label>
                <Input
                  id="snsUrl"
                  name="snsUrl"
                  type="url"
                  placeholder="https://instagram.com/coachkim"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">연락처 (선택)</Label>
                <Input
                  id="contact"
                  name="contact"
                  type="text"
                  placeholder="예: 010-1234-5678"
                  disabled={isLoading}
                />
              </div>

              {/* 약관 동의 */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="termsAgreed"
                    name="termsAgreed"
                    required
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label
                    htmlFor="termsAgreed"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    이용약관에 동의합니다. *
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="privacyAgreed"
                    name="privacyAgreed"
                    required
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label
                    htmlFor="privacyAgreed"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    개인정보처리방침에 동의합니다. *
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    저장 중...
                  </>
                ) : (
                  "프로필 완료하기"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

