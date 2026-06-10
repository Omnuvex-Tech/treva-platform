import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
export function NotFound() {
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-900 text-white", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "mb-2 text-4xl font-bold", children: "404" }), _jsx("p", { className: "mb-6 text-white/50", children: "Page not found" }), _jsx(Link, { to: "/", className: "rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/20", children: "Go Home" })] }) }));
}
