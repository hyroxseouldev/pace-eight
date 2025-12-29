"use client";

import Image from "next/image";
import CTAButton from "./cta-button";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  const scrollToNext = () => {
    const nextSection = document.getElementById("service-intro");
    nextSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070"
          alt="High-intensity training"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="max-w-5xl text-center">
          {/* Main Copy */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-4 text-4xl font-extrabold text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            당신의 한계는
            <br />
            <span className="text-[rgb(var(--volt-yellow))]">매일 갱신된다</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-2 text-sm font-medium uppercase tracking-widest text-[rgb(var(--volt-yellow))]"
          >
            Your limits are renewed every day
          </motion.p>

          {/* Sub Copy */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mx-auto mb-10 max-w-2xl text-base text-gray-300 md:text-lg lg:text-xl"
          >
            단순한 운동을 넘어 체력의 한계에 도전하세요.
            <br />
            하이록스 스타일의 고강도 트레이닝 프로그램과
            <br className="hidden sm:block" />
            전문 코칭이 당신을 기다립니다.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <CTAButton href="/signup" variant="primary" size="large">
              지금 도전하기
            </CTAButton>
            <CTAButton
              href="#service-intro"
              variant="secondary"
              size="large"
              onClick={(e) => {
                e.preventDefault();
                scrollToNext();
              }}
            >
              프로그램 보기
            </CTAButton>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white transition-colors hover:text-[rgb(var(--volt-yellow))]"
        aria-label="Scroll to next section"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={40} />
        </motion.div>
      </motion.button>
    </section>
  );
}

