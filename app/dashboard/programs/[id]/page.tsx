import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProgramById, getProgramSubscribers } from "../../actions";
import { ProgramOverviewTab } from "./_components/program-overview-tab";
import { WorkoutsTab } from "./_components/workouts-tab";
import { SubscribersTab } from "./_components/subscribers-tab";

interface ProgramDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { id } = await params;
  
  const [program, subscribers] = await Promise.all([
    getProgramById(id),
    getProgramSubscribers(id),
  ]);

  if (!program) {
    notFound();
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { title: "프로그램", href: "/dashboard/programs" },
          { title: program.title },
        ]}
      />
      <div className="flex-1 p-6">
        <div className="space-y-6">
          {/* 페이지 타이틀 */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{program.title}</h1>
            <p className="text-muted-foreground">
              프로그램 설정, 워크아웃, 구독자를 관리하세요
            </p>
          </div>

          {/* 탭 */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">개요</TabsTrigger>
              <TabsTrigger value="workouts">
                워크아웃 ({program.workouts?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="subscribers">
                구독자 ({subscribers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ProgramOverviewTab program={program} />
            </TabsContent>

            <TabsContent value="workouts">
              <WorkoutsTab program={program} />
            </TabsContent>

            <TabsContent value="subscribers">
              <SubscribersTab subscribers={subscribers} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

