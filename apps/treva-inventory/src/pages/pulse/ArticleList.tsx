import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { articlesApi, Article } from "../../api/articles";
import { pulseCategoriesApi, PulseCategory } from "../../api/pulse-categories";
import { Layout } from "../../components/Layout";

export function ArticleList() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    const { data: result, isLoading } = useQuery({
        queryKey: ["articles", "admin"],
        queryFn: () => articlesApi.getAllAdmin(),
    });

    const { data: categoriesRes } = useQuery({
        queryKey: ["pulse-categories"],
        queryFn: () => pulseCategoriesApi.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => articlesApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["articles"] }),
    });

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Delete "${title}"?`)) deleteMutation.mutate(id);
    };

    const articles = (result?.data ?? []) as Article[];
    const categories = (categoriesRes?.data ?? []) as PulseCategory[];
    const filtered = articles.filter((a) => {
        const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
        const matchCategory = !category || a.category === category;
        return matchSearch && matchCategory;
    });

    return (
        <Layout>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Articles</h2>
                <Link
                    to="/pulse/articles/new"
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                    + New Article
                </Link>
            </div>

            <div className="mb-4 flex gap-3">
                <input
                    className="w-full max-w-xs rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30 placeholder:text-white/30"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-white/50">Loading...</div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Author</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Header</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((article) => (
                                <tr
                                    key={article.id}
                                    className="border-b border-white/5 transition-colors hover:bg-white/3"
                                >
                                    <td className="max-w-[300px] truncate px-4 py-3 font-medium">
                                        {article.title}
                                    </td>
                                    <td className="px-4 py-3 text-white/70">{article.category}</td>
                                    <td className="px-4 py-3 text-white/70">
                                        {article.author?.name ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-white/70">
                                        {new Date(article.date).toLocaleDateString("az-AZ")}
                                    </td>
                                    <td className="px-4 py-3">
                                        {article.headerPosition ? (
                                            <span className={`rounded-full px-2 py-0.5 text-xs ${
                                                article.headerPosition === "center"
                                                    ? "bg-purple-500/20 text-purple-400"
                                                    : article.headerPosition === "left"
                                                    ? "bg-blue-500/20 text-blue-400"
                                                    : "bg-orange-500/20 text-orange-400"
                                            }`}>
                                                {article.headerPosition} {article.headerOrder ? `#${article.headerOrder}` : ""}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-white/30">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {article.published ? (
                                            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                                                Published
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                                                Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            to={`/pulse/articles/${article.id}/edit`}
                                            className="mr-2 text-blue-400 hover:text-blue-300"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(article.id, article.title)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-white/50">
                                        No articles yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </Layout>
    );
}
