"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Bot,
    Radar,
    Search,
    Database,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Moon,
    Sun
} from "lucide-react";
import clsx from "clsx";

// Force rebuild for PRO view deployment
export default function Sidebar({ activeView, setActiveView, isDark, toggleTheme }: any) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { icon: Bot, label: "Agent Chat", id: "agent" },
        { icon: Radar, label: "Risk Radar", id: "global" },
        { icon: Search, label: "FDA Search", id: "search" },
        { icon: Database, label: "Knowledge Base", id: "kb" },
    ];

    return (
        <motion.div
            initial={{ width: 320 }} // Wider sidebar
            animate={{ width: isCollapsed ? 96 : 320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={clsx(
                "h-screen border-r flex flex-col relative z-20 shadow-xl transition-colors duration-300",
                isDark ? "bg-stone-900 border-stone-800" : "bg-sand-50 border-sand-200"
            )}
        >
            {/* Header */}
            <div className="p-8 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                    <ShieldCheck className="text-white w-6 h-6" />
                </div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={clsx(
                            "font-bold text-2xl tracking-tight transition-colors",
                            isDark ? "text-sand-50" : "text-stone-800"
                        )}
                    >
                        ComplianceOS
                    </motion.div>
                )}
            </div>

            {/* Domain Switcher Removed - Moved to Chat Interface */}

            {/* Navigation */}
            <div className="flex-1 px-6 flex flex-col gap-3">
                {menuItems.map((item) => {
                    const isActive = activeView === item.id;
                    const isRiskRadar = item.id === "global";
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={clsx(
                                "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group hover:translate-x-1 relative overflow-hidden",
                                isActive
                                    ? (isDark ? "bg-stone-800 text-orange-400 shadow-md" : "bg-white text-orange-600 shadow-sm")
                                    : (isRiskRadar
                                        ? (isDark ? "text-amber-400 hover:bg-stone-800/50" : "text-amber-600 hover:bg-white")
                                        : (isDark ? "text-stone-400 hover:bg-stone-800 hover:text-orange-400" : "text-stone-600 hover:bg-white hover:text-orange-600")
                                    )
                            )}
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <motion.div
                                    layoutId="navIndicator"
                                    className="absolute left-0 top-2 bottom-2 w-1 bg-orange-500 rounded-r-md"
                                />
                            )}

                            {/* Shiny Effect for Risk Radar */}
                            {isRiskRadar && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                            )}

                            <item.icon className={clsx("w-6 h-6 shrink-0 transition-colors", isActive && "text-orange-500", isRiskRadar && !isActive && "text-amber-500")} />
                            {!isCollapsed && (
                                <div className="flex items-center gap-2">
                                    <span className={clsx("font-semibold text-lg", isActive && "font-bold")}>{item.label}</span>
                                    {isRiskRadar && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm tracking-wider">
                                            PRO
                                        </span>
                                    )}
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Footer / Toggle */}
            <div className={clsx(
                "p-6 border-t flex flex-col gap-4",
                isDark ? "border-stone-800" : "border-sand-200"
            )}>
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className={clsx(
                        "flex items-center justify-center p-3 rounded-xl transition-colors",
                        isDark ? "bg-stone-800 text-yellow-400 hover:bg-stone-700" : "bg-sand-100 text-stone-600 hover:bg-sand-200"
                    )}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    {!isCollapsed && <span className="ml-3 font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>}
                </button>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={clsx(
                        "w-full flex items-center justify-center p-2 rounded-lg transition-colors",
                        isDark ? "hover:bg-stone-800 text-stone-500" : "hover:bg-sand-100 text-stone-400"
                    )}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </motion.div>
    );
}
