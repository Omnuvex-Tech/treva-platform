import { categoriesApi, type Category } from "../../api/categories";
import { CrudSection } from "../../components/CrudSection";
import { useEntityCrud } from "../../hooks/useEntityCrud";
import { createDuplicateToken, duplicateSlug, duplicateText } from "../../utils/duplicate";

export function CategoriesSection() {
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
        queryKey: ["categories", "category"],
        queryFn: () => categoriesApi.getAll("category"),
        getItems: (data) => (Array.isArray(data?.data) ? data.data : []),
        createEmptyForm: () => ({ title: "", name: "", slug: "" }),
        mapItemToForm: (item: Category) => ({
            title: item.title,
            name: item.name,
            slug: item.slug,
        }),
        buildPayload: (nextForm) => ({ ...nextForm, type: "category" }),
        createFn: (payload) => categoriesApi.create(payload),
        updateFn: (itemId, payload) => categoriesApi.update(itemId, payload),
        deleteFn: (itemId) => categoriesApi.delete(itemId),
        getItemId: (item: Category) => item.id,
        getDeleteLabel: (item: Category) => item.title,
        entityName: "Category",
        buildDuplicatePayload: (item: Category) => {
            const token = createDuplicateToken();
            return {
                title: duplicateText(item.title, token),
                name: duplicateText(item.name, token),
                slug: duplicateSlug(item.slug, token),
            };
        },
    });

    return (
        <CrudSection
            title="Categories"
            createLabel="+ New Category"
            onCreate={openCreate}
            showForm={showForm}
            formContent={
                <form onSubmit={submitForm} className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-4 grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Title</label>
                            <input
                                value={form.title}
                                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Name</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Slug</label>
                            <input
                                value={form.slug}
                                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                                required
                            />
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
            emptyText="No categories yet"
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
