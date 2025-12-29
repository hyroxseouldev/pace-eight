export interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export interface LandingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
}
