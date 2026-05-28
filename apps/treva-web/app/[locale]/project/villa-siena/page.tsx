import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function VillaSienaPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/projects/villa-siena?design=2`);
}
