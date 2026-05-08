import { redirect } from "next/navigation";
import { config } from "@/config";

export default function DevelopersRedirect() {
    redirect(`/${config.project.defLang}/developers`);
}
