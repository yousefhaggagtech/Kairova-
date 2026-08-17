import { getTranslations } from "next-intl/server";

import styles from "../page.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });

  return (
    <div className={styles.page}>
      <section className={styles.main}>
        <div className={styles.intro}>
          <h1>{t("title")}</h1>
          <p>{t("tagline")}</p>
        </div>
      </section>
    </div>
  );
}
