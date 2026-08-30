import { redirect } from "@/src/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LoginAliasPage({ params }: Props) {
  const { locale } = await params;

  redirect({ href: "/auth/login", locale, forcePrefix: true });
}
