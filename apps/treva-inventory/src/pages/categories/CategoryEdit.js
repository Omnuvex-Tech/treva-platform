import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";
import { Layout } from "../../components/Layout";
export function CategoryEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const { data: category, isLoading } = useQuery({
        queryKey: ["category", id],
        queryFn: () => categoriesApi.getById(id),
        enabled: !!id,
    });
    useEffect(() => {
        if (category?.data) {
            setTitle(category.data.title);
            setName(category.data.name);
            setSlug(category.data.slug);
        }
    }, [category]);
    const updateMutation = useMutation({
        mutationFn: () => categoriesApi.update(id, { title, name, slug }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            navigate("/categories");
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate();
    };
    if (isLoading) {
        return (_jsx(Layout, { children: _jsx("div", { className: "py-8 text-center text-white/50", children: "Loading..." }) }));
    }
    return (_jsx(Layout, { children: _jsxs("div", { className: "mx-auto max-w-lg", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Edit Category" }), _jsx("p", { className: "text-sm text-white/50", children: "Update category details" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "rounded-xl border border-white/10 bg-white/3 p-6", children: [_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-white/70", children: "Title" }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), className: "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-white/70", children: "Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), className: "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-white/70", children: "Slug" }), _jsx("input", { type: "text", value: slug, onChange: (e) => setSlug(e.target.value), className: "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none", required: true })] })] }), updateMutation.isError && (_jsx("div", { className: "mt-4 rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-300", children: updateMutation.error?.message || "Failed to update category" })), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsx("button", { type: "submit", disabled: updateMutation.isPending, className: "rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50", children: updateMutation.isPending ? "Saving..." : "Save" }), _jsx("button", { type: "button", onClick: () => navigate("/categories"), className: "rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5", children: "Cancel" })] })] })] }) }));
}
