import React, { useState } from "react";

export function Dashboard() {
    const [activeMenu, setActiveMenu] = useState("dashboard");

    return (
        <div className="flex min-h-screen w-full bg-white font-sans overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-[240px] bg-white border-r border-gray-100 flex flex-col pt-8 px-4 flex-shrink-0 relative">
                <div className="px-4 mb-10">
                    <span className="text-[22px] font-bold tracking-wider text-[#11142D]">TREVA</span>
                </div>
                
                <nav className="flex flex-col gap-2 w-full">
                    {/* Dashboard */}
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveMenu("dashboard"); }}
                        className="flex items-center gap-3 px-4 h-12 rounded-xl font-medium text-[14px] transition-colors"
                        style={{
                            background: activeMenu === "dashboard" ? "#4C525E" : "transparent",
                            color: activeMenu === "dashboard" ? "#FFFFFF" : "#808191"
                        }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Dashboard
                    </a>
                    
                    {/* Listings */}
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveMenu("listings"); }}
                        className="flex items-center gap-3 px-4 h-12 rounded-xl font-medium text-[14px] transition-colors"
                        style={{
                            background: activeMenu === "listings" ? "#4C525E" : "transparent",
                            color: activeMenu === "listings" ? "#FFFFFF" : "#808191"
                        }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        Listings
                    </a>
                </nav>

                {/* Chevron left button - external, moves with active menu */}
                <div style={{ position: "absolute", right: -23, top: activeMenu === "dashboard" ? 130 : 182, width: 36, height: 36, borderRadius: 10, border: "1px solid #EBEBEB", background: "#FFFFFF", boxShadow: "0px 2px 8px rgba(0,0,0,0.08)", cursor: "pointer", zIndex: 10, transition: "top 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.1658 4.23431C10.4782 4.54673 10.4782 5.05327 10.1658 5.36569L7.53147 8L10.1658 10.6343C10.4782 10.9467 10.4782 11.4533 10.1658 11.7657C9.85336 12.0781 9.34683 12.0781 9.03441 11.7657L5.83441 8.56569C5.52199 8.25327 5.52199 7.74673 5.83441 7.43431L9.03441 4.23431C9.34683 3.9219 9.85336 3.9219 10.1658 4.23431Z" fill="#4E525D"/>
                    </svg>
                </div>
            </div>
 
            {/* Main Application Container */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Navbar */}
                <header className="h-[80px] w-full bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
                    <div>
                        <h2 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 500, fontSize: 24, lineHeight: "32px", letterSpacing: 0 }}>
                            {activeMenu === "dashboard" ? "Dashboard" : "Listings"}
                        </h2>
                        <p className="m-0 mt-0.5 text-[#666666]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>
                            {activeMenu === "dashboard" ? "Welcome back, here's what's happening today" : "Manage your apartment listings"}
                        </p>
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

                {/* Dashboard Content */}
                {activeMenu === "dashboard" && (
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
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>Revenue Overview</h4>
                                <span className="text-[#4E525D]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Last 6 months performance</span>
                            </div>
                            <div className="relative w-full flex-1 min-h-[260px]">
                                <div className="absolute left-0 top-0 text-right pr-3" style={{ width: 72, bottom: 32 }}>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "0%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>2200000</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "20%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>1650000</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "40%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>1100000</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "60%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>550000</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "80%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>100</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "100%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>0</span>
                                </div>

                                <div className="ml-[72px] relative" style={{ height: "calc(100% - 32px)" }}>
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                    </div>

                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="revenueAreaFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4E525D" stopOpacity="0.35" />
                                                <stop offset="100%" stopColor="#4E525D" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M 0 55 C 2 53, 3 52, 5 51 C 9 45, 13 38, 16 38 C 19 38, 20 42, 22 46 C 26 54, 33 65, 38 73 C 42 80, 45 82, 48 82 C 51 82, 53 74, 55 69 C 59 59, 65 53, 68 53 C 70 53, 71 54, 72 55 C 75 58, 78 59, 80 59 C 84 59, 87 48, 90 40 C 94 30, 98 20, 100 15 L 100 100 L 0 100 Z" fill="url(#revenueAreaFill)" stroke="none" vectorEffect="non-scaling-stroke" />
                                        <path d="M 0 55 C 2 53, 3 52, 5 51 C 9 45, 13 38, 16 38 C 19 38, 20 42, 22 46 C 26 54, 33 65, 38 73 C 42 80, 45 82, 48 82 C 51 82, 53 74, 55 69 C 59 59, 65 53, 68 53 C 70 53, 71 54, 72 55 C 75 58, 78 59, 80 59 C 84 59, 87 48, 90 40 C 94 30, 98 20, 100 15" fill="none" stroke="#4E525D" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                                    </svg>

                                    <div className="absolute flex items-center justify-center" style={{ left: "5%", top: "51%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    <div className="absolute flex items-center justify-center" style={{ left: "22%", top: "46%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    <div className="absolute" style={{ left: "38%", top: "73%", width: 0, height: 0 }}>
                                        <div className="absolute w-[14px] h-[14px] rounded-full bg-[#4E525D]" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", boxShadow: "0px 0px 1px 0px #00000040, 0px 2px 1px 0px #0000000D" }} />
                                        <div className="absolute" style={{ left: "50%", bottom: 26, transform: "translateX(-50%)" }}>
                                            <div className="relative">
                                                <div className="flex items-center justify-center text-white" style={{ width: 45, height: 42, padding: "12px 16px", borderRadius: 8, background: "#00000080", opacity: 0.8 }}>
                                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "18px" }}>10</span>
                                                </div>
                                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "6px solid #00000080" }} />
                                            </div>
                                        </div>
                                        <div className="absolute" style={{ left: "50%", top: 0, height: 60, borderLeft: "2px dashed #4E525D", transform: "translateX(-50%)" }} />
                                    </div>
                                    <div className="absolute flex items-center justify-center" style={{ left: "55%", top: "69%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    <div className="absolute flex items-center justify-center" style={{ left: "72%", top: "55%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    <div className="absolute flex items-center justify-center" style={{ left: "90%", top: "40%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                </div>

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
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <h4 className="m-0 text-[#2C3E50]" style={{ fontWeight: 600, fontSize: 18, lineHeight: "24px" }}>Unit Distribution</h4>
                                <p className="m-0 mt-1 text-[#7F8C8D]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px" }}>Current inventory status</p>
                            </div>
                            
                            <div className="flex flex-1 items-center justify-center relative min-h-[180px] my-4">
                                {/* SVG Donut Chart with corrected angles, colors, and clean padding gaps matching image_dd0e00.png */}
                                <svg width="140" height="140" viewBox="0 0 128 128">
                                    {/* Green Slice - Sold (Top Half) */}
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#00C377" strokeWidth="13"
                                        strokeDasharray="150.1 164.1" strokeLinecap="butt"
                                        transform="rotate(184 64 64)" />
                                    
                                    {/* Yellow Slice - Active (Bottom Right) */}
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#FFBB00" strokeWidth="13"
                                        strokeDasharray="57.6 256.6" strokeLinecap="butt"
                                        transform="rotate(4 64 64)" />

                                    {/* Blue Slice - Monthly.S (Bottom Left) */}
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#0075E3" strokeWidth="13"
                                        strokeDasharray="68.1 246.1" strokeLinecap="butt"
                                        transform="rotate(76 64 64)" />

                                    {/* Red Slice - Reserved (Mid Left) */}
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#E6211B" strokeWidth="13"
                                        strokeDasharray="15.7 298.5" strokeLinecap="butt"
                                        transform="rotate(160 64 64)" />
                                </svg>
                            </div>

                            {/* Legend Grid matching the sequence layout in image_dd0e00.png */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] mt-2">
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#0075E3] flex-shrink-0" />
                                    <span>Monthly.S <span className="font-semibold text-[#2C3E50] ml-0.5">24</span></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#00C377] flex-shrink-0" />
                                    <span>Sold <span className="font-semibold text-[#2C3E50] ml-0.5">323</span></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#FFBB00] flex-shrink-0" />
                                    <span>Active <span className="font-semibold text-[#2C3E50] ml-0.5">1,234</span></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#E6211B] flex-shrink-0" />
                                    <span>Reserved <span className="font-semibold text-[#2C3E50] ml-0.5">12</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                )}

                {/* Listings Content */}
                {activeMenu === "listings" && (
                <main 
                    className="flex-1 p-8 overflow-y-auto flex flex-col gap-6"
                    style={{ background: "var(--background-primary-50, #FFFFFF80)" }}
                >
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 18, lineHeight: "24px" }}>Listings</h3>
                        <p className="m-0 mt-2 text-[#666666]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px" }}>Manage and view all apartment listings here.</p>
                    </div>
                </main>
                )}
            </div>
        </div>
    );
}