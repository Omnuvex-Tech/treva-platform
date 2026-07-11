import { roomOptionsApi, type RoomOption } from "../../api/room-options";
import { CrudSection } from "../../components/CrudSection";
import { useMessageCenter } from "../../components/MessageCenter";
import { useEntityCrud } from "../../hooks/useEntityCrud";
import { createDuplicateToken, duplicateText } from "../../utils/duplicate";
import { FormDropdown } from "@repo/ui";

export function RoomOptionsSection() {
    type RoomOptionForm = {
        name: string;
        title: string;
        type: "" | "resale" | "off-plan";
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
        queryKey: ["room-options"],
        queryFn: () => roomOptionsApi.getAll(),
        getItems: (data) => (Array.isArray(data?.data) ? data.data : []),
        createEmptyForm: (): RoomOptionForm => ({ name: "", title: "", type: "" }),
        mapItemToForm: (item: RoomOption): RoomOptionForm => ({
            name: item.name,
            title: item.title,
            type: (item.type as "resale" | "off-plan") || "",
        }),
        buildPayload: (nextForm: RoomOptionForm) => ({
            name: nextForm.name,
            title: nextForm.title,
            type: nextForm.type as "resale" | "off-plan",
        }),
        createFn: (payload) => roomOptionsApi.create(payload),
        updateFn: (itemId, payload) => roomOptionsApi.update(itemId, payload),
        deleteFn: (itemId) => roomOptionsApi.delete(itemId),
        getItemId: (item: RoomOption) => item.id,
        getDeleteLabel: (item: RoomOption) => item.title,
        entityName: "Room option",
        buildDuplicatePayload: (item: RoomOption) => {
            const token = createDuplicateToken();
            return {
                name: duplicateText(item.name, token),
                title: duplicateText(item.title, token),
                type: (item.type as "resale" | "off-plan") || "",
            };
        },
    });

    return (
        <CrudSection
            title="Room Options"
            createLabel="+ New Room Option"
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
                            <label className="mb-1 block text-xs text-[#666666]">Name</label>
                            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Title</label>
                            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
                        </div>
                        <div>
                            <FormDropdown
                                label="Type"
                                value={form.type}
                                options={[
                                    { id: "resale", label: "Resale" },
                                    { id: "off-plan", label: "Off-Plan" },
                                ]}
                                placeholder="Select type"
                                onChange={(id) => setForm((prev) => ({ ...prev, type: id as RoomOptionForm["type"] }))}
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
                { key: "name", label: "Name" },
                { key: "title", label: "Title" },
                { key: "type", label: "Type" },
            ]}
            items={items}
            emptyText="No room options yet"
            getRowKey={(item) => item.id}
            renderCells={(item) => (
                <>
                    <td className="px-4 py-3 text-[#666666]">{item.name}</td>
                    <td className="px-4 py-3 text-[#1A1A1A]">{item.title}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.type || "-"}</td>
                </>
            )}
            onEdit={openEdit}
            onDuplicate={duplicateItem}
            onDelete={confirmAndDelete}
        />
    );
}
