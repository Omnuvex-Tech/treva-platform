import { redirect } from "next/navigation";
import { config } from "@/config";

export default function ProjectsPage() {
  redirect(`/${config.project.defLang}/projects`);
}
