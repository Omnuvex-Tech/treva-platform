import { redirect } from "next/navigation";
import { config } from "@/config";

export default function Home() {
    redirect(`/${config.project.defLang}`);
}
