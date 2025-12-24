"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import CTAButton from "./cta-button";

const navigation = [
  { name: "서비스 소개", href: "#service-intro" },
  { name: "프로그램", href: "#service-intro" },
  { name: "고객 후기", href: "#social-proof" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[rgb(var(--pure-black))]/95 backdrop-blur-sm shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-extrabold md:text-3xl"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="text-[rgb(var(--volt-yellow))]">PACE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="text-sm font-medium text-white transition-colors hover:text-[rgb(var(--volt-yellow))] lg:text-base"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-white transition-colors hover:text-[rgb(var(--volt-yellow))] lg:text-base"
            >
              로그인
            </Link>
            <CTAButton href="/signup" variant="primary" size="default">
              시작하기
            </CTAButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white transition-colors hover:text-[rgb(var(--volt-yellow))] md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-[rgb(var(--dark-grey))] py-4 md:hidden">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="text-left text-base font-medium text-white transition-colors hover:text-[rgb(var(--volt-yellow))]"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/login"
                  className="text-center text-base font-medium text-white transition-colors hover:text-[rgb(var(--volt-yellow))]"
                  onClick={() => setIsOpen(false)}
                >
                  로그인
                </Link>
                <CTAButton
                  href="/signup"
                  variant="primary"
                  size="default"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  시작하기
                </CTAButton>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

