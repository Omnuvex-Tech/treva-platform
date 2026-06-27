import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
    articlesApi,
    CreateArticleData,
    ArticleBlock,
} from "../../api/articles";
import { authorsApi, Author } from "../../api/authors";
import { keywordsApi, Keyword } from "../../api/keywords";
import { pulseCategoriesApi, PulseCategory } from "../../api/pulse-categories";
import { Layout } from "../../components/Layout";

type TabKey = "basic" | "seo" | "content";

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[ə]/g, "e")
        .replace(/[ü]/g, "u")
        .replace(/[ı]/g, "i")
        .replace(/[ö]/g, "o")
        .replace(/[ç]/g, "c")
        .replace(/[ş]/g, "s")
        .replace(/[ğ]/g, "g")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

let blockIdCounter = 0;
function newBlockId() {
    return `block-${Date.now()}-${++blockIdCounter}`;
}

type BlockWithId = ArticleBlock & { _id: string };

function createEmptyBlock(type: ArticleBlock["type"]): BlockWithId {
    const _id = newBlockId();
    switch (type) {
        case "heading":
            return { _id, type: "heading", level: 2, text: "" };
        case "paragraph":
            return { _id, type: "paragraph", text: "" };
        case "image":
            return { _id, type: "image", url: "", alt: "" };
        case "list":
            return { _id, type: "list", items: [""] };
        case "faq":
            return { _id, type: "faq", question: "", answer: "" };
        case "quote":
            return { _id, type: "quote", text: "", author: "" };
        case "video":
            return { _id, type: "video", url: "" };
        case "gallery":
            return { _id, type: "gallery", images: [] };
    }
}

export function ArticleForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<TabKey>("basic");
    const [tabErrors, setTabErrors] = useState<Record<string, string[]>>({});

    const { data: existing } = useQuery({
        queryKey: ["article", id],
        queryFn: () => articlesApi.getById(id!),
        enabled: isEdit,
    });

    const { data: authorsRes } = useQuery({
        queryKey: ["authors"],
        queryFn: () => authorsApi.getAll(),
    });

    const { data: keywordsRes } = useQuery({
        queryKey: ["keywords"],
        queryFn: () => keywordsApi.getAll(),
    });

    const { data: categoriesRes } = useQuery({
        queryKey: ["pulse-categories"],
        queryFn: () => pulseCategoriesApi.getAll(),
    });

    const [form, setForm] = useState<CreateArticleData>({
        slug: "",
        title: "",
        category: "Bloq",
        date: new Date().toISOString().split("T")[0],
        coverImage: "",
        excerpt: "",
        authorId: "",
        keywordIds: [],
        blocks: [],
        metaTitle: "",
        metaDescription: "",
        featured: false,
        published: false,
        headerPosition: null,
        headerOrder: null,
    });

    const [blocks, setBlocks] = useState<BlockWithId[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (existing?.data) {
            const a = existing.data;
            setForm({
                slug: a.slug,
                title: a.title,
                category: a.category,
                date: a.date ? new Date(a.date).toISOString().split("T")[0] : "",
                coverImage: a.coverImage ?? "",
                excerpt: a.excerpt ?? "",
                authorId: a.authorId ?? "",
                keywordIds: a.keywords?.map((k) => k.id) ?? [],
                blocks: a.blocks ?? [],
                metaTitle: a.metaTitle ?? "",
                metaDescription: a.metaDescription ?? "",
                featured: a.featured,
                published: a.published,
                headerPosition: a.headerPosition ?? null,
                headerOrder: a.headerOrder ?? null,
            });
            setBlocks(
                (a.blocks as ArticleBlock[])?.map((b) => ({
                    ...b,
                    _id: newBlockId(),
                })) ?? [],
            );
        }
    }, [existing?.data]);

    const authors = (authorsRes?.data ?? []) as Author[];
    const keywords = (keywordsRes?.data ?? []) as Keyword[];
    const categories = (categoriesRes?.data ?? []) as PulseCategory[];

    const updateField = <K extends keyof CreateArticleData>(
        field: K,
        value: CreateArticleData[K],
    ) => {
        setForm((f) => ({ ...f, [field]: value }));
        setTabErrors((e) => {
            const next = { ...e };
            delete next[field as string];
            return next;
        });
    };

    const validateTab = (tab: TabKey): string[] => {
        const errors: string[] = [];
        if (tab === "basic") {
            if (!form.title.trim()) errors.push("Title is required");
            if (!form.slug.trim()) errors.push("Slug is required");
            if (!form.category) errors.push("Category is required");
        }
        return errors;
    };

    const goToTab = (tab: TabKey) => {
        const errors = validateTab(activeTab);
        if (errors.length > 0) {
            setTabErrors((e) => ({ ...e, [activeTab]: errors }));
            return;
        }
        setActiveTab(tab);
    };

    const mutation = useMutation({
        mutationFn: (data: CreateArticleData) =>
            isEdit
                ? articlesApi.update(id!, data)
                : articlesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            navigate("/pulse/articles");
        },
    });

    const handleSubmit = () => {
        const errors = validateTab("basic");
        if (errors.length > 0) {
            setTabErrors({ basic: errors });
            setActiveTab("basic");
            return;
        }
        mutation.mutate({ ...form, blocks });
    };

    const handleImageUpload = async (
        file: File,
        callback: (url: string) => void,
    ) => {
        setUploading(true);
        try {
            const res = await articlesApi.uploadFile(file);
            callback(res.data.url);
        } catch {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const moveBlock = (index: number, direction: -1 | 1) => {
        setBlocks((prev) => {
            const next = [...prev];
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= next.length) return prev;
            const temp = next[index];
            const swap = next[newIndex];
            if (temp && swap) {
                next[index] = swap;
                next[newIndex] = temp;
            }
            return next;
        });
    };

    const inputClass =
        "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30 placeholder:text-white/30";

    const tabs: { key: TabKey; label: string }[] = [
        { key: "basic", label: "Basic Info" },
        { key: "seo", label: "SEO" },
        { key: "content", label: "Content Blocks" },
    ];

    return (
        <Layout>
            <div className="mb-4">
                <h2 className="text-lg font-semibold">
                    {isEdit ? "Edit Article" : "New Article"}
                </h2>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 border-b border-white/10">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => goToTab(tab.key)}
                        className={`relative px-4 py-2.5 text-sm transition-colors ${
                            activeTab === tab.key
                                ? "text-white"
                                : "text-white/50 hover:text-white/80"
                        }`}
                    >
                        {tab.label}
                        {tabErrors[tab.key] && tab.key !== activeTab && (
                            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                        )}
                        {activeTab === tab.key && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Errors */}
            {tabErrors[activeTab] && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {tabErrors[activeTab].map((e, i) => (
                        <div key={i}>{e}</div>
                    ))}
                </div>
            )}

            {/* Mutation Error */}
            {mutation.isError && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {(mutation.error as any)?.response?.data?.message
                        ? String((mutation.error as any).response.data.message)
                        : "An error occurred"}
                </div>
            )}

            {/* Basic Info Tab */}
            {activeTab === "basic" && (
                <div className="max-w-2xl space-y-4">
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Title</label>
                        <input
                            className={inputClass}
                            value={form.title}
                            onChange={(e) => {
                                updateField("title", e.target.value);
                                if (!isEdit) {
                                    updateField("slug", slugify(e.target.value));
                                }
                            }}
                            placeholder="Article title"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Slug</label>
                            <input
                                className={inputClass}
                                value={form.slug}
                                onChange={(e) => updateField("slug", e.target.value)}
                                placeholder="article-slug"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Category</label>
                            <select
                                className={inputClass}
                                value={form.category}
                                onChange={(e) => updateField("category", e.target.value)}
                            >
                                {(categoriesRes?.data ?? []).map((c: PulseCategory) => (
                                    <option key={c.id} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Date</label>
                            <input
                                className={inputClass}
                                type="date"
                                value={form.date ?? ""}
                                onChange={(e) => updateField("date", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Author</label>
                            <select
                                className={inputClass}
                                value={form.authorId ?? ""}
                                onChange={(e) => updateField("authorId", e.target.value || undefined)}
                            >
                                <option value="">No author</option>
                                {authors.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Excerpt</label>
                        <textarea
                            className={inputClass}
                            rows={2}
                            value={form.excerpt ?? ""}
                            onChange={(e) => updateField("excerpt", e.target.value)}
                            placeholder="Short description for cards..."
                        />
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Cover Image</label>
                        {form.coverImage ? (
                            <div className="relative inline-block">
                                <img
                                    src={form.coverImage}
                                    alt="Cover"
                                    className="h-40 rounded-lg object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => updateField("coverImage", "")}
                                    className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
                                >
                                    X
                                </button>
                            </div>
                        ) : (
                            <label className="flex h-32 cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/20 text-sm text-white/40 hover:border-white/40 hover:text-white/60">
                                {uploading ? "Uploading..." : "Click to upload cover image"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleImageUpload(file, (url) =>
                                                updateField("coverImage", url),
                                            );
                                        }
                                    }}
                                />
                            </label>
                        )}
                    </div>

                    {/* Keywords */}
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Keywords</label>
                        <div className="flex flex-wrap gap-2">
                            {keywords.map((kw) => {
                                const selected = form.keywordIds?.includes(kw.id);
                                return (
                                    <button
                                        key={kw.id}
                                        type="button"
                                        onClick={() => {
                                            const current = form.keywordIds ?? [];
                                            updateField(
                                                "keywordIds",
                                                selected
                                                    ? current.filter((k) => k !== kw.id)
                                                    : [...current, kw.id],
                                            );
                                        }}
                                        className={`rounded-full px-3 py-1 text-xs transition-colors ${
                                            selected
                                                ? "bg-white/20 text-white"
                                                : "border border-white/10 text-white/50 hover:text-white/80"
                                        }`}
                                    >
                                        {kw.name}
                                    </button>
                                );
                            })}
                            {keywords.length === 0 && (
                                <span className="text-xs text-white/30">No keywords yet. Create them first.</span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 text-sm text-white/70">
                            <input
                                type="checkbox"
                                checked={form.featured ?? false}
                                onChange={(e) => updateField("featured", e.target.checked)}
                                className="rounded"
                            />
                            Featured
                        </label>
                        <label className="flex items-center gap-2 text-sm text-white/70">
                            <input
                                type="checkbox"
                                checked={form.published ?? false}
                                onChange={(e) => updateField("published", e.target.checked)}
                                className="rounded"
                            />
                            Published
                        </label>
                    </div>
                </div>
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && (
                <div className="max-w-2xl space-y-4">
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Meta Title</label>
                        <input
                            className={inputClass}
                            value={form.metaTitle ?? ""}
                            onChange={(e) => updateField("metaTitle", e.target.value)}
                            placeholder="SEO title (defaults to article title)"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Meta Description</label>
                        <textarea
                            className={inputClass}
                            rows={3}
                            value={form.metaDescription ?? ""}
                            onChange={(e) => updateField("metaDescription", e.target.value)}
                            placeholder="SEO description for search engines..."
                        />
                    </div>
                </div>
            )}

            {/* Content Blocks Tab */}
            {activeTab === "content" && (
                <div className="max-w-3xl space-y-4">
                    {/* Add Block Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {(
                            [
                                ["heading", "+ Heading"],
                                ["paragraph", "+ Paragraph"],
                                ["image", "+ Image"],
                                ["list", "+ List"],
                                ["faq", "+ FAQ"],
                                ["quote", "+ Quote"],
                                ["video", "+ Video"],
                                ["gallery", "+ Gallery"],
                            ] as const
                        ).map(([type, label]) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setBlocks((prev) => [...prev, createEmptyBlock(type)])}
                                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-white/30 hover:text-white/80"
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Block List */}
                    {blocks.length === 0 && (
                        <div className="rounded-lg border border-dashed border-white/10 py-12 text-center text-sm text-white/30">
                            No content blocks yet. Click a button above to add one.
                        </div>
                    )}

                    {blocks.map((block, index) => (
                        <div
                            key={block._id}
                            className="rounded-lg border border-white/10 bg-white/3 p-4"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                                    {block.type}
                                    {block.type === "heading" && ` (h${block.level})`}
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => moveBlock(index, -1)}
                                        disabled={index === 0}
                                        className="rounded px-2 py-0.5 text-xs text-white/40 hover:text-white/80 disabled:opacity-30"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveBlock(index, 1)}
                                        disabled={index === blocks.length - 1}
                                        className="rounded px-2 py-0.5 text-xs text-white/40 hover:text-white/80 disabled:opacity-30"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setBlocks((prev) => prev.filter((_, i) => i !== index))
                                        }
                                        className="rounded px-2 py-0.5 text-xs text-red-400 hover:text-red-300"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Heading */}
                            {block.type === "heading" && (
                                <div className="flex gap-3">
                                    <select
                                        className="w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white outline-none"
                                        value={block.level}
                                        onChange={(e) => {
                                            const val = Number(e.target.value) as 2 | 3;
                                            setBlocks((prev) =>
                                                prev.map((b, i) =>
                                                    i === index ? { ...b, level: val } : b,
                                                ),
                                            );
                                        }}
                                    >
                                        <option value={2}>H2</option>
                                        <option value={3}>H3</option>
                                    </select>
                                    <input
                                        className={inputClass}
                                        value={block.text}
                                        onChange={(e) =>
                                            setBlocks((prev) =>
                                                prev.map((b, i) =>
                                                    i === index ? { ...b, text: e.target.value } : b,
                                                ),
                                            )
                                        }
                                        placeholder="Heading text..."
                                    />
                                </div>
                            )}

                            {/* Paragraph */}
                            {block.type === "paragraph" && (
                                <textarea
                                    className={inputClass}
                                    rows={4}
                                    value={block.text}
                                    onChange={(e) =>
                                        setBlocks((prev) =>
                                            prev.map((b, i) =>
                                                i === index ? { ...b, text: e.target.value } : b,
                                            ),
                                        )
                                    }
                                    placeholder="Paragraph text..."
                                />
                            )}

                            {/* Image */}
                            {block.type === "image" && (
                                <div className="space-y-3">
                                    {block.url ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={block.url}
                                                alt={block.alt}
                                                className="max-h-48 rounded-lg object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setBlocks((prev) =>
                                                        prev.map((b, i) =>
                                                            i === index ? { ...b, url: "" } : b,
                                                        ),
                                                    )
                                                }
                                                className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/20 text-sm text-white/40 hover:border-white/40">
                                            {uploading ? "Uploading..." : "Click to upload image"}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleImageUpload(file, (url) =>
                                                            setBlocks((prev) =>
                                                                prev.map((b, i) =>
                                                                    i === index ? { ...b, url } : b,
                                                                ),
                                                            ),
                                                        );
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                    <input
                                        className={inputClass}
                                        value={block.alt}
                                        onChange={(e) =>
                                            setBlocks((prev) =>
                                                prev.map((b, i) =>
                                                    i === index ? { ...b, alt: e.target.value } : b,
                                                ),
                                            )
                                        }
                                        placeholder="Alt text..."
                                    />
                                </div>
                            )}

                            {/* List */}
                            {block.type === "list" && (
                                <div className="space-y-2">
                                    {block.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="flex gap-2">
                                            <input
                                                className={inputClass}
                                                value={item}
                                                onChange={(e) => {
                                                    const newItems = [...block.items];
                                                    newItems[itemIdx] = e.target.value;
                                                    setBlocks((prev) =>
                                                        prev.map((b, i) =>
                                                            i === index ? { ...b, items: newItems } : b,
                                                        ),
                                                    );
                                                }}
                                                placeholder={`Item ${itemIdx + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newItems = block.items.filter(
                                                        (_, i) => i !== itemIdx,
                                                    );
                                                    setBlocks((prev) =>
                                                        prev.map((b, i) =>
                                                            i === index ? { ...b, items: newItems } : b,
                                                        ),
                                                    );
                                                }}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setBlocks((prev) =>
                                                prev.map((b, i) =>
                                                    i === index && b.type === "list"
                                                        ? { ...b, items: [...b.items, ""] }
                                                        : b,
                                                ),
                                            )
                                        }
                                        className="text-xs text-white/40 hover:text-white/70"
                                    >
                                        + Add item
                                    </button>
                                </div>
                            )}

                            {/* FAQ */}
                            {block.type === "faq" && (
                                <div className="space-y-3">
                                    <input
                                        className={inputClass}
                                        value={block.question}
                                        onChange={(e) =>
                                            setBlocks((prev) =>
                                                prev.map((b, i) =>
                                                    i === index
                                                        ? { ...b, question: e.target.value }
                                                        : b,
                                                ),
                                            )
                                        }
                                        placeholder="Question..."
                                    />
                                    <textarea
                                        className={inputClass}
                                        rows={3}
                                        value={block.answer}
                                        onChange={(e) =>
                                            setBlocks((prev) =>
                                                prev.map((b, i) =>
                                                    i === index
                                                        ? { ...b, answer: e.target.value }
                                                        : b,
                                                ),
                                            )
                                        }
                                        placeholder="Answer..."
                                    />
                                </div>
                            )}

                            {/* Quote */}
                            {block.type === "quote" && (
                                <div className="space-y-3">
                                    <textarea
                                        className={inputClass}
                                        rows={3}
                                        value={block.text}
                                        onChange={(e) =>
                                            setBlocks((prev) =>
                                                prev.map((b, i) =>
                                                    i === index ? { ...b, text: e.target.value } : b,
                                                ),
                                            )
                                        }
                                        placeholder="Quote text..."
                                    />
                                    <input
                                        className={inputClass}
                                        value={block.author ?? ""}
                                        onChange={(e) =>
                                            setBlocks((prev) =>
                                                prev.map((b, i) =>
                                                    i === index
                                                        ? { ...b, author: e.target.value }
                                                        : b,
                                                ),
                                            )
                                        }
                                        placeholder="Quote author (optional)"
                                    />
                                </div>
                            )}

                            {/* Video */}
                            {block.type === "video" && (
                                <input
                                    className={inputClass}
                                    value={block.url}
                                    onChange={(e) =>
                                        setBlocks((prev) =>
                                            prev.map((b, i) =>
                                                i === index ? { ...b, url: e.target.value } : b,
                                            ),
                                        )
                                    }
                                    placeholder="YouTube or Vimeo URL..."
                                />
                            )}

                            {/* Gallery */}
                            {block.type === "gallery" && (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-3">
                                        {block.images.map((img, imgIdx) => (
                                            <div key={imgIdx} className="relative">
                                                <img
                                                    src={img.url}
                                                    alt={img.alt}
                                                    className="h-24 w-24 rounded-lg object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = block.images.filter(
                                                            (_, i) => i !== imgIdx,
                                                        );
                                                        setBlocks((prev) =>
                                                            prev.map((b, i) =>
                                                                i === index
                                                                    ? { ...b, images: newImages }
                                                                    : b,
                                                            ),
                                                        );
                                                    }}
                                                    className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white hover:bg-black/80"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <label className="flex h-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/20 text-sm text-white/40 hover:border-white/40">
                                        {uploading ? "Uploading..." : "+ Add images to gallery"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files ?? []);
                                                files.forEach((file) => {
                                                    handleImageUpload(file, (url) =>
                                                        setBlocks((prev) =>
                                                            prev.map((b, i) =>
                                                                i === index && b.type === "gallery"
                                                                    ? {
                                                                          ...b,
                                                                          images: [
                                                                              ...b.images,
                                                                              { url, alt: "" },
                                                                          ],
                                                                      }
                                                                    : b,
                                                            ),
                                                        ),
                                                    );
                                                });
                                            }}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3 border-t border-white/10 pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={mutation.isPending}
                    className="rounded-lg bg-white/10 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                >
                    {mutation.isPending ? "Saving..." : isEdit ? "Update" : "Create"}
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/pulse/articles")}
                    className="rounded-lg border border-white/10 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
                >
                    Cancel
                </button>
            </div>
        </Layout>
    );
}
