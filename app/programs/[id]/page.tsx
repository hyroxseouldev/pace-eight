import { notFound } from "next/navigation";
import { getProgramForSale } from "@/app/dashboard/actions";
import { ProgramHero } from "./_components/program-hero";
import { ProgramContent } from "./_components/program-content";
import { WorkoutPreview } from "./_components/workout-preview";
import { CoachSection } from "./_components/coach-section";
import { PricingSection } from "./_components/pricing-section";
import { FAQSection } from "./_components/faq-section";
import { MobileCTABar } from "./_components/mobile-cta-bar";

interface ProgramPageProps {
  params: {
    id: string;
  };
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { id } = await params; // Await params in Next.js 15+
  const program = await getProgramForSale(id);

  if (!program) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <ProgramHero program={program} coach={program.coach} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Main Content */}
          <div className="space-y-12 lg:col-span-2">
            {/* 프로그램 상세 정보 (Tabs) */}
            <ProgramContent program={program} coach={program.coach} />

            {/* 워크아웃 미리보기 */}
            <WorkoutPreview
              workouts={program.workouts}
              programId={program.id}
            />

            {/* 코치 소개 */}
            <CoachSection coach={program.coach} />

            {/* FAQ */}
            <FAQSection />
          </div>

          {/* Right: Sticky Sidebar (Desktop) */}
          <div className="lg:col-span-1">
            <PricingSection program={program} />
          </div>
        </div>
      </div>

      {/* Mobile CTA Bar */}
      <MobileCTABar program={program} />
    </div>
  );
}
