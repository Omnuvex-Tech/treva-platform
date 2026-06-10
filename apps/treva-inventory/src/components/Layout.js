import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation, useNavigate } from "react-router-dom";
const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/categories", label: "Categories", icon: "📁" },
    { path: "/unit-layouts", label: "Unit Layouts", icon: "🏢" },
];
export function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };
    return (_jsxs("div", { className: "flex h-screen bg-gray-900 text-white", children: [_jsxs("aside", { className: "w-64 border-r border-white/10 p-4", children: [_jsx("div", { className: "mb-6 text-lg font-bold tracking-tight", children: "Treva Inventory" }), _jsx("nav", { className: "flex flex-col gap-1", children: navItems.map((item) => (_jsxs(Link, { to: item.path, className: `rounded-lg px-3 py-2 text-sm transition-colors ${location.pathname === item.path
                                ? "bg-white/10 text-white"
                                : "text-white/85 hover:bg-white/5 hover:text-white"}`, children: [_jsx("span", { className: "mr-2", children: item.icon }), item.label] }, item.path))) }), _jsx("div", { className: "mt-auto border-t border-white/10 pt-4", children: _jsx("button", { onClick: handleLogout, className: "w-full rounded-lg px-3 py-2 text-left text-sm text-white/85 hover:bg-white/5 hover:text-white", children: "Logout" }) })] }), _jsxs("main", { className: "flex min-w-0 flex-col", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-3 backdrop-blur", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold", children: navItems.find((i) => i.path === location.pathname)
                                            ?.label ?? "Dashboard" }), _jsx("div", { className: "mt-0.5 text-xs text-white/60", children: "Inventory management admin panel" })] }), _jsx("button", { onClick: handleLogout, className: "rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5", children: "Logout" })] }), _jsx("section", { className: "flex-1 overflow-auto p-5", children: children })] })] }));
}
