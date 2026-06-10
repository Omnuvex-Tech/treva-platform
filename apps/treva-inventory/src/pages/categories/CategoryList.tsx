import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { categoriesApi, Category } from "../../api/categories";
import { Layout } from "../../components/Layout";

export function CategoryList() {
    const queryClient = useQueryClient();

    const { data: categories, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => categoriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Delete "${title}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <Layout>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Categories</h2>
                <Link
                    to="/categories/new"
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                    + New Category
                </Link>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-white/50">Loading...</div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Slug</th>
                                <th className="px-4 py-3 font-medium">Created</th>
                                <th className="px-4 py-3 font-medium text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories?.data.map((category: Category) => (
                                <tr
                                    key={category.id}
                                    className="border-b border-white/5 transition-colors hover:bg-white/3"
                                >
                                    <td className="px-4 py-3">{category.title}</td>
                                    <td className="px-4 py-3 text-white/70">
                                        {category.name}
                                    </td>
                                    <td className="px-4 py-3 text-white/70">
                                        {category.slug}
                                    </td>
                                    <td className="px-4 py-3 text-white/50">
                                        {new Date(category.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            to={`/categories/${category.id}/edit`}
                                            className="mr-2 text-blue-400 hover:text-blue-300"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(category.id, category.title)
                                            }
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories?.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-white/50"
                                    >
                                        No categories yet
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
