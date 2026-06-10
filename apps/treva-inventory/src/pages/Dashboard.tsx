import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../api/categories";
import { unitLayoutsApi } from "../api/unit-layouts";
import { Layout } from "../components/Layout";

export function Dashboard() {
    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.getAll(),
    });

    const { data: stats } = useQuery({
        queryKey: ["unit-layouts-stats"],
        queryFn: () => unitLayoutsApi.getStats(),
    });

    return (
        <Layout>
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/3 p-3.5">
                    <div className="text-xs text-white/60">Categories</div>
                    <div className="mt-2.5 text-2xl font-bold">
                        {categories?.data?.length ?? "—"}
                    </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/3 p-3.5">
                    <div className="text-xs text-white/60">Unit Layouts</div>
                    <div className="mt-2.5 text-2xl font-bold">
                        {stats?.data?.total ?? "—"}
                    </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/3 p-3.5">
                    <div className="text-xs text-white/60">Available</div>
                    <div className="mt-2.5 text-2xl font-bold text-green-400">
                        {stats?.data?.available ?? "—"}
                    </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/3 p-3.5">
                    <div className="text-xs text-white/60">Sold</div>
                    <div className="mt-2.5 text-2xl font-bold text-red-400">
                        {stats?.data?.sold ?? "—"}
                    </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/3 p-3.5">
                    <div className="text-xs text-white/60">Reserved</div>
                    <div className="mt-2.5 text-2xl font-bold text-yellow-400">
                        {stats?.data?.reserved ?? "—"}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
