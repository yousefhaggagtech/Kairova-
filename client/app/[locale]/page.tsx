import { getTranslations } from "next-intl/server";

import styles from "../page.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  const alternateHref = locale === "ar" ? "/en" : "/";
  const alternateLabel = locale === "ar" ? "English" : "العربية";

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>{t("title")}</h1>
          <p>{t("tagline")}</p>
        </div>
        <div className={styles.ctas}>
          <a className={styles.secondary} href={alternateHref}>
            {alternateLabel}
          </a>
        </div>
      </main>
    </div>
  );
}
