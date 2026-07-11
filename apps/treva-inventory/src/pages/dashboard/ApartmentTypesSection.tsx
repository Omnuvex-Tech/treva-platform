import { apartmentTypesApi, type ApartmentType } from "../../api/apartment-types";
import { CrudSection } from "../../components/CrudSection";
import { useEntityCrud } from "../../hooks/useEntityCrud";
import { createDuplicateToken, duplicateText } from "../../utils/duplicate";

export function ApartmentTypesSection() {
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
        queryKey: ["apartment-types"],
        queryFn: () => apartmentTypesApi.getAll(),
        getItems: (data) => (Array.isArray(data?.data) ? data.data : []),
        createEmptyForm: () => ({ name: "", title: "" }),
        mapItemToForm: (item: ApartmentType) => ({
            name: item.name,
            title: item.title,
        }),
        buildPayload: (nextForm) => ({
            name: nextForm.name,
            title: nextForm.title,
        }),
        createFn: (payload) => apartmentTypesApi.create(payload),
        updateFn: (itemId, payload) => apartmentTypesApi.update(itemId, payload),
        deleteFn: (itemId) => apartmentTypesApi.delete(itemId),
        getItemId: (item: ApartmentType) => item.id,
        getDeleteLabel: (item: ApartmentType) => item.title,
        entityName: "Apartment type",
        buildDuplicatePayload: (item: ApartmentType) => {
            const token = createDuplicateToken();
            return {
                name: duplicateText(item.name, token),
                title: duplicateText(item.title, token),
            };
        },
    });

    return (
        <CrudSection
            title="Apartment Types"
            createLabel="+ New Type"
            onCreate={openCreate}
            showForm={showForm}
            formContent={
                <form onSubmit={submitForm} className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Name</label>
                            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Title</label>
                            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
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
                { key: "name", label: "Name" },
                { key: "title", label: "Title" },
            ]}
            items={items}
            emptyText="No apartment types yet"
            getRowKey={(item) => item.id}
            renderCells={(item) => (
                <>
                    <td className="px-4 py-3 text-[#666666]">{item.name}</td>
                    <td className="px-4 py-3 text-[#1A1A1A]">{item.title}</td>
                </>
            )}
            onEdit={openEdit}
            onDuplicate={duplicateItem}
            onDelete={confirmAndDelete}
        />
    );
}
