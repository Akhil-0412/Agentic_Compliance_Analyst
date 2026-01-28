"use client";

import { motion } from "framer-motion";
import { Search, Filter, Sparkles, FileText, AlertOctagon, CheckCircle2, ChevronRight, Bookmark } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

const DEMO_RESULTS = [
    {
        id: 1,
        title: "Cybersecurity in Medical Devices: Quality System Considerations",
        type: "Guidance Document",
        date: "2023-09-27",
        relevance: "HIGH", // HIGH, MED, LOW
        impact: "CRITICAL", // CRITICAL, MODERATE, LOW
        impactDesc: "Requires immediate update to Software Validation Protocol (SVP-001).",
        confidence: 0.92,
        summary: "This guidance significantly expands the requirements for threat modeling and SBOM maintenance. Your current procedure lacks a post-market vulnerability disclosure timeline which is now mandatory."
    },
    {
        id: 2,
        title: "Premarket Submissions for Device Software Functions",
        type: "Draft Guidance",
        date: "2023-06-14",
        relevance: "MEDIUM",
        impact: "MODERATE",
        impactDesc: "May affect documentation structure for Q3 submission.",
        confidence: 0.85,
        summary: "Clarifies formatting for software architecture diagrams. Review if your current architectural views align with the new tiered approach."
    }
];

export default function FDASearchView({ isDark }: { isDark: boolean }) {
    const [query, setQuery] = useState("");

    return (
        <div className="h-full flex flex-col p-8 gap-6 overflow-hidden">
            {/* Header */}
            <div>
                <h1 className={clsx("text-4xl font-bold tracking-tight mb-2", isDark ? "text-white" : "text-stone-900")}>
                    Regulatory Intelligence
                </h1>
                <p className={clsx("text-lg", isDark ? "text-stone-400" : "text-stone-500")}>
                    Analyze guidance impact on your specific product portfolio.
                </p>
            </div>

            {/* Smart Search Bar */}
            <div className="relative max-w-3xl">
                <div className={clsx(
                    "absolute inset-0 rounded-2xl blur-md opacity-20",
                    isDark ? "bg-orange-500" : "bg-orange-300"
                )} />
                <div className={clsx(
                    "relative flex items-center gap-4 p-4 rounded-2xl border shadow-xl",
                    isDark ? "bg-stone-900 border-stone-700" : "bg-white border-sand-200"
                )}>
                    <Search className="text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search FDA guidance, warning letters, or regulations..."
                        className="flex-1 bg-transparent outline-none text-lg font-medium"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="h-6 w-px bg-stone-500/20" />
                    <button className={clsx(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        isDark ? "hover:bg-stone-800 text-stone-400" : "hover:bg-sand-100 text-stone-600"
                    )}>
                        <Filter size={16} /> Filters
                    </button>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-bold transition-colors">
                        Analyze
                    </button>
                </div>
            </div>

            {/* Content Area: Split View */}
            <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
                {/* Left: Results List */}
                <div className="col-span-7 flex flex-col gap-4 overflow-y-auto pr-2">
                    {DEMO_RESULTS.map((res) => (
                        <motion.div
                            key={res.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={clsx(
                                "group p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-lg hover:border-orange-500/30",
                                isDark ? "bg-stone-900 border-stone-800" : "bg-white border-sand-200"
                            )}
                        >
                            {/* Metadata Badges */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className={clsx(
                                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                                    res.impact === "CRITICAL"
                                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                )}>
                                    {res.impact} IMPACT
                                </span>
                                <span className="text-xs font-mono opacity-50">{res.type} • {res.date}</span>
                            </div>

                            <h3 className={clsx("text-lg font-bold leading-tight mb-2 group-hover:text-orange-500 transition-colors", isDark ? "text-stone-100" : "text-stone-800")}>
                                {res.title}
                            </h3>

                            <div className="flex items-start gap-3 mt-3">
                                <AlertOctagon size={16} className={clsx("mt-0.5 shrink-0", res.impact === "CRITICAL" ? "text-red-500" : "text-yellow-500")} />
                                <p className={clsx("text-sm", isDark ? "text-stone-400" : "text-stone-600")}>
                                    {res.impactDesc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Right: AI Analysis Panel */}
                <div className="col-span-5 h-full">
                    <div className={clsx(
                        "h-full rounded-2xl p-6 border flex flex-col gap-4 relative overflow-hidden",
                        isDark ? "bg-stone-900/50 border-stone-800" : "bg-white/50 border-sand-200"
                    )}>
                        <div className="flex items-center gap-3 pb-4 border-b border-stone-500/10">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                                <Sparkles size={20} />
                            </div>
                            <h2 className="font-bold text-lg">Agent Analysis</h2>
                        </div>

                        <div className="space-y-4 overflow-y-auto">
                            <div className={clsx("text-sm leading-relaxed space-y-4", isDark ? "text-stone-300" : "text-stone-600")}>
                                <p>
                                    <strong className="text-indigo-400">Executive Summary:</strong> {DEMO_RESULTS[0].summary}
                                </p>

                                <div className={clsx("p-4 rounded-xl border border-dashed", isDark ? "border-stone-700 bg-stone-800/20" : "border-stone-300 bg-sand-50")}>
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-60">Suggested Actions</h4>
                                    <ul className="space-y-2">
                                        <li className="flex gap-2 items-start text-sm">
                                            <div className="mt-1 w-4 h-4 rounded border flex items-center justify-center shrink-0 border-indigo-500 text-indigo-500" />
                                            <span>Update <strong>SVP-001</strong> to include new vulnerability timelines.</span>
                                        </li>
                                        <li className="flex gap-2 items-start text-sm">
                                            <div className="mt-1 w-4 h-4 rounded border flex items-center justify-center shrink-0 border-stone-500 opacity-50" />
                                            <span className="opacity-70">Schedule "Threat Model" workshop with Engineering.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 flex gap-3">
                            <button className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors">
                                Generate Gap Analysis
                            </button>
                            <button className={clsx("p-2 rounded-lg border transition-colors", isDark ? "border-stone-700 hover:bg-stone-800" : "border-sand-200 hover:bg-sand-100")}>
                                <Bookmark size={20} className="text-stone-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
