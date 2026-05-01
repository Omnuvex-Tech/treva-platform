import { redirect } from "next/navigation";
import { config } from "@/config";

export default function ContactAliasPage() {
    redirect(`/${config.project.defLang}/contact`);
}
