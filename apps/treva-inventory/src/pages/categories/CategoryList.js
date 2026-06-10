import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { categoriesApi } from "../../api/categories";
import { Layout } from "../../components/Layout";
export function CategoryList() {
    const queryClient = useQueryClient();
    const { data: categories, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.getAll(),
    });
    const deleteMutation = useMutation({
        mutationFn: (id) => categoriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
    const handleDelete = (id, title) => {
        if (window.confirm(`Delete "${title}"?`)) {
            deleteMutation.mutate(id);
        }
    };
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Categories" }), _jsx(Link, { to: "/categories/new", className: "rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20", children: "+ New Category" })] }), isLoading ? (_jsx("div", { className: "py-8 text-center text-white/50", children: "Loading..." })) : (_jsx("div", { className: "overflow-hidden rounded-xl border border-white/10", children: _jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { className: "border-b border-white/10 bg-white/5", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 font-medium", children: "Title" }), _jsx("th", { className: "px-4 py-3 font-medium", children: "Name" }), _jsx("th", { className: "px-4 py-3 font-medium", children: "Slug" }), _jsx("th", { className: "px-4 py-3 font-medium", children: "Created" }), _jsx("th", { className: "px-4 py-3 font-medium text-right", children: "Actions" })] }) }), _jsxs("tbody", { children: [categories?.data.map((category) => (_jsxs("tr", { className: "border-b border-white/5 transition-colors hover:bg-white/3", children: [_jsx("td", { className: "px-4 py-3", children: category.title }), _jsx("td", { className: "px-4 py-3 text-white/70", children: category.name }), _jsx("td", { className: "px-4 py-3 text-white/70", children: category.slug }), _jsx("td", { className: "px-4 py-3 text-white/50", children: new Date(category.createdAt).toLocaleDateString() }), _jsxs("td", { className: "px-4 py-3 text-right", children: [_jsx(Link, { to: `/categories/${category.id}/edit`, className: "mr-2 text-blue-400 hover:text-blue-300", children: "Edit" }), _jsx("button", { onClick: () => handleDelete(category.id, category.title), className: "text-red-400 hover:text-red-300", children: "Delete" })] })] }, category.id))), categories?.data.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-4 py-8 text-center text-white/50", children: "No categories yet" }) }))] })] }) }))] }));
}
