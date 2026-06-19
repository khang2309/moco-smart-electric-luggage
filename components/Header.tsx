"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLanguage } from "../app/providers";

const navItems = [
  ["Home", "#home"],
  ["Product", "#product"],
  ["Features", "#features"],
  ["Contact", "#contact"],
] as const;

const trackedHeaderItems = [
  ...navItems,
  ["Support", "#support"],
  ["Rewards", "#rewards"],
  ["Cart", "#cart"],
] as const;

const copy = {
  vi: {
    topWelcome: "Welcome to MOCO!",
    nav: {
      home: "Trang ch\u1ee7",
      product: "S\u1ea3n ph\u1ea9m",
      features: "T\u00ednh n\u0103ng",
      contact: "Li\u00ean h\u1ec7",
    },
    support: "H\u1ed7 tr\u1ee3",
    search: "T\u00ecm ki\u1ebfm",
    rewards: "My MOCO Rewards",
    cart: "Gi\u1ecf h\u00e0ng",
    searchTitle: "T\u00ecm Ki\u1ebfm",
    searchSubmit: "T\u00ecm",
    closeSearch: "\u0110\u00f3ng t\u00ecm ki\u1ebfm",
    searchLabel: "T\u00ecm ki\u1ebfm n\u1ed9i dung MOCO",
    quickLinksTitle: "Li\u00ean K\u1ebft Nhanh",
    quickLinks: [
      "N\u1ebfu b\u1ea1n qu\u00ean m\u1eadt kh\u1ea9u t\u00e0i kho\u1ea3n MOCO",
      "Quy \u0111\u1ecbnh pin Li-ion v\u00e0 An to\u00e0n bay",
      "\u0110\u1ecba \u0111i\u1ec3m b\u1ea3o h\u00e0nh v\u00e0 s\u1eeda ch\u1eefa ch\u00ednh h\u00e3ng t\u1ea1i Vi\u1ec7t Nam",
      "Li\u00ean h\u1ec7 v\u1edbi b\u1ed9 ph\u1eadn h\u1ed7 tr\u1ee3 c\u1ee7a MOCO",
    ],
  },
  en: {
    topWelcome: "Welcome to MOCO!",
    nav: {
      home: "Home",
      product: "Product",
      features: "Features",
      contact: "Contact",
    },
    support: "Support",
    search: "Search",
    rewards: "My MOCO Rewards",
    cart: "Cart",
    searchTitle: "Search",
    searchSubmit: "Go",
    closeSearch: "Close search",
    searchLabel: "Search MOCO content",
    quickLinksTitle: "Quick Links",
    quickLinks: [
      "Reset your MOCO account password",
      "Li-ion battery and flight safety policy",
      "Official warranty and repair locations in Vietnam",
      "Contact MOCO support",
    ],
  },
} as const;

export default function Header() {
  const [activeSection, setActiveSection] = useState("#home");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { language, setLanguage } = useLanguage();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isClickScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.body.classList.toggle("search-open", isSearchOpen);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("search-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isClickScrolling.current) return;

      let current = "";

      for (const item of trackedHeaderItems) {
        const id = item[1].substring(1);
        const section = document.getElementById(id);

        if (section) {
          const rect = section.getBoundingClientRect();

          if (rect.top <= 150 && rect.bottom >= 150) {
            current = item[1];
          }
        }
      }

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        current = "#contact";
      }

      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsSearchOpen(false);
    setActiveSection(href);
    isClickScrolling.current = true;

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 1500);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedQuery = searchQuery.trim().toLowerCase();
    let target = "#support";

    if (normalizedQuery.includes("li\u00ean h\u1ec7") || normalizedQuery.includes("contact")) {
      target = "#contact";
    } else if (
      normalizedQuery.includes("pin") ||
      normalizedQuery.includes("bay") ||
      normalizedQuery.includes("gps") ||
      normalizedQuery.includes("kh\u00f3a")
    ) {
      target = "#features";
    } else if (
      normalizedQuery.includes("product") ||
      normalizedQuery.includes("s\u1ea3n ph\u1ea9m") ||
      normalizedQuery.includes("vali")
    ) {
      target = "#product";
    } else if (normalizedQuery.includes("faq") || normalizedQuery.includes("c\u00e2u h\u1ecfi")) {
      target = "#faq";
    }

    setIsSearchOpen(false);
    window.setTimeout(() => {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const currentCopy = copy[language];
  const translatedNavItems = [
    [currentCopy.nav.home, "#home"],
    [currentCopy.nav.product, "#product"],
    [currentCopy.nav.features, "#features"],
    [currentCopy.nav.contact, "#contact"],
  ] as const;

  return (
    <>
      <div className="top-bar">
        <span>{currentCopy.topWelcome}</span>
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
          <nav className="nav" aria-label={language === "vi" ? "\u0110i\u1ec1u h\u01b0\u1edbng ch\u00ednh" : "Main navigation"}>
            {translatedNavItems.map(([label, href]) => (
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
          <div className="header-actions">
            <a
              href="#support"
              className={`action-item action-support${activeSection === "#support" ? " active" : ""}`}
              onClick={() => handleNavClick("#support")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
              <span>{currentCopy.support}</span>
            </a>
            <button
              className="action-item action-search"
              type="button"
              aria-expanded={isSearchOpen}
              aria-controls="site-search-panel"
              onClick={() => {
                setActiveSection("#search");
                setIsSearchOpen((open) => !open);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>{currentCopy.search}</span>
            </button>
            <a
              href="#rewards"
              className={`action-item action-rewards${activeSection === "#rewards" ? " active" : ""}`}
              onClick={() => handleNavClick("#rewards")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>{currentCopy.rewards}</span>
            </a>
            <a
              href="#cart"
              className={`action-item action-cart${activeSection === "#cart" ? " active" : ""}`}
              onClick={() => handleNavClick("#cart")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>{currentCopy.cart}</span>
            </a>
            <button
              className="lang-switch"
              type="button"
              aria-label={language === "vi" ? "Chuy\u1ec3n sang ti\u1ebfng Anh" : "Switch to Vietnamese"}
              onClick={() => setLanguage((current) => (current === "vi" ? "en" : "vi"))}
            >
              <span className={language === "vi" ? "active" : ""}>VI</span>
              <span aria-hidden="true">/</span>
              <span className={language === "en" ? "active" : ""}>EN</span>
            </button>
          </div>
        </div>
      </header>
      {isSearchOpen && (
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-search-title"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="search-panel shadow-2xl ring-1 ring-black/5"
            id="site-search-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <form className="search-entry-bar shadow-inner" role="search" onSubmit={handleSearchSubmit}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                ref={searchInputRef}
                id="site-search-title"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={currentCopy.searchTitle}
                aria-label={currentCopy.searchLabel}
              />
              <button type="submit">{currentCopy.searchSubmit}</button>
              <button
                className="search-entry-close"
                type="button"
                aria-label={currentCopy.closeSearch}
                onClick={() => setIsSearchOpen(false)}
              >
                x
              </button>
            </form>
            <div className="search-quick-links">
              <h3>{currentCopy.quickLinksTitle}</h3>
              <ul>
                {currentCopy.quickLinks.map((link, index) => {
                  const href = index === 1 ? "#features" : index === 3 ? "#contact" : "#support";

                  return (
                    <li key={link}>
                      <a href={href} onClick={() => setIsSearchOpen(false)}>
                        {link}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
