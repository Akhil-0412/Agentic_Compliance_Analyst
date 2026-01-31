"use client";

import { motion } from "framer-motion";
import { FileText, ShieldCheck, Upload, Globe, Lock, BrainCircuit, Search } from "lucide-react";
import clsx from "clsx";

export default function KnowledgeBaseView({ isDark }: { isDark: boolean }) {
    return (
        <div className="h-full flex flex-col p-8 gap-10 overflow-y-auto">
            {/* Header */}
            <div>
                <h1 className={clsx("text-4xl font-bold tracking-tight mb-2", isDark ? "text-white" : "text-stone-900")}>
                    Knowledge Base
                </h1>
                <p className={clsx("text-lg", isDark ? "text-stone-400" : "text-stone-500")}>
                    Manage the agent's regulatory context and extend its capabilities.
                </p>
            </div>

            {/* Core Knowledge Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <BrainCircuit className={isDark ? "text-orange-400" : "text-orange-600"} size={24} />
                    <h2 className={clsx("text-xl font-bold uppercase tracking-wider", isDark ? "text-stone-300" : "text-stone-700")}>
                        Core Knowledge
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { id: "GDPR", name: "GDPR (EU)", desc: "General Data Protection Regulation", color: "bg-blue-500" },
                        { id: "FDA", name: "FDA (US)", desc: "21 CFR Part 11 & Guidelines", color: "bg-red-500" },
                        { id: "CCPA", name: "CCPA (CA)", desc: "California Consumer Privacy Act", color: "bg-orange-500" },
                    ].map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={clsx(
                                "p-6 rounded-3xl border flex flex-col gap-4 relative overflow-hidden",
                                isDark ? "bg-stone-900 border-stone-800" : "bg-white border-sand-200"
                            )}
                        >
                            <div className={clsx("absolute top-0 right-0 p-3 rounded-bl-2xl bg-opacity-10 text-xs font-bold uppercase tracking-widest", isDark ? "bg-white text-white" : "bg-black text-black")}>
                                Built-in
                            </div>
                            <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-lg`}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-stone-900")}>{item.name}</h3>
                                <p className={clsx("text-sm mt-1", isDark ? "text-stone-400" : "text-stone-500")}>{item.desc}</p>
                            </div>
                            <div className={clsx("mt-2 flex items-center gap-2 text-xs font-bold", isDark ? "text-emerald-400" : "text-emerald-600")}>
                                <ShieldCheck size={14} /> Verified & Active
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Custom Knowledge Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Globe className={isDark ? "text-orange-400" : "text-orange-600"} size={24} />
                    <h2 className={clsx("text-xl font-bold uppercase tracking-wider", isDark ? "text-stone-300" : "text-stone-700")}>
                        Custom Knowledge
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Upload Card */}
                    <div className={clsx(
                        "p-8 rounded-3xl border border-dashed flex flex-col items-center justify-center text-center gap-4 transition-all hover:bg-opacity-50 cursor-pointer group",
                        isDark ? "bg-stone-900/50 border-stone-700 hover:border-orange-500/50" : "bg-white border-sand-300 hover:border-orange-400"
                    )}>
                        <div className={clsx(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                            isDark ? "bg-stone-800 text-stone-300" : "bg-sand-100 text-stone-600"
                        )}>
                            <Upload size={32} />
                        </div>
                        <div>
                            <h3 className={clsx("text-lg font-bold", isDark ? "text-white" : "text-stone-900")}>Upload Documents</h3>
                            <p className={clsx("text-sm mt-1 px-8", isDark ? "text-stone-500" : "text-stone-400")}>
                                Upload PDF, DOCX, or TXT files to analyze specific internal policies.
                            </p>
                        </div>
                        <button className={clsx("mt-2 px-6 py-2 rounded-xl text-sm font-bold transition-colors", isDark ? "bg-stone-800 hover:bg-stone-700 text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-800")}>
                            Select Files
                        </button>
                    </div>

                    {/* Browse Card */}
                    <div className={clsx(
                        "p-8 rounded-3xl border border-dashed flex flex-col items-center justify-center text-center gap-4 transition-all hover:bg-opacity-50 cursor-pointer group",
                        isDark ? "bg-stone-900/50 border-stone-700 hover:border-orange-500/50" : "bg-white border-sand-300 hover:border-orange-400"
                    )}>
                        <div className={clsx(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                            isDark ? "bg-stone-800 text-stone-300" : "bg-sand-100 text-stone-600"
                        )}>
                            <Search size={32} />
                        </div>
                        <div>
                            <h3 className={clsx("text-lg font-bold", isDark ? "text-white" : "text-stone-900")}>Browse & Fetch</h3>
                            <p className={clsx("text-sm mt-1 px-8", isDark ? "text-stone-500" : "text-stone-400")}>
                                Use Tavily to search the web for relevant regulatory updates or articles.
                            </p>
                        </div>
                        <button className={clsx("mt-2 px-6 py-2 rounded-xl text-sm font-bold transition-colors", isDark ? "bg-stone-800 hover:bg-stone-700 text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-800")}>
                            Start Search
                        </button>
                    </div>
                </div>

                {/* Privacy Note */}
                <div className={clsx(
                    "mt-8 p-4 rounded-xl flex items-center gap-3 text-sm font-medium",
                    isDark ? "bg-stone-900/50 text-stone-500" : "bg-sand-50 text-stone-500"
                )}>
                    <Lock size={16} />
                    <span>
                        <strong className={isDark ? "text-stone-300" : "text-stone-700"}>Privacy Note:</strong> Custom knowledge is stored locally for your active session and individual account only. It is not shared with the global model.
                    </span>
                </div>
            </section>
        </div>
    );
}
