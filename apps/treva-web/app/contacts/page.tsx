import { redirect } from "next/navigation";
import { config } from "@/config";

export default function ContactsAliasPage() {
    redirect(`/${config.project.defLang}/contact`);
}
