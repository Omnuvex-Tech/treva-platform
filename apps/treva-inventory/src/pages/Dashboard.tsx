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
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-[16px] font-bold text-[#11142D] m-0">Revenue Overview</h4>
                                <span className="text-[12px] text-[#808191]">Last 6 months performance</span>
                            </div>
                            <div className="h-[220px] w-full flex flex-col justify-between relative pt-4">
                                {/* Grid backdrop tracks */}
                                <div className="border-b border-dashed border-gray-100 w-full h-0"></div>
                                <div className="border-b border-dashed border-gray-100 w-full h-0"></div>
                                <div className="border-b border-dashed border-gray-100 w-full h-0"></div>
                                <div className="border-b border-dashed border-gray-100 w-full h-0"></div>
                                <div className="border-b border-gray-200 w-full h-0"></div>
                                
                                {/* Timeline label references */}
                                <div className="flex justify-between text-[11px] font-medium text-[#808191] px-2 mt-2">
                                    <span>Jan</span>
                                    <span>Feb</span>
                                    <span>Mar</span>
                                    <span>Apr</span>
                                    <span>May</span>
                                    <span>Jun</span>
                                </div>
                            </div>
                        </div>

                        {/* Distribution Donut Diagram Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="mb-6">
                                <h4 className="text-[16px] font-bold text-[#11142D] m-0">Unit Distribution</h4>
                                <p className="text-[12px] text-[#808191] m-0 mt-0.5">Current inventory status</p>
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
