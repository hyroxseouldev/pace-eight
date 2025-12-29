import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProfileSettingsForm } from "./_components/profile-settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  return (
    <>
      <DashboardHeader breadcrumbs={[{ title: "설정" }]} />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* 페이지 타이틀 */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">설정</h1>
            <p className="text-muted-foreground">
              프로필 및 계정 설정을 관리하세요
            </p>
          </div>

          {/* 프로필 설정 폼 */}
          <ProfileSettingsForm
            profile={{
              name: profile?.name ?? "",
              email: user.email ?? "",
              avatarUrl: profile?.avatarUrl ?? "",
            }}
          />
        </div>
      </div>
    </>
  );
}
