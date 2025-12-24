import Link from "next/link";
import { Instagram, Youtube, Facebook } from "lucide-react";

const navigation = {
  product: [
    { name: "서비스 소개", href: "#service-intro" },
    { name: "프로그램", href: "#service-intro" },
    { name: "고객 후기", href: "#social-proof" },
    { name: "로그인", href: "/login" },
  ],
  legal: [
    { name: "이용약관", href: "#" },
    { name: "개인정보처리방침", href: "#" },
  ],
  social: [
    {
      name: "Instagram",
      href: "#",
      icon: Instagram,
    },
    {
      name: "YouTube",
      href: "#",
      icon: Youtube,
    },
    {
      name: "Facebook",
      href: "#",
      icon: Facebook,
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[rgb(var(--dark-grey))] text-white">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-2xl font-extrabold">
              <span className="text-[rgb(var(--volt-yellow))]">PACE</span>
            </h3>
            <p className="mb-4 max-w-md text-[rgb(var(--light-grey))]">
              하이록스 스타일의 고강도 피트니스 트레이닝 프로그램.
              <br />
              당신의 한계를 매일 갱신하세요.
            </p>
            <div className="text-sm text-[rgb(var(--light-grey))]">
              <p className="mb-1">사업자등록번호: 000-00-00000</p>
              <p className="mb-1">대표: 홍길동</p>
              <p>이메일: contact@pace.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-bold">바로가기</h4>
            <ul className="space-y-2">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[rgb(var(--light-grey))] transition-colors hover:text-[rgb(var(--volt-yellow))]"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-lg font-bold">법적 정보</h4>
            <ul className="space-y-2">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[rgb(var(--light-grey))] transition-colors hover:text-[rgb(var(--volt-yellow))]"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div className="mt-6">
              <h4 className="mb-3 text-lg font-bold">소셜 미디어</h4>
              <div className="flex gap-4">
                {navigation.social.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-[rgb(var(--light-grey))] transition-colors hover:text-[rgb(var(--volt-yellow))]"
                    aria-label={item.name}
                  >
                    <item.icon size={24} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-[rgb(var(--pure-black))] pt-8 text-center text-sm text-[rgb(var(--light-grey))]">
          <p>© 2025 PACE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

