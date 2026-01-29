"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Globe, Loader2, FileText, BrainCircuit } from "lucide-react";
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

export default function ChatInterface({ domain, isDark }: { domain: string, isDark: boolean }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentThought, setCurrentThought] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isProcessing, currentThought]);

    // Reset messages when domain changes? Or keep history?
    // User requested "Slide fade everytime" clicked on tab.
    // We can animate the entrance of the container on key={domain}.

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

            // Use HuggingFace backend directly (bypasses Vercel rewrite issues)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const response = await fetch(`${apiUrl}/api/chat`, {
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
            isDark ? "bg-stone-950 text-sand-50" : "bg-white text-stone-900"
        )}>
            {/* Background Decoration */}
            <div className={clsx(
                "absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-colors duration-500",
                isDark ? "bg-orange-900/10" : "bg-orange-100/40"
            )} />

            {/* Header */}
            <div className={clsx(
                "p-8 border-b flex items-center justify-between z-10 backdrop-blur-sm",
                isDark ? "border-stone-800 bg-stone-950/80" : "border-sand-100 bg-white/80"
            )}>
                <motion.div
                    key={domain}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className={clsx("text-3xl font-bold transition-colors", isDark ? "text-white" : "text-stone-800")}>
                        {domain} Compliance Agent
                    </h1>
                    <p className={clsx("text-sm mt-1", isDark ? "text-stone-500" : "text-stone-400")}>
                        Powered by Llama3 & Tavily
                    </p>
                </motion.div>
            </div>

            {/* Messages - Slide Fade on Domain Change */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={domain} // Triggers animation on change
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 overflow-y-auto w-full flex justify-center scroll-smooth"
                >
                    <div className="w-full max-w-5xl p-8 space-y-10 pb-64">
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
                                    "max-w-[75%] p-8 rounded-3xl shadow-sm leading-relaxed relative overflow-hidden",
                                    m.role === "user"
                                        ? "bg-orange-500 text-white rounded-tr-md shadow-orange-500/20"
                                        : (isDark
                                            ? "bg-stone-900 border border-stone-800 text-sand-100 rounded-tl-md"
                                            : "bg-white border border-sand-100 text-stone-700 rounded-tl-md")
                                )}>
                                    {/* AI Header */}
                                    {m.role === "ai" && (
                                        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-orange-500 uppercase tracking-widest">
                                            <BotIcon /> Agent Response
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className={clsx("prose prose-lg max-w-none", isDark ? "prose-invert prose-headings:text-orange-100 prose-p:text-stone-300" : "prose-orange prose-headings:text-stone-800")}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Metadata Cards */}
                                    {m.role === "ai" && m.metadata?.risk_level && (
                                        <div className={clsx(
                                            "mt-6 pt-6 border-t flex gap-6",
                                            isDark ? "border-stone-800" : "border-stone-100"
                                        )}>
                                            <Badge label="Risk Level" value={m.metadata.risk_level} color="red" isDark={isDark} />
                                            <Badge label="Confidence" value={`${(m.metadata.confidence_score * 100).toFixed(0)}%`} color="green" isDark={isDark} />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Invisible element to scroll to */}
                        <div ref={messagesEndRef} />

                        {/* Loading Bubble */}
                        {isProcessing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex w-full justify-start"
                            >
                                <div className={clsx(
                                    "max-w-[75%] p-6 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-4",
                                    isDark ? "bg-stone-900 border border-stone-800 text-sand-100" : "bg-white border border-sand-100 text-stone-700"
                                )}>
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-500">
                                        <Loader2 className="animate-spin w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">Agent is Thinking</span>
                                        <span className="text-sm font-medium animate-pulse">{currentThought}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Input - Floating & Centered */}
            <div className={clsx(
                "absolute bottom-0 left-0 right-0 p-8 backdrop-blur-xl border-t transition-colors",
                isDark ? "bg-stone-950/80 border-stone-800" : "bg-white/90 border-sand-100"
            )}>
                <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Ask about ${domain} compliance...`}
                        className={clsx(
                            "w-full p-6 pr-24 rounded-3xl outline-none text-xl transition-all shadow-2xl",
                            isDark
                                ? "bg-stone-900 border-stone-800 text-white placeholder-stone-600 focus:ring-2 focus:ring-orange-500/50"
                                : "bg-white border-sand-200 text-stone-800 placeholder-stone-400 border focus:ring-4 focus:ring-orange-500/20"
                        )}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isProcessing}
                        className="absolute right-3 top-3 bottom-3 aspect-square bg-orange-500 hover:bg-orange-400 active:scale-95 transition-all text-white rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:grayscale shadow-lg shadow-orange-500/30"
                    >
                        <Send size={24} />
                    </button>
                </form>
                <div className={clsx("text-center mt-4 text-xs font-medium tracking-wide opacity-50", isDark ? "text-stone-500" : "text-stone-400")}>
                    Trusted AI for Legal Compliance. Always verify with human counsel.
                </div>
            </div>
        </div>
    );
}

function Badge({ label, value, color, isDark }: any) {
    const textColor = color === "red" ? "text-rose-500" : "text-emerald-500";
    return (
        <div className="flex flex-col">
            <span className={clsx("text-[10px] uppercase font-bold tracking-wider mb-1", isDark ? "text-stone-500" : "text-stone-400")}>{label}</span>
            <span className={clsx("font-bold text-lg", textColor)}>{value}</span>
        </div>
    )
}

function BotIcon() {
    return <BrainCircuit size={16} />
}
