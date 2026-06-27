import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
];

const offPlanItems = [
    { path: "/categories", label: "Categories", icon: "📁" },
    { path: "/unit-layouts", label: "Unit Layouts", icon: "🏢" },
    { path: "/room-options", label: "Room Options", icon: "🛏️" },
    { path: "/view-options", label: "View Options", icon: "🖼️" },
    { path: "/currencies", label: "Currencies", icon: "💰" },
    { path: "/status-options", label: "Status Options", icon: "🏷️" },
];

const resaleItems = [
    { path: "/resale/apartments", label: "Apartments", icon: "🏠" },
    { path: "/resale/apartment-types", label: "Apartment Types", icon: "📑" },
    { path: "/resale/owners", label: "Owners", icon: "👤" },
    { path: "/resale/attributes", label: "Attributes", icon: "🔧" },
    { path: "/resale/requests", label: "Requests", icon: "📬" },
    { path: "/resale/currencies", label: "Currencies", icon: "💰" },
];

const pulseItems = [
    { path: "/pulse/articles", label: "Articles", icon: "📝" },
    { path: "/pulse/authors", label: "Authors", icon: "👤" },
    { path: "/pulse/categories", label: "Categories", icon: "🏷️" },
    { path: "/pulse/layout", label: "Layout", icon: "📐" },
];

export function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <aside className="w-64 border-r border-white/10 bg-gray-900 p-4">
                <div className="mb-6 text-lg font-bold tracking-tight">
                    Treva Inventory
                </div>
                <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                                location.pathname === item.path
                                    ? "bg-white/10 text-white"
                                    : "text-white/85 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                    <div className="mt-3 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">Off-Plan</div>
                    {offPlanItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                                location.pathname === item.path
                                    ? "bg-white/10 text-white"
                                    : "text-white/85 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                    <div className="mt-3 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">Resale</div>
                    {resaleItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                                location.pathname.startsWith(item.path)
                                    ? "bg-white/10 text-white"
                                    : "text-white/85 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                    <div className="mt-3 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">Pulse</div>
                    {pulseItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                                location.pathname.startsWith(item.path)
                                    ? "bg-white/10 text-white"
                                    : "text-white/85 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto border-t border-white/10 pt-4">
                    <button
                        onClick={handleLogout}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/85 hover:bg-white/5 hover:text-white"
                    >
                        Logout
                    </button>
                </div>
            </aside>
            <main className="flex min-w-0 flex-1 flex-col bg-gray-900">
                <header className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
                    <div>
                        <div className="text-sm font-semibold">
                            {[...navItems, ...offPlanItems, ...resaleItems, ...pulseItems].find(
                                (i) => location.pathname === i.path || (i.path !== "/" && location.pathname.startsWith(i.path))
                            )?.label ?? "Dashboard"}
                        </div>
                        <div className="mt-0.5 text-xs text-white/60">
                            Inventory management admin panel
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
                    >
                        Logout
                    </button>
                </header>
                <section className="flex-1 overflow-auto bg-gray-900 p-5">{children}</section>
            </main>
        </div>
    );
}
