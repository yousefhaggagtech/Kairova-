import { getTranslations } from "next-intl/server";

import { Link } from "@/src/i18n/navigation";

type GatewayItem = {
  href: "/men" | "/women";
  mediaClassName: string;
  titleKey: "dualGateway.menTitle" | "dualGateway.womenTitle";
  videoSrc: string;
};

const GATEWAY_ITEMS: GatewayItem[] = [
  {
    href: "/men",
    mediaClassName: "object-[50%_42%]",
    titleKey: "dualGateway.menTitle",
    videoSrc:
      "https://ik.imagekit.io/1pscfy7oah/kiarova/dual-gateway-section-men.MP4",
  },
  {
    href: "/women",
    mediaClassName: "object-[50%_45%]",
    titleKey: "dualGateway.womenTitle",
    videoSrc:
      "https://ik.imagekit.io/1pscfy7oah/kiarova/dual-gateway-section-women.MP4",
  },
];

const panelClassName =
  "kairova-dual-gateway-panel group/collection relative flex min-h-[56svh] flex-1 origin-center items-center justify-center overflow-hidden bg-bg-primary text-fg-primary transition-[flex,opacity,transform,filter] duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] focus-visible:z-10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-8px] focus-visible:outline-fg-primary sm:min-h-[62svh] md:min-h-[86svh]";

export default async function DualGateway() {
  const t = await getTranslations("home");
  const tSite = await getTranslations("site");

  return (
    <section
      aria-label={t("dualGateway.label")}
      className="kairova-dual-gateway flex w-full flex-col overflow-hidden bg-bg-primary md:flex-row"
      data-section="dual-gateway"
    >
      {GATEWAY_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className={panelClassName}>
          <video
            aria-hidden="true"
            autoPlay
            className={`kairova-dual-gateway-media absolute [inset-block:0] [inset-inline:0] h-full w-full object-cover grayscale transition-transform duration-[1400ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${item.mediaClassName}`}
            disablePictureInPicture
            loop
            muted
            playsInline
            preload="metadata"
          >
            <source src={item.videoSrc} type="video/mp4" />
          </video>

          <span
            aria-hidden="true"
            className="absolute [inset-block:0] [inset-inline:0] bg-[linear-gradient(180deg,rgba(10,10,10,0.18)_0%,rgba(10,10,10,0.34)_46%,rgba(10,10,10,0.78)_100%)] transition-opacity duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/collection:opacity-90"
          />

          <span className="relative z-10 flex min-h-56 w-full flex-col items-center justify-center ps-5 pe-5 text-center sm:ps-10 sm:pe-10">
            <span className="block text-caption font-medium uppercase text-border-light">
              {tSite("title")}
            </span>
            <h2 className="mt-4 max-w-[12ch] text-4xl leading-display text-fg-primary sm:text-h1">
              {t(item.titleKey)}
            </h2>
            <span className="kairova-dual-gateway-cta mt-8 inline-flex h-12 min-w-52 items-center justify-center border border-fg-primary/80 bg-transparent ps-8 pe-8 text-caption font-medium uppercase text-fg-primary transition-[opacity,transform,background-color,color,border-color] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/collection:border-fg-primary group-hover/collection:bg-fg-primary group-hover/collection:text-fg-secondary group-focus-visible/collection:border-fg-primary group-focus-visible/collection:bg-fg-primary group-focus-visible/collection:text-fg-secondary">
              {t("dualGateway.cta")}
            </span>
          </span>
        </Link>
      ))}
    </section>
  );
}
