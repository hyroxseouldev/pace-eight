"use client";

import { LANDING_CONTENT } from "@/components/landing/constants";
import { FadeIn } from "@/components/landing/fade-in";
import { LandingButton } from "@/components/landing/landing-button";
import { LandingCard } from "@/components/landing/landing-card";
import { ArrowDownIcon } from "lucide-react";

export default function MarketingPage() {
  const { sections, brand_identity } = LANDING_CONTENT;

  return (
    <>
      <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b-2 border-black z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div
                className="text-xl font-bold tracking-tighter uppercase cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {LANDING_CONTENT.project_name}
              </div>
              <div className="hidden md:block text-sm font-mono text-secondary border-l-2 border-gray-200 pl-6 h-full">
                {brand_identity.slogan}
              </div>
            </div>
            <div className="flex items-center">
              <LandingButton variant="outline" size="sm">
                Log In
              </LandingButton>
            </div>
          </div>
        </nav>

        <main className="pt-20">
          {/* HERO SECTION */}
          <section
            id="hero"
            className="min-h-[90vh] flex flex-col justify-center items-center px-6 relative"
          >
            <FadeIn className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8 whitespace-pre-wrap">
                {sections.hero.title}
              </h1>
              <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
                {sections.hero.subtitle}
              </p>
              <LandingButton>{sections.hero.cta_text}</LandingButton>
            </FadeIn>

            <div className="absolute bottom-12 animate-bounce">
              <ArrowDownIcon />
            </div>
          </section>

          {/* DIFFERENTIATION SECTION */}
          <section
            id="differentiation"
            className="py-24 px-6 border-t-2 border-black bg-surface"
          >
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <h2 className="text-3xl font-bold mb-16 text-center">
                  {sections.differentiation.title}
                </h2>
              </FadeIn>

              <div className="grid md:grid-cols-2 gap-0 border-2 border-black">
                {/* Legacy */}
                <div className="p-12 border-b-2 md:border-b-0 md:border-r-2 border-black bg-white flex flex-col justify-center min-h-[300px]">
                  <span className="font-mono text-sm text-secondary mb-4 uppercase tracking-widest">
                    Legacy
                  </span>
                  <h3 className="text-2xl font-bold text-secondary mb-4 line-through decoration-2 decoration-black/30">
                    {sections.differentiation.comparison.legacy.label}
                  </h3>
                  <p className="text-lg text-secondary">
                    {sections.differentiation.comparison.legacy.desc}
                  </p>
                </div>

                {/* Pace Eight */}
                <div className="p-12 bg-black text-white flex flex-col justify-center min-h-[300px]">
                  <span className="font-mono text-sm text-secondary mb-4 uppercase tracking-widest">
                    The New Standard
                  </span>
                  <h3 className="text-2xl font-bold mb-4">
                    {sections.differentiation.comparison.pace_eight.label}
                  </h3>
                  <p className="text-xl font-medium leading-relaxed">
                    {sections.differentiation.comparison.pace_eight.desc}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* LOGIC SECTION */}
          <section id="logic" className="py-32 px-6">
            <div className="max-w-3xl mx-auto text-center">
              <FadeIn>
                <h2 className="text-4xl font-bold mb-8">
                  {sections.training_logic.title}
                </h2>
                <p className="text-xl leading-relaxed mb-12">
                  {sections.training_logic.description}
                </p>
                <div className="border-l-4 border-black pl-6 text-left py-2">
                  <p className="text-2xl font-bold italic">
                    "{sections.training_logic.philosophy}"
                  </p>
                </div>
              </FadeIn>
            </div>
          </section>

          {/* KEY FEATURES */}
          <section
            id="features"
            className="py-24 px-6 border-t-2 border-black bg-surface"
          >
            <div className="max-w-6xl mx-auto">
              <FadeIn className="mb-16">
                <h2 className="text-3xl font-bold">
                  {sections.key_features.title}
                </h2>
              </FadeIn>

              <div className="grid md:grid-cols-3 gap-8">
                {sections.key_features.features.map((feature, idx) => (
                  <FadeIn key={idx} delay={idx * 100}>
                    <LandingCard className="h-full flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300">
                      <div>
                        <h3 className="text-xl font-bold font-mono mb-4 border-b-2 border-black pb-2 inline-block">
                          {feature.label}
                        </h3>
                        <p className="text-secondary leading-relaxed">
                          {feature.value}
                        </p>
                      </div>
                    </LandingCard>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section
            id="how-it-works"
            className="py-24 px-6 border-t-2 border-black"
          >
            <div className="max-w-4xl mx-auto">
              <FadeIn className="mb-16 text-center">
                <h2 className="text-3xl font-bold">
                  {sections.how_it_works.title}
                </h2>
              </FadeIn>

              <div className="space-y-0">
                {sections.how_it_works.process.map((step, idx) => (
                  <FadeIn key={idx} delay={idx * 100}>
                    <div
                      className={`flex flex-col md:flex-row items-start md:items-center py-10 border-black ${
                        idx !== sections.how_it_works.process.length - 1
                          ? "border-b-2"
                          : ""
                      }`}
                    >
                      <div className="text-5xl md:text-6xl font-mono font-bold text-transparent text-stroke-2 mr-8 mb-4 md:mb-0 opacity-20">
                        {step.no}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{step.task}</h3>
                        <p className="text-secondary text-lg">{step.desc}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="py-32 px-6 bg-black text-white text-center">
            <FadeIn>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                {sections.final_cta.title}
              </h2>
              <p className="text-xl text-secondary mb-12 max-w-xl mx-auto">
                {sections.final_cta.subtitle}
              </p>
              <LandingButton variant="outline">
                {sections.final_cta.cta_text}
              </LandingButton>
            </FadeIn>
          </section>

          {/* FOOTER */}
          <footer className="py-8 border-t-2 border-white bg-black text-white px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-60">
              <p className="font-mono text-sm">
                © 2024 PACE EIGHT. All rights reserved.
              </p>
              <p className="font-mono text-sm mt-2 md:mt-0">
                {brand_identity.core_concept}
              </p>
            </div>
          </footer>
        </main>

        {/* Custom styles for text-stroke effect */}
        <style>{`
        .text-stroke-2 {
          -webkit-text-stroke: 2px black;
        }
      `}</style>
      </div>
    </>
  );
}
