import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";

export async function middleware(request: NextRequest) {
  // update user's auth session
  const response = await updateSession(request);
  
  const { pathname } = request.nextUrl;
  
  // 온보딩 체크가 필요한 보호된 경로
  const protectedPaths = ["/dashboard", "/onboarding"];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  
  if (isProtectedPath) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    // 로그인하지 않은 경우 로그인 페이지로
    if (!user && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // 로그인했지만 온보딩 미완료 시 온보딩 페이지로
    if (user && pathname.startsWith("/dashboard") && pathname !== "/dashboard/settings") {
      // 온보딩 완료 여부 확인은 클라이언트에서 처리하도록 변경
      // (DB 쿼리를 middleware에서 하면 성능 이슈 발생 가능)
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

