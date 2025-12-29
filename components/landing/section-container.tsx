import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: "black" | "dark-grey" | "transparent";
}

export default function SectionContainer({
  children,
  className,
  id,
  background = "transparent",
}: SectionContainerProps) {
  const bgColor = {
    black: "bg-[rgb(var(--pure-black))]",
    "dark-grey": "bg-[rgb(var(--dark-grey))]",
    transparent: "bg-transparent",
  };

  return (
    <section
      id={id}
      className={cn(
        "relative w-full py-16 md:py-24 lg:py-32",
        bgColor[background],
        className
      )}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {children}
      </div>
    </section>
  );
}

