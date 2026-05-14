import { redirect } from "next/navigation";
import { config } from "@/config";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PulseArticleRedirect({ params }: Props) {
  const { slug } = await params;

  redirect(`/${config.project.defLang}/pulse/${slug}`);
}
