"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatInterface from "../components/ChatInterface";
import GlobalComplianceView from "../components/views/GlobalComplianceView";
import FDASearchView from "../components/views/FDASearchView";
import KnowledgeBaseView from "../components/views/KnowledgeBaseView";
import clsx from "clsx";

export default function Home() {
  const [activeDomain, setActiveDomain] = useState("GDPR");
  const [activeView, setActiveView] = useState("agent"); // agent, global, search, kb
  const [isDark, setIsDark] = useState(false);

  return (
    <main className={clsx(
      "flex h-screen font-sans transition-colors duration-300",
      isDark ? "bg-stone-950 text-white" : "bg-sand-50 text-stone-900"
    )}>
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isDark={isDark}
        toggleTheme={() => setIsDark(!isDark)}
      />

      {/* View Switcher */}
      <div className="flex-1 min-w-0">
        {activeView === "agent" && (
          <ChatInterface
            domain={activeDomain}
            setDomain={setActiveDomain}
            isDark={isDark}
          />
        )}

        {activeView === "global" && (
          <GlobalComplianceView isDark={isDark} />
        )}

        {activeView === "search" && (
          <FDASearchView isDark={isDark} />
        )}

        {activeView === "kb" && (
          <KnowledgeBaseView isDark={isDark} />
        )}
      </div>
    </main>
  );
}
