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
        { icon: Bot, label: "Agent", id: "agent" },
        { icon: Radar, label: "Risk Radar", id: "global" },
        { icon: Search, label: "FDA Search", id: "search" },
        { icon: Database, label: "Memory", id: "kb" },
    ];

    return (
        <motion.div
            initial={{ width: 280 }}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={clsx(
                "h-screen border-r flex flex-col relative z-20 transition-colors duration-300",
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50/50 backdrop-blur-xl border-neutral-200"
            )}
        >
            {/* Header */}
            <div className="p-6 flex items-center gap-3">
                <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    isDark ? "bg-neutral-800 text-neutral-400" : "bg-neutral-200 text-neutral-600"
                )}>
                    <ShieldCheck className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={clsx(
                            "font-semibold text-lg tracking-tight",
                            isDark ? "text-neutral-200" : "text-neutral-800"
                        )}
                    >
                        ComplianceOS
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 flex flex-col gap-1">
                {menuItems.map((item) => {
                    const isActive = activeView === item.id;
                    const isRiskRadar = item.id === "global";
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={clsx(
                                "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? (isDark ? "bg-neutral-800 text-white shadow-sm" : "bg-white text-neutral-900 shadow-elevation-low border border-neutral-200/50")
                                    : (isDark ? "text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900")
                            )}
                        >
                            <item.icon className={clsx("w-5 h-5 shrink-0 transition-colors", isActive && "text-trust-600", isRiskRadar && !isActive && "text-amber-500/80")} />
                            {!isCollapsed && (
                                <div className="flex items-center gap-2 flex-1">
                                    <span className={clsx("text-sm font-medium")}>{item.label}</span>
                                    {isRiskRadar && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    )}
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Footer / Toggle */}
            <div className={clsx(
                "p-4 border-t flex flex-col gap-2",
                isDark ? "border-neutral-800" : "border-neutral-200"
            )}>
                <button
                    onClick={toggleTheme}
                    className={clsx(
                        "flex items-center justify-center p-2 rounded-lg transition-colors",
                        isDark ? "hover:bg-neutral-800 text-neutral-500" : "hover:bg-neutral-100 text-neutral-400"
                    )}
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={clsx(
                        "flex items-center justify-center p-2 rounded-lg transition-colors",
                        isDark ? "hover:bg-neutral-800 text-neutral-500" : "hover:bg-neutral-100 text-neutral-400"
                    )}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
        </motion.div>
    );
}
