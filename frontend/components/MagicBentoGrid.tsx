"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Send, Scale, ShieldAlert, FileText, BookOpen } from "lucide-react";

const CARDS = [
    {
        icon: <ShieldAlert size={28} className="text-orange-500" />,
        title: "Risk Analysis",
        description: "Identify high-risk processing activities and mitigation strategies.",
        query: "What are the key risks in my data processing?",
        span: "col-span-1 row-span-1"
    },
    {
        icon: <Scale size={28} className="text-indigo-400" />,
        title: "Case Law Search",
        description: "Search recent precedents and enforcement actions.",
        query: "Find recent lawsuits related to data breaches.",
        span: "col-span-1 row-span-1"
    },
    {
        icon: <FileText size={28} className="text-emerald-400" />,
        title: "Drafting Assistant",
        description: "Generate policy clauses and disclosure texts.",
        query: "Draft a privacy policy update for cookie consent.",
        span: "col-span-1 row-span-1 md:col-span-2 lg:col-span-1"
    },
    {
        icon: <BookOpen size={28} className="text-rose-400" />,
        title: "Definitions",
        description: "Clarify legal terms and statutory requirements.",
        query: "What is the definition of 'Personal Information'?",
        span: "col-span-1 row-span-1"
    }
];

export default function MagicBentoGrid({ onSelect, isDark }: { onSelect: (q: string) => void, isDark: boolean }) {
    const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        cardsRef.current.forEach((card) => {
            if (!card) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-20 group/grid" onMouseMove={handleMouseMove}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-[180px]">
                {CARDS.map((card, idx) => (
                    <motion.div
                        key={idx}
                        ref={(el) => { cardsRef.current[idx] = el }}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(card.query)}
                        className={clsx(
                            "relative group cursor-pointer overflow-hidden rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 border backdrop-blur-md shadow-lg",
                            card.span,
                            isDark
                                ? "bg-stone-900/50 border-stone-800 hover:bg-stone-900/80 hover:border-orange-500/30"
                                : "bg-white/60 border-sand-200 hover:bg-white/90 hover:border-orange-200"
                        )}
                        style={{
                            // @ts-ignore
                            "--mouse-x": "-9999px",
                            "--mouse-y": "-9999px",
                        }}
                    >
                        {/* SPOTLIGHT GLOW EFFECT (Torch Mode) */}
                        {/* 1. Background Spotlight (Subtle surface illumination) */}
                        <div
                            className={clsx(
                                "absolute inset-0 transition-opacity duration-1000 pointer-events-none opacity-0 group-hover/grid:opacity-100",
                                "bg-[radial-gradient(1000px_circle_at_var(--mouse-x)_var(--mouse-y),var(--spotlight-color),transparent_40%)]"
                            )}
                            style={{
                                // @ts-ignore
                                "--spotlight-color": isDark ? "rgba(249, 115, 22, 0.1)" : "rgba(249, 115, 22, 0.05)"
                            }}
                        />

                        {/* 2. Border Spotlight (Intense edge glow) */}
                        <div
                            className={clsx(
                                "absolute inset-0 transition-opacity duration-500 pointer-events-none z-0 opacity-0 group-hover/grid:opacity-100",
                                "bg-[radial-gradient(800px_circle_at_var(--mouse-x)_var(--mouse-y),var(--border-spotlight),transparent_40%)]"
                            )}
                            style={{
                                // @ts-ignore
                                "--border-spotlight": isDark ? "rgba(249, 115, 22, 0.8)" : "rgba(249, 115, 22, 0.6)",
                                mixBlendMode: "screen"
                            }}
                        />

                        {/* Icon Header */}
                        <div className="flex justify-between items-start z-10 relative">
                            <div className={clsx(
                                "p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110",
                                isDark ? "bg-stone-800" : "bg-white shadow-sm"
                            )}>
                                {card.icon}
                            </div>

                            {/* Arrow Icon fades in on hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0">
                                <Send size={16} className={isDark ? "text-stone-500" : "text-stone-400"} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="z-10 space-y-1 relative">
                            <h3 className={clsx("font-bold text-lg", isDark ? "text-stone-100" : "text-stone-800")}>
                                {card.title}
                            </h3>
                            <p className={clsx("text-xs font-medium leading-relaxed line-clamp-2", isDark ? "text-stone-400" : "text-stone-500")}>
                                {card.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
