import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 이메일 인증 핸들러
 *
 * 유저 플로우:
 * 1. 이메일 인증 링크 클릭 → token_hash와 type 수신
 * 2. verifyOtp()로 토큰 검증
 * 3. 세션 생성 (쿠키 저장)
 * 4. /onboarding으로 리디렉션
 * 5. Proxy에서 세션 갱신 및 검증
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = "/onboarding"; // 온보딩으로 리디렉션

  // Create redirect link without the secret token
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirectTo.searchParams.delete("next");
      return NextResponse.redirect(redirectTo);
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = "/error";
  return NextResponse.redirect(redirectTo);
}
