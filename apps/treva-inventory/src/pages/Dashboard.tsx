import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../api/categories";
import { unitLayoutsApi } from "../api/unit-layouts";
import { apartmentsApi } from "../api/apartments";
import { apartmentTypesApi } from "../api/apartment-types";
import { ownersApi } from "../api/owners";
import { attributesApi } from "../api/attributes";
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

    const { data: apartmentsRes } = useQuery({
        queryKey: ["apartments-stats"],
        queryFn: () => apartmentsApi.getAll({ limit: 1 }),
    });

    const { data: apartmentTypesRes } = useQuery({
        queryKey: ["apartment-types-stats"],
        queryFn: () => apartmentTypesApi.getAll(),
    });

    const { data: ownersRes } = useQuery({
        queryKey: ["owners-stats"],
        queryFn: () => ownersApi.getAll(),
    });

    const { data: attributesRes } = useQuery({
        queryKey: ["attributes-stats"],
        queryFn: () => attributesApi.getAll(),
    });

    return (
        <Layout>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Off-Plan</div>
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
            <div className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-white/40">Resale</div>
            <div className="grid grid-cols-4 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/3 p-3.5">
                    <div className="text-xs text-white/60">Apartments</div>
                    <div className="mt-2.5 text-2xl font-bold">
                        {apartmentsRes?.data?.pagination?.total ?? "—"}
                    </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/3 p-3.5">
                    <div className="text-xs text-white/60">Apartment Types</div>
                    <div className="mt-2.5 text-2xl font-bold">
                        {Array.isArray(apartmentTypesRes?.data) ? apartmentTypesRes.data.length : "—"}
                    </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/3 p-3.5">
                    <div className="text-xs text-white/60">Owners</div>
                    <div className="mt-2.5 text-2xl font-bold">
                        {Array.isArray(ownersRes?.data) ? ownersRes.data.length : "—"}
                    </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/3 p-3.5">
                    <div className="text-xs text-white/60">Attributes</div>
                    <div className="mt-2.5 text-2xl font-bold">
                        {Array.isArray(attributesRes?.data) ? attributesRes.data.length : "—"}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
