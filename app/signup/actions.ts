"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("passwordConfirm") as string;

  // 비밀번호 확인
  if (password !== passwordConfirm) {
    redirect("/signup?error=password_mismatch");
  }

  // 이메일과 비밀번호 검증
  if (!email || !password) {
    redirect("/signup?error=missing_fields");
  }

  if (password.length < 6) {
    redirect("/signup?error=password_too_short");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/confirm`,
    },
  });

  if (error) {
    console.error("Signup error:", error);
    redirect(`/signup?error=${error.code || "signup_failed"}`);
  }

  revalidatePath("/", "layout");
  redirect("/signup?success=true");
}

