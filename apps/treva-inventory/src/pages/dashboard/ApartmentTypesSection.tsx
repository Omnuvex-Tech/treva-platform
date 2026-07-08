import { apartmentTypesApi, type ApartmentType } from "../../api/apartment-types";
import { CrudSection } from "../../components/CrudSection";
import { useEntityCrud } from "../../hooks/useEntityCrud";
import { createDuplicateToken, duplicateSlug, duplicateText } from "../../utils/duplicate";

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
        createEmptyForm: () => ({ title: "", slug: "", order: "" }),
        mapItemToForm: (item: ApartmentType) => ({
            title: item.title,
            slug: item.slug,
            order: item.order != null ? String(item.order) : "",
        }),
        buildPayload: (nextForm) => ({
            title: nextForm.title,
            slug: nextForm.slug,
            order: nextForm.order ? Number(nextForm.order) : undefined,
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
                title: duplicateText(item.title, token),
                slug: duplicateSlug(item.slug, token),
                order: item.order,
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
                    <div className="mb-4 grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Title</label>
                            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Slug</label>
                            <input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
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
                { key: "title", label: "Title" },
                { key: "slug", label: "Slug" },
                { key: "order", label: "Order" },
            ]}
            items={items}
            emptyText="No apartment types yet"
            getRowKey={(item) => item.id}
            renderCells={(item) => (
                <>
                    <td className="px-4 py-3 text-[#1A1A1A]">{item.title}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.slug}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.order}</td>
                </>
            )}
            onEdit={openEdit}
            onDuplicate={duplicateItem}
            onDelete={confirmAndDelete}
        />
    );
}
