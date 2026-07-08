import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { apartmentTypesApi, CreateApartmentTypeData } from "../../api/apartment-types";
import { Layout } from "../../components/Layout";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";

export function ApartmentTypeForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();

    const { data: existing } = useQuery({
        queryKey: ["apartment-type", id],
        queryFn: () => apartmentTypesApi.getById(id!),
        enabled: isEdit,
    });

    const [form, setForm] = useState<CreateApartmentTypeData>({
        title: "",
        slug: "",
        order: 0,
    });

    useEffect(() => {
        if (existing?.data) {
            setForm({
                title: existing.data.title,
                slug: existing.data.slug,
                order: existing.data.order,
            });
        }
    }, [existing?.data]);

    const mutation = useMutation({
        mutationFn: (data: CreateApartmentTypeData) =>
            isEdit ? apartmentTypesApi.update(id!, data) : apartmentTypesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apartment-types"] });
            showSuccess({
                title: isEdit ? "Apartment type updated" : "Apartment type created",
            });
            navigate("/resale/apartment-types");
        },
        onError: (error) => {
            showError({
                title: isEdit
                    ? "Apartment type could not be updated"
                    : "Apartment type could not be created",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(form);
    };

    const inputClass =
        "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30 placeholder:text-white/30";

    return (
        <Layout>
            <div className="mb-4">
                <h2 className="text-lg font-semibold">
                    {isEdit ? "Edit Apartment Type" : "New Apartment Type"}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
                <div>
                    <label className="mb-1 block text-xs text-white/60">Title</label>
                    <input
                        className={inputClass}
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. 1 Room"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Slug</label>
                        <input
                            className={inputClass}
                            value={form.slug}
                            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                            placeholder="e.g. 1-room"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Order</label>
                        <input
                            className={inputClass}
                            type="number"
                            value={form.order}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))
                            }
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
                        onClick={() => navigate("/resale/apartment-types")}
                        className="rounded-lg border border-white/10 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Layout>
    );
}
