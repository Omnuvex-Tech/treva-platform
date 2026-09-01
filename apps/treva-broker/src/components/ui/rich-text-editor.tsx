"use client";

import {
    TextBoldIcon,
    TextItalicIcon,
    TextUnderlineIcon,
    LeftToRightListBulletIcon,
    LeftToRightListNumberIcon,
    Link01Icon,
    RemoveFormattingIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { useCallback, useEffect, useId, useRef } from "react";

import { cn } from "@/lib/utils/cn";
import { Select } from "./select";

export interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    /** Body height in px — 360 in the News Content card. */
    minHeight?: number;
    ariaLabel?: string;
    className?: string;
}

interface ToolbarAction {
    key: string;
    icon: IconSvgElement;
    label: string;
    run: () => void;
}

const BLOCK_OPTIONS = [
    { value: "p", label: "Paragraph" },
    { value: "h2", label: "Heading" },
    { value: "h3", label: "Subheading" },
    { value: "blockquote", label: "Quote" },
];

/**
 * A small `contenteditable` editor: a block-format select, seven inline
 * commands, and an HTML string in and out.
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
 */
export function RichTextEditor({
    value,
    onChange,
    placeholder,
    minHeight = 360,
    ariaLabel,
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

    const actions: ToolbarAction[] = [
        { key: "bold", icon: TextBoldIcon, label: "Bold", run: () => exec("bold") },
        { key: "italic", icon: TextItalicIcon, label: "Italic", run: () => exec("italic") },
        { key: "underline", icon: TextUnderlineIcon, label: "Underline", run: () => exec("underline") },
        {
            key: "ul",
            icon: LeftToRightListBulletIcon,
            label: "Bulleted list",
            run: () => exec("insertUnorderedList"),
        },
        {
            key: "ol",
            icon: LeftToRightListNumberIcon,
            label: "Numbered list",
            run: () => exec("insertOrderedList"),
        },
        {
            key: "link",
            icon: Link01Icon,
            label: "Link",
            run: () => {
                const href = window.prompt("Link URL");
                if (href) exec("createLink", href);
            },
        },
        {
            key: "clear",
            icon: RemoveFormattingIcon,
            label: "Clear formatting",
            run: () => exec("removeFormat"),
        },
    ];

    return (
        <div className={cn("flex flex-col", className)}>
            <div className="flex h-17 items-center gap-3 border-b border-border-subtle px-4">
                <Select
                    aria-label="Text style"
                    options={BLOCK_OPTIONS}
                    defaultValue="p"
                    onChange={(block) => exec("formatBlock", `<${block}>`)}
                    containerClassName="w-33"
                    className="h-9"
                />

                <div className="flex items-center gap-1">
                    {actions.map((action) => (
                        <button
                            key={action.key}
                            type="button"
                            title={action.label}
                            aria-label={action.label}
                            // Keep the selection: a mousedown-driven blur would
                            // collapse it before the command runs.
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={action.run}
                            className="flex size-8 items-center justify-center rounded-s text-content-secondary transition-colors hover:bg-bg-secondary hover:text-content-primary"
                        >
                            <HugeiconsIcon icon={action.icon} size={16} strokeWidth={1.6} />
                        </button>
                    ))}
                </div>
            </div>

            <div
                id={editorId}
                ref={bodyRef}
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-multiline
                aria-label={ariaLabel}
                data-placeholder={placeholder}
                onInput={(event) => onChange(event.currentTarget.innerHTML)}
                style={{ minHeight }}
                className={cn(
                    "scrollbar-thin overflow-y-auto px-4 py-3 text-sm text-content-primary outline-none",
                    "[&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold",
                    "[&_h3]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold",
                    "[&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5",
                    "[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5",
                    "[&_a]:text-content-link [&_a]:underline",
                    "[&_blockquote]:border-l-2 [&_blockquote]:border-border-tertiary [&_blockquote]:pl-3 [&_blockquote]:text-content-secondary",
                    // The placeholder is CSS-only so it never becomes real content.
                    "empty:before:text-content-tertiary empty:before:content-[attr(data-placeholder)]",
                )}
            />
        </div>
    );
}
