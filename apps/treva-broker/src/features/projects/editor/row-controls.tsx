"use client";

import { AssetIcon } from "@/components/ui/asset-icon";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/providers/i18n-provider";

/**
 * The switch and delete chip at the top right of a Highlights or Offers card
 * (873:51146 / 873:51255): 2px of top padding, 8 apart, the chip 28 tall on
 * Background/Secondary with an 8px radius around a 1px-stroke trash in brand.
 */
export function RowControls({
    enabled,
    onToggle,
    onDelete,
    toggleLabel,
    disabled,
}: {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    onDelete: () => void;
    toggleLabel: string;
    disabled?: boolean;
}) {
    const { t } = useI18n();

    return (
        <div className="flex shrink-0 items-center gap-2 pt-0.5">
            <Switch
                checked={enabled}
                disabled={disabled}
                onChange={(event) => onToggle(event.target.checked)}
                aria-label={toggleLabel}
            />

            <button
                type="button"
                disabled={disabled}
                onClick={onDelete}
                aria-label={t.common.delete}
                title={t.common.delete}
                className="flex h-7 items-center rounded-sm bg-bg-secondary px-2 py-1 text-content-brand transition-colors hover:bg-bg-tertiary disabled:opacity-50"
            >
                <AssetIcon src="/images/projects/icon-trash-thin.svg" size={16} />
            </button>
        </div>
    );
}

/**
 * The full-width add button under a card list (873:51229 / 873:51305): 44 tall
 * on a 3XL radius, Border/Brand edge and Content/Brand ink.
 */
export function AddRowButton({
    label,
    onClick,
    disabled,
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <div className="px-2">
            <Button
                type="button"
                variant="brandOutline"
                size="lg"
                disabled={disabled}
                // Figma's 14px inset counts the 1px edge inside it.
                className="w-full rounded-lg bg-transparent px-[13px]"
                leadingIcon={<AssetIcon src="/images/news/icon-plus.svg" size={16} />}
                onClick={onClick}
            >
                {label}
            </Button>
        </div>
    );
}
