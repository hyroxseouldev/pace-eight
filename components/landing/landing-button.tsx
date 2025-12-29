import React from "react";
import { LandingButtonProps } from "./type";

export const LandingButton: React.FC<LandingButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-4 text-lg",
    lg: "px-10 py-5 text-xl",
  };

  const baseStyle = `font-bold border-2 border-black transition-all duration-300 rounded-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
    sizeStyles[size] || sizeStyles.md
  }`;

  const variants = {
    primary: "bg-black text-white hover:bg-white hover:text-black",
    outline: "bg-white text-black hover:bg-black hover:text-white",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
