import type { ReactNode } from "react";

import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";

/**
 * Auth screens are a 50/50 split, as drawn in the Welcome artboard
 * (873:72373): the form in a 720px column on the left, the dark brand panel
 * filling the other 720px on the right.
 *
 * The panel is dropped below `lg` rather than stacked — on a narrow screen the
 * form is the only thing worth showing.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="grid min-h-dvh lg:grid-cols-2">
            <div className="flex items-center justify-center px-6 py-12">
                {/* 508px is the form width in the artboard. */}
                <div className="w-full max-w-127">{children}</div>
            </div>

            <div className="hidden lg:block">
                <AuthBrandPanel />
            </div>
        </div>
    );
}
