import SectionContainer from "./section-container";
import AnimatedElement from "./animated-element";
import { ClipboardCheck, MessageSquare, LineChart } from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Systematic Program",
    description: "하이록스 기반의 검증된 8단계 훈련 커리큘럼",
  },
  {
    icon: MessageSquare,
    title: "Daily Coaching",
    description: "매일 주어지는 과제와 코치의 실시간 피드백",
  },
  {
    icon: LineChart,
    title: "Data Driven",
    description: "사진과 수치로 기록되는 당신의 피트니스 히스토리",
  },
];

export default function ServiceIntroSection() {
  return (
    <SectionContainer id="service-intro" background="dark-grey">
      <div className="text-center">
        <AnimatedElement delay={0.1}>
          <h2 className="mb-4 text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
            측정 가능한 결과,{" "}
            <span className="text-[rgb(var(--volt-yellow))]">확실한 변화</span>
          </h2>
        </AnimatedElement>

        <AnimatedElement delay={0.2}>
          <p className="mx-auto mb-16 max-w-2xl text-lg text-[rgb(var(--light-grey))]">
            단순한 운동 앱이 아닙니다. 당신의 성장을 데이터로 증명하는 시스템입니다.
          </p>
        </AnimatedElement>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <AnimatedElement key={feature.title} delay={0.3 + index * 0.1}>
            <FeatureCard {...feature} />
          </AnimatedElement>
        ))}
      </div>
    </SectionContainer>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border-2 border-transparent bg-[rgb(var(--pure-black))] p-8 transition-all duration-300 hover:border-[rgb(var(--volt-yellow))] hover:shadow-xl hover:shadow-[rgb(var(--volt-yellow))]/20">
      {/* Icon */}
      <div className="mb-6 inline-flex rounded-lg bg-[rgb(var(--dark-grey))] p-4 transition-colors group-hover:bg-[rgb(var(--volt-yellow))]">
        <Icon
          className="h-8 w-8 text-[rgb(var(--volt-yellow))] transition-colors group-hover:text-[rgb(var(--pure-black))]"
          strokeWidth={2.5}
        />
      </div>

      {/* Title */}
      <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>

      {/* Description */}
      <p className="text-[rgb(var(--light-grey))] leading-relaxed">
        {description}
      </p>

      {/* Hover Effect Border */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-[rgb(var(--volt-yellow))] transition-all duration-300 group-hover:w-full" />
    </div>
  );
}

