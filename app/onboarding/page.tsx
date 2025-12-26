"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dumbbell, CheckCircle2 } from "lucide-react";
import { completeCoachProfile } from "../signup/actions";

const COACHING_EXPERIENCE_OPTIONS = [
  { value: "less_than_1", label: "1년 미만" },
  { value: "1_to_3", label: "1-3년" },
  { value: "3_to_5", label: "3-5년" },
  { value: "5_to_10", label: "5-10년" },
  { value: "more_than_10", label: "10년 이상" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [coachingExperience, setCoachingExperience] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // 코칭 경력 추가
      formData.set("coachingExperience", coachingExperience);

      const result = await completeCoachProfile(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("프로필이 완성되었습니다! 🎉");
      router.push("/dashboard");
    } catch (error) {
      toast.error("프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="size-6" />
            </div>
            <span className="text-2xl font-bold">PACE</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-6">
            코치 프로필 작성
          </h1>
          <p className="text-muted-foreground mt-2">
            회원들에게 보여질 프로필을 완성해주세요
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle2 className="size-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">계정 생성</span>
          </div>
          <div className="h-px w-8 bg-primary" />
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              2
            </div>
            <span className="text-sm font-medium">프로필 작성</span>
          </div>
        </div>

        {/* 프로필 작성 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>
                코치님의 기본 정보를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  이름 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="홍길동"
                  required
                  minLength={2}
                  maxLength={50}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">활동명 / 별명 (선택)</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  placeholder="예: 하이록스킹, 코치K"
                  maxLength={30}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  입력하지 않으면 이름이 표시됩니다
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 전문성 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>전문성 정보</CardTitle>
              <CardDescription>
                코치님의 경력을 알려주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coachingExperience">
                  코칭 경력 <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={coachingExperience}
                  onValueChange={setCoachingExperience}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="경력을 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {COACHING_EXPERIENCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">자격증 (선택)</Label>
                <Input
                  id="certifications"
                  name="certifications"
                  placeholder="예: 생활체육지도자 2급, NSCA-CPT, CrossFit Level 1"
                  maxLength={200}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  여러 개인 경우 쉼표(,)로 구분해주세요
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 소개 및 연락처 */}
          <Card>
            <CardHeader>
              <CardTitle>소개 및 연락처</CardTitle>
              <CardDescription>
                회원들에게 보여질 정보입니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bioShort">
                  한 줄 소개 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bioShort"
                  name="bioShort"
                  placeholder="예: 하이록스 세계 대회 출전 경험을 바탕으로 과학적인 트레이닝을 제공합니다"
                  required
                  minLength={10}
                  maxLength={100}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bioLong">상세 소개 (선택)</Label>
                <Textarea
                  id="bioLong"
                  name="bioLong"
                  placeholder="- 코칭 철학&#10;- 주요 경력 및 성과&#10;- 회원들에게 전하고 싶은 메시지"
                  rows={6}
                  maxLength={1000}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">프로필 사진 URL (선택)</Label>
                <Input
                  id="avatarUrl"
                  name="avatarUrl"
                  type="url"
                  placeholder="https://example.com/profile.jpg"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  추후 파일 업로드 기능이 추가될 예정입니다
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="snsUrl">SNS 또는 웹사이트 (선택)</Label>
                <Input
                  id="snsUrl"
                  name="snsUrl"
                  type="url"
                  placeholder="https://instagram.com/yourhandle"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  회원들이 코치님에 대해 더 알아볼 수 있습니다
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">연락처 (선택)</Label>
                <Input
                  id="contact"
                  name="contact"
                  placeholder="010-1234-5678 또는 카카오톡 ID"
                  maxLength={50}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* 약관 동의 */}
          <Card>
            <CardHeader>
              <CardTitle>약관 동의</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termsAgreed"
                  name="termsAgreed"
                  required
                  disabled={isLoading}
                />
                <Label
                  htmlFor="termsAgreed"
                  className="text-sm font-normal cursor-pointer leading-tight"
                >
                  서비스 이용약관에 동의합니다{" "}
                  <span className="text-destructive">*</span>
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacyAgreed"
                  name="privacyAgreed"
                  required
                  disabled={isLoading}
                />
                <Label
                  htmlFor="privacyAgreed"
                  className="text-sm font-normal cursor-pointer leading-tight"
                >
                  개인정보 처리방침에 동의합니다{" "}
                  <span className="text-destructive">*</span>
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketingAgreed"
                  name="marketingAgreed"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="marketingAgreed"
                  className="text-sm font-normal cursor-pointer leading-tight text-muted-foreground"
                >
                  (선택) 마케팅 정보 수신에 동의합니다
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isLoading}
              onClick={() => router.push("/dashboard")}
            >
              나중에 완성하기
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  저장 중...
                </>
              ) : (
                "프로필 완성하기"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

