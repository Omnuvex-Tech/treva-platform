import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await authApi.login({ email, password });
            localStorage.setItem("token", response.data.access_token);
            navigate("/");
        } catch (err: unknown) {
            if (err && typeof err === "object" && "response" in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                setError(axiosError.response?.data?.message || "Login failed");
            } else {
                setError("Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white font-sans overflow-x-hidden">
            {/* Left Panel: Form Section */}
            <div className="flex w-full md:w-1/2 items-center justify-center p-8 sm:p-12 md:p-16 bg-white">
                <div className="w-full max-w-[420px] flex flex-col">
                    <header className="mb-9 text-center">
                        <h1 className="text-[28px] font-bold tracking-tight text-[#11142D] mb-2">
                            Welcome to TREVA
                        </h1>
                        <p className="text-[14px] text-[#808191]">
                            Premium real estate management platform
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {error && (
                            <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600 border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-semibold text-[#53545C] block mb-0.5">
                                Email address
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-[#A0AEC0] pointer-events-none">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    placeholder="admin@treva.az"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-[52px] rounded-xl border border-transparent bg-[#F4F5F6] pl-12 pr-4 text-[14px] text-[#11142D] placeholder-[#A0AEC0] outline-none transition-all focus:border-[#CBD5E1] focus:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-semibold text-[#53545C] block mb-0.5">
                                Password
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-[#A0AEC0] pointer-events-none">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-[52px] rounded-xl border border-transparent bg-[#F4F5F6] pl-12 pr-4 text-[14px] text-[#11142D] placeholder-[#A0AEC0] outline-none transition-all focus:border-[#CBD5E1] focus:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[13px]">
                            <label className="flex cursor-pointer items-center gap-2 font-medium text-[#4A5568] select-none">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-[18px] w-[18px] rounded border-[#A0AEC0] accent-[#4E5464]"
                                />
                                Remember me
                            </label>
                            <a href="#" className="font-medium text-[#11142D] hover:underline transition-all">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-3 h-[52px] w-full rounded-xl bg-[#4E5464] text-[15px] font-semibold text-white transition-colors hover:bg-[#3F4452] disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign in to dashboard"}
                        </button>
                    </form>

                    <footer className="mt-6 text-center">
                        <p className="text-[13px] text-[#808191]">
                            Protected by enterprise-grade security
                        </p>
                    </footer>
                </div>
            </div>

            {/* Right Panel: Content Section */}
            <div className="hidden md:flex w-1/2 items-center justify-center px-16 lg:px-24 py-16" style={{ background: "linear-gradient(135deg, #1A1A1A 0%, #4E525D 50%, #666666 100%)" }}>
                <div className="w-full max-w-[520px]">
                    <h2 className="mb-5 text-white" style={{ fontSize: 40, fontWeight: 600, lineHeight: "48px", letterSpacing: 0 }}>
                        Manage Azerbaijan's<br />Premium Real Estate
                    </h2>
                    <p className="mb-12 text-[19px] leading-relaxed text-[#B2B3BD]">
                        Complete property lifecycle management with advanced analytics, seamless integrations, and enterprise-grade security.
                    </p>

                    <div className="flex flex-col gap-7">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-white">
                                <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-semibold text-white m-0">
                                    Off-plan & Resale Management
                                </h3>
                                <p className="mt-1 text-[13px] text-[#B2B3BD] m-0">
                                    Complete inventory control
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-white">
                                <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-semibold text-white m-0">
                                    Advanced Integrations
                                </h3>
                                <p className="mt-1 text-[13px] text-[#B2B3BD] m-0">
                                    Profitbase sync & Excel imports
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-white">
                                <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-semibold text-white m-0">
                                    Real-time Analytics
                                </h3>
                                <p className="mt-1 text-[13px] text-[#B2B3BD] m-0">
                                    KPIs & comprehensive reporting
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}