import { redirect } from "next/navigation";
import { config } from "@/config";

export default function PulseRedirect() {
    redirect(`/${config.project.defLang}/pulse`);
}
