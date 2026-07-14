import { redirect } from "next/navigation";
import { config } from "@/config";

export default function AboutUsRedirect() {
  redirect(`/${config.project.defLang}/about-us`);
}
