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
                        <h2 className="text-[20px] font-bold text-[#11142D] m-0">Dashboard</h2>
                        <p className="text-[12px] text-[#808191] m-0 mt-0.5">Welcome back, here's what's happening today</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative flex items-center w-[320px]">
                            <span className="absolute left-4 text-[#A0AEC0]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </span>
                            <input 
                                type="text" 
                                placeholder="Search" 
                                className="w-full h-11 pl-11 pr-4 bg-[#F4F5F6] border border-transparent rounded-xl text-[14px] outline-none focus:bg-white focus:border-gray-200"
                            />
                        </div>
                        <button className="w-11 h-11 flex items-center justify-center bg-[#F4F5F6] rounded-xl text-[#11142D] hover:bg-gray-100 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-7" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </button>
                        <button className="w-11 h-11 flex items-center justify-center bg-[#F4F5F6] rounded-xl text-[#11142D] hover:bg-gray-100 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
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
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-start shadow-sm">
                            <div>
                                <p className="text-[13px] font-medium text-[#808191] m-0">Monthly Apartment Sales</p>
                                <h3 className="text-[28px] font-bold text-[#11142D] mt-2 mb-1">24</h3>
                                <span className="text-[12px] font-semibold text-[#2ECC71]">+12% from last month</span>
                            </div>
                            <span className="text-[24px]">🏢</span>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-start shadow-sm">
                            <div>
                                <p className="text-[13px] font-medium text-[#808191] m-0">Active Apartments</p>
                                <h3 className="text-[28px] font-bold text-[#11142D] mt-2 mb-1">1,234</h3>
                                <span className="text-[12px] font-semibold text-[#2ECC71]">+8% from last month</span>
                            </div>
                            <span className="text-[24px]">🔑</span>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-start shadow-sm">
                            <div>
                                <p className="text-[13px] font-medium text-[#808191] m-0">Apartments Sold</p>
                                <h3 className="text-[28px] font-bold text-[#11142D] mt-2 mb-1">323</h3>
                                <span className="text-[12px] font-semibold text-[#2ECC71]">+26% from last month</span>
                            </div>
                            <span className="text-[24px]">🏪</span>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-start shadow-sm">
                            <div>
                                <p className="text-[13px] font-medium text-[#808191] m-0">Reserved Apartments</p>
                                <h3 className="text-[28px] font-bold text-[#11142D] mt-2 mb-1">12</h3>
                                <span className="text-[12px] font-semibold text-[#E74C3C]">-5.1% from last month</span>
                            </div>
                            <span className="text-[24px]">📋</span>
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
