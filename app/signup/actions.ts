"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function signupWithEmail(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // 유효성 검증
  if (!email || !password || !confirmPassword) {
    return { error: "모든 필드를 입력해주세요." };
  }

  if (password !== confirmPassword) {
    return { error: "비밀번호가 일치하지 않습니다." };
  }

  if (password.length < 8) {
    return { error: "비밀번호는 최소 8자 이상이어야 합니다." };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
        data: {
          role: "coach", // 코치로 가입
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "회원가입에 실패했습니다." };
    }

    // 이메일 확인이 필요한 경우
    if (data.user && !data.session) {
      return {
        success: true,
        requiresEmailConfirmation: true,
        message: "이메일로 인증 링크를 발송했습니다. 이메일을 확인해주세요.",
      };
    }

    // 즉시 로그인된 경우 (이메일 확인 불필요 설정)
    revalidatePath("/", "layout");
    return { success: true, redirect: "/onboarding" };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "회원가입 처리 중 오류가 발생했습니다." };
  }
}

export async function completeCoachProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 필수 필드 검증
  const name = formData.get("name") as string;
  const coachingExperience = formData.get("coachingExperience") as string;
  const bioShort = formData.get("bioShort") as string;

  // 약관 동의
  const termsAgreed = formData.get("termsAgreed") === "on";
  const privacyAgreed = formData.get("privacyAgreed") === "on";

  // 유효성 검증
  if (!name || name.length < 2) {
    return { error: "이름은 최소 2자 이상 입력해주세요." };
  }

  if (!coachingExperience) {
    return { error: "코칭 경력을 선택해주세요." };
  }

  if (!bioShort || bioShort.length < 10) {
    return { error: "한 줄 소개는 최소 10자 이상 입력해주세요." };
  }

  if (!termsAgreed || !privacyAgreed) {
    return { error: "필수 약관에 동의해주세요." };
  }

  try {
    // 선택 필드
    const displayName = formData.get("displayName") as string;
    const certifications = formData.get("certifications") as string;
    const bioLong = formData.get("bioLong") as string;
    const avatarUrl = formData.get("avatarUrl") as string;
    const snsUrl = formData.get("snsUrl") as string;
    const contact = formData.get("contact") as string;

    // 프로필 업데이트
    await db
      .update(profiles)
      .set({
        name: name.trim(),
        displayName: displayName?.trim() || null,
        coachingExperience,
        certifications: certifications?.trim() || null,
        bioShort: bioShort.trim(),
        bioLong: bioLong?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
        snsUrl: snsUrl?.trim() || null,
        contact: contact?.trim() || null,
        onboardingCompleted: true,
        role: "coach", // 명시적으로 코치 역할 설정
      })
      .where(eq(profiles.id, user.id));

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Profile completion error:", error);
    return { error: "프로필 저장 중 오류가 발생했습니다." };
  }
}

export async function checkOnboardingStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { completed: false, authenticated: false };
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  return {
    completed: profile?.onboardingCompleted ?? false,
    authenticated: true,
  };
}
