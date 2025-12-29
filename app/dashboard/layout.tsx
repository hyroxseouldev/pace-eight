import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // 프로필 정보 조회
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  // 코치만 접근 가능 (필요에 따라 주석 해제)
  // if (profile?.role !== "coach") {
  //   redirect("/");
  // }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: profile?.name ?? user.email?.split("@")[0],
          email: user.email,
          avatarUrl: profile?.avatarUrl,
        }}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
