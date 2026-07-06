import React from "react";

export function Dashboard() {
    return (
        <div className="flex min-h-screen w-full bg-white font-sans overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-[240px] bg-white border-r border-gray-100 flex flex-col pt-8 px-4 flex-shrink-0 relative">
                <div className="px-4 mb-10">
                    <span className="text-[22px] font-bold tracking-wider text-[#11142D]">TREVA</span>
                </div>
                
                <nav className="flex flex-col gap-2 w-full">
                    <a href="#" className="flex items-center gap-3 px-4 h-12 rounded-xl bg-[#4C525E] text-white font-medium text-[14px] transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Dashboard
                        <span className="absolute right-[-8px] bg-white text-[#4C525E] border border-gray-100 rounded-full w-5 h-5 flex items-center justify-center shadow-sm text-[10px]">‹</span>
                    </a>
                    
                    <a href="#" className="flex items-center gap-3 px-4 h-12 rounded-xl text-[#808191] hover:bg-gray-50 font-medium text-[14px] transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        Listings
                    </a>
                </nav>
            </div>

            {/* Main Application Container */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Navbar */}
                <header className="h-[80px] w-full bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
                    <div>
                        <h2 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 500, fontSize: 24, lineHeight: "32px", letterSpacing: 0 }}>Dashboard</h2>
                        <p className="m-0 mt-0.5 text-[#666666]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Welcome back, here's what's happening today</p>
                    </div>

                    <div className="ml-6 flex min-w-0 flex-1 items-center justify-end gap-4">
                        <div className="relative flex min-w-[180px] max-w-[392px] flex-1 items-center" style={{ height: 44 }}>
                            <span className="absolute left-4 pointer-events-none flex items-center justify-center w-5 h-5">
                                <img src="/images/pages/inv-dashboard/search.svg" alt="" className="h-5 w-5" />
                            </span>
                            <input 
                                type="text" 
                                placeholder="Search" 
                                className="w-full h-full pl-12 pr-4 bg-[#F4F5F6] border border-transparent rounded-xl outline-none focus:bg-white focus:border-gray-200"
                                style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0, color: "#666666" }}
                            />
                        </div>
                        <button className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-visible rounded-[16px] border border-white bg-[#EBEBEB] transition-colors">
                            <img src="/images/pages/inv-dashboard/notification.svg" alt="" className="h-4 w-4" />
                        </button>
                        <button className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-visible rounded-[16px] border border-white bg-[#EBEBEB] transition-colors">
                            <img src="/images/pages/inv-dashboard/settings.svg" alt="" className="h-4 w-4" />
                        </button>
                    </div>
                </header>

                {/* Dashboard Metrics Content Area */}
                <main 
                    className="flex-1 p-8 overflow-y-auto flex flex-col gap-6"
                    style={{ background: "var(--background-primary-50, #FFFFFF80)" }}
                >
                    {/* Top Row: Info Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Card 1 */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Monthly Apartment Sales</p>
                                <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>24</h3>
                                <span className="text-[#2D9A5B]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>+12% from last month</span>
                            </div>
                            <img src="/images/pages/inv-dashboard/first-img.svg" alt="" className="h-10 w-10" />
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Active Apartments</p>
                                <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>1,234</h3>
                                <span className="text-[#2D9A5B]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>+8% from last month</span>
                            </div>
                            <img src="/images/pages/inv-dashboard/second-img.svg" alt="" className="h-10 w-10" />
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Apartments Sold</p>
                                <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>323</h3>
                                <span className="text-[#2D9A5B]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>+26% from last month</span>
                            </div>
                            <img src="/images/pages/inv-dashboard/third-img.svg" alt="" className="h-10 w-10" />
                        </div>

                        {/* Card 4 */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Reserved Apartments</p>
                                <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>12</h3>
                                <span className="text-[#C3362B]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>-5.1% from last month</span>
                            </div>
                            <img src="/images/pages/inv-dashboard/forth-img.svg" alt="" className="h-10 w-10" />
                        </div>
                    </div>

                    {/* Middle Row: Graphic Charts Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Analytical Line Chart Widget */}
                        <div
                            className="lg:col-span-2 bg-white p-6 rounded-2xl flex flex-col"
                            style={{ border: "2px solid var(--Background-Brand, #4E525D)", boxShadow: "0px 2px 1px 0px #0000000D" }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>Revenue Overview</h4>
                                <span className="text-[#4E525D]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Last 6 months performance</span>
                            </div>
                            <div className="relative w-full flex-1 min-h-[260px]">
                                {/* Y-axis labels */}
                                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-right pr-3" style={{ width: 72 }}>
                                    <span className="text-[#1A1A1A]" style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>2200000</span>
                                    <span className="text-[#1A1A1A]" style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>1650000</span>
                                    <span className="text-[#1A1A1A]" style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>1100000</span>
                                    <span className="text-[#1A1A1A]" style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>550000</span>
                                    <span className="text-[#1A1A1A]" style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>100</span>
                                    <span className="text-[#1A1A1A]" style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>0</span>
                                </div>

                                {/* Chart area */}
                                <div className="ml-[72px] relative" style={{ height: "calc(100% - 32px)" }}>
                                    {/* Dotted grid lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                    </div>

                                    {/* Line + area chart, drawn to match the reference image exactly */}
                                    <svg
                                        className="absolute inset-0 w-full h-full pointer-events-none"
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="none"
                                    >
                                        <defs>
                                            <linearGradient id="revenueAreaFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4E525D" stopOpacity="0.35" />
                                                <stop offset="100%" stopColor="#4E525D" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        {/* Filled area under the curve */}
                                        <path
                                            d="M 0 55 C 2 53, 3 52, 5 51 C 9 45, 13 38, 16 38 C 19 38, 20 42, 22 46 C 26 54, 33 65, 38 73 C 42 80, 45 82, 48 82 C 51 82, 53 74, 55 69 C 59 59, 65 53, 68 53 C 70 53, 71 54, 72 55 C 75 58, 78 59, 80 59 C 84 59, 87 48, 90 40 C 94 30, 98 20, 100 15 L 100 100 L 0 100 Z"
                                            fill="url(#revenueAreaFill)"
                                            stroke="none"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                        {/* Revenue line, matching curve shape/peaks/dips from the reference image */}
                                        <path
                                            d="M 0 55 C 2 53, 3 52, 5 51 C 9 45, 13 38, 16 38 C 19 38, 20 42, 22 46 C 26 54, 33 65, 38 73 C 42 80, 45 82, 48 82 C 51 82, 53 74, 55 69 C 59 59, 65 53, 68 53 C 70 53, 71 54, 72 55 C 75 58, 78 59, 80 59 C 84 59, 87 48, 90 40 C 94 30, 98 20, 100 15"
                                            fill="none"
                                            stroke="#4E525D"
                                            strokeWidth="1.4"
                                            vectorEffect="non-scaling-stroke"
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    {/* Dots on each month, positioned exactly on the curve above */}
                                    {/* Jan */}
                                    <div className="absolute flex items-center justify-center" style={{ left: "5%", top: "51%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    {/* Feb */}
                                    <div className="absolute flex items-center justify-center" style={{ left: "22%", top: "46%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    {/* Mar - active with tooltip. Wrapper is a zero-size anchor placed exactly
                                        on the curve point (38%, 74%); every child is positioned relative to
                                        that single point so the dot never drifts off the line. */}
                                    <div className="absolute" style={{ left: "38%", top: "73%", width: 0, height: 0 }}>
                                        {/* Dot, centered exactly on the curve point */}
                                        <div
                                            className="absolute w-[14px] h-[14px] rounded-full bg-[#4E525D]"
                                            style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", boxShadow: "0px 0px 1px 0px #00000040, 0px 2px 1px 0px #0000000D" }}
                                        />
                                        {/* Tooltip, floating directly above the dot on the same vertical axis */}
                                        <div className="absolute" style={{ left: "50%", bottom: 12, transform: "translateX(-50%)" }}>
                                            <div className="relative">
                                                <div className="rounded-xl px-3 py-2 text-center text-white" style={{ background: "#6B7280", boxShadow: "0px 4px 8px rgba(0,0,0,0.15)" }}>
                                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "18px" }}>10</span>
                                                </div>
                                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "6px solid #6B7280" }} />
                                            </div>
                                        </div>
                                        {/* Dashed vertical line, dropping straight down from the dot to the axis, on the same vertical axis */}
                                        <div className="absolute" style={{ left: "50%", top: 0, height: 60, borderLeft: "2px dashed #4E525D", transform: "translateX(-50%)" }} />
                                    </div>
                                    {/* Apr */}
                                    <div className="absolute flex items-center justify-center" style={{ left: "55%", top: "69%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    {/* May */}
                                    <div className="absolute flex items-center justify-center" style={{ left: "72%", top: "55%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    {/* Jun */}
                                    <div className="absolute flex items-center justify-center" style={{ left: "90%", top: "40%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                </div>

                                {/* Month labels - each pinned to the exact same x-coordinate as its dot/dashed line above, so labels never drift off their axis */}
                                <div className="absolute bottom-0 left-[72px] right-0 px-2" style={{ height: 18 }}>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "5%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Jan</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "22%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Feb</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "38%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Mar</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "55%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Apr</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "72%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>May</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "90%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Jun</span>
                                </div>
                            </div>
                        </div>

                        {/* Distribution Donut Diagram Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="mb-6">
                                <h4 className="m-0 text-[#4E525D]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>Unit Distribution</h4>
                                <p className="m-0 mt-0.5 text-[#666666]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Current inventory status</p>
                            </div>
                            
                            <div className="flex-1 flex items-center justify-center relative min-h-[160px]">
                                {/* Circular CSS donut presentation circle */}
                                <div className="w-32 h-32 rounded-full border-[14px] border-[#2ECC71] flex items-center justify-center relative">
                                    <div className="absolute inset-[-14px] rounded-full border-[14px] border-transparent border-b-[#F1C40F] border-l-[#3498DB]"></div>
                                </div>
                            </div>

                            {/* Legend labels grid mapping block */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] font-medium text-[#11142D] mt-4">
                                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#3498DB]" /> Monthly: 24</div>
                                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" /> Sold: 323</div>
                                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#F1C40F]" /> Active: 1,234</div>
                                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#E74C3C]" /> Reserved: 12</div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}