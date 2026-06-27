import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { authorsApi, Author } from "../../api/authors";
import { Layout } from "../../components/Layout";

export function AuthorList() {
    const queryClient = useQueryClient();

    const { data: result, isLoading } = useQuery({
        queryKey: ["authors"],
        queryFn: () => authorsApi.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => authorsApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authors"] }),
    });

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Delete "${name}"?`)) deleteMutation.mutate(id);
    };

    const authors = (result?.data ?? []) as Author[];

    return (
        <Layout>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Authors</h2>
                <Link
                    to="/pulse/authors/new"
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                    + New Author
                </Link>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-white/50">Loading...</div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Slug</th>
                                <th className="px-4 py-3 font-medium">Articles</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {authors.map((author) => (
                                <tr
                                    key={author.id}
                                    className="border-b border-white/5 transition-colors hover:bg-white/3"
                                >
                                    <td className="flex items-center gap-3 px-4 py-3">
                                        {author.avatar ? (
                                            <img
                                                src={author.avatar}
                                                alt={author.name}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white/50">
                                                {author.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="font-medium">{author.name}</span>
                                    </td>
                                    <td className="px-4 py-3 text-white/70">{author.title ?? "—"}</td>
                                    <td className="px-4 py-3 text-white/70">{author.slug}</td>
                                    <td className="px-4 py-3 text-white/70">
                                        {author._count?.articles ?? 0}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            to={`/pulse/authors/${author.id}/edit`}
                                            className="mr-2 text-blue-400 hover:text-blue-300"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(author.id, author.name)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {authors.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                                        No authors yet
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
