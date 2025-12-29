import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js 16 Proxy 세션 관리
 * 
 * 이 함수는 다음 작업을 수행합니다:
 * 1. Supabase 세션 갱신 (getClaims로 JWT 검증)
 * 2. 루트 보호 및 리디렉션
 * 3. 온보딩 플로우 관리
 * 4. 쿠키 동기화 (브라우저/서버)
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Request 쿠키 설정
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          
          // 2. 새로운 Response 생성 (중요!)
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // 3. Response 쿠키 설정
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getClaims()로 JWT 검증
  // getSession()는 JWT 검증을 보장하지 않으므로 사용하지 않음
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const { pathname } = request.nextUrl

  // 루트 보호 설정
  const protectedRoutes = ['/dashboard']
  const publicRoutes = ['/login', '/signup', '/', '/onboarding', '/programs', '/auth']

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  // 보호된 루트: 미인증 시 /login으로 리디렉션
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // 현재 경로를 쿼리 파라미터로 전달 (로그인 후 리디렉션용)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // 공용 루트: 인증된 사용자의 온보딩 체크는 Server Component에서 수행
  // Proxy에서는 최소한의 인증 체크만 수행
  if (isPublicRoute && user && pathname.startsWith('/login')) {
    // 로그인 페이지 접근 시 이미 로그인된 경우
    // 온보딩 완료 여부에 따라 루트 결정
    // Server Component에서 처리
    return supabaseResponse
  }

  // IMPORTANT: 반드시 supabaseResponse 반환
  // 새로운 Response를 생성하면 쿠키가 동기화되지 않음
  return supabaseResponse
}

