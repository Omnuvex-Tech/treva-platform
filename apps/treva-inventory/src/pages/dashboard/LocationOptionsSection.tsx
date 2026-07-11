import { locationOptionsApi, type LocationOption } from "../../api/location-options";
import { CrudSection } from "../../components/CrudSection";
import { useMessageCenter } from "../../components/MessageCenter";
import { useEntityCrud } from "../../hooks/useEntityCrud";
import { createDuplicateToken, duplicateText } from "../../utils/duplicate";
import { FormDropdown } from "@repo/ui";

export function LocationOptionsSection() {
    type LocationOptionForm = {
        type: "" | "region" | "city";
        name: string;
        title: string;
    };

    const { showError } = useMessageCenter();

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
        queryKey: ["location-options"],
        queryFn: () => locationOptionsApi.getAll(),
        getItems: (data) => (Array.isArray(data?.data) ? data.data : []),
        createEmptyForm: (): LocationOptionForm => ({ type: "", name: "", title: "" }),
        mapItemToForm: (item: LocationOption): LocationOptionForm => ({
            type: item.type,
            name: item.name,
            title: item.title,
        }),
        buildPayload: (nextForm: LocationOptionForm) => ({
            type: nextForm.type as "region" | "city",
            name: nextForm.name,
            title: nextForm.title,
        }),
        createFn: (payload) => locationOptionsApi.create(payload),
        updateFn: (itemId, payload) => locationOptionsApi.update(itemId, payload),
        deleteFn: (itemId) => locationOptionsApi.delete(itemId),
        getItemId: (item: LocationOption) => item.id,
        getDeleteLabel: (item: LocationOption) => item.title,
        entityName: "Location option",
        buildDuplicatePayload: (item: LocationOption) => {
            const token = createDuplicateToken();
            return {
                type: item.type,
                name: duplicateText(item.name, token),
                title: duplicateText(item.title, token),
            };
        },
    });

    return (
        <CrudSection
            title="Location Options"
            createLabel="+ New Location Option"
            onCreate={openCreate}
            showForm={showForm}
            formContent={
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!form.type) {
                            showError({ title: "Type is required" });
                            return;
                        }

                        submitForm(e);
                    }}
                    className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                    <div className="mb-4 grid grid-cols-3 gap-4">
                        <div>
                            <FormDropdown
                                label="Type"
                                value={form.type}
                                options={[
                                    { id: "city", label: "City" },
                                    { id: "region", label: "Region" },
                                ]}
                                placeholder="Select type"
                                onChange={(id) => setForm((prev) => ({ ...prev, type: id as "region" | "city" }))}
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
                            <label className="mb-1 block text-xs text-[#666666]">Title</label>
                            <input
                                value={form.title}
                                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
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
                { key: "type", label: "Type" },
                { key: "name", label: "Name" },
                { key: "title", label: "Title" },
            ]}
            items={items}
            emptyText="No location options yet"
            getRowKey={(item) => item.id}
            renderCells={(item) => (
                <>
                    <td className="px-4 py-3 text-[#666666] capitalize">{item.type}</td>
                    <td className="px-4 py-3 text-[#1A1A1A]">{item.name}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.title}</td>
                </>
            )}
            onEdit={openEdit}
            onDuplicate={duplicateItem}
            onDelete={confirmAndDelete}
        />
    );
}
