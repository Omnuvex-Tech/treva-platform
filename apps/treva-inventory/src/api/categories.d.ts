export interface Category {
    id: string;
    title: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateCategoryData {
    title: string;
    name: string;
    slug: string;
}
export interface UpdateCategoryData {
    title?: string;
    name?: string;
    slug?: string;
}
export declare const categoriesApi: {
    getAll: () => any;
    getById: (id: string) => any;
    getBySlug: (slug: string) => any;
    create: (data: CreateCategoryData) => any;
    update: (id: string, data: UpdateCategoryData) => any;
    delete: (id: string) => any;
};
//# sourceMappingURL=categories.d.ts.map