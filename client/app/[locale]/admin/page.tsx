import { redirect } from "@/src/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;

  redirect({ href: "/admin/orders", locale, forcePrefix: true });
}
