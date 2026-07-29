import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
];

const sharedItems = [
];

const offPlanItems = [
    { path: "/categories", label: "Categories", icon: "📁" },
    { path: "/unit-layouts", label: "Unit Layouts", icon: "🏢" },
];

const resaleItems = [
    { path: "/resale/apartments", label: "Apartments", icon: "🏠" },
    { path: "/resale/apartment-types", label: "Apartment Types", icon: "📑" },
    { path: "/resale/owners", label: "Owners", icon: "👤" },
    { path: "/resale/attributes", label: "Attributes", icon: "🔧" },
    { path: "/resale/requests", label: "Requests", icon: "📬" },
];

export function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [offPlanOpen, setOffPlanOpen] = useState(false);
    const [resaleOpen, setResaleOpen] = useState(false);

    useEffect(() => {
        const isOffPlan = offPlanItems.some((item) => location.pathname.startsWith(item.path));
        const isResale = location.pathname.startsWith("/resale");

        setOffPlanOpen(isOffPlan);
        setResaleOpen(isResale);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-[#F8F9FB] text-[#1A1A1A]">
            <aside className="w-64 border-r border-[#E7E9EE] bg-white p-4">
                <div className="mb-6 text-lg font-bold tracking-tight text-[#1A1A1A]">
                    Treva Inventory
                </div>
                <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                                location.pathname === item.path
                                    ? "bg-[#EBEBEB] text-[#4E525D]"
                                    : "text-[#666666] hover:bg-[#F4F5F6] hover:text-[#1A1A1A]"
                            }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                    <div className="mt-3 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[#999999]">Shared</div>
                    {sharedItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                                location.pathname === item.path
                                    ? "bg-[#EBEBEB] text-[#4E525D]"
                                    : "text-[#666666] hover:bg-[#F4F5F6] hover:text-[#1A1A1A]"
                            }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                    <button
                        type="button"
                        onClick={() => setOffPlanOpen((v) => !v)}
                        className="mt-3 mb-1 flex items-center justify-between px-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999999]"
                    >
                        <span>Off-Plan</span>
                        <span className="text-[#B0B0B0]">{offPlanOpen ? "▾" : "▸"}</span>
                    </button>
                    {offPlanOpen &&
                        offPlanItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                                    location.pathname.startsWith(item.path)
                                        ? "bg-[#EBEBEB] text-[#4E525D]"
                                        : "text-[#666666] hover:bg-[#F4F5F6] hover:text-[#1A1A1A]"
                                }`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}

                    <button
                        type="button"
                        onClick={() => setResaleOpen((v) => !v)}
                        className="mt-3 mb-1 flex items-center justify-between px-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999999]"
                    >
                        <span>Resale</span>
                        <span className="text-[#B0B0B0]">{resaleOpen ? "▾" : "▸"}</span>
                    </button>
                    {resaleOpen &&
                        resaleItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                                    location.pathname.startsWith(item.path)
                                        ? "bg-[#EBEBEB] text-[#4E525D]"
                                        : "text-[#666666] hover:bg-[#F4F5F6] hover:text-[#1A1A1A]"
                                }`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                </nav>
                <div className="mt-auto border-t border-[#E7E9EE] pt-4">
                    <button
                        onClick={handleLogout}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#666666] transition-colors hover:bg-[#F4F5F6] hover:text-[#1A1A1A]"
                    >
                        Logout
                    </button>
                </div>
            </aside>
            <main className="flex min-w-0 flex-1 flex-col bg-[#F8F9FB]">
                <header className="flex items-center justify-between border-b border-[#E7E9EE] bg-white px-5 py-3">
                    <div>
                        <div className="text-sm font-semibold text-[#1A1A1A]">
                            {[...navItems, ...sharedItems, ...offPlanItems, ...resaleItems].find(
                                (i) => location.pathname === i.path || (i.path !== "/" && location.pathname.startsWith(i.path))
                            )?.label ?? "Dashboard"}
                        </div>
                        <div className="mt-0.5 text-xs text-[#808191]">
                            Inventory management admin panel
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="rounded-md border border-[#E7E9EE] px-3 py-1.5 text-xs text-[#666666] transition-colors hover:bg-[#F4F5F6] hover:text-[#1A1A1A]"
                    >
                        Logout
                    </button>
                </header>
                <section className="flex-1 overflow-auto bg-[#F8F9FB] p-5">{children}</section>
            </main>
        </div>
    );
}
