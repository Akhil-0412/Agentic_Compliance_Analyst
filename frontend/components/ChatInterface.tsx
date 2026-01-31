"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Globe, Loader2, FileText, BrainCircuit, Sparkles, ChevronDown } from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MagicBentoGrid from "./MagicBentoGrid";

interface Message {
    role: "user" | "ai";
    content: string;
    status?: "searching" | "reading" | "reasoning" | "done";
    metadata?: any;
}

export default function ChatInterface({ domain, setDomain, isDark }: { domain: string, setDomain: (d: string) => void, isDark: boolean }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentThought, setCurrentThought] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    };

    useEffect(() => {
        scrollToBottom("smooth");
    }, [messages, isProcessing, currentThought]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsProcessing(true);
        setCurrentThought("Initializing Agent...");

        try {
            let steps = [
                "Searching global databases...",
                `Accessing ${domain} repository...`,
                "Reading Article 83...",
                "Checking cross-references...",
                "Formulating compliance advice..."
            ];

            for (const step of steps) {
                setCurrentThought(step);
                await new Promise(r => setTimeout(r, 800));
            }

            // Use Next.js Rewrite Proxy (configured in next.config.ts)
            // This avoids CORS issues by routing through the Vercel server
            const response = await fetch('/api/chat', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: userMsg, domain })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error ${response.status}: ${errorText || "No details provided"}`);
            }

            const data = await response.json();
            const content = data.summary || data.response || JSON.stringify(data);

            setMessages(prev => [...prev, { role: "ai", content, metadata: data }]);
        } catch (err: any) {
            console.error(err);
            setMessages(prev => [...prev, { role: "ai", content: `Connection Error: ${err.message || "Unknown error"}. Check console for details.` }]);
        } finally {
            setIsProcessing(false);
            setCurrentThought("");
        }
    };

    return (
        <div className={clsx(
            "flex-1 h-screen flex flex-col relative overflow-hidden transition-colors duration-300",
            isDark ? "bg-neutral-950 text-neutral-200" : "bg-grain text-neutral-900"
        )}>
            {/* Background Gradient Spotlights */}
            <div className={clsx(
                "absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none opacity-40",
                isDark ? "bg-trust-900/20" : "bg-neutral-200"
            )} />

            {/* Header */}
            <div className={clsx(
                "px-8 py-6 flex items-center justify-between z-10",
                isDark ? "bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800" : "bg-white/50 backdrop-blur-md border-b border-neutral-200/50"
            )}>
                <motion.div
                    key={domain}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex items-center gap-3">
                        <div className={clsx("p-2 rounded-lg", isDark ? "bg-neutral-800" : "bg-white shadow-sm border border-neutral-200")}>
                            <BrainCircuit className={isDark ? "text-trust-500" : "text-neutral-700"} size={20} />
                        </div>
                        <div>
                            <h1 className={clsx("text-lg font-bold tracking-tight leading-none", isDark ? "text-white" : "text-neutral-900")}>
                                {domain === "GLOBAL" ? "Global Compliance Agent" : `${domain} Legal Assistant`}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <p className={clsx("text-xs font-medium uppercase tracking-wider", isDark ? "text-neutral-500" : "text-neutral-500")}>
                                    Reasoning Enabled • v2.4
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={domain}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full flex justify-center py-4"
                    >
                        <div className="w-full max-w-4xl px-8 space-y-8 pb-48">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center w-full mt-10">
                                    <MagicBentoGrid onSelect={setInput} isDark={isDark} />
                                </div>
                            )}

                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={clsx(
                                        "flex w-full",
                                        m.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div className={clsx(
                                        "max-w-[85%] p-6 rounded-2xl relative overflow-hidden interactive-card",
                                        m.role === "user"
                                            ? "bg-neutral-900 text-white rounded-br-sm shadow-lg"
                                            : (isDark
                                                ? "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-sm"
                                                : "glass-panel text-neutral-800 rounded-bl-sm shadow-glass")
                                    )}>
                                        {/* AI Header */}
                                        {m.role === "ai" && (
                                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-200/50 dark:border-neutral-800">
                                                <Sparkles size={14} className="text-trust-600" />
                                                <span className="text-xs font-bold text-trust-600 uppercase tracking-widest">Analysis</span>
                                            </div>
                                        )}

                                        {/* Content */}
                                        {/* REASONING MAP (Structured Fact->Law Table) */}
                                        {m.role === "ai" && m.metadata?.reasoning_map && m.metadata.reasoning_map.length > 0 && (
                                            <div className={clsx(
                                                "mb-4 p-3 rounded-lg border",
                                                isDark ? "bg-neutral-800/50 border-neutral-700" : "bg-neutral-50 border-neutral-200"
                                            )}>
                                                <p className="text-xs font-bold uppercase tracking-wider mb-2 text-trust-600">
                                                    Reasoning Map (Fact → Law)
                                                </p>
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className={clsx(
                                                            "text-left border-b",
                                                            isDark ? "border-neutral-700" : "border-neutral-200"
                                                        )}>
                                                            <th className="py-1 pr-2 font-semibold">Fact</th>
                                                            <th className="py-1 pr-2 font-semibold">Legal Meaning</th>
                                                            <th className="py-1 pr-2 font-semibold">GDPR Subsection</th>
                                                            <th className="py-1 font-semibold">Justification</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {m.metadata.reasoning_map.map((entry: any, idx: number) => (
                                                            <tr key={idx} className={clsx(
                                                                "border-b last:border-b-0",
                                                                isDark ? "border-neutral-700/50" : "border-neutral-100"
                                                            )}>
                                                                <td className="py-2 pr-2">{entry.fact}</td>
                                                                <td className="py-2 pr-2">{entry.legal_meaning}</td>
                                                                <td className="py-2 pr-2 font-mono text-trust-600">{entry.gdpr_subsection}</td>
                                                                <td className="py-2">{entry.justification}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        <div className={clsx("prose prose-sm md:prose-base max-w-none", isDark ? "prose-invert" : "prose-neutral")}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {m.content}
                                            </ReactMarkdown>
                                        </div>

                                        {/* Metadata Footer */}
                                        {m.role === "ai" && m.metadata?.risk_level && (
                                            <div className={clsx(
                                                "mt-5 pt-3 flex gap-4 text-xs font-medium border-t",
                                                isDark ? "border-neutral-800 text-neutral-500" : "border-neutral-200/50 text-neutral-400"
                                            )}>
                                                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Risk: {m.metadata.risk_level}</span>
                                                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Confidence: {(m.metadata.confidence_score * 100).toFixed(0)}%</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Reasoning Indicator */}
                            {isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex w-full justify-start"
                                >
                                    <div className={clsx(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm",
                                        isDark ? "bg-neutral-900 border-neutral-800 text-neutral-400" : "bg-white border-neutral-200 text-neutral-500"
                                    )}>
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        <span className="text-xs font-medium tracking-wide">{currentThought}</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Command Center Input */}
            <div className="absolute bottom-10 left-0 right-0 px-8 z-20">
                <div className={clsx(
                    "max-w-3xl mx-auto rounded-3xl p-2 shadow-elevation-high border transition-colors",
                    isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-neutral-200"
                )}>
                    <div className="relative flex items-center gap-2">
                        {/* Domain Selector */}
                        <DomainSelector
                            currentDomain={domain}
                            setDomain={setDomain}
                            isDark={isDark}
                        />

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={domain === "GLOBAL"}
                            placeholder={domain === "GLOBAL" ? "Feature Locked: Global Reasoning Network Coming Soon" : "Enter a compliance query or upload regulation text..."}
                            className={clsx(
                                "flex-1 bg-transparent p-4 outline-none text-lg placeholder-neutral-400 transition-all",
                                isDark ? "text-white" : "text-neutral-900"
                            )}
                        />

                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={!input.trim() || isProcessing || domain === "GLOBAL"}
                            className={clsx(
                                "p-3 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale hover:scale-105 active:scale-95",
                                isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-900 text-white hover:bg-black"
                            )}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        </button>
                    </div>
                </div>
                <div className={clsx("text-center mt-3 text-[10px] font-medium tracking-widest uppercase opacity-40", isDark ? "text-neutral-500" : "text-neutral-400")}>
                    AI Legal Assistant • Verify all outputs independently
                </div>
            </div>
        </div>
    );
}

function DomainSelector({ currentDomain, setDomain, isDark }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const domains = [
        { id: "GDPR", label: "GDPR (EU)", color: "bg-blue-500" },
        { id: "FDA", label: "FDA (US)", color: "bg-red-500" },
        { id: "CCPA", label: "CCPA (CA)", color: "bg-orange-500" },
        { id: "GLOBAL", label: "Risk Radar (Global)", color: "bg-purple-500", isPro: true },
    ];

    return (
        <div className="relative">
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={clsx(
                                "absolute bottom-full left-0 mb-4 w-60 p-1.5 rounded-xl shadow-xl border z-50 flex flex-col gap-0.5",
                                isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-neutral-200"
                            )}
                        >
                            <p className={clsx("px-3 py-2 text-[10px] font-bold uppercase tracking-wider", isDark ? "text-neutral-500" : "text-neutral-400")}>
                                Active Jurisdiction
                            </p>
                            {domains.map((d: any) => (
                                <button
                                    key={d.id}
                                    onClick={() => {
                                        setDomain(d.id);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        "flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left text-sm font-medium",
                                        currentDomain === d.id
                                            ? (isDark ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-900")
                                            : (isDark ? "text-neutral-400 hover:bg-neutral-800/50" : "text-neutral-500 hover:bg-neutral-50")
                                    )}
                                >
                                    <div className={`w-2 h-2 rounded-full ${d.color}`} />
                                    <span>{d.id}</span>
                                    {d.isPro && (
                                        <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-900 text-white">PRO</span>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "h-12 px-4 rounded-xl flex items-center gap-2 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 border-r border-transparent hover:border-neutral-200 dark:hover:border-neutral-700",
                )}
            >
                <Globe size={18} className={isDark ? "text-neutral-400" : "text-neutral-500"} />
                <span className={clsx("text-sm font-bold tracking-wide", isDark ? "text-white" : "text-neutral-800")}>{currentDomain}</span>
                <ChevronDown size={14} className="opacity-50" />
            </button>
        </div>
    );
}
