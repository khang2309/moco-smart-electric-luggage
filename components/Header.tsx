"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

const navItems = [
  ["Home", "#home"],
  ["Product", "#product"],
  ["Features", "#features"],
  ["Contact", "#contact"],
] as const;

export default function Header() {
  const [activeSection, setActiveSection] = useState("#home");
  const isClickScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (isClickScrolling.current) return;

      // Find the current section
      let current = "";
      for (const item of navItems) {
        const id = item[1].substring(1);
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          // If the section is near the top of the viewport (with some offset for the sticky header)
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = item[1];
          }
        }
      }

      // Handle the case where user scrolled to the very bottom
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        current = "#contact"; // Assuming contact is the last section
      }

      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger once on mount to set initial active section based on scroll position
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setActiveSection(href);
    isClickScrolling.current = true;

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 1500); // 1500ms delay for smooth scrolling to finish
  };

  return (
    <>
      <div className="top-bar">
        <span>Welcome to MOCO!</span>
        <span>mocoluggage@gmail.com</span>
      </div>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="MOCO home">
          <Image
            src="/assets/logo.jpg"
            alt="MOCO logo"
            width={60}
            height={40}
            style={{ objectFit: "contain" }}
          />
        </a>
        <div className="header-main-nav">
          <nav className="nav" aria-label="Điều hướng chính">
            {navItems.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className={activeSection === href ? "active" : ""}
                onClick={() => handleNavClick(href)}
              >
                {label}
              </a>
            ))}
          </nav>
          {/* <div className="divider"></div> */}
          <div className="header-actions">
            <a href="#support" className="action-item">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
              <span>Hỗ trợ</span>
            </a>
            <button className="action-item">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Tìm kiếm</span>
            </button>
            <a href="#rewards" className="action-item">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>My MOCO Rewards</span>
            </a>
            <a href="#cart" className="action-item">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Giỏ hàng</span>
            </a>
            <div className="lang-switch">
              <span>VI/EN</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
