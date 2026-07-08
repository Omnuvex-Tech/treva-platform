import { viewOptionsApi, type ViewOption } from "../../api/view-options";
import { CrudSection } from "../../components/CrudSection";
import { useEntityCrud } from "../../hooks/useEntityCrud";
import { createDuplicateToken, duplicateText } from "../../utils/duplicate";

export function ViewOptionsSection() {
    const {
        items,
        isLoading,
        showForm,
        form,
        setForm,
        editItem,
        openCreate,
        openEdit,
        closeForm,
        submitForm,
        confirmAndDelete,
        duplicateItem,
    } = useEntityCrud({
        queryKey: ["view-options"],
        queryFn: () => viewOptionsApi.getAll(),
        getItems: (data) => (Array.isArray(data?.data) ? data.data : []),
        createEmptyForm: () => ({ value: "", order: "" }),
        mapItemToForm: (item: ViewOption) => ({
            value: item.value,
            order: item.order != null ? String(item.order) : "",
        }),
        buildPayload: (nextForm) => ({
            value: nextForm.value,
            order: nextForm.order ? Number(nextForm.order) : undefined,
        }),
        createFn: (payload) => viewOptionsApi.create(payload),
        updateFn: (itemId, payload) => viewOptionsApi.update(itemId, payload),
        deleteFn: (itemId) => viewOptionsApi.delete(itemId),
        getItemId: (item: ViewOption) => item.id,
        getDeleteLabel: (item: ViewOption) => item.value,
        entityName: "View option",
        buildDuplicatePayload: (item: ViewOption) => {
            const token = createDuplicateToken();
            return {
                value: duplicateText(item.value, token),
                order: item.order,
            };
        },
    });

    return (
        <CrudSection
            title="View Options"
            createLabel="+ New View Option"
            onCreate={openCreate}
            showForm={showForm}
            formContent={
                <form onSubmit={submitForm} className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Value</label>
                            <input value={form.value} onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Order</label>
                            <input type="number" value={form.order} onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="rounded-xl px-4 py-2 text-sm font-medium text-white" style={{ background: "#4E525D" }}>
                            {editItem ? "Update" : "Create"}
                        </button>
                        <button type="button" onClick={closeForm} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-[#666666]">
                            Cancel
                        </button>
                    </div>
                </form>
            }
            isLoading={isLoading}
            columns={[
                { key: "value", label: "Value" },
                { key: "order", label: "Order" },
            ]}
            items={items}
            emptyText="No view options yet"
            getRowKey={(item) => item.id}
            renderCells={(item) => (
                <>
                    <td className="px-4 py-3 text-[#1A1A1A]">{item.value}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.order}</td>
                </>
            )}
            onEdit={openEdit}
            onDuplicate={duplicateItem}
            onDelete={confirmAndDelete}
        />
    );
}
