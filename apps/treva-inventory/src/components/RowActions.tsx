interface RowActionsProps {
    onEdit?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
}

export function RowActions({
    onEdit,
    onDuplicate,
    onDelete,
}: RowActionsProps) {
    return (
        <div className="flex items-center justify-end gap-2">
            {onEdit ? (
                <button
                    type="button"
                    onClick={onEdit}
                    aria-label="Edit"
                    title="Edit"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#4E525D] transition-colors hover:bg-gray-100"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L8.25 18.463 4 19.5l1.037-4.25L16.862 3.487Z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 4.5 19.5 8.25"
                        />
                    </svg>
                </button>
            ) : null}
            {onDuplicate ? (
                <button
                    type="button"
                    onClick={onDuplicate}
                    aria-label="Duplicate"
                    title="Duplicate"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#4E525D] transition-colors hover:bg-gray-100"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                    >
                        <rect
                            x="9"
                            y="9"
                            width="10"
                            height="10"
                            rx="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"
                        />
                    </svg>
                </button>
            ) : null}
            {onDelete ? (
                <button
                    type="button"
                    onClick={onDelete}
                    aria-label="Delete"
                    title="Delete"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#C3362B] transition-colors hover:bg-[#FCEDEA]"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 7.5h15"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.75 3.75h4.5A1.5 1.5 0 0 1 15.75 5.25V7.5h-7.5V5.25a1.5 1.5 0 0 1 1.5-1.5Z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 7.5l.675 10.125A1.5 1.5 0 0 0 8.922 19.5h6.156a1.5 1.5 0 0 0 1.497-1.875L17.25 7.5"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 10.5v5.25M13.5 10.5v5.25"
                        />
                    </svg>
                </button>
            ) : null}
        </div>
    );
}
