import { NotDesignedYet } from "@/components/common/not-designed-yet";

/**
 * The Welcome section of each role has six artboards, but only the first (sign
 * in) has anything drawn in it — the other five are empty 1440x1024 frames.
 * This route exists so the "Forgot password?" link is not dead.
 */
export default function ForgotPasswordPage() {
    return (
        <NotDesignedYet
            nodeId="873:72848"
            purpose="Requesting a password-reset link."
        />
    );
}
