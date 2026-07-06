import { useState } from "react";
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
                <div className="w-full max-w-[508px] flex flex-col">
                    <header className="mb-9 text-center">
                        <h1 className="mb-2 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>
                            Welcome to TREVA
                        </h1>
                        <p className="text-[#4E525D]" style={{ fontWeight: 400, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>
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
                            <label className="block mb-0.5 text-[#333333]" style={{ fontWeight: 600, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>
                                Email address
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 pointer-events-none flex items-center justify-center w-5 h-5">
                                    <img src="/images/pages/login/mail.svg" alt="" width={19} height={17} />
                                </span>
                                <input
                                    type="email"
                                    placeholder="admin@treva.az"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-[52px] rounded-[16px] border bg-[#F4F5F5] pl-[44px] pr-3 text-[#666666] placeholder-[#666666] outline-none transition-all focus:border-[#CBD5E1] focus:bg-white"
                                    style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0, borderColor: "#EBEBEB", paddingTop: 16, paddingBottom: 16 }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="block mb-0.5 text-[#333333]" style={{ fontWeight: 600, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>
                                Password
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 pointer-events-none flex items-center justify-center w-5 h-5">
                                    <img src="/images/pages/login/lock.svg" alt="" width={15} height={19} />
                                </span>
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-[52px] rounded-[16px] border bg-[#F4F5F5] pl-[44px] pr-3 text-[#666666] placeholder-[#666666] outline-none transition-all focus:border-[#CBD5E1] focus:bg-white"
                                    style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0, borderColor: "#EBEBEB", paddingTop: 16, paddingBottom: 16 }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between" style={{ paddingTop: "calc(var(--spacing) * 8)" }}>
                            <label className="flex cursor-pointer items-center gap-2 select-none text-[#333333]" style={{ fontWeight: 400, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="sr-only"
                                />
                                {rememberMe ? (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#4E525D]">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </span>
                                ) : (
                                    <img src="/images/pages/login/checkbox.svg" alt="" width={20} height={20} />
                                )}
                                Remember me
                            </label>
                            <a href="#" className="text-[#1A1A1A] hover:underline transition-all" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0, textAlign: "center" as const }}>
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-3 h-[52px] w-full rounded-[16px] border border-white text-white transition-colors hover:bg-[#3F4452] disabled:opacity-50 flex items-center justify-center"
                            style={{ background: "#4E525D", fontWeight: 500, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}
                        >
                            {loading ? "Signing in..." : "Sign in to dashboard"}
                        </button>
                    </form>

                    <footer className="mt-6 text-center">
                        <p className="text-[#4E525D]" style={{ fontWeight: 400, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>
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
                            <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "#FFFFFF1F" }}>
                                <div className="h-3 w-3 rounded-full bg-white" />
                            </div>
                            <div>
                                <h3 className="m-0 text-white" style={{ fontWeight: 500, fontSize: 20, lineHeight: "28px", letterSpacing: 0 }}>
                                    Off-plan & Resale Management
                                </h3>
                                <p className="mt-1 m-0" style={{ fontWeight: 400, fontSize: 16, lineHeight: "20px", letterSpacing: 0, color: "#C8C9CD" }}>
                                    Complete inventory control
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "#FFFFFF1F" }}>
                                <div className="h-3 w-3 rounded-full bg-white" />
                            </div>
                            <div>
                                <h3 className="m-0 text-white" style={{ fontWeight: 500, fontSize: 20, lineHeight: "28px", letterSpacing: 0 }}>
                                    Advanced Integrations
                                </h3>
                                <p className="mt-1 m-0" style={{ fontWeight: 400, fontSize: 16, lineHeight: "20px", letterSpacing: 0, color: "#C8C9CD" }}>
                                    Profitbase sync & Excel imports
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "#FFFFFF1F" }}>
                                <div className="h-3 w-3 rounded-full bg-white" />
                            </div>
                            <div>
                                <h3 className="m-0 text-white" style={{ fontWeight: 500, fontSize: 20, lineHeight: "28px", letterSpacing: 0 }}>
                                    Real-time Analytics
                                </h3>
                                <p className="mt-1 m-0" style={{ fontWeight: 400, fontSize: 16, lineHeight: "20px", letterSpacing: 0, color: "#C8C9CD" }}>
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