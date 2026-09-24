"use client";

import { Fragment, useCallback, useEffect, useId, useRef } from "react";

import { cn } from "@/lib/utils/cn";
import { AssetIcon } from "./asset-icon";
import { Select } from "./select";

export interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    /** Body height in px — 360 in the News Content card. */
    minHeight?: number;
    ariaLabel?: string;
    /** Renders the body read-only — the card's Preview toggle. */
    readOnly?: boolean;
    labels: {
        paragraph: string;
        heading: string;
        subheading: string;
        quote: string;
    };
    className?: string;
}

interface ToolbarAction {
    key: string;
    label: string;
    command: string;
    /** Asks for the command's argument; the action is dropped when it returns null. */
    argument?: () => string | null;
}

const ICONS = "/images/news/editor";

/**
 * The toolbar of the News Content card (873:51500), in the artboard's order.
 * Each inner array is a group; the groups are split by 1x16 rules.
 */
const GROUPS: ToolbarAction[][] = [
    [
        { key: "undo", label: "Undo", command: "undo" },
        { key: "redo", label: "Redo", command: "redo" },
    ],
    [
        { key: "bold", label: "Bold", command: "bold" },
        { key: "italic", label: "Italic", command: "italic" },
        { key: "underline", label: "Underline", command: "underline" },
        { key: "strike", label: "Strikethrough", command: "strikeThrough" },
    ],
    [
        { key: "align-left", label: "Align left", command: "justifyLeft" },
        { key: "align-center", label: "Align center", command: "justifyCenter" },
        { key: "align-right", label: "Align right", command: "justifyRight" },
        { key: "justify", label: "Justify", command: "justifyFull" },
    ],
    [
        { key: "list", label: "Bulleted list", command: "insertUnorderedList" },
        { key: "ordered", label: "Numbered list", command: "insertOrderedList" },
        { key: "quote", label: "Quote", command: "formatBlock", argument: () => "<blockquote>" },
        { key: "link", label: "Link", command: "createLink", argument: () => window.prompt("Link URL") },
        { key: "image", label: "Image", command: "insertImage", argument: () => window.prompt("Image URL") },
    ],
];

/**
 * A small `contenteditable` editor: a block-format select, the artboard's
 * seventeen commands, and an HTML string in and out.
 *
 * Why not the shared `@repo/ui` RichTextEditor: that one takes a CSS-module
 * object as a prop and expects the consuming page to define every one of its
 * class names. This app is on Tailwind, so wiring it up would mean maintaining
 * a module of shims — more surface than the editor itself. The contract here is
 * deliberately narrow (`value` / `onChange` of HTML), so swapping in a real
 * editor later touches this file and nothing else.
 *
 * `document.execCommand` is deprecated but is still the only API every browser
 * implements for this; the alternative is a full editing framework, which is a
 * separate decision from "build the screen the design shows".
 *
 * Measurements are the artboard's with Figma's inside strokes accounted for: a
 * 68px toolbar row (16px padding, the rule taking one of the bottom sixteen), a
 * 132x36 select 12px from 23px buttons 3px apart, 13px glyphs.
 */
export function RichTextEditor({
    value,
    onChange,
    placeholder,
    minHeight = 360,
    ariaLabel,
    readOnly = false,
    labels,
    className,
}: RichTextEditorProps) {
    const bodyRef = useRef<HTMLDivElement>(null);
    const editorId = useId();

    // Only write into the DOM when the incoming value and the live document have
    // actually diverged — assigning innerHTML on every keystroke would reset the
    // caret to the start of the field.
    useEffect(() => {
        const node = bodyRef.current;
        if (node && node.innerHTML !== value) {
            node.innerHTML = value;
        }
    }, [value]);

    const exec = useCallback(
        (command: string, argument?: string) => {
            bodyRef.current?.focus();
            document.execCommand(command, false, argument);
            if (bodyRef.current) onChange(bodyRef.current.innerHTML);
        },
        [onChange],
    );

    function run(action: ToolbarAction) {
        if (!action.argument) {
            exec(action.command);
            return;
        }
        const argument = action.argument();
        if (argument) exec(action.command, argument);
    }

    return (
        <div className={cn("flex flex-col", className)}>
            <div className="relative border-b border-[var(--color-border-overlay)] bg-bg-primary px-4 pt-4 pb-[15px]">
                <div className="flex items-center gap-3">
                    <Select
                        aria-label="Text style"
                        options={[
                            { value: "p", label: labels.paragraph },
                            { value: "h2", label: labels.heading },
                            { value: "h3", label: labels.subheading },
                            { value: "blockquote", label: labels.quote },
                        ]}
                        defaultValue="p"
                        onChange={(block) => exec("formatBlock", `<${block}>`)}
                        disabled={readOnly}
                        containerClassName="w-33 shrink-0"
                        className="h-9 rounded-md border-border-tertiary bg-bg-primary pr-[11px] pl-[15px] text-content-tertiary"
                        icon={
                            <AssetIcon
                                src={`${ICONS}/select-chevron.svg`}
                                size={20}
                                className="text-content-tertiary"
                            />
                        }
                    />

                    <div className="flex items-center gap-[3px]">
                        {GROUPS.map((group, index) => (
                            <Fragment key={index}>
                                <span aria-hidden className="h-4 w-px shrink-0 bg-border-subtle" />
                                {group.map((action) => (
                                    <button
                                        key={action.key}
                                        type="button"
                                        title={action.label}
                                        aria-label={action.label}
                                        disabled={readOnly}
                                        // Keep the selection: a mousedown-driven blur would
                                        // collapse it before the command runs.
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => run(action)}
                                        className="flex size-[23px] shrink-0 items-center justify-center rounded-xxs text-content-brand transition-colors hover:bg-bg-secondary disabled:opacity-50"
                                    >
                                        <AssetIcon src={`${ICONS}/tb-${action.key}.svg`} size={13} />
                                    </button>
                                ))}
                            </Fragment>
                        ))}
                    </div>
                </div>

                {/* 873:51582 — a stray rule the artboard draws over the
                    numbered-list button, kept so the row matches it. */}
                <span aria-hidden className="absolute top-4 left-[472.5px] h-4 w-px bg-border-subtle" />
            </div>

            <div
                id={editorId}
                ref={bodyRef}
                contentEditable={!readOnly}
                suppressContentEditableWarning
                role="textbox"
                aria-multiline
                aria-readonly={readOnly || undefined}
                aria-label={ariaLabel}
                data-placeholder={placeholder}
                onInput={(event) => onChange(event.currentTarget.innerHTML)}
                style={{ minHeight }}
                className={cn(
                    "scrollbar-thin overflow-y-auto p-5 text-sm leading-5 text-content-primary outline-none",
                    "[&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold",
                    "[&_h3]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold",
                    "[&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5",
                    "[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5",
                    "[&_a]:text-content-link [&_a]:underline [&_img]:max-w-full [&_img]:rounded-sm",
                    "[&_blockquote]:border-l-2 [&_blockquote]:border-border-tertiary [&_blockquote]:pl-3 [&_blockquote]:text-content-secondary",
                    // The placeholder is CSS-only so it never becomes real content:
                    // 14/Medium on Content/Tertiary Inverse, 20px in (873:51585).
                    "empty:before:font-medium empty:before:text-[var(--color-content-tertiary-inverse)] empty:before:content-[attr(data-placeholder)]",
                )}
            />
        </div>
    );
}
