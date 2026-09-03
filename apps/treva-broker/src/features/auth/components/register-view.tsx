"use client";

import { useState } from "react";

import { NotDesignedYet } from "@/components/common/not-designed-yet";
import { RegisterTypeView } from "./register-type-view";

/**
 * Sign-up, behind the Register action on the Welcome artboard (873:59617).
 *
 * Only the type step is drawn — five artboards covering its five states. The
 * meter says "of 3", so two more steps exist somewhere; until they are drawn,
 * Continue lands on the placeholder rather than on a form nobody designed.
 */
export function RegisterView() {
    const [chosen, setChosen] = useState(false);

    if (chosen) {
        return (
            <div className="mx-auto flex min-h-dvh max-w-[540px] items-center px-4 py-12">
                <NotDesignedYet
                    nodeId="873:60389"
                    purpose="Step 3 of sign-up, after the registration type is chosen."
                />
            </div>
        );
    }

    return <RegisterTypeView onContinue={() => setChosen(true)} />;
}
