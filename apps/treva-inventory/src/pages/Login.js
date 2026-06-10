import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await authApi.login({ email, password });
            localStorage.setItem("token", response.data.access_token);
            navigate("/");
        }
        catch (err) {
            if (err && typeof err === "object" && "response" in err) {
                const axiosError = err;
                setError(axiosError.response?.data?.message || "Login failed");
            }
            else {
                setError("Login failed");
            }
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-900", children: _jsxs("div", { className: "w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-8", children: [_jsx("h1", { className: "mb-6 text-center text-xl font-bold text-white", children: "Treva Inventory" }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [error && (_jsx("div", { className: "rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-300", children: error })), _jsx("input", { type: "email", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value), className: "rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none", required: true }), _jsx("input", { type: "password", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), className: "rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none", required: true }), _jsx("button", { type: "submit", disabled: loading, className: "mt-2 rounded-lg bg-white/10 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50", children: loading ? "Signing in..." : "Sign In" })] })] }) }));
}
