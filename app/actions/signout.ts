"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * 로그아웃 Server Action
 *
 * 이 Server Action은 다음 컴포넌트에서 사용할 수 있습니다:
 * - components/dashboard/app-sidebar.tsx (로그아웃 버튼)
 * - app/dashboard/settings/_components/profile-settings-form.tsx (로그아웃 버튼)
 * - 기타 Client Component에서
 *
 * 사용법:
 * ```tsx
 * import { handleSignOut } from "@/app/actions/signout";
 *
 * <button onClick={async () => {
 *   await handleSignOut();
 * }}>
 *   로그아웃
 * </button>
 * ```
 *
 * 장점:
 * - 자연스러운 UX (페이지 새로고침 없음)
 * - 폼이 필요 없음
 * - Client Component에서 쉽게 사용 가능
 * - TypeScript 타입 안전
 */
export async function handleSignOut() {
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

  // 로그인 페이지로 리디렉션
  redirect("/login");
}
