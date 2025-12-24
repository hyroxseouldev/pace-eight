"use client";

import SectionContainer from "./section-container";
import AnimatedElement from "./animated-element";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "김민준",
    role: "직장인 / 6개월 수강",
    rating: 5,
    text: "체계적인 프로그램과 코치님의 세심한 피드백 덕분에 6개월 만에 체력이 눈에 띄게 좋아졌습니다. 매일 기록을 남기니 성장이 확실히 보여서 동기부여가 됩니다.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    name: "이서연",
    role: "프리랜서 / 3개월 수강",
    rating: 5,
    text: "하이록스 스타일의 고강도 훈련이 처음엔 힘들었지만, 지금은 제 한계를 넘어서는 재미에 푹 빠졌어요. 무엇보다 데이터로 보이는 변화가 정말 만족스럽습니다.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  },
  {
    name: "박지훈",
    role: "대학생 / 4개월 수강",
    rating: 5,
    text: "체계적인 8단계 커리큘럼이 정말 과학적이에요. 단계별로 목표를 달성하면서 자신감도 함께 올라갔습니다. 코치님의 실시간 피드백도 큰 도움이 됩니다.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  },
  {
    name: "최은지",
    role: "간호사 / 5개월 수강",
    rating: 5,
    text: "야간 근무로 불규칙한 생활을 하는데도, 유연한 일정 조정과 개인 맞춤형 코칭 덕분에 꾸준히 운동할 수 있었어요. 체력과 건강 모두 좋아졌습니다.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
  },
];

const stats = [
  { value: "50,000+", label: "총 훈련 완료 횟수" },
  { value: "1,200+", label: "활동 중인 회원" },
  { value: "4.8/5.0", label: "평균 만족도" },
];

export default function SocialProofSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <SectionContainer id="social-proof" background="black">
      <div className="text-center">
        <AnimatedElement delay={0.1}>
          <h2 className="mb-4 text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
            이미 수천 명이{" "}
            <span className="text-[rgb(var(--volt-yellow))]">
              자신의 기록을 깨고 있습니다
            </span>
          </h2>
        </AnimatedElement>

        <AnimatedElement delay={0.2}>
          <p className="mx-auto mb-16 max-w-2xl text-lg text-[rgb(var(--light-grey))]">
            비포/애프터가 아닌, '비포/애프터 레코드'를 확인하세요.
          </p>
        </AnimatedElement>
      </div>

      {/* Testimonials Carousel */}
      <AnimatedElement delay={0.3}>
        <div className="mb-16 overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="min-w-0 flex-[0_0_100%] px-4 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === selectedIndex
                  ? "w-8 bg-[rgb(var(--volt-yellow))]"
                  : "w-2 bg-[rgb(var(--light-grey))]"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </AnimatedElement>

      {/* Stats */}
      <div className="mt-20 grid gap-8 md:grid-cols-3">
        {stats.map((stat, index) => (
          <AnimatedElement key={stat.label} delay={0.4 + index * 0.1}>
            <div className="text-center">
              <div className="mb-2 text-4xl font-extrabold text-[rgb(var(--volt-yellow))] md:text-5xl">
                {stat.value}
              </div>
              <div className="text-lg text-[rgb(var(--light-grey))]">
                {stat.label}
              </div>
            </div>
          </AnimatedElement>
        ))}
      </div>
    </SectionContainer>
  );
}

interface TestimonialCardProps {
  name: string;
  role: string;
  rating: number;
  text: string;
  image: string;
}

function TestimonialCard({
  name,
  role,
  rating,
  text,
  image,
}: TestimonialCardProps) {
  return (
    <div className="h-full rounded-lg border border-[rgb(var(--dark-grey))] bg-[rgb(var(--dark-grey))] p-6 transition-all hover:border-[rgb(var(--volt-yellow))] hover:shadow-lg">
      {/* Stars */}
      <div className="mb-4 flex gap-1">
        {Array.from({ length: rating }).map((_, i) => (
          <Star
            key={i}
            className="h-5 w-5 fill-[rgb(var(--volt-yellow))] text-[rgb(var(--volt-yellow))]"
          />
        ))}
      </div>

      {/* Text */}
      <p className="mb-6 text-base leading-relaxed text-white">{text}</p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <img
          src={image}
          alt={name}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <div className="font-bold text-white">{name}</div>
          <div className="text-sm text-[rgb(var(--light-grey))]">{role}</div>
        </div>
      </div>
    </div>
  );
}

