import { createClient } from './server'

/**
 * 유저 세션 타입 정의
 */
export interface UserSession {
  user: {
    id: string
    email: string
    created_at: string
    // 기타 필요한 유저 필드
  } | null
  session: {
    access_token: string
    expires_at: number
  } | null
}

/**
 * Server Component에서 유저 세션 안전하게 가져오기
 * 
 * getClaims()를 사용하여 JWT 검증을 보장합니다.
 * Proxy에서 이미 JWT를 검증했으므로, 여기서는 추가 정보를 가져옵니다.
 * 
 * @returns 유저 세션 정보
 */
export async function getUserSession(): Promise<UserSession> {
  const supabase = await createClient()
  
  // Proxy에서 이미 getClaims()로 검증했으므로,
  // 여기서는 getUser()로 추가 유저 정보를 가져옵니다.
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    return { user: null, session: null }
  }
  
  return { 
    user: {
      id: data.user.id,
      email: data.user.email || '',
      created_at: data.user.created_at,
    }, 
    session: data.session ? {
      access_token: data.session.access_token,
      expires_at: data.session.expires_at,
    } : null
  }
}

/**
 * 온보딩 완료 여부 체크
 * 
 * @param userId 유저 ID
 * @returns 온보딩 완료 여부
 */
export async function checkOnboardingCompleted(userId: string): Promise<boolean> {
  const { db } = await import('@/lib/db')
  const { profiles } = await import('@/lib/db/schema')
  const { eq } = await import('drizzle-orm')
  
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      columns: {
        onboardingCompleted: true,
      },
    })
    
    return profile?.onboardingCompleted ?? false
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return false
  }
}

/**
 * 유저 역할 가져오기
 * 
 * @param userId 유저 ID
 * @returns 유저 역할 (coach | subscriber)
 */
export async function getUserRole(userId: string): Promise<'coach' | 'subscriber' | null> {
  const { db } = await import('@/lib/db')
  const { profiles } = await import('@/lib/db/schema')
  const { eq } = await import('drizzle-orm')
  
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      columns: {
        role: true,
      },
    })
    
    return profile?.role ?? null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * 인증되지 않은 사용자 리디렉션
 * 
 * Server Component에서 사용: 인증되지 않은 경우 /login으로 리디렉션
 */
export function requireAuth(user: any) {
  if (!user) {
    return { redirect: '/login' }
  }
  return null
}

/**
 * 온보딩이 필요한 사용자 리디렉션
 * 
 * Server Component에서 사용: 온보딩 미완료 시 /onboarding으로 리디렉션
 */
export async function requireOnboarding(userId: string) {
  const isCompleted = await checkOnboardingCompleted(userId)
  if (!isCompleted) {
    return { redirect: '/onboarding' }
  }
  return null
}

