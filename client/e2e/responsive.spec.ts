import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

type ResponsiveRoute = {
  label: string;
  path: string;
};

type SlugLookup = {
  slug: string | null;
  note?: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const locales = [
  { locale: "ar", prefix: "" },
  { locale: "en", prefix: "/en" },
] as const;

const viewportCases = [
  { height: 720, name: "mobile-320", width: 320 },
  { height: 812, name: "mobile-375", width: 375 },
  { height: 896, name: "mobile-480", width: 480 },
  { height: 1024, name: "tablet-768", width: 768 },
  { height: 900, name: "desktop-1280", width: 1280 },
] as const;

const staticRoutes = [
  { label: "home", path: "/" },
  { label: "men", path: "/men" },
  { label: "women", path: "/women" },
  { label: "about", path: "/about" },
  { label: "cart", path: "/cart" },
  { label: "checkout", path: "/checkout" },
  { label: "search", path: "/search?q=kairova%20watch" },
  { label: "login", path: "/auth/login" },
  { label: "register", path: "/auth/register" },
  { label: "account", path: "/account" },
  { label: "account addresses", path: "/account/addresses" },
  { label: "account orders", path: "/account/orders" },
  { label: "admin", path: "/admin" },
  { label: "admin orders", path: "/admin/orders" },
  { label: "admin products", path: "/admin/products" },
  { label: "admin product new", path: "/admin/products/new" },
  { label: "admin settings", path: "/admin/settings" },
] as const;

let productLookup: SlugLookup = { slug: null };
let categoryLookup: SlugLookup = { slug: null };

function withLocalePrefix(path: string, prefix: string) {
  if (!prefix) {
    return path;
  }

  return path === "/" ? prefix : `${prefix}${path}`;
}

function localizedRoutes(routes: readonly ResponsiveRoute[]) {
  return routes.flatMap((route) =>
    locales.map(({ locale, prefix }) => ({
      label: `${locale} ${route.label}`,
      path: withLocalePrefix(route.path, prefix),
    })),
  );
}

async function fetchFirstSlug(
  request: APIRequestContext,
  endpoint: string,
  collectionKey: "products" | "categories",
): Promise<SlugLookup> {
  const url = `${apiBaseUrl}${endpoint}`;

  try {
    const response = await request.get(url, { timeout: 10_000 });

    if (!response.ok()) {
      return {
        slug: null,
        note: `${url} returned ${response.status()} ${response.statusText()}`,
      };
    }

    const payload = (await response.json()) as {
      data?: Record<string, Array<{ slug?: unknown }>>;
    };
    const items = payload.data?.[collectionKey];

    if (!Array.isArray(items) || items.length === 0) {
      return { slug: null, note: `${url} returned no ${collectionKey}` };
    }

    const item = items.find(
      (candidate) =>
        typeof candidate.slug === "string" && candidate.slug.length > 0,
    );

    if (!item || typeof item.slug !== "string") {
      return {
        slug: null,
        note: `${url} returned ${collectionKey} without a usable slug`,
      };
    }

    return { slug: item.slug };
  } catch (error) {
    return {
      slug: null,
      note: `${url} could not be fetched: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

async function assertNoHorizontalOverflow(page: Page, context: string) {
  let metrics:
    | {
        offenders: Array<{
          className: string;
          left: number;
          right: number;
          tag: string;
          text: string;
          width: number;
        }>;
        overflow: number;
        scrollWidth: number;
        viewportWidth: number;
      }
    | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      metrics = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const scrollWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
        );

        function hasOverflowBoundary(element: Element) {
          let ancestor = element.parentElement;

          while (ancestor && ancestor !== document.body) {
            const overflowX = window.getComputedStyle(ancestor).overflowX;

            if (
              overflowX === "auto" ||
              overflowX === "scroll" ||
              overflowX === "hidden" ||
              overflowX === "clip"
            ) {
              return true;
            }

            ancestor = ancestor.parentElement;
          }

          return false;
        }

        const offenders = Array.from(document.body.querySelectorAll("*"))
          .filter((element) => !element.closest("[inert]"))
          .filter((element) => !hasOverflowBoundary(element))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const className =
              typeof element.className === "string" ? element.className : "";
            const text = element.textContent?.trim().replace(/\s+/g, " ");

            return {
              className: className.slice(0, 120),
              left: Math.floor(rect.left),
              right: Math.ceil(rect.right),
              tag: element.tagName.toLowerCase(),
              text: text ? text.slice(0, 80) : "",
              width: Math.ceil(rect.width),
            };
          })
          .filter(
            (element) =>
              element.width > 0 &&
              (element.left < -2 || element.right > viewportWidth + 2),
          )
          .slice(0, 10);

        return {
          offenders,
          overflow: scrollWidth - viewportWidth,
          scrollWidth,
          viewportWidth,
        };
      });
      break;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(300);
    }
  }

  if (!metrics) {
    throw lastError;
  }

  expect(
    metrics.scrollWidth,
    `${context} overflowed by ${metrics.overflow}px. Offenders: ${JSON.stringify(
      metrics.offenders,
      null,
      2,
    )}`,
  ).toBeLessThanOrEqual(metrics.viewportWidth + 2);
}

async function visitAndAssertResponsive(page: Page, route: ResponsiveRoute) {
  await page.goto(route.path, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load", { timeout: 8_000 }).catch(() => null);
  await page.waitForTimeout(250);
  await assertNoHorizontalOverflow(page, route.path);
}

test.beforeAll(async ({ request }) => {
  productLookup = await fetchFirstSlug(
    request,
    "/api/products?limit=1",
    "products",
  );
  categoryLookup = await fetchFirstSlug(
    request,
    "/api/categories?limit=1",
    "categories",
  );
});

for (const viewport of viewportCases) {
  for (const route of localizedRoutes(staticRoutes)) {
    test(`responsive: ${viewport.name} ${route.label}`, async ({ page }) => {
      await page.setViewportSize({
        height: viewport.height,
        width: viewport.width,
      });
      await visitAndAssertResponsive(page, route);
    });
  }

  for (const { locale, prefix } of locales) {
    test(`responsive: ${viewport.name} ${locale} product detail`, async ({
      page,
    }) => {
      const path = productLookup.slug
        ? withLocalePrefix(`/product/${productLookup.slug}`, prefix)
        : withLocalePrefix("/product/[slug]", prefix);

      if (!productLookup.slug) {
        test.skip(true, productLookup.note || "No product slug returned by API");
      }

      await page.setViewportSize({
        height: viewport.height,
        width: viewport.width,
      });
      await visitAndAssertResponsive(page, {
        label: `${locale} product detail`,
        path,
      });
    });

    test(`responsive: ${viewport.name} ${locale} category detail`, async ({
      page,
    }) => {
      const path = categoryLookup.slug
        ? withLocalePrefix(`/category/${categoryLookup.slug}`, prefix)
        : withLocalePrefix("/category/[slug]", prefix);

      if (!categoryLookup.slug) {
        test.skip(true, categoryLookup.note || "No category slug returned by API");
      }

      await page.setViewportSize({
        height: viewport.height,
        width: viewport.width,
      });
      await visitAndAssertResponsive(page, {
        label: `${locale} category detail`,
        path,
      });
    });
  }
}

test("responsive: 320px mobile navbar drawer", async ({ page }) => {
  await page.setViewportSize({ height: 720, width: 320 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load", { timeout: 8_000 }).catch(() => null);

  await page.locator("button[aria-controls='navbar-mobile-menu']").click();
  await expect(page.locator("#navbar-mobile-menu")).toBeVisible();
  await page.waitForTimeout(350);
  await assertNoHorizontalOverflow(page, "320px mobile navbar drawer");
});
