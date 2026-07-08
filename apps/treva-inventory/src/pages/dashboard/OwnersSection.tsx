import { ownersApi, type Owner } from "../../api/owners";
import { CrudSection } from "../../components/CrudSection";
import { useEntityCrud } from "../../hooks/useEntityCrud";
import { createDuplicateToken, duplicatePhone, duplicateText } from "../../utils/duplicate";

export function OwnersSection() {
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
        queryKey: ["owners"],
        queryFn: () => ownersApi.getAll(),
        getItems: (data) => (Array.isArray(data?.data) ? data.data : []),
        createEmptyForm: () => ({ firstName: "", lastName: "", profession: "", phoneNumber: "" }),
        mapItemToForm: (item: Owner) => ({
            firstName: item.firstName,
            lastName: item.lastName,
            profession: item.profession || "",
            phoneNumber: item.phoneNumber,
        }),
        buildPayload: (nextForm) => ({
            firstName: nextForm.firstName,
            lastName: nextForm.lastName,
            profession: nextForm.profession || undefined,
            phoneNumber: nextForm.phoneNumber,
        }),
        createFn: (payload) => ownersApi.create(payload),
        updateFn: (itemId, payload) => ownersApi.update(itemId, payload),
        deleteFn: (itemId) => ownersApi.delete(itemId),
        getItemId: (item: Owner) => item.id,
        getDeleteLabel: (item: Owner) => `${item.firstName} ${item.lastName}`,
        entityName: "Owner",
        buildDuplicatePayload: (item: Owner) => {
            const token = createDuplicateToken();
            return {
                firstName: item.firstName,
                lastName: duplicateText(item.lastName, token),
                profession: item.profession || undefined,
                phoneNumber: duplicatePhone(item.phoneNumber, token),
            };
        },
    });

    return (
        <CrudSection
            title="Owners"
            createLabel="+ New Owner"
            onCreate={openCreate}
            showForm={showForm}
            formContent={
                <form onSubmit={submitForm} className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">First Name</label>
                            <input value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Last Name</label>
                            <input value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Profession</label>
                            <input value={form.profession} onChange={(e) => setForm((prev) => ({ ...prev, profession: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Phone Number</label>
                            <input value={form.phoneNumber} onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400" required />
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
                { key: "profession", label: "Profession" },
                { key: "phone", label: "Phone" },
            ]}
            items={items}
            emptyText="No owners yet"
            getRowKey={(item) => item.id}
            renderCells={(item) => (
                <>
                    <td className="px-4 py-3 text-[#1A1A1A]">{item.firstName} {item.lastName}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.profession || "—"}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.phoneNumber}</td>
                </>
            )}
            onEdit={openEdit}
            onDuplicate={duplicateItem}
            onDelete={confirmAndDelete}
        />
    );
}
