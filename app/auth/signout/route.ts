import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

/**
 * 로그아웃 핸들러
 *
 * 유저 플로우:
 * 1. 로그아웃 버튼 클릭 → GET/POST 요청
 * 2. Server: getUser()로 유저 확인
 * 3. signOut() 호출 → 세션 쿠키 삭제
 * 4. /login으로 리디렉션
 * 5. Proxy: 다음 요청에서 세션 갱신 (null)
 *
 * 참고: GET과 POST 모두 지원하여 Link 컴포넌트에서 자연스럽게 사용 가능
 */
async function handleSignOut(req: NextRequest) {
  const supabase = await createClient();

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  // 레이아웃 캐시 무효화
  revalidatePath("/", "layout");
  return NextResponse.redirect(new URL("/login", req.url), {
    status: 302,
  });
}

// POST 요청 핸들러 (폼 제출용)
export async function POST(req: NextRequest) {
  return handleSignOut(req);
}

// GET 요청 핸들러 (Link 컴포넌트용)
export async function GET(req: NextRequest) {
  return handleSignOut(req);
}
