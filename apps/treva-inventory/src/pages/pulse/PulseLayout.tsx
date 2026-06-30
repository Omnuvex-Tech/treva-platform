import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi, Article, CreateArticleData } from "../../api/articles";
import { Layout } from "../../components/Layout";

type SectionKey = "left" | "center" | "right" | "week";

const SECTION_CONFIG: Record<SectionKey, { label: string; limit: number | null; color: string }> = {
    left: { label: "Left Column", limit: 2, color: "blue" },
    center: { label: "Center (Featured)", limit: 1, color: "purple" },
    right: { label: "Right Column", limit: 4, color: "orange" },
    week: { label: "Həftənin Seçimi", limit: null, color: "green" },
};

const colorClasses: Record<string, { badge: string; border: string; hover: string }> = {
    blue: { badge: "bg-blue-500/20 text-blue-400", border: "border-blue-500/30", hover: "hover:border-blue-500/50" },
    purple: { badge: "bg-purple-500/20 text-purple-400", border: "border-purple-500/30", hover: "hover:border-purple-500/50" },
    orange: { badge: "bg-orange-500/20 text-orange-400", border: "border-orange-500/30", hover: "hover:border-orange-500/50" },
    green: { badge: "bg-green-500/20 text-green-400", border: "border-green-500/30", hover: "hover:border-green-500/50" },
};

export function PulseLayout() {
    const queryClient = useQueryClient();
    const [openSection, setOpenSection] = useState<SectionKey | null>(null);

    const { data: result, isLoading } = useQuery({
        queryKey: ["articles", "admin"],
        queryFn: () => articlesApi.getAllAdmin(),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { headerPosition: string | null; headerOrder: number | null } }) =>
            articlesApi.update(id, data as Partial<CreateArticleData>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["articles"] });
        },
    });

    const articles = (result?.data ?? []) as Article[];

    const sections: Record<SectionKey, Article[]> = {
        left: articles
            .filter((a) => a.headerPosition === "left")
            .sort((a, b) => (a.headerOrder ?? 0) - (b.headerOrder ?? 0)),
        center: articles
            .filter((a) => a.headerPosition === "center")
            .sort((a, b) => (a.headerOrder ?? 0) - (b.headerOrder ?? 0)),
        right: articles
            .filter((a) => a.headerPosition === "right")
            .sort((a, b) => (a.headerOrder ?? 0) - (b.headerOrder ?? 0)),
        week: articles
            .filter((a) => a.headerPosition === "week")
            .sort((a, b) => (a.headerOrder ?? 0) - (b.headerOrder ?? 0)),
    };

    const assignedIds = new Set(articles.filter((a) => a.headerPosition).map((a) => a.id));
    const unassigned = articles.filter((a) => !a.headerPosition && a.published);

    const handleAssign = (section: SectionKey, article: Article) => {
        const config = SECTION_CONFIG[section];
        const currentCount = sections[section].length;
        if (config.limit !== null && currentCount >= config.limit) return;

        const nextOrder = sections[section].length + 1;
        updateMutation.mutate({
            id: article.id,
            data: { headerPosition: section, headerOrder: nextOrder },
        });
    };

    const handleUnassign = (article: Article) => {
        updateMutation.mutate({
            id: article.id,
            data: { headerPosition: null, headerOrder: null },
        });
    };

    const handleMove = (article: Article, direction: "up" | "down") => {
        const section = article.headerPosition as SectionKey;
        const items = sections[section];
        const idx = items.findIndex((a) => a.id === article.id);
        if (idx === -1) return;

        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= items.length) return;

        const swap = items[swapIdx]!;
        updateMutation.mutate({ id: article.id, data: { headerPosition: section, headerOrder: swap.headerOrder ?? 0 } });
        updateMutation.mutate({ id: swap.id, data: { headerPosition: section, headerOrder: article.headerOrder ?? 0 } });
    };

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-lg font-semibold">Pulse Layout</h2>
                <p className="mt-1 text-sm text-white/50">
                    Assign articles to header sections. Left: max 2, Center: max 1, Right: max 4, Həftənin seçimi: unlimited.
                </p>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-white/50">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {(Object.keys(SECTION_CONFIG) as SectionKey[]).map((key) => {
                        const config = SECTION_CONFIG[key];
                        const colors = colorClasses[config.color]!;
                        const items = sections[key];
                        const isFull = config.limit !== null && items.length >= config.limit;

                        return (
                            <div
                                key={key}
                                className={`rounded-xl border ${colors.border} bg-white/5 p-4`}
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-white">{config.label}</h3>
                                        <span className={`rounded-full px-2 py-0.5 text-xs ${colors.badge}`}>
                                            {items.length}{config.limit !== null ? ` / ${config.limit}` : ""}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setOpenSection(openSection === key ? null : key)}
                                        className="rounded-md bg-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/20"
                                    >
                                        {openSection === key ? "Close" : "+ Add"}
                                    </button>
                                </div>

                                {/* Article list */}
                                <div className="space-y-2">
                                    {items.length === 0 && (
                                        <p className="py-4 text-center text-xs text-white/30">No articles assigned</p>
                                    )}
                                    {items.map((article, idx) => (
                                        <div
                                            key={article.id}
                                            className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2"
                                        >
                                            {article.coverImage && (
                                                <img
                                                    src={article.coverImage}
                                                    alt=""
                                                    className="h-10 w-10 rounded object-cover"
                                                />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm text-white">{article.title}</div>
                                                <div className="text-xs text-white/40">{article.category}</div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleMove(article, "up")}
                                                    disabled={idx === 0}
                                                    className="rounded px-1.5 py-0.5 text-xs text-white/50 hover:bg-white/10 disabled:opacity-30"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => handleMove(article, "down")}
                                                    disabled={idx === items.length - 1}
                                                    className="rounded px-1.5 py-0.5 text-xs text-white/50 hover:bg-white/10 disabled:opacity-30"
                                                >
                                                    ↓
                                                </button>
                                                <button
                                                    onClick={() => handleUnassign(article)}
                                                    className="rounded px-1.5 py-0.5 text-xs text-red-400 hover:bg-red-500/10"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add article dropdown */}
                                {openSection === key && (
                                    <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
                                        <p className="mb-2 text-xs text-white/40">
                                            Select a published article to assign:
                                        </p>
                                        <div className="max-h-48 space-y-1 overflow-y-auto">
                                            {unassigned.length === 0 && (
                                                <p className="py-2 text-center text-xs text-white/30">
                                                    All published articles are assigned
                                                </p>
                                            )}
                                            {unassigned.map((article) => (
                                                <button
                                                    key={article.id}
                                                    onClick={() => handleAssign(key, article)}
                                                    disabled={isFull}
                                                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-white/80 hover:bg-white/10 disabled:opacity-40"
                                                >
                                                    {article.coverImage && (
                                                        <img
                                                            src={article.coverImage}
                                                            alt=""
                                                            className="h-6 w-6 rounded object-cover"
                                                        />
                                                    )}
                                                    <span className="truncate">{article.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
}
