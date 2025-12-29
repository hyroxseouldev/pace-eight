import { redirect } from "next/navigation";
import {
  getUserSession,
  checkOnboardingCompleted,
} from "@/lib/supabase/auth-helpers";
import CoachOnboardingForm from "./_components/coach-onboarding-form";

/**
 * 온보딩 페이지
 *
 * 유저 플로우:
 * 1. Proxy에서 인증 체크
 * 2. 온보딩 완료 여부 확인
 * 3. 미완료: 온보딩 폼 표시
 * 4. 완료: 대시보드로 리디렉션
 */
export default async function OnboardingPage() {
  // 유저 세션 가져오기 (Proxy에서 이미 검증됨)
  const { user } = await getUserSession();

  // 미인증 시 로그인 페이지로 리디렉션
  if (!user) {
    redirect("/login");
  }

  // 온보딩 완료 시 대시보드로 리디렉션
  const isCompleted = await checkOnboardingCompleted(user.id);
  if (isCompleted) {
    redirect("/dashboard");
  }

  // 온보딩 폼 렌더링
  return <CoachOnboardingForm userId={user.id} />;
}
