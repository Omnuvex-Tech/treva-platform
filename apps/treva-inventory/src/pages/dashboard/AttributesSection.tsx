import { attributesApi, type Attribute } from "../../api/attributes";
import { apartmentsApi } from "../../api/apartments";
import { CrudSection } from "../../components/CrudSection";
import { useEntityCrud } from "../../hooks/useEntityCrud";
import { createDuplicateToken, duplicateText } from "../../utils/duplicate";
import { FormImageField } from "@repo/ui";

export function AttributesSection() {
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
        queryKey: ["attributes"],
        queryFn: () => attributesApi.getAll(),
        getItems: (data) => (Array.isArray(data?.data) ? data.data : []),
        createEmptyForm: () => ({ name: "", title: "", value: "", icon: "" }),
        mapItemToForm: (item: Attribute) => ({ name: item.name, title: item.title, value: item.value, icon: item.icon || "" }),
        buildPayload: (nextForm) => nextForm,
        createFn: (payload) => attributesApi.create(payload),
        updateFn: (itemId, payload) => attributesApi.update(itemId, payload),
        deleteFn: (itemId) => attributesApi.delete(itemId),
        getItemId: (item: Attribute) => item.id,
        getDeleteLabel: (item: Attribute) => item.title,
        entityName: "Attribute",
        buildDuplicatePayload: (item: Attribute) => {
            const token = createDuplicateToken();
            return {
                name: duplicateText(item.name, token),
                title: duplicateText(item.title, token),
                value: duplicateText(item.value, token),
                icon: item.icon || "",
            };
        },
    });

    return (
        <CrudSection
            title="Attributes"
            createLabel="+ New Attribute"
            onCreate={openCreate}
            showForm={showForm}
            formContent={
                <form onSubmit={submitForm} className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-4 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                        <div>
                            <FormImageField
                                label="Icon"
                                value={form.icon}
                                onChange={(url) => setForm((prev) => ({ ...prev, icon: url }))}
                                uploadFn={async (file) => {
                                    const response = await apartmentsApi.uploadFile(file);
                                    return { url: response.data.url };
                                }}
                                accept="image/*"
                                previewClassName="aspect-square h-auto"
                                uploadClassName="aspect-square h-auto"
                            />
                        </div>
                        <div className="max-w-[360px] space-y-3">
                            <div>
                                <label className="mb-1 block text-xs text-[#666666]">Name</label>
                                <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[#666666]">Title</label>
                                <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[#666666]">Value</label>
                                <input value={form.value} onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
                            </div>
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
                { key: "icon", label: "Icon" },
                { key: "name", label: "Name" },
                { key: "title", label: "Title" },
                { key: "value", label: "Value" },
            ]}
            items={items}
            emptyText="No attributes yet"
            getRowKey={(item) => item.id}
            renderCells={(item) => (
                <>
                    <td className="px-4 py-3 text-[#666666]">
                        {item.icon ? (
                            <img src={item.icon} alt="" className="h-8 w-8 rounded-lg object-cover" />
                        ) : (
                            <span className="text-[#999]">-</span>
                        )}
                    </td>
                    <td className="px-4 py-3 text-[#1A1A1A]">{item.name}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.title}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.value}</td>
                </>
            )}
            onEdit={openEdit}
            onDuplicate={duplicateItem}
            onDelete={confirmAndDelete}
        />
    );
}
