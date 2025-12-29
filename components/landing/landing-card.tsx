import React from "react";

interface LandingCardProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export const LandingCard: React.FC<LandingCardProps> = ({
  children,
  className = "",
  dark = false,
}) => {
  return (
    <div
      className={`border-2 border-black p-8 ${
        dark ? "bg-black text-white" : "bg-white text-black"
      } ${className}`}
    >
      {children}
    </div>
  );
};
