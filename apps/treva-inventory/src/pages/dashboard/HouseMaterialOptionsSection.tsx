import { houseMaterialOptionsApi, type HouseMaterialOption } from "../../api/house-material-options";
import { CrudSection } from "../../components/CrudSection";
import { useEntityCrud } from "../../hooks/useEntityCrud";
import { createDuplicateToken, duplicateText } from "../../utils/duplicate";

export function HouseMaterialOptionsSection() {
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
        queryKey: ["house-material-options"],
        queryFn: () => houseMaterialOptionsApi.getAll(),
        getItems: (data) => (Array.isArray(data?.data) ? data.data : []),
        createEmptyForm: () => ({ value: "" }),
        mapItemToForm: (item: HouseMaterialOption) => ({
            value: item.value,
        }),
        buildPayload: (nextForm) => ({
            value: nextForm.value,
        }),
        createFn: (payload) => houseMaterialOptionsApi.create(payload),
        updateFn: (itemId, payload) => houseMaterialOptionsApi.update(itemId, payload),
        deleteFn: (itemId) => houseMaterialOptionsApi.delete(itemId),
        getItemId: (item: HouseMaterialOption) => item.id,
        getDeleteLabel: (item: HouseMaterialOption) => item.value,
        entityName: "House material",
        buildDuplicatePayload: (item: HouseMaterialOption) => {
            const token = createDuplicateToken();
            return {
                value: duplicateText(item.value, token),
            };
        },
    });

    return (
        <CrudSection
            title="House Materials"
            createLabel="+ New House Material"
            onCreate={openCreate}
            showForm={showForm}
            formContent={
                <form onSubmit={submitForm} className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-4">
                        <label className="mb-1 block text-xs text-[#666666]">Value</label>
                        <input
                            value={form.value}
                            onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                            required
                        />
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
            ]}
            items={items}
            emptyText="No house materials yet"
            getRowKey={(item) => item.id}
            renderCells={(item) => (
                <>
                    <td className="px-4 py-3 text-[#1A1A1A]">{item.value}</td>
                </>
            )}
            onEdit={openEdit}
            onDuplicate={duplicateItem}
            onDelete={confirmAndDelete}
        />
    );
}
