import type { ReactNode } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { RowActions } from "./RowActions";

interface CrudSectionColumn {
    key: string;
    label: string;
    headerClassName?: string;
}

interface CrudSectionProps<TItem> {
    title: string;
    createLabel?: string;
    onCreate?: () => void;
    showForm?: boolean;
    formContent?: ReactNode;
    isLoading: boolean;
    loadingClassName?: string;
    columns: CrudSectionColumn[];
    items: TItem[];
    emptyText: string;
    getRowKey: (item: TItem) => string;
    renderCells: (item: TItem) => ReactNode;
    onEdit?: (item: TItem) => void;
    onDuplicate?: (item: TItem) => void;
    onDelete?: (item: TItem) => void;
}

export function CrudSection<TItem>({
    title,
    createLabel,
    onCreate,
    showForm = false,
    formContent,
    isLoading,
    loadingClassName,
    columns,
    items,
    emptyText,
    getRowKey,
    renderCells,
    onEdit,
    onDuplicate,
    onDelete,
}: CrudSectionProps<TItem>) {
    const hasActions = Boolean(onEdit || onDuplicate || onDelete);

    return (
        <main
            className="flex-1 p-8 overflow-y-auto"
            style={{ background: "var(--background-primary-50, #FFFFFF80)" }}
        >
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h4
                        className="m-0 text-[#1A1A1A]"
                        style={{ fontWeight: 600, fontSize: 16 }}
                    >
                        {title}
                    </h4>
                    {onCreate && createLabel ? (
                        <button
                            type="button"
                            onClick={onCreate}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-white"
                            style={{ background: "#4E525D" }}
                        >
                            {createLabel}
                        </button>
                    ) : null}
                </div>

                {showForm ? formContent : null}

                {isLoading ? (
                    <LoadingSpinner className={loadingClassName} />
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-100">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-100 bg-gray-50">
                                <tr>
                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            className={`px-4 py-3 font-medium text-[#4E525D] ${column.headerClassName ?? ""}`.trim()}
                                        >
                                            {column.label}
                                        </th>
                                    ))}
                                    {hasActions ? (
                                        <th className="px-4 py-3 text-right font-medium text-[#4E525D]">
                                            Actions
                                        </th>
                                    ) : null}
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={columns.length + (hasActions ? 1 : 0)}
                                            className="px-4 py-8 text-center text-[#666666]"
                                        >
                                            {emptyText}
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr
                                            key={getRowKey(item)}
                                            className="border-b border-gray-50 hover:bg-gray-50/50"
                                        >
                                            {renderCells(item)}
                                            {hasActions ? (
                                                <td className="px-4 py-3">
                                                    <RowActions
                                                        onEdit={onEdit ? () => onEdit(item) : undefined}
                                                        onDuplicate={onDuplicate ? () => onDuplicate(item) : undefined}
                                                        onDelete={onDelete ? () => onDelete(item) : undefined}
                                                    />
                                                </td>
                                            ) : null}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
