"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * 로그인 Server Action
 *
 * 유저 플로우:
 * 1. 이메일/비밀번호로 로그인 요청
 * 2. 세션 생성 (쿠키 저장)
 * 3. /dashboard로 리디렉션
 * 4. Proxy에서 세션 갱신 및 검증
 * 5. Server Component에서 온보딩 상태 확인
 */
export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/login?error=invalid_credentials");
  }

  // 레이아웃 캐시 무효화
  revalidatePath("/", "layout");

  // 대시보드로 리디렉션 (온보딩 미완료 시 자동 리디렉션됨)
  redirect("/dashboard");
}
