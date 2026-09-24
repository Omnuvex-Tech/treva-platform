"use client";

import { useState } from "react";

import { NotDesignedYet } from "@/components/common/not-designed-yet";
import { RegisterCredentialsView } from "./register-credentials-view";
import { RegisterShell } from "./register-shell";
import { RegisterTypeView, type RegistrationChoice } from "./register-type-view";

/**
 * Sign-up, behind the Register action on the Welcome artboard (873:59617).
 *
 * Only the type step is drawn — five artboards covering its five states. The
 * meter says "of 3", so more steps exist somewhere:
 *
 * - Individual goes on to a credentials step. Nothing draws it, so it is the
 *   two fields the login screen already asks for, on the type card's own
 *   chrome — enough to actually create an account rather than dead-end.
 * - Creating a company asks for nothing but the company's name (typed on the
 *   type step itself), then lands on the same credentials step.
 * - Joining a company keeps the placeholder: there is no company list to pick
 *   from yet, and inventing that flow is a different thing entirely.
 *
 * Every branch renders THROUGH `RegisterShell`, never as its own page: the card
 * has to survive the swap for its height to animate across it.
 */
export function RegisterView() {
    // The last choice made on the type step, kept after Back so going back to
    // fix something (a taken company name, say) doesn't wipe the whole form.
    const [draft, setDraft] = useState<RegistrationChoice | null>(null);
    const [continued, setContinued] = useState(false);
    // Owned here rather than by the credentials step so Back and forth keeps them.
    const [credentials, setCredentials] = useState({ email: "", password: "" });

    const choice = continued ? draft : null;
    const back = () => setContinued(false);

    const step =
        choice?.type === "individual" ? (
            <RegisterCredentialsView
                type="individual"
                credentials={credentials}
                onCredentialsChange={setCredentials}
                onBack={back}
            />
        ) : choice?.setup === "create" && choice.companyName ? (
            <RegisterCredentialsView
                type="company"
                companyName={choice.companyName}
                credentials={credentials}
                onCredentialsChange={setCredentials}
                onBack={back}
            />
        ) : choice?.type === "company" ? (
            // Inset so the placeholder's own dashed edge reads as a panel
            // inside the card rather than a second border against its own.
            <div className="p-6">
                <NotDesignedYet
                    nodeId="873:60389"
                    purpose="The company branch of sign-up, after the registration type is chosen."
                />
            </div>
        ) : (
            <RegisterTypeView
                initial={draft}
                onContinue={(next) => {
                    setDraft(next);
                    setContinued(true);
                }}
            />
        );

    return (
        <RegisterShell>
            {/* Keyed so each step is a fresh node and plays the fade on arrival.
                Only the fade lives here — the travel and the resize belong to
                the card around it, which is animating its own height. */}
            <div key={choice ? `${choice.type}-${choice.setup ?? ""}` : "type"} className="motion-safe:animate-[step-in_260ms_ease-out]">
                {step}
            </div>
        </RegisterShell>
    );
}
