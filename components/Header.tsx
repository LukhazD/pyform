"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ButtonSignin from "./ButtonSignin";
import logo from "@/app/icon.png";
import config from "@/config";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import Modal from "./Modal";

const links: {
  href: string;
  label: string;
}[] = [
    {
      href: "/#pricing",
      label: "Precios",
    },
    {
      href: "/#testimonials",
      label: "Reseñas",
    },
    {
      href: "/#faq",
      label: "FAQ",
    },
  ];

const cta: JSX.Element = <ButtonSignin extraStyle="btn-primary bg-purple-[#5B23FF] border-none hover:bg-purple-700" text="Iniciar Sesión" />;

const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const scrollDirection = useScrollDirection();
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll for pure transparency vs glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        } ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"}`}
    >
      <nav
        className="container flex items-center justify-between px-8 py-4 mx-auto"
        aria-label="Global"
      >
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0"
            href="/"
            title={`${config.appName} homepage`}
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-8"
              placeholder="blur"
              priority={true}
              width={32}
              height={32}
            />
            <span className={`font-extrabold text-lg ${isScrolled ? "text-gray-900" : "text-gray-900"}`}>
              {config.appName}
            </span>
          </Link>
        </div>

        {/* Mobile Burger Button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Abrir menú principal</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex lg:justify-center lg:gap-12 lg:items-center">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className={`text-sm font-medium transition-colors hover:text-purple-600 ${isScrolled ? "text-gray-600" : "text-gray-800"
                }`}
              title={link.label}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex lg:justify-end lg:flex-1">{cta}</div>
      </nav>

      {/* Mobile Menu Modal */}
      <Modal isModalOpen={isOpen} setIsModalOpen={setIsOpen} title="Menú" isFullScreen={true}>
        <div className="flex flex-col gap-6 items-center pt-4 pb-2">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="text-xl font-medium text-gray-900 hover:text-purple-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="w-full h-px bg-gray-100 my-2" />
          <div className="w-full">
            <ButtonSignin extraStyle="btn-primary w-full bg-purple-[#5B23FF] border-none hover:bg-purple-700" text="Iniciar Sesión" />
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default Header;
