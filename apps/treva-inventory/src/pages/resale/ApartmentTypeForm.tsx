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
        name: "",
        title: "",
    });

    useEffect(() => {
        if (existing?.data) {
            setForm({
                name: existing.data.name,
                title: existing.data.title,
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
                    <label className="mb-1 block text-xs text-white/60">Name</label>
                    <input
                        className={inputClass}
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="studio"
                        required
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-white/60">Title</label>
                    <input
                        className={inputClass}
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="1 Room"
                        required
                    />
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
