import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

type SmokeRoute = {
  label: string;
  path: string;
};

type CapturedError = {
  source: "console" | "pageerror" | "navigation" | "response";
  message: string;
  status?: number;
  url?: string;
};

type RouteReport = SmokeRoute & {
  errors: CapturedError[];
  skipped?: string;
};

type SlugLookup = {
  slug: string | null;
  note?: string;
};

const locales = [
  { locale: "ar", prefix: "" },
  { locale: "en", prefix: "/en" },
] as const;

const staticRoutes = [
  { label: "home", path: "/" },
  { label: "men", path: "/men" },
  { label: "women", path: "/women" },
  { label: "about", path: "/about" },
  { label: "cart", path: "/cart" },
  { label: "checkout", path: "/checkout" },
  { label: "login screen", path: "/auth/login" },
  { label: "login alias", path: "/login" },
  { label: "register", path: "/auth/register" },
  { label: "account", path: "/account" },
  { label: "account addresses", path: "/account/addresses" },
  { label: "account orders", path: "/account/orders" },
  { label: "admin redirect", path: "/admin" },
  { label: "admin orders", path: "/admin/orders" },
  { label: "admin products", path: "/admin/products" },
  { label: "admin product new", path: "/admin/products/new" },
  { label: "admin settings", path: "/admin/settings" },
] as const;

const routeReports: RouteReport[] = [];
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const allowedAuth401Paths = [
  // Expected when the smoke browser is logged out and the app checks for an existing session.
  "/api/auth/me",
  // Expected follow-up when no refresh token exists for the logged-out smoke browser.
  "/api/auth/refresh",
] as const;

let productLookup: SlugLookup = { slug: null };
let categoryLookup: SlugLookup = { slug: null };

function withLocalePrefix(path: string, prefix: string) {
  if (!prefix) {
    return path;
  }

  return path === "/" ? prefix : `${prefix}${path}`;
}

function localizedRoutes(routes: readonly SmokeRoute[]) {
  return routes.flatMap((route) =>
    locales.map(({ locale, prefix }) => ({
      label: `${locale} ${route.label}`,
      path: withLocalePrefix(route.path, prefix),
    })),
  );
}

function getPathname(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
}

function isAllowedAuth401({
  message = "",
  status,
  url = "",
}: Pick<CapturedError, "message" | "status" | "url">) {
  const pathname = getPathname(url);
  const isAllowedPath = allowedAuth401Paths.includes(
    pathname as (typeof allowedAuth401Paths)[number],
  );
  const is401 =
    typeof status === "number"
      ? status === 401
      : /\b401\b/.test(message) && /Unauthorized/i.test(message);

  return isAllowedPath && is401;
}

function isAllowedError(error: CapturedError) {
  return error.source !== "pageerror" && isAllowedAuth401(error);
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

function recordSkipped(route: SmokeRoute, reason: string) {
  routeReports.push({
    ...route,
    errors: [],
    skipped: reason,
  });
}

async function visitAndRecord(page: Page, route: SmokeRoute) {
  const errors: CapturedError[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }

    const location = message.location();
    const locationSuffix = location.url
      ? ` (${location.url}:${location.lineNumber}:${location.columnNumber})`
      : "";

    const capturedError: CapturedError = {
      source: "console",
      message: `${message.text()}${locationSuffix}`,
      url: location.url,
    };

    if (!isAllowedError(capturedError)) {
      errors.push(capturedError);
    }
  });

  page.on("response", (response) => {
    const status = response.status();

    if (status < 400) {
      return;
    }

    const capturedError: CapturedError = {
      source: "response",
      message: `${response.request().method()} ${response.url()} returned ${status} ${response.statusText()}`,
      status,
      url: response.url(),
    };

    if (!isAllowedError(capturedError)) {
      errors.push(capturedError);
    }
  });

  page.on("pageerror", (error) => {
    errors.push({
      source: "pageerror",
      message: error.stack || error.message,
    });
  });

  try {
    await page.goto(route.path, { waitUntil: "networkidle" });
  } catch (error) {
    errors.push({
      source: "navigation",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  routeReports.push({
    ...route,
    errors,
  });

  expect(errors, `${route.path} unexpected browser/runtime errors`).toEqual([]);
}

function printReport() {
  console.log("\n=== Playwright Smoke Console Report (Phase 2) ===");
  console.log(`API base URL for dynamic slugs: ${apiBaseUrl}`);

  for (const report of routeReports) {
    console.log(`\n${report.path} (${report.label})`);

    if (report.skipped) {
      console.log(`  skipped: ${report.skipped}`);
      continue;
    }

    if (report.errors.length === 0) {
      console.log("  clean");
      continue;
    }

    for (const [index, error] of report.errors.entries()) {
      console.log(`  ${index + 1}. [${error.source}] ${error.message}`);
    }
  }

  console.log("\n=== End Playwright Smoke Console Report ===");
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

test.afterAll(() => {
  printReport();
});

for (const route of localizedRoutes(staticRoutes)) {
  test(`smoke: ${route.label} (${route.path})`, async ({ page }) => {
    await visitAndRecord(page, route);
  });
}

for (const { locale, prefix } of locales) {
  test(`smoke: ${locale} product detail`, async ({ page }) => {
    const path = productLookup.slug
      ? withLocalePrefix(`/product/${productLookup.slug}`, prefix)
      : withLocalePrefix("/product/[slug]", prefix);
    const route = { label: `${locale} product detail`, path };

    if (!productLookup.slug) {
      const reason = productLookup.note || "No product slug returned by API";
      recordSkipped(route, reason);
      test.skip(true, reason);
    }

    await visitAndRecord(page, route);
  });

  test(`smoke: ${locale} category detail`, async ({ page }) => {
    const path = categoryLookup.slug
      ? withLocalePrefix(`/category/${categoryLookup.slug}`, prefix)
      : withLocalePrefix("/category/[slug]", prefix);
    const route = { label: `${locale} category detail`, path };

    if (!categoryLookup.slug) {
      const reason = categoryLookup.note || "No category slug returned by API";
      recordSkipped(route, reason);
      test.skip(true, reason);
    }

    await visitAndRecord(page, route);
  });
}
