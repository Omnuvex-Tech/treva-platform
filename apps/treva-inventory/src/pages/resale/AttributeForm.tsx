import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { attributesApi, CreateAttributeData } from "../../api/attributes";
import { Layout } from "../../components/Layout";

export function AttributeForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: existing } = useQuery({
        queryKey: ["attribute", id],
        queryFn: () => attributesApi.getById(id!),
        enabled: isEdit,
    });

    const [form, setForm] = useState<CreateAttributeData>({
        name: "",
        title: "",
        value: "",
        icon: "",
    });

    useEffect(() => {
        if (existing?.data) {
            setForm({
                name: existing.data.name,
                title: existing.data.title,
                value: existing.data.value,
                icon: existing.data.icon || "",
            });
        }
    }, [existing?.data]);

    const mutation = useMutation({
        mutationFn: (data: CreateAttributeData) =>
            isEdit ? attributesApi.update(id!, data) : attributesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attributes"] });
            navigate("/resale/attributes");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(form);
    };

    const inputClass =
        "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30";

    return (
        <Layout>
            <div className="mb-4">
                <h2 className="text-lg font-semibold">
                    {isEdit ? "Edit Attribute" : "New Attribute"}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Name</label>
                        <input
                            className={inputClass}
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. renovation"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Title</label>
                        <input
                            className={inputClass}
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Renovation"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Value</label>
                        <input
                            className={inputClass}
                            value={form.value}
                            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                            placeholder="e.g. Modern"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Icon (emoji)</label>
                        <input
                            className={inputClass}
                            value={form.icon}
                            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                            placeholder="e.g. 🏠"
                        />
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="rounded-lg bg-white/10 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                    >
                        {mutation.isPending ? "Saving..." : isEdit ? "Update" : "Create"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/resale/attributes")}
                        className="rounded-lg border border-white/10 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Layout>
    );
}
