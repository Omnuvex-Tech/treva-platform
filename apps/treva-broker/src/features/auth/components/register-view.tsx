"use client";

import { useState } from "react";

import { NotDesignedYet } from "@/components/common/not-designed-yet";
import { RegisterCredentialsView } from "./register-credentials-view";
import { RegisterTypeView, type RegistrationType } from "./register-type-view";

/**
 * Sign-up, behind the Register action on the Welcome artboard (873:59617).
 *
 * Only the type step is drawn — five artboards covering its five states. The
 * meter says "of 3", so more steps exist somewhere:
 *
 * - Individual goes on to a credentials step. Nothing draws it, so it is the
 *   two fields the login screen already asks for, on the type card's own
 *   chrome — enough to actually create an account rather than dead-end.
 * - Company keeps the placeholder: its remaining steps collect company details
 *   nobody has specified, and inventing those is a different thing entirely.
 */
export function RegisterView() {
    const [choice, setChoice] = useState<RegistrationType | null>(null);

    if (choice === "individual") {
        return (
            <RegisterCredentialsView type="individual" onBack={() => setChoice(null)} />
        );
    }

    if (choice === "company") {
        return (
            <div className="mx-auto flex min-h-dvh max-w-[540px] items-center px-4 py-12">
                <NotDesignedYet
                    nodeId="873:60389"
                    purpose="The company branch of sign-up, after the registration type is chosen."
                />
            </div>
        );
    }

    return <RegisterTypeView onContinue={(next) => setChoice(next.type)} />;
}
