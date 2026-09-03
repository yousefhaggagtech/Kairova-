"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Menu, X } from "lucide-react";

import { useAuthMe } from "@/application/hooks/useAuthMe";
import { useAuthStore } from "@/application/store/authStore";
import { useCartStore } from "@/application/store/cartStore";
import CartDrawer from "@/components/cart/CartDrawer";
import type { Locale } from "@/src/i18n/config";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";

import Logo from "./Logo";

type MenuKey = "men" | "women";

type NavProduct = {
  href: string;
  image: string;
  name: string;
};

type NavBranch = {
  href: string;
  labelKey: string;
  products?: NavProduct[];
};

type NavTree = {
  allHref: string;
  allLabelKey: string;
  branches: NavBranch[];
};

const NAV_TREES: Record<MenuKey, NavTree> = {
  men: {
    allHref: "/men",
    allLabelKey: "allMens",
    branches: [
      {
        href: "/category/men-watches",
        labelKey: "watches",
        products: [
          {
            href: "/product/kairova-royal-automatic-silver-men-watch",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/watches/kairova-royal-automatic-silver-men-watch.jpeg?updatedAt=1787938134070",
            name: "Kairova Royal Automatic",
          },
          {
            href: "/product/kairova-legacy-automatic-silver-men-watch",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/watches/kairova-legacy-automatic-silver-men-watch.jpeg?updatedAt=1787938287575",
            name: "Kairova Legacy Automatic",
          },
          {
            href: "/product/kairova-apex-chronograph-silver-men-watch",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/watches/kairova-apex-chronograph-silver-men-watch.jpeg?updatedAt=1787938287884",
            name: "Kairova Apex Chronograph",
          },
        ],
      },
      {
        href: "/category/men-perfume",
        labelKey: "perfume",
        products: [
          {
            href: "/product/kairova-sovereign-oud-eau-de-parfum-men-perfume",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/kairova-sovereign-oud-eau-de-parfum-men-perfume.jpeg?updatedAt=1787938411787",
            name: "Kairova Sovereign Oud",
          },
          {
            href: "/product/kairova-noir-leather-100ml-men-perfume",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/kairova-noir-leather-100ml-men-perfume.jpeg?updatedAt=1787938412049",
            name: "Kairova Noir Leather",
          },
          {
            href: "/product/kairova-bloom-vanilla-100ml-women-perfume",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/kairova-bloom-vanilla-100ml-women-perfume.jpeg?updatedAt=1787938411471",
            name: "Kairova Bloom Vanilla",
          },
        ],
      },
      {
        href: "/category/men-accessories",
        labelKey: "accessories",
        products: [
          {
            href: "/product/kairova-titan-braided-leather-silver-men-bracelet",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/accessories/kairova-titan-braided-leather-silver-men-bracelet.jpeg?updatedAt=1787938525463",
            name: "Kairova Titan Braided Leather",
          },
          {
            href: "/product/kairova-monarch-silver-onyx-men-cufflinks",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/accessories/kairova-monarch-silver-onyx-men-cufflinks.jpeg?updatedAt=1787938525725",
            name: "Kairova Monarch Onyx Cufflinks",
          },
        ],
      },
      { href: "/category/men-belts", labelKey: "belts" },
      { href: "/category/men-wallets", labelKey: "wallets" },
    ],
  },
  women: {
    allHref: "/women",
    allLabelKey: "allWomens",
    branches: [
      {
        href: "/category/women-watches",
        labelKey: "watches",
        products: [
          {
            href: "/product/kairova-aura-mesh-gold-women-watch",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/watches/kairova-aura-mesh-gold-women-watch.jpeg?updatedAt=1787938288552",
            name: "Kairova Aura Mesh",
          },
          {
            href: "/product/kairova-elise-diamond-gold-women-watch",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/watches/kairova-elise-diamond-gold-women-watch.jpeg?updatedAt=1787938288475",
            name: "Kairova Elise Diamond",
          },
          {
            href: "/product/kairova-celeste-petite-gold-women-watch",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/watches/kairova-celeste-petite-gold-women-watch.jpeg?updatedAt=1787938288174",
            name: "Kairova Celeste Petite",
          },
        ],
      },
      {
        href: "/category/women-perfume",
        labelKey: "perfume",
        products: [
          {
            href: "/product/kairova-elixir-jasmine-intense-women-perfume",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/kairova-elixir-jasmine-intense-women-perfume.jpeg?updatedAt=1787938412858",
            name: "Kairova Elixir Jasmine",
          },
          {
            href: "/product/kairova-velvet-rose-eau-de-parfum-women-perfume",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/kairova-velvet-rose-eau-de-parfum-women-perfume.jpeg?updatedAt=1787938412471",
            name: "Kairova Velvet Rose",
          },
          {
            href: "/product/kairova-absolute-amber-intense-men-perfume",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/kairova-absolute-amber-intense-men-perfume.jpeg?updatedAt=1787938411136",
            name: "Kairova Absolute Amber",
          },
        ],
      },
      {
        href: "/category/women-accessories",
        labelKey: "accessories",
        products: [
          {
            href: "/product/kairova-luna-crystal-pendant-gold-women-necklace",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/accessories/kairova-luna-crystal-pendant-gold-women-necklace.jpeg?updatedAt=1787938525283",
            name: "Kairova Luna Crystal Pendant",
          },
          {
            href: "/product/kairova-verona-pearl-charm-silver-women-bracelet",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/accessories/kairova-verona-pearl-charm-silver-women-bracelet.jpeg?updatedAt=1787938525041",
            name: "Kairova Verona Pearl Charm",
          },
          {
            href: "/product/kairova-solaris-hoop-gold-women-earrings",
            image:
              "https://ik.imagekit.io/1pscfy7oah/kiarova/accessories/kairova-solaris-hoop-gold-women-earrings.jpeg?updatedAt=1787938524934",
            name: "Kairova Solaris Hoop",
          },
        ],
      },
    ],
  },
};

const navTextClass =
  "inline-flex min-h-11 cursor-pointer items-center whitespace-nowrap text-caption font-medium uppercase transition-colors duration-200 hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none";

const iconButtonClass =
  "relative inline-flex h-11 w-11 cursor-pointer items-center justify-center transition-colors duration-200 hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none";

const mobileMenuLinkClass =
  "flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 border-b border-border-light py-3 text-start text-body font-medium text-fg-secondary transition-colors duration-200 hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none";

const mobileUtilityLinkClass =
  "inline-flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 border border-border-light px-4 text-body text-fg-secondary transition-colors duration-200 hover:border-fg-secondary hover:bg-bg-secondary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg-secondary";

function SearchIcon({ title }: { title: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      height="20"
      width="20"
      fill="none"
      focusable="false"
      role="img"
    >
      <title>{title}</title>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M10.034 2.93c-5.87 2.516-8.606 9.354-6.111 15.273s9.275 8.679 15.144 6.163c.78-.334 1.506-.745 2.17-1.22l6.085 6.545a.965.965 0 0 0 1.371.044.984.984 0 0 0 .044-1.383l-6.015-6.47a11.72 11.72 0 0 0 2.456-12.788C22.684 3.174 15.903.415 10.034 2.93M5.709 17.439c-2.075-4.924.201-10.613 5.084-12.706s10.524.203 12.599 5.127c2.075 4.925-.201 10.613-5.084 12.706s-10.524-.203-12.599-5.127"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AccountIcon({ title }: { title: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      height="20"
      width="20"
      fill="none"
      focusable="false"
      role="img"
    >
      <title>{title}</title>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M15.937 2h.126c.52 0 .856 0 1.144.028a6 6 0 0 1 5.421 5.822c.007.29-.017.624-.054 1.143l-.223 3.125c-.02.288-.034.475-.055.64a6 6 0 0 1-.782 2.29c1.417.65 3.395 1.756 5.085 3.244.895.789 1.364 1.91 1.392 3.055.053 2.217-.1 5.742-1.047 8.48a1 1 0 1 1-1.89-.654c.828-2.393.989-5.627.937-7.778-.015-.637-.273-1.214-.714-1.602-1.745-1.536-3.87-2.636-5.122-3.158a6 6 0 0 1-3.478 1.356c-.167.009-.353.009-.642.009h-.07c-.288 0-.476 0-.642-.01a6 6 0 0 1-3.478-1.355c-1.251.522-3.378 1.622-5.122 3.158-.44.388-.7.965-.714 1.602-.052 2.15.109 5.385.937 7.778a1 1 0 1 1-1.89.654c-.948-2.738-1.1-6.263-1.047-8.48.028-1.144.497-2.266 1.392-3.055 1.69-1.488 3.668-2.594 5.085-3.245a6 6 0 0 1-.782-2.288 12 12 0 0 1-.055-.64l-.224-3.126c-.037-.519-.06-.853-.053-1.143a6 6 0 0 1 5.42-5.822C15.083 2 15.417 2 15.938 2M16 4c-.605 0-.835.001-1.015.019a4 4 0 0 0-3.614 3.88c-.004.181.01.411.054 1.015l.216 3.028c.024.334.034.46.047.564a4 4 0 0 0 3.746 3.488c.104.006.23.006.566.006s.462 0 .566-.006a4 4 0 0 0 3.746-3.488c.013-.104.023-.23.047-.565l.216-3.027c.043-.604.058-.834.054-1.014a4 4 0 0 0-3.614-3.881C16.835 4 16.605 4 16 4"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CartIcon({ title }: { title: string }) {
  return (
    <svg
      focusable="false"
      height="20"
      role="presentation"
      viewBox="0 0 32 32"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <path
        fill="currentColor"
        clipRule="evenodd"
        d="M0.819824 2C0.819824 1.44772 1.26754 1 1.81982 1H4.51982C5.45524 1 6.26571 1.64837 6.47104 2.56097L7.01982 5H28.6216C29.8694 5 30.8126 6.13009 30.5894 7.35777L29.2516 14.7155C28.9058 16.6175 27.2492 18 25.3161 18H9.94482L10.093 18.6585C10.401 20.0274 11.6167 21 13.0198 21H27.8198C28.3721 21 28.8198 21.4477 28.8198 22C28.8198 22.5523 28.3721 23 27.8198 23H13.0198C10.6813 23 8.65511 21.3791 8.14178 19.0976L4.51982 3H1.81982C1.26754 3 0.819824 2.55228 0.819824 2ZM9.49482 16H25.3161C26.2827 16 27.1109 15.3088 27.2838 14.3578L28.6216 7H7.46982L9.49482 16Z"
        fillRule="evenodd"
      />
      <path
        fill="currentColor"
        clipRule="evenodd"
        d="M14.8198 27.5C14.8198 29.433 13.2528 31 11.3198 31C9.38683 31 7.81982 29.433 7.81982 27.5C7.81982 25.567 9.38683 24 11.3198 24C13.2528 24 14.8198 25.567 14.8198 27.5ZM12.8198 27.5C12.8198 28.3284 12.1483 29 11.3198 29C10.4914 29 9.81982 28.3284 9.81982 27.5C9.81982 26.6716 10.4914 26 11.3198 26C12.1483 26 12.8198 26.6716 12.8198 27.5Z"
        fillRule="evenodd"
      />
      <path
        fill="currentColor"
        clipRule="evenodd"
        d="M28.8198 27.5C28.8198 29.433 27.2528 31 25.3198 31C23.3868 31 21.8198 29.433 21.8198 27.5C21.8198 25.567 23.3868 24 25.3198 24C27.2528 24 28.8198 25.567 28.8198 27.5ZM26.8198 27.5C26.8198 28.3284 26.1483 29 25.3198 29C24.4914 29 23.8198 28.3284 23.8198 27.5C23.8198 26.6716 24.4914 26 25.3198 26C26.1483 26 26.8198 26.6716 26.8198 27.5Z"
        fillRule="evenodd"
      />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="20"
      viewBox="0 0 32 32"
      width="20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 16h26M16 3c3.2 3.4 4.8 7.7 4.8 13S19.2 25.6 16 29M16 3c-3.2 3.4-4.8 7.7-4.8 13S12.8 25.6 16 29"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const isHomeRoute = pathname === "/";
  const headerRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const lastScrollYRef = useRef(0);
  const hiddenRef = useRef(false);
  const previousPathnameRef = useRef(pathname);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);
  const hasCartHydrated = useCartStore((state) => state.hasHydrated);
  const itemCount = useCartStore((state) => state.getItemCount());
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollState, setScrollState] = useState({
    hidden: false,
    atTop: isHomeRoute,
    pastHero: !isHomeRoute,
  });

  useAuthMe({
    enabled: hasAuthHydrated && isAuthenticated && Boolean(user?.id),
  });

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;

    const resetTimeout = window.setTimeout(() => {
      setActiveMenu(null);
      setIsMobileMenuOpen(false);
      setIsSearchOpen(false);
      setIsCartOpen(false);
    }, 0);

    return () => {
      window.clearTimeout(resetTimeout);
    };
  }, [pathname]);

  useEffect(() => {
    function getHeaderChromeHeight() {
      const headerChrome = headerRef.current?.firstElementChild;

      if (headerChrome instanceof HTMLElement) {
        return headerChrome.getBoundingClientRect().height;
      }

      return headerRef.current?.getBoundingClientRect().height ?? 80;
    }

    function getHeroThreshold() {
      if (!isHomeRoute) {
        return 0;
      }

      const hero = document.querySelector<HTMLElement>("[data-section='hero']");
      const heroHeight = hero?.getBoundingClientRect().height ?? window.innerHeight;
      const headerHeight = getHeaderChromeHeight();

      return Math.max(heroHeight - headerHeight, 0);
    }

    function updateScrollState() {
      const currentY = Math.max(window.scrollY, 0);
      const threshold = getHeroThreshold();
      const atTop = isHomeRoute ? currentY <= 8 : false;
      const pastHero = isHomeRoute ? currentY > threshold : true;
      const delta = currentY - lastScrollYRef.current;
      let hidden = hiddenRef.current;

      if (!pastHero || atTop) {
        hidden = false;
      } else if (Math.abs(delta) > 4) {
        hidden = delta > 0;
      }

      hiddenRef.current = hidden;
      lastScrollYRef.current = currentY;
      setScrollState({ hidden, atTop, pastHero });
    }

    lastScrollYRef.current = Math.max(window.scrollY, 0);
    hiddenRef.current = false;
    updateScrollState();

    const resizeObserver =
      isHomeRoute && "ResizeObserver" in window
        ? new ResizeObserver(() => updateScrollState())
        : null;
    const hero = isHomeRoute
      ? document.querySelector<HTMLElement>("[data-section='hero']")
      : null;
    const headerChrome = headerRef.current?.firstElementChild;

    if (hero) {
      resizeObserver?.observe(hero);
    }

    if (headerChrome instanceof HTMLElement) {
      resizeObserver?.observe(headerChrome);
    }

    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [isHomeRoute]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMenu(null);
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const accountHref =
    hasAuthHydrated && isAuthenticated && user
      ? user.role === "admin"
        ? "/admin"
        : "/account"
      : "/auth/login";
  const accountLabel =
    hasAuthHydrated && isAuthenticated && user
      ? user.role === "admin"
        ? t("adminDashboard")
        : t("account")
      : t("login");
  const nextLocale: Locale = locale === "ar" ? "en" : "ar";
  const nextLocaleLabel = nextLocale === "ar" ? t("arabic") : t("english");
  const isPanelOpen =
    activeMenu !== null || isMobileMenuOpen || isSearchOpen || isCartOpen;
  const isSolid = isPanelOpen || !isHomeRoute || !scrollState.atTop;
  const isHidden = !isPanelOpen && scrollState.hidden;
  const logoStyle = {
    "--kairova-logo-filter": isSolid
      ? "brightness(0)"
      : "brightness(0) invert(1)",
  } as CSSProperties;
  const activeMenuTree = activeMenu ? NAV_TREES[activeMenu] : null;

  function toggleMenu(menu: MenuKey) {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setActiveMenu((currentMenu) => (currentMenu === menu ? null : menu));
  }

  function toggleMobileMenu() {
    setActiveMenu(null);
    setIsSearchOpen(false);
    setIsMobileMenuOpen((currentValue) => !currentValue);
  }

  function toggleMobileCollection(menu: MenuKey) {
    setActiveMenu((currentMenu) => (currentMenu === menu ? null : menu));
  }

  function closeNavigationPanels() {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }

  function toggleSearch() {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
    setIsSearchOpen((currentValue) => !currentValue);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim().replace(/\s+/g, " ");

    if (!query) {
      searchInputRef.current?.focus();
      return;
    }

    setActiveMenu(null);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  function openCart() {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsCartOpen(true);
  }

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 z-50 [inset-inline:0] transition-[background-color,color,transform] duration-300 ease-out ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        } ${
          isSolid
            ? "bg-bg-secondary text-fg-secondary shadow-[0_1px_0_rgba(10,10,10,0.08)]"
            : "bg-transparent text-fg-primary"
        }`}
        style={logoStyle}
      >
        <div className="relative mx-auto grid min-h-20 w-full max-w-[var(--max-content)] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 ps-3 pe-3 sm:ps-6 sm:pe-6 md:ps-10 md:pe-10">
          <div className="flex min-w-0 items-center justify-start">
            <button
              type="button"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center transition-colors duration-200 hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none lg:hidden"
              aria-label={t(isMobileMenuOpen ? "closeMenu" : "openMenu")}
              aria-expanded={isMobileMenuOpen}
              aria-controls="navbar-mobile-menu"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X aria-hidden="true" className="h-5 w-5 stroke-[1.7]" />
              ) : (
                <Menu aria-hidden="true" className="h-5 w-5 stroke-[1.7]" />
              )}
            </button>

            <nav
              className="hidden min-w-0 items-center justify-start gap-6 lg:flex xl:gap-8"
              aria-label={t("primary")}
            >
              <button
                type="button"
                className={navTextClass}
                aria-expanded={activeMenu === "men"}
                aria-controls="navbar-menu-panel"
                onClick={() => toggleMenu("men")}
              >
                {t("men")}
              </button>
              <button
                type="button"
                className={navTextClass}
                aria-expanded={activeMenu === "women"}
                aria-controls="navbar-menu-panel"
                onClick={() => toggleMenu("women")}
              >
                {t("women")}
              </button>
              <Link href="/about" className={navTextClass}>
                {t("ourStory")}
              </Link>
            </nav>
          </div>

          <Link
            href="/"
            aria-label={t("home")}
            className="kairova-nav-logo-link inline-flex cursor-pointer items-center justify-center justify-self-center transition-colors duration-200 focus-visible:outline-none"
            onClick={closeNavigationPanels}
          >
            <Logo className="kairova-nav-logo h-auto w-[82px] sm:w-24 md:w-[120px] lg:w-[132px]" />
          </Link>

          <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2 md:gap-3">
            <Link
              href={pathname}
              locale={nextLocale}
              onMouseEnter={() =>
                router.prefetch(pathname, { locale: nextLocale })
              }
              onFocus={() => router.prefetch(pathname, { locale: nextLocale })}
              className="relative hidden h-11 w-11 cursor-pointer items-center justify-center gap-1 transition-colors duration-200 hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none lg:inline-flex lg:w-14"
              aria-label={t("switchLanguage", { locale: nextLocaleLabel })}
              title={t("switchLanguage", { locale: nextLocaleLabel })}
            >
              <LanguageIcon />
              <span className="text-[0.625rem] font-semibold uppercase leading-none">
                {nextLocale.toUpperCase()}
              </span>
            </Link>
            <button
              type="button"
              className={iconButtonClass}
              aria-label={t("search")}
              aria-expanded={isSearchOpen}
              aria-controls="navbar-search-panel"
              onClick={toggleSearch}
            >
              <SearchIcon title={t("search")} />
            </button>
            <Link
              href={accountHref}
              className={`${iconButtonClass} hidden sm:inline-flex`}
              aria-label={accountLabel}
              title={accountLabel}
            >
              <AccountIcon title={accountLabel} />
            </Link>
            <button
              type="button"
              className={iconButtonClass}
              aria-label={t("cart")}
              aria-expanded={isCartOpen}
              aria-controls="cart-drawer"
              title={t("cart")}
              onClick={openCart}
            >
              <CartIcon title={t("cart")} />
              {hasCartHydrated && itemCount > 0 ? (
                <span className="absolute end-0 top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-fg-secondary px-1 text-[0.625rem] leading-none text-bg-secondary">
                  {itemCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div
          id="navbar-mobile-menu"
          className={`overflow-hidden border-border-light bg-surface-light text-fg-secondary shadow-[0_18px_52px_rgba(10,10,10,0.10)] transition-[max-height,opacity] duration-300 ease-out lg:hidden ${
            isMobileMenuOpen
              ? "max-h-[calc(100svh-5rem)] border-t opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="max-h-[calc(100svh-5rem)] overflow-y-auto">
            <nav
              aria-label={t("primary")}
              className="mx-auto w-full max-w-[var(--max-content)] px-4 py-6 text-start sm:px-6 md:px-10"
            >
              <div className="space-y-2">
                {(["men", "women"] as const).map((menuKey) => {
                  const tree = NAV_TREES[menuKey];
                  const isExpanded = activeMenu === menuKey;

                  return (
                    <div key={menuKey}>
                      <button
                        type="button"
                        className={mobileMenuLinkClass}
                        aria-expanded={isExpanded}
                        aria-controls={`navbar-mobile-${menuKey}-panel`}
                        onClick={() => toggleMobileCollection(menuKey)}
                      >
                        <span>{t(menuKey)}</span>
                        <span
                          aria-hidden="true"
                          className="text-h3 leading-none text-fg-muted"
                        >
                          {isExpanded ? "-" : "+"}
                        </span>
                      </button>

                      <div
                        id={`navbar-mobile-${menuKey}-panel`}
                        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                          isExpanded
                            ? "max-h-[90rem] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="border-b border-border-light pb-5 ps-4">
                          <Link
                            href={tree.allHref}
                            className="flex min-h-11 cursor-pointer items-center text-caption font-medium uppercase text-fg-muted transition-colors duration-200 hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none"
                            onClick={closeNavigationPanels}
                          >
                            {t(tree.allLabelKey)}
                          </Link>

                          <ul className="mt-3 grid gap-4">
                            {tree.branches.map((branch) => (
                              <li
                                key={branch.href}
                                className="border-s border-border-light ps-4"
                              >
                                <Link
                                  href={branch.href}
                                  className="flex min-h-11 cursor-pointer items-center text-body font-medium text-fg-secondary transition-colors duration-200 hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none"
                                  onClick={closeNavigationPanels}
                                >
                                  {t(branch.labelKey)}
                                </Link>

                                {branch.products?.length ? (
                                  <ul className="mt-2 grid gap-2">
                                    {branch.products.map((product) => (
                                      <li key={product.href}>
                                        <Link
                                          href={product.href}
                                          className="group grid min-h-16 cursor-pointer grid-cols-[56px_minmax(0,1fr)] items-center gap-3 transition-colors duration-200 hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none"
                                          onClick={closeNavigationPanels}
                                        >
                                          <span className="relative block aspect-[4/5] overflow-hidden bg-surface-light">
                                            <Image
                                              src={product.image}
                                              alt={product.name}
                                              fill
                                              sizes="56px"
                                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                          </span>
                                          <span className="break-words text-caption leading-body">
                                            {product.name}
                                          </span>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Link
                  href="/about"
                  className={mobileMenuLinkClass}
                  onClick={closeNavigationPanels}
                >
                  <span>{t("ourStory")}</span>
                </Link>
              </div>

              <div className="mt-6 grid gap-3 border-t border-border-light pt-5 sm:grid-cols-2">
                <Link
                  href={accountHref}
                  className={mobileUtilityLinkClass}
                  onClick={closeNavigationPanels}
                >
                  <span>{accountLabel}</span>
                  <AccountIcon title={accountLabel} />
                </Link>
                <Link
                  href={pathname}
                  locale={nextLocale}
                  onMouseEnter={() =>
                    router.prefetch(pathname, { locale: nextLocale })
                  }
                  onFocus={() => router.prefetch(pathname, { locale: nextLocale })}
                  className={mobileUtilityLinkClass}
                  aria-label={t("switchLanguage", {
                    locale: nextLocaleLabel,
                  })}
                  onClick={closeNavigationPanels}
                >
                  <span>{t("switchLanguage", { locale: nextLocaleLabel })}</span>
                  <span className="text-caption font-semibold uppercase">
                    {nextLocale.toUpperCase()}
                  </span>
                </Link>
              </div>
            </nav>
          </div>
        </div>

        <div
          id="navbar-menu-panel"
          className={`hidden overflow-hidden border-border-light bg-surface-light text-fg-secondary shadow-[0_18px_52px_rgba(10,10,10,0.10)] transition-[max-height,opacity] duration-300 ease-out lg:block ${
            activeMenu
              ? "max-h-[calc(100svh-5rem)] border-t opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="max-h-[calc(100svh-5rem)] overflow-y-auto">
            <div className="mx-auto w-full max-w-[var(--max-content)] ps-4 pe-4 pt-7 pb-9 sm:ps-6 sm:pe-6 md:ps-10 md:pe-10">
              {activeMenuTree ? (
                <nav
                  aria-label={t("menuTree", {
                    collection:
                      activeMenu === "men" ? t("men") : t("women"),
                  })}
                  className="text-start"
                >
                  <Link
                    href={activeMenuTree.allHref}
                    className="inline-flex cursor-pointer text-caption font-medium uppercase text-fg-muted transition-colors duration-200 hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none"
                    onClick={() => setActiveMenu(null)}
                  >
                    {t(activeMenuTree.allLabelKey)}
                  </Link>

                  <ul className="mt-6 grid gap-7 lg:grid-cols-3">
                    {activeMenuTree.branches.map((branch) => (
                      <li
                        key={branch.href}
                        className="border-s border-border-light ps-4"
                      >
                        <Link
                          href={branch.href}
                          className="block cursor-pointer text-body-lg font-medium text-fg-secondary transition-colors duration-200 hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none"
                          onClick={() => setActiveMenu(null)}
                        >
                          {t(branch.labelKey)}
                        </Link>

                        {branch.products?.length ? (
                          <ul className="mt-4 grid gap-3">
                            {branch.products.map((product) => (
                              <li key={product.href}>
                                <Link
                                  href={product.href}
                                  className="group grid cursor-pointer grid-cols-[72px_1fr] items-center gap-3 transition-colors duration-200 hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <span className="relative block aspect-[4/5] overflow-hidden bg-surface-light">
                                    <Image
                                      src={product.image}
                                      alt={product.name}
                                      fill
                                      sizes="72px"
                                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                  </span>
                                  <span className="text-caption leading-body">
                                    {product.name}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}
            </div>
          </div>
        </div>

        <div
          id="navbar-search-panel"
          className={`overflow-hidden border-border-light bg-surface-light text-fg-secondary shadow-[0_18px_52px_rgba(10,10,10,0.10)] transition-[max-height,opacity] duration-300 ease-out ${
            isSearchOpen ? "max-h-40 border-t opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-auto w-full max-w-[var(--max-content)] ps-4 pe-4 py-6 sm:ps-6 sm:pe-6 md:ps-10 md:pe-10">
            <form
              className="flex items-end gap-4"
              onSubmit={handleSearchSubmit}
            >
              <div className="min-w-0 flex-1">
                <label htmlFor="navbar-search-input" className="sr-only">
                  {t("searchProducts")}
                </label>
                <input
                  ref={searchInputRef}
                  id="navbar-search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full border-0 border-b border-border-light bg-transparent py-3 text-body text-fg-secondary outline-none transition-colors placeholder:text-fg-muted focus:border-fg-secondary"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center border border-border-light text-fg-secondary transition-colors duration-200 hover:border-fg-secondary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-secondary"
                aria-label={t("search")}
                title={t("search")}
              >
                <SearchIcon title={t("search")} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {!isHomeRoute ? <div className="h-20 shrink-0" aria-hidden="true" /> : null}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
