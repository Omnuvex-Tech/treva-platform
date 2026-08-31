import { ComingSoon } from "@/components/common/coming-soon";

/**
 * The Welcome section of each Figma role has six artboards — sign in plus the
 * password-recovery steps. Only sign in is built; this route exists so the
 * "Forgot password?" link is not dead.
 */
export default function ForgotPasswordPage() {
    return <ComingSoon figmaNodes={{ admin: "873:48461", topBroker: "873:60083", broker: "873:72848" }} />;
}
