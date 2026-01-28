"use client";

import { motion } from "framer-motion";
import { FileText, ShieldCheck, Clock, Upload, Plus, MoreHorizontal, FileCheck, FileWarning } from "lucide-react";
import clsx from "clsx";

const FILES = [
    {
        id: "pol-001",
        name: "Data Retention Policy v4.2",
        type: "Internal Policy",
        status: "VERIFIED", // VERIFIED, DRAFT, EXPIRED
        authority: "Legal Dept",
        lastReviewed: "Nov 2025",
        confidence: 0.98,
        description: "Official retention schedules for EU user data."
    },
    {
        id: "con-102",
        name: "Cloud Service Agreement (AWS)",
        type: "Contract",
        status: "VERIFIED",
        authority: "Procurement",
        lastReviewed: "Jan 2026",
        confidence: 0.95,
        description: "DPA addendum and security clauses."
    },
    {
        id: "aud-2023",
        name: "2024 Compliance Audit Report",
        type: "Audit Log",
        status: "EXPIRED",
        authority: "External Auditor",
        lastReviewed: "Jan 2024",
        confidence: 0.40,
        description: "Superseded by 2025 report (pending upload)."
    }
];

export default function KnowledgeBaseView({ isDark }: { isDark: boolean }) {
    return (
        <div className="h-full flex flex-col p-8 gap-8 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className={clsx("text-4xl font-bold tracking-tight mb-2", isDark ? "text-white" : "text-stone-900")}>
                        Institutional Memory
                    </h1>
                    <p className={clsx("text-lg", isDark ? "text-stone-400" : "text-stone-500")}>
                        Governed policy objects with strict lifecycle tracking.
                    </p>
                </div>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-105">
                    <Upload size={18} /> Upload New Policy
                </button>
            </div>

            {/* Stats / Governance Bar */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: "Governed Assets", value: "142", icon: FileText, color: "text-blue-500" },
                    { label: "Verified Trusted", value: "98%", icon: ShieldCheck, color: "text-emerald-500" },
                    { label: "Pending Review", value: "3", icon: Clock, color: "text-orange-500" },
                ].map((stat, i) => (
                    <div key={i} className={clsx(
                        "p-4 rounded-2xl border flex items-center gap-4",
                        isDark ? "bg-stone-900 border-stone-800" : "bg-white border-sand-200"
                    )}>
                        <div className={clsx("p-3 rounded-xl bg-opacity-10", stat.color.replace("text-", "bg-"))}>
                            <stat.icon className={stat.color} size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className={clsx("text-xs font-bold uppercase tracking-wider opacity-50")}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {FILES.map((file, idx) => (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={clsx(
                            "group relative flex flex-col justify-between p-6 rounded-3xl border transition-all hover:shadow-xl",
                            isDark ? "bg-stone-900/50 border-stone-800 hover:border-orange-500/30" : "bg-white border-sand-200 hover:border-orange-200",
                            file.status === "EXPIRED" && "opacity-60 grayscale hover:grayscale-0"
                        )}
                    >
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6">
                            <div className={clsx(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border",
                                file.status === "VERIFIED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                    file.status === "EXPIRED" ? "bg-stone-500/10 text-stone-500 border-stone-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            )}>
                                {file.status === "VERIFIED" && <FileCheck size={12} />}
                                {file.status === "EXPIRED" && <FileWarning size={12} />}
                                {file.status}
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className={clsx(
                                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-2xl font-bold",
                                isDark ? "bg-stone-800 text-stone-400" : "bg-sand-100 text-stone-500"
                            )}>
                                {file.type === "Internal Policy" ? "P" : file.type === "Contract" ? "C" : "A"}
                            </div>
                            <h3 className={clsx("font-bold text-lg leading-snug mb-1", isDark ? "text-stone-100" : "text-stone-800")}>
                                {file.name}
                            </h3>
                            <p className={clsx("text-xs font-medium", isDark ? "text-stone-500" : "text-stone-400")}>
                                {file.authority} • Reviewed {file.lastReviewed}
                            </p>
                        </div>

                        <div className={clsx("pt-4 border-t flex justify-between items-center", isDark ? "border-stone-800" : "border-sand-200")}>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">Confidence</span>
                                <span className={clsx(
                                    "text-sm font-bold",
                                    file.confidence > 0.9 ? "text-emerald-500" : "text-yellow-500"
                                )}>{(file.confidence * 100).toFixed(0)}% Trust</span>
                            </div>
                            <button className={clsx("p-2 rounded-lg hover:bg-stone-100 transition-colors", isDark ? "hover:bg-stone-800" : "")}>
                                <MoreHorizontal size={18} className="opacity-50" />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {/* Add New Card */}
                <button className={clsx(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border border-dashed transition-all hover:bg-opacity-5",
                    isDark ? "border-stone-800 hover:bg-stone-100 text-stone-600" : "border-sand-300 hover:bg-stone-900 text-stone-400"
                )}>
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center opacity-50">
                        <Plus size={24} />
                    </div>
                    <span className="font-bold">Add Document</span>
                </button>
            </div>
        </div>
    );
}
