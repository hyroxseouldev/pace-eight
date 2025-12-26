"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Dumbbell } from "lucide-react";
import { signupWithEmail } from "./actions";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await signupWithEmail(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.requiresEmailConfirmation) {
        setEmailSent(true);
        toast.success(result.message || "이메일을 확인해주세요");
      } else if (result.redirect) {
        toast.success("회원가입이 완료되었습니다!");
        router.push(result.redirect);
      }
    } catch (error) {
      toast.error("회원가입 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-6 text-primary" />
            </div>
            <CardTitle>이메일을 확인해주세요</CardTitle>
            <CardDescription>
              가입하신 이메일로 인증 링크를 발송했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                이메일의 인증 링크를 클릭하면 프로필 작성 페이지로 이동합니다.
                이메일이 오지 않았다면 스팸함을 확인해주세요.
              </AlertDescription>
            </Alert>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">로그인 페이지로 이동</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 로고 및 타이틀 */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="size-6" />
            </div>
            <span className="text-2xl font-bold">PACE</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-6">
            코치 회원가입
          </h1>
          <p className="text-muted-foreground mt-2">
            하이록스 전문 코치로 시작하세요
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              1
            </div>
            <span className="text-sm font-medium">계정 생성</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
              2
            </div>
            <span className="text-sm text-muted-foreground">프로필 작성</span>
          </div>
        </div>

        {/* 회원가입 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>이메일로 시작하기</CardTitle>
            <CardDescription>
              이메일 인증 후 코치 프로필을 작성할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="coach@example.com"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">
                  최소 8자 이상 입력해주세요
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    처리 중...
                  </>
                ) : (
                  "계정 만들기"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 로그인 링크 */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
          <Link href="/login" className="font-medium text-primary hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
