import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { attributesApi, CreateAttributeData } from "../../api/attributes";
import { apartmentsApi } from "../../api/apartments";
import { Layout } from "../../components/Layout";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";

export function AttributeForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();

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

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleIconUpload = async (file: File) => {
        setUploading(true);
        setUploadError("");
        try {
            const res = await apartmentsApi.uploadFile(file);
            setForm((f) => ({ ...f, icon: res.data.url }));
            showSuccess({ title: "Icon uploaded" });
        } catch {
            setUploadError("Icon upload failed");
            showError({
                title: "Icon upload failed",
                description: "Please try again.",
            });
        } finally {
            setUploading(false);
        }
    };

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
    const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) handleIconUpload(file);
    };

    const mutation = useMutation({
        mutationFn: (data: CreateAttributeData) =>
            isEdit ? attributesApi.update(id!, data) : attributesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attributes"] });
            showSuccess({
                title: isEdit ? "Attribute updated" : "Attribute created",
            });
            navigate("/resale/attributes");
        },
        onError: (error) => {
            showError({
                title: isEdit
                    ? "Attribute could not be updated"
                    : "Attribute could not be created",
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
                            placeholder="renovation"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Title</label>
                        <input
                            className={inputClass}
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            placeholder="Renovation"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs text-white/60">Value</label>
                    <input
                        className={inputClass}
                        value={form.value}
                        onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                        placeholder="Modern"
                        required
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs text-white/60">Icon (PNG)</label>
                    {uploadError && (
                        <div className="mb-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-400">{uploadError}</div>
                    )}
                    {form.icon ? (
                        <div className="relative inline-block">
                            <img src={form.icon} alt="Icon" className="h-16 w-16 rounded-lg object-cover" />
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, icon: "" }))}
                                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-xs text-white hover:bg-red-500"
                                title="Remove"
                            >
                                âœ•
                            </button>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/70 px-2 py-0.5 text-[11px] text-white hover:bg-black/90"
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <div
                            onDragOver={onDragOver}
                            onDragEnter={onDragEnter}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
                                dragActive
                                    ? "border-blue-400 bg-blue-500/10"
                                    : uploading
                                        ? "pointer-events-none opacity-50 border-white/15 bg-white/5"
                                        : "border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/8"
                            }`}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-colors ${dragActive ? "text-blue-400" : "text-white/40"}`}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span className={`text-sm ${dragActive ? "text-blue-400" : "text-white/60"}`}>
                                {uploading ? "Uploading..." : dragActive ? "Drop icon here" : "Drag & drop or click to upload"}
                            </span>
                            <span className="text-[11px] text-white/30">PNG image</span>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleIconUpload(file);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
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
