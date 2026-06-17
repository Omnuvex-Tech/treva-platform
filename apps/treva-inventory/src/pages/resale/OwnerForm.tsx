import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ownersApi, CreateOwnerData } from "../../api/owners";
import { Layout } from "../../components/Layout";

export function OwnerForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: existing } = useQuery({
        queryKey: ["owner", id],
        queryFn: () => ownersApi.getById(id!),
        enabled: isEdit,
    });

    const [form, setForm] = useState<CreateOwnerData>({
        firstName: "",
        lastName: "",
        profession: "",
        phoneNumber: "",
    });

    useEffect(() => {
        if (existing?.data) {
            setForm({
                firstName: existing.data.firstName,
                lastName: existing.data.lastName,
                profession: existing.data.profession || "",
                phoneNumber: existing.data.phoneNumber,
            });
        }
    }, [existing?.data]);

    const mutation = useMutation({
        mutationFn: (data: CreateOwnerData) =>
            isEdit ? ownersApi.update(id!, data) : ownersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owners"] });
            navigate("/resale/owners");
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
                    {isEdit ? "Edit Owner" : "New Owner"}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs text-white/60">First Name</label>
                        <input
                            className={inputClass}
                            value={form.firstName}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, firstName: e.target.value }))
                            }
                            placeholder="e.g. Farid"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Last Name</label>
                        <input
                            className={inputClass}
                            value={form.lastName}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, lastName: e.target.value }))
                            }
                            placeholder="e.g. Aliyev"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Profession</label>
                        <input
                            className={inputClass}
                            value={form.profession}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, profession: e.target.value }))
                            }
                            placeholder="e.g. Engineer"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Phone Number</label>
                        <input
                            className={inputClass}
                            value={form.phoneNumber}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, phoneNumber: e.target.value }))
                            }
                            placeholder="e.g. +994501234567"
                            required
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
                        onClick={() => navigate("/resale/owners")}
                        className="rounded-lg border border-white/10 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Layout>
    );
}
