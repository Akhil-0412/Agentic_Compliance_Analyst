"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Info, Globe, ShieldAlert, ArrowRight } from "lucide-react";
import clsx from "clsx";

const REGIONS = [
    {
        id: "EU",
        name: "European Union",
        status: "ATTENTION", // OK, ATTENTION, CRITICAL
        trend: "UP", // UP (Worsening), DOWN (Improving), STABLE
        confidence: 0.72,
        issues: 3,
        drivers: ["Recent DPA enforcement on AI profiling", "Missing DPIA for HR Systems"],
        lastUpdated: "2d ago"
    },
    {
        id: "US",
        name: "United States (FDA)",
        status: "OK",
        trend: "STABLE",
        confidence: 0.94,
        issues: 0,
        drivers: ["Routine surveillance - No new signals"],
        lastUpdated: "4h ago"
    },
    {
        id: "CA",
        name: "California (CCPA)",
        status: "CRITICAL",
        trend: "UP",
        confidence: 0.88,
        issues: 1,
        drivers: ["New CPRA regulations effective immediately", "Data Subject Request spike"],
        lastUpdated: "12h ago"
    }
];

export default function GlobalComplianceView({ isDark }: { isDark: boolean }) {
    return (
        <div className="h-full flex flex-col p-8 gap-6 overflow-y-auto">
            {/* Header / Radar Scope */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className={clsx("text-4xl font-bold tracking-tight mb-2", isDark ? "text-white" : "text-stone-900")}>
                        Regulatory Risk Radar
                    </h1>
                    <p className={clsx("text-lg", isDark ? "text-stone-400" : "text-stone-500")}>
                        Real-time surveillance of emerging regulatory threats and confidence decay.
                    </p>
                </div>
                <div className={clsx(
                    "px-4 py-2 rounded-full flex items-center gap-2 text-sm font-mono border",
                    isDark ? "bg-stone-900 border-stone-800 text-emerald-400" : "bg-white border-sand-200 text-emerald-600"
                )}>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    SYSTEM ONLINE • GLOBAL WATCH
                </div>
            </div>

            {/* Risk Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {REGIONS.map((region, idx) => (
                    <motion.div
                        key={region.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={clsx(
                            "rounded-3xl p-6 border flex flex-col gap-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300",
                            isDark ? "bg-stone-900 border-stone-800" : "bg-white border-sand-200",
                            region.status === "CRITICAL" && "ring-1 ring-red-500/50",
                            region.status === "ATTENTION" && "ring-1 ring-orange-500/50"
                        )}
                    >
                        {/* Status Beam (Top Gradient) */}
                        <div className={clsx(
                            "absolute top-0 left-0 right-0 h-1",
                            region.status === "CRITICAL" ? "bg-red-500" :
                                region.status === "ATTENTION" ? "bg-orange-500" : "bg-emerald-500"
                        )} />

                        {/* Region Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "p-3 rounded-2xl",
                                    isDark ? "bg-stone-800" : "bg-sand-100"
                                )}>
                                    <Globe size={24} className={isDark ? "text-stone-400" : "text-stone-600"} />
                                </div>
                                <div>
                                    <h3 className={clsx("font-bold text-xl", isDark ? "text-white" : "text-stone-900")}>
                                        {region.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs font-mono opacity-60">
                                        UPDATED {region.lastUpdated.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            {/* Trend Indicator */}
                            <div className={clsx(
                                "flex flex-col items-end",
                                region.status === "CRITICAL" ? "text-red-500" :
                                    region.status === "ATTENTION" ? "text-orange-500" : "text-emerald-500"
                            )}>
                                <div className="flex items-center gap-1 font-bold text-sm uppercase tracking-wider">
                                    {region.status}
                                    {region.trend === "UP" && <TrendingUp size={16} />}
                                    {region.trend === "DOWN" && <TrendingDown size={16} />}
                                    {region.trend === "STABLE" && <Minus size={16} />}
                                </div>
                                <span className="text-xs font-medium opacity-80">Risk Trend</span>
                            </div>
                        </div>

                        {/* Confidence Meter */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium uppercase tracking-wider opacity-60">
                                <span>Agent Confidence</span>
                                <span>{(region.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-stone-200/20 rounded-full overflow-hidden">
                                <div
                                    className={clsx(
                                        "h-full rounded-full transition-all duration-500",
                                        region.confidence > 0.8 ? "bg-emerald-500" :
                                            region.confidence > 0.6 ? "bg-yellow-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${region.confidence * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Causal Drivers (Why this changed) */}
                        <div className={clsx(
                            "rounded-xl p-4 text-sm space-y-3",
                            isDark ? "bg-stone-800/50" : "bg-sand-50"
                        )}>
                            <p className="font-semibold opacity-70 flex items-center gap-2">
                                <Info size={14} /> Risk Drivers
                            </p>
                            <ul className="space-y-2">
                                {region.drivers.map((driver, i) => (
                                    <li key={i} className="flex gap-2 items-start">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                        <span className="opacity-80 leading-relaxed">{driver}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Action: Investigate */}
                        <button className={clsx(
                            "mt-auto w-full py-3 rounded-xl border font-medium flex items-center justify-center gap-2 transition-all group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white",
                            isDark ? "border-stone-700 text-stone-300 hover:bg-stone-800" : "border-sand-300 text-stone-600 hover:bg-white"
                        )}>
                            Investigate Scope <ArrowRight size={16} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
