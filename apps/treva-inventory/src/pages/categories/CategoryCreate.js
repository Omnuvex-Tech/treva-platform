import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";
import { Layout } from "../../components/Layout";
export function CategoryCreate() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const createMutation = useMutation({
        mutationFn: () => categoriesApi.create({ title, name, slug }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            navigate("/categories");
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate();
    };
    const handleTitleChange = (value) => {
        setTitle(value);
        if (!slug) {
            setSlug(value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""));
        }
    };
    return (_jsx(Layout, { children: _jsxs("div", { className: "mx-auto max-w-lg", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "New Category" }), _jsx("p", { className: "text-sm text-white/50", children: "Create a new category" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "rounded-xl border border-white/10 bg-white/3 p-6", children: [_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-white/70", children: "Title" }), _jsx("input", { type: "text", value: title, onChange: (e) => handleTitleChange(e.target.value), className: "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none", placeholder: "Panorama by ELIE SAAB", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-white/70", children: "Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), className: "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none", placeholder: "panorama-by-elie-saab", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-white/70", children: "Slug" }), _jsx("input", { type: "text", value: slug, onChange: (e) => setSlug(e.target.value), className: "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none", placeholder: "panorama-by-elie-saab", required: true })] })] }), createMutation.isError && (_jsx("div", { className: "mt-4 rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-300", children: createMutation.error?.message || "Failed to create category" })), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsx("button", { type: "submit", disabled: createMutation.isPending, className: "rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50", children: createMutation.isPending ? "Creating..." : "Create" }), _jsx("button", { type: "button", onClick: () => navigate("/categories"), className: "rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5", children: "Cancel" })] })] })] }) }));
}
