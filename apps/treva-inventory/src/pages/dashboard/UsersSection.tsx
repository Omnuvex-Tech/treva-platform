import { useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { usersApi, type UpdateUserData, type CreateUserData, type User } from "../../api/users";
import { CrudSection } from "../../components/CrudSection";
import { useEntityCrud } from "../../hooks/useEntityCrud";
import { PERMISSION_SECTIONS, allMenuKeys, type PermissionSection } from "../../lib/permissions";

/** Menu keys granted per section. A missing key means the project is not granted at all. */
type SelectedAccess = Partial<Record<PermissionSection, string[]>>;

interface UserForm {
    name: string;
    email: string;
    password: string;
    isActive: boolean;
    access: SelectedAccess;
}

export function UsersSection() {
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
    } = useEntityCrud<
        Awaited<ReturnType<typeof usersApi.getAll>>,
        User,
        UserForm,
        UpdateUserData
    >({
        queryKey: ["users"],
        queryFn: () => usersApi.getAll(),
        getItems: (data) => (Array.isArray(data?.data) ? data.data : []),
        createEmptyForm: () => ({
            name: "",
            email: "",
            password: "",
            isActive: true,
            access: {},
        }),
        mapItemToForm: (item) => ({
            name: item.name ?? "",
            email: item.email,
            password: "",
            isActive: item.isActive,
            access: item.permissions.reduce<SelectedAccess>((acc, entry) => {
                acc[entry.section as PermissionSection] = entry.menuKeys;
                return acc;
            }, {}),
        }),
        buildPayload: (nextForm) => ({
            email: nextForm.email,
            name: nextForm.name || undefined,
            isActive: nextForm.isActive,
            // Blank on edit means "keep the current password".
            ...(nextForm.password ? { password: nextForm.password } : {}),
            permissions: Object.entries(nextForm.access)
                .filter(([, menuKeys]) => (menuKeys?.length ?? 0) > 0)
                .map(([section, menuKeys]) => ({ section, menuKeys: menuKeys ?? [] })),
        }),
        createFn: (payload) => usersApi.create(payload as CreateUserData),
        updateFn: (itemId, payload) => usersApi.update(itemId, payload),
        deleteFn: (itemId) => usersApi.delete(itemId),
        getItemId: (item) => item.id,
        getDeleteLabel: (item) => item.email,
        entityName: "User",
    });

    const [showPassword, setShowPassword] = useState(false);

    // Every time the form is (re)opened the password starts hidden again.
    const handleOpenCreate = () => {
        setShowPassword(false);
        openCreate();
    };

    const handleOpenEdit = (item: User) => {
        setShowPassword(false);
        openEdit(item);
    };

    const handleCloseForm = () => {
        setShowPassword(false);
        closeForm();
    };

    const toggleSection = (section: PermissionSection, enabled: boolean) => {
        setForm((prev) => {
            const nextAccess = { ...prev.access };

            // Granting a project starts with every menu enabled; the admin then
            // unchecks whatever this user should not see.
            if (enabled) nextAccess[section] = allMenuKeys(section);
            else delete nextAccess[section];

            return { ...prev, access: nextAccess };
        });
    };

    const toggleMenu = (section: PermissionSection, menuKey: string, enabled: boolean) => {
        setForm((prev) => {
            const current = prev.access[section] ?? [];
            const nextKeys = enabled
                ? [...current, menuKey]
                : current.filter((key) => key !== menuKey);

            return { ...prev, access: { ...prev.access, [section]: nextKeys } };
        });
    };

    const describeAccess = (user: User) => {
        const granted = user.permissions.filter((entry) => entry.menuKeys.length > 0);

        if (granted.length === 0) return "No access";

        return granted
            .map((entry) => {
                const label = PERMISSION_SECTIONS.find((s) => s.key === entry.section)?.label ?? entry.section;
                return `${label} (${entry.menuKeys.length})`;
            })
            .join(", ");
    };

    return (
        <CrudSection
            title="Users"
            createLabel="+ New User"
            onCreate={handleOpenCreate}
            showForm={showForm}
            formContent={
                <form onSubmit={submitForm} className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Name</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#666666]">
                                Password {editItem ? <span className="text-[#999999]">(leave blank to keep current)</span> : null}
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                                    className="h-10 w-full rounded-xl border border-gray-200 pl-3 pr-10 text-sm outline-none focus:border-gray-400"
                                    minLength={8}
                                    required={!editItem}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-3 flex h-5 w-5 items-center justify-center text-[#666666] transition-colors hover:text-[#1A1A1A] cursor-pointer"
                                >
                                    {showPassword ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <label className="flex h-10 cursor-pointer select-none items-center gap-2 text-sm text-[#333333]">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                                    className="h-4 w-4 accent-[#4E525D]"
                                />
                                Account active
                            </label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#999999]">
                            Project access
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {PERMISSION_SECTIONS.map((section) => {
                                const selectedMenus = form.access[section.key];
                                const isSectionEnabled = selectedMenus !== undefined;

                                return (
                                    <div key={section.key} className="rounded-xl border border-gray-200 bg-white p-4">
                                        <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-[#1A1A1A]">
                                            <input
                                                type="checkbox"
                                                checked={isSectionEnabled}
                                                onChange={(e) => toggleSection(section.key, e.target.checked)}
                                                className="h-4 w-4 accent-[#4E525D]"
                                            />
                                            {section.label}
                                        </label>

                                        {isSectionEnabled ? (
                                            <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                                                {section.menus.map((menu) => (
                                                    <label
                                                        key={menu.key}
                                                        className="flex cursor-pointer select-none items-center gap-2 text-sm text-[#666666]"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMenus.includes(menu.key)}
                                                            onChange={(e) => toggleMenu(section.key, menu.key, e.target.checked)}
                                                            className="h-4 w-4 accent-[#4E525D]"
                                                        />
                                                        {menu.label}
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="mt-2 mb-0 text-xs text-[#999999]">
                                                Select to grant access to this project
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="rounded-xl px-4 py-2 text-sm font-medium text-white" style={{ background: "#4E525D" }}>
                            {editItem ? "Update" : "Create"}
                        </button>
                        <button type="button" onClick={handleCloseForm} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-[#666666]">
                            Cancel
                        </button>
                    </div>
                </form>
            }
            isLoading={isLoading}
            columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "status", label: "Status" },
                { key: "access", label: "Project access" },
            ]}
            items={items}
            emptyText="No users yet"
            getRowKey={(item) => item.id}
            renderCells={(item) => (
                <>
                    <td className="px-4 py-3 text-[#1A1A1A]">{item.name || "—"}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.email}</td>
                    <td className="px-4 py-3">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                item.isActive
                                    ? "bg-[#E7F6ED] text-[#2D9A5B]"
                                    : "bg-[#FDECEC] text-[#C3362B]"
                            }`}
                        >
                            {item.isActive ? "Active" : "Inactive"}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-[#666666]">{describeAccess(item)}</td>
                </>
            )}
            onEdit={handleOpenEdit}
            onDelete={confirmAndDelete}
        />
    );
}
