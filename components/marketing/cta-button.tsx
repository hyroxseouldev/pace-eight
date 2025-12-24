import Link from "next/link";
import { cn } from "@/lib/utils";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "default" | "large";
  className?: string;
  onClick?: () => void;
}

export default function CTAButton({
  href,
  children,
  variant = "primary",
  size = "default",
  className,
  onClick,
}: CTAButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold transition-all duration-200 rounded-md";

  const variants = {
    primary:
      "bg-[rgb(var(--volt-yellow))] text-[rgb(var(--pure-black))] hover:opacity-90 hover:scale-105",
    secondary:
      "bg-transparent border-2 border-[rgb(var(--volt-yellow))] text-[rgb(var(--volt-yellow))] hover:bg-[rgb(var(--volt-yellow))] hover:text-[rgb(var(--pure-black))]",
  };

  const sizes = {
    default: "px-6 py-3 text-sm md:text-base",
    large: "px-8 py-4 text-base md:text-lg",
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}

