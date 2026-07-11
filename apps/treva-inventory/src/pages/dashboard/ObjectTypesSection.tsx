import { objectTypesApi, type ObjectType } from "../../api/object-types";
import { CrudSection } from "../../components/CrudSection";
import { useEntityCrud } from "../../hooks/useEntityCrud";
import { createDuplicateToken, duplicateText } from "../../utils/duplicate";

export function ObjectTypesSection() {
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
        queryKey: ["object-types"],
        queryFn: () => objectTypesApi.getAll(),
        getItems: (data) => (Array.isArray(data?.data) ? data.data : []),
        createEmptyForm: () => ({ name: "", title: "", slug: "" }),
        mapItemToForm: (item: ObjectType) => ({
            name: item.name,
            title: item.title,
            slug: item.slug,
        }),
        buildPayload: (nextForm) => ({
            name: nextForm.name,
            title: nextForm.title,
            slug: nextForm.slug,
        }),
        createFn: (payload) => objectTypesApi.create(payload),
        updateFn: (itemId, payload) => objectTypesApi.update(itemId, payload),
        deleteFn: (itemId) => objectTypesApi.delete(itemId),
        getItemId: (item: ObjectType) => item.id,
        getDeleteLabel: (item: ObjectType) => item.title,
        entityName: "Object type",
        buildDuplicatePayload: (item: ObjectType) => {
            const token = createDuplicateToken();
            return {
                name: item.name,
                title: duplicateText(item.title, token),
                slug: duplicateText(item.slug, token),
            };
        },
    });

    return (
        <CrudSection
            title="Object Types"
            createLabel="+ New Object Type"
            onCreate={openCreate}
            showForm={showForm}
            formContent={
                <form onSubmit={submitForm} className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-4 grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Name</label>
                            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Title</label>
                            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Slug</label>
                            <input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
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
                { key: "name", label: "Name" },
                { key: "slug", label: "Slug" },
            ]}
            items={items}
            emptyText="No object types yet"
            getRowKey={(item) => item.id}
            renderCells={(item) => (
                <>
                    <td className="px-4 py-3 text-[#1A1A1A]">{item.title}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.name}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.slug}</td>
                </>
            )}
            onEdit={openEdit}
            onDuplicate={duplicateItem}
            onDelete={confirmAndDelete}
        />
    );
}
