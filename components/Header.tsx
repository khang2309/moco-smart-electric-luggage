"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { signOutUser, readCurrentUser } from "../app/auth-storage";
import { useLanguage } from "../app/providers";

type CartItem = {
  slug: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  oldPrice: number;
  store: string;
  subtitle: string;
};

const navItems = [
  ["Home", "/"],
  ["Product", "/product"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

const trackedHeaderItems = [
  ["Home", "#home"],
  ["Product", "#product"],
  ["Contact", "#contact"],
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
      about: "V\u1ec1 MOCO",
      contact: "Li\u00ean h\u1ec7",
    },
    support: "H\u1ed7 tr\u1ee3",
    search: "T\u00ecm ki\u1ebfm",
    account: "Account",
    aboutUs: "About Us",
    experience: "Experience",
    registerProduct: "\u0110\u0103ng k\u00fd s\u1ea3n ph\u1ea9m",
    orders: "\u0110\u01a1n h\u00e0ng c\u1ee7a t\u00f4i",
    profile: "Qu\u1ea3n l\u00fd h\u1ed3 s\u01a1",
    favorites: "Y\u00eau th\u00edch c\u1ee7a t\u00f4i",
    coupons: "Ưu đãi MOCO của tôi",
    login: "Đăng ký / Đăng nhập",
    logout: "Đăng xuất",
    rewards: "Ưu đãi MOCO của tôi",
    cart: "Giỏ hàng",
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
      about: "About",
      contact: "Contact",
    },
    support: "Support",
    search: "Search",
    account: "Account",
    aboutUs: "About Us",
    experience: "Experience",
    registerProduct: "Register product",
    orders: "My orders",
    profile: "Profile management",
    favorites: "My favorites",
    coupons: "my MOCO rewards",
    login: "Register / Login",
    logout: "Logout",
    rewards: "my MOCO rewards",
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCartPulsing, setIsCartPulsing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    role?: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCartSlugs, setSelectedCartSlugs] = useState<string[]>([]);
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isAccountOpen &&
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAccountOpen]);

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
    const loadCart = () => {
      try {
        const rawCart = window.localStorage.getItem("moco-cart");
        const nextCart: CartItem[] = rawCart ? JSON.parse(rawCart) : [];
        setCartItems(nextCart);
        setSelectedCartSlugs((current) => {
          const existingSlugs = nextCart.map((item) => item.slug);
          const keptSelection = current.filter((slug) => existingSlugs.includes(slug));
          const newlyAdded = existingSlugs.filter((slug) => !current.includes(slug));
          return [...keptSelection, ...newlyAdded];
        });
        setIsCartPulsing(true);
        window.setTimeout(() => setIsCartPulsing(false), 650);
      } catch {
        setCartItems([]);
        setSelectedCartSlugs([]);
      }
    };

    const loadAuth = () => {
      const isAuth = window.localStorage.getItem("moco-auth") === "true";
      setIsLoggedIn(isAuth);
      if (isAuth) {
        try {
          const user = JSON.parse(
            window.localStorage.getItem("moco-user") || "{}",
          );
          if (user.name) {
            setUserInfo(user);
            setIsAdmin(user.role === "admin");
          }
        } catch (e) {}
      } else {
        setUserInfo(null);
        setIsAdmin(false);
      }
    };

    loadAuth();
    loadCart();

    const handleAuthUpdate = () => loadAuth();

    window.addEventListener("storage", loadCart);
    window.addEventListener("moco-cart-updated", loadCart);
    window.addEventListener("moco-auth-updated", handleAuthUpdate);

    return () => {
      window.removeEventListener("storage", loadCart);
      window.removeEventListener("moco-cart-updated", loadCart);
      window.removeEventListener("moco-auth-updated", handleAuthUpdate);
    };
  }, []);

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

      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        current = "#contact";
      }

      if (current && pathname === "/") {
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleNavClick = (href: string) => {
    setIsSearchOpen(false);
    setIsCartOpen(false);
    setIsAccountOpen(false);
    setActiveSection(href);

    if (href.includes("#")) {
      isClickScrolling.current = true;

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        isClickScrolling.current = false;
      }, 1500);
    }
  };

  const persistCart = (items: CartItem[]) => {
    setCartItems(items);
    window.localStorage.setItem("moco-cart", JSON.stringify(items));
    window.dispatchEvent(new Event("moco-cart-updated"));
  };

  const updateCartQuantity = (slug: string, delta: number) => {
    const updatedItems = cartItems
      .map((item) =>
        item.slug === slug
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item,
      )
      .filter((item) => item.quantity > 0);

    persistCart(updatedItems);
  };

  const removeCartItem = (slug: string) => {
    persistCart(cartItems.filter((item) => item.slug !== slug));
    setSelectedCartSlugs((current) => current.filter((item) => item !== slug));
  };

  const toggleCartItemSelection = (slug: string) => {
    setSelectedCartSlugs((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  };

  const toggleSelectAllCart = () => {
    setSelectedCartSlugs((current) =>
      current.length === cartItems.length ? [] : cartItems.map((item) => item.slug),
    );
  };

  const handleCheckout = () => {
    const selectedItems = cartItems.filter((item) => selectedCartSlugs.includes(item.slug));

    if (selectedItems.length === 0) return;

    window.localStorage.setItem("moco-checkout-items", JSON.stringify(selectedItems));
    setIsCartOpen(false);
    router.push("/checkout");
  };

  const handleLogout = () => {
    signOutUser();
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsAccountOpen(false);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedQuery = searchQuery.trim().toLowerCase();
    let target = "/support";

    if (
      normalizedQuery.includes("li\u00ean h\u1ec7") ||
      normalizedQuery.includes("contact")
    ) {
      target = "/contact";
    } else if (
      normalizedQuery.includes("pin") ||
      normalizedQuery.includes("bay") ||
      normalizedQuery.includes("gps") ||
      normalizedQuery.includes("kh\u00f3a")
    ) {
      target = "/product";
    } else if (
      normalizedQuery.includes("product") ||
      normalizedQuery.includes("s\u1ea3n ph\u1ea9m") ||
      normalizedQuery.includes("vali")
    ) {
      target = "/product";
    } else if (
      normalizedQuery.includes("faq") ||
      normalizedQuery.includes("c\u00e2u h\u1ecfi")
    ) {
      target = "/contact";
    }

    setIsSearchOpen(false);
    window.setTimeout(() => router.push(target), 0);
  };

  const currentCopy = copy[language];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedCartItems = cartItems.filter((item) => selectedCartSlugs.includes(item.slug));
  const selectedCartCount = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = selectedCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const isEveryCartItemSelected = cartItems.length > 0 && selectedCartSlugs.length === cartItems.length;
  const currency = new Intl.NumberFormat("vi-VN").format;
  const translatedNavItems = [
    [currentCopy.nav.home, "/"],
    [currentCopy.nav.product, "/product"],
    [currentCopy.nav.about, "/about"],
    [currentCopy.nav.contact, "/contact"],
  ] as const;

  return (
    <>
      <div className="top-bar">
        <span>{currentCopy.topWelcome}</span>
        <span>mocoluggage@gmail.com</span>
      </div>
      <header className="site-header">
        <a className="brand" href="/" aria-label="MOCO home">
          <Image
            src="/assets/logo.jpg"
            alt="MOCO logo"
            width={60}
            height={40}
            style={{ objectFit: "contain", width: "auto", height: "auto" }}
          />
        </a>
        <div className="header-main-nav">
          <nav
            className="nav"
            aria-label={
              language === "vi"
                ? "\u0110i\u1ec1u h\u01b0\u1edbng ch\u00ednh"
                : "Main navigation"
            }
          >
            {translatedNavItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={
                  pathname === href
                    ? "active"
                    : ""
                }
                onClick={() => handleNavClick(href)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <div className="divider"></div>
            <Link
              href="/support"
              className={`action-item action-support${pathname === "/support" ? " active" : ""}`}
              onClick={() => handleNavClick("/support")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
              <span>{currentCopy.support}</span>
            </Link>
            <button
              className="action-item action-search"
              type="button"
              aria-expanded={isSearchOpen}
              aria-controls="site-search-panel"
              onClick={() => {
                setActiveSection("#search");
                setIsAccountOpen(false);
                setIsCartOpen(false);
                setIsSearchOpen((open) => !open);
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>{currentCopy.search}</span>
            </button>
            <button
              className={`action-item action-cart${activeSection === "#cart" ? " active" : ""}${isCartPulsing ? " cart-pulse" : ""}`}
              type="button"
              aria-expanded={isCartOpen}
              onClick={() => {
                setActiveSection("#cart");
                setIsSearchOpen(false);
                setIsAccountOpen(false);
                setIsCartOpen(true);
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>{currentCopy.cart}</span>
              {cartCount > 0 && <b className="cart-badge">{cartCount}</b>}
            </button>
            <button
              className="lang-switch"
              type="button"
              aria-label={
                language === "vi"
                  ? "Chuy\u1ec3n sang ti\u1ebfng Anh"
                  : "Switch to Vietnamese"
              }
              onClick={() =>
                setLanguage((current) => (current === "vi" ? "en" : "vi"))
              }
            >
              <span className={language === "vi" ? "active" : ""}>VI</span>
              <span aria-hidden="true">/</span>
              <span className={language === "en" ? "active" : ""}>EN</span>
            </button>
            <div className="account-menu" ref={accountMenuRef}>
              <button
                className={`action-item action-account${isAccountOpen ? " active" : ""}`}
                type="button"
                aria-expanded={isAccountOpen}
                onClick={() => {
                  setIsAccountOpen((open) => !open);
                  setIsSearchOpen(false);
                  setIsCartOpen(false);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>
                  {isLoggedIn && userInfo?.name
                    ? userInfo.name
                    : currentCopy.account}
                </span>
              </button>

              {isAccountOpen && (
                <div className="account-dropdown">
                  <div className="account-dropdown-header flex-col items-center">
                    {isLoggedIn ? (
                      <div className="w-full flex flex-col items-center">
                        {userInfo && (
                          <div className="mb-4 text-center w-full overflow-hidden">
                            <div className="font-bold text-white text-[15px] truncate px-2">
                              {userInfo.name}
                            </div>
                            <div className="text-gray-400 text-[13px] truncate px-2 mt-0.5">
                              {userInfo.email}
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          className="auth-btn"
                          onClick={handleLogout}
                        >
                          {currentCopy.logout}
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/login"
                        className="auth-btn"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        {currentCopy.login}
                      </Link>
                    )}
                  </div>
                  <div className="account-dropdown-divider"></div>
                  <div className="account-dropdown-links">
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          <span>🔐 Admin Panel</span>
                        </Link>
                        <div className="border-b border-gray-600 my-1"></div>
                      </>
                    )}
                    <Link
                      href="/register-product"
                      onClick={() => setIsAccountOpen(false)}
                    >
                      <span>{currentCopy.registerProduct}</span>
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setIsAccountOpen(false)}
                    >
                      <span>{currentCopy.profile}</span>
                    </Link>
                    <Link
                      href="/order"
                      onClick={() => setIsAccountOpen(false)}
                    >
                      <span>{currentCopy.orders}</span>
                    </Link>
                    <Link
                      href="/product"
                      onClick={() => handleNavClick("/product")}
                    >
                      <span>{currentCopy.favorites}</span>
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => handleNavClick("/contact")}
                    >
                      <span>{currentCopy.coupons}</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
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
            <form
              className="search-entry-bar shadow-inner"
              role="search"
              onSubmit={handleSearchSubmit}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
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
                  const href =
                    index === 1
                      ? "/product"
                      : index === 3
                        ? "/contact"
                        : "/contact";

                  return (
                    <li key={link}>
                      <Link href={href} onClick={() => setIsSearchOpen(false)}>
                        {link}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
      {isCartOpen && (
        <div
          className="cart-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
          onClick={() => setIsCartOpen(false)}
        >
          <aside
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-drawer-header">
              <h2 id="cart-drawer-title">
                {language === "vi" ? "Giỏ hàng" : "Cart"} ({cartCount})
              </h2>
              <button
                className="cart-close-btn"
                type="button"
                aria-label="Close cart"
                onClick={() => setIsCartOpen(false)}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="cart-empty-state">
                <div className="cart-empty-icon">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <p>Your cart is empty</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    window.location.href = "/product";
                  }}
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              <>
                <label className="cart-select-all">
                  <input
                    type="checkbox"
                    checked={isEveryCartItemSelected}
                    onChange={toggleSelectAllCart}
                  />
                  <span>{language === "vi" ? "Chọn tất cả" : "Select all"}</span>
                  <strong>
                    {selectedCartCount} {language === "vi" ? "sản phẩm đã chọn" : "selected"}
                  </strong>
                </label>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <article className={`cart-item${selectedCartSlugs.includes(item.slug) ? " selected" : ""}`} key={item.slug}>
                      <label className="cart-item-check" aria-label={`Select ${item.name}`}>
                        <input
                          type="checkbox"
                          checked={selectedCartSlugs.includes(item.slug)}
                          onChange={() => toggleCartItemSelection(item.slug)}
                        />
                      </label>
                      <Image src={item.image} alt="" width={68} height={68} />
                      <div className="cart-item-main">
                        <span>{item.store}</span>
                        <strong>{item.name}</strong>
                        <p>{item.subtitle}</p>
                        <div className="cart-quantity">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.slug, -1)}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.slug, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-side">
                        <strong>{currency(item.price)} VND</strong>
                        <span>{currency(item.oldPrice)} VND</span>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeCartItem(item.slug)}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M8 6V4h8v2"></path>
                            <path d="m19 6-1 14H6L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                          </svg>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <button className="cart-note-button" type="button">
                  ADD ORDER NOTE
                </button>
                <div className="cart-footer">
                  <div>
                    <span>{language === "vi" ? "Tổng tiền sản phẩm đã chọn" : "Selected total"}</span>
                    <strong>{currency(cartTotal)} VND</strong>
                  </div>
                  <div className="cart-actions">
                    <button type="button" onClick={toggleSelectAllCart}>
                      {isEveryCartItemSelected
                        ? language === "vi"
                          ? "BỎ CHỌN"
                          : "CLEAR"
                        : language === "vi"
                          ? "CHỌN TẤT CẢ"
                          : "SELECT ALL"}
                    </button>
                    <button type="button" disabled={selectedCartItems.length === 0} onClick={handleCheckout}>
                      {language === "vi" ? "THANH TOÁN" : "CHECK OUT"}
                    </button>
                  </div>
                  <p>
                    {language === "vi"
                      ? "Bạn chỉ thanh toán các sản phẩm đã chọn. Phí vận chuyển và voucher sẽ được tính ở bước checkout."
                      : "Only selected items will be checked out. Shipping and vouchers are calculated at checkout."}
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
