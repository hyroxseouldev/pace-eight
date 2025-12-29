import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 Proxy 진입점
 *
 * 이 Proxy는 다음 작업을 수행합니다:
 * 1. 모든 요청에서 Supabase 세션 갱신
 * 2. 보호된 루트 접근 제어
 * 3. 인증된 사용자의 루트 리디렉션
 *
 * 참고: Next.js 16에서는 middleware.ts 대신 proxy.ts를 사용합니다.
 */
export async function proxy(request: NextRequest) {
  // 세션 갱신 및 루트 보호
  return await updateSession(request);
}

/**
 * Proxy Matcher
 *
 * 다음 경로에서 Proxy를 실행하지 않습니다:
 * - _next/static: 정적 파일
 * - _next/image: 이미지 최적화
 * - favicon.ico: 파비콘
 * - 이미지 파일 확장자: svg, png, jpg, jpeg, gif, webp
 */
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
