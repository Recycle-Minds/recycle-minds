"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { useRef , useEffect } from "react"

interface ActionButtonsProps {
  activeTab: "digital-recycler" | "view-collection" | "recycling-history" | "claim-sol" | "why-recycle" | "rewards-store" | "faq"
  onTabChange: (tab: "digital-recycler" | "view-collection" | "recycling-history" | "claim-sol" | "why-recycle" | "rewards-store" | "faq") => void
}

export function ActionButtons({ activeTab, onTabChange }: ActionButtonsProps) {
  const tabs = [
    { id: "why-recycle", label: "Why Recycle?", shortLabel: "Why?", color: "green" },
    { id: "digital-recycler", label: "Digital Recycler", shortLabel: "Recycler", color: "green" },
    { id: "rewards-store", label: "Rewards Store", shortLabel: "Rewards", color: "green" },
    { id: "view-collection", label: "View Collection", shortLabel: "Collection", color: "gray" },
    { id: "recycling-history", label: "History", shortLabel: "History", color: "green" },
    { id: "faq", label: "FAQ", shortLabel: "FAQ", color: "green" },
    { id: "claim-sol", label: "Empty Accounts", shortLabel: "Claim", color: "teal" }
  ]

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || window.innerWidth >= 640) return

    const distance = 40  
    const timeout1 = setTimeout(() => {
      el.scrollTo({ left: distance, behavior: "smooth" })
    }, 300)

    const timeout2 = setTimeout(() => {
      el.scrollTo({ left: 0, behavior: "smooth" })
    }, 900)

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
    }
  }, [])

  return (
    <TooltipProvider>
      <div className="relative mb-8">
        {/* Container geral com fundo */}
        <div className="relative bg-[#0f0f0f] rounded-2xl border border-[#292929] backdrop-blur-sm overflow-hidden">

          {/* Fundo ativo visível apenas no desktop */}
          <div
            className={`absolute top-0 bottom-0 hidden sm:block rounded-xl transition-all duration-500 ease-out pointer-events-none ${activeTab === "claim-sol"
                ? "bg-gradient-to-r from-teal-500/20 to-teal-500/10"
                : "bg-gradient-to-r from-[#00ff00]/20 to-[#00ff00]/10"
              }`}
            style={{
              left: `${tabs.findIndex(tab => tab.id === activeTab) * (100 / tabs.length)}%`,
              width: `${100 / tabs.length}%`,
            }}
          />

          {/* Menu scrollável */}
          <div ref={scrollRef} className="relative flex gap-2 sm:gap-0 overflow-x-auto scrollbar-hide px-3 py-2 sm:p-0 sm:justify-between">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              const isDisabled = tab.id === "view-collection" && activeTab !== "view-collection"

              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && onTabChange(tab.id as any)}
                  disabled={isDisabled}
                  className={`
                    flex-shrink-0 w-auto 
                    sm:flex-1 sm:min-w-0
                    px-3 sm:px-4 py-3 sm:py-4 rounded-xl 
                    font-medium text-xs sm:text-sm transition-all duration-300 ease-out
                    ${
                      isActive
                        ? tab.color === 'teal'
                          ? 'text-teal-300'
                          : 'text-[#00ff00] font-medium'
                        : isDisabled
                          ? 'text-gray-500 cursor-not-allowed opacity-60'
                          : tab.color === 'teal'
                            ? 'text-teal-400 hover:text-teal-300 hover:bg-[#111]/80'
                            : 'text-gray-400 hover:text-[#00ff00] hover:bg-[#111]/80'
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>

                    {(tab.id === "digital-recycler" || tab.id === "claim-sol") && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-teal hover:text-[#00ff00] transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          {tab.id === "digital-recycler" ? (
                            <div className="space-y-2">
                              <p className={`font-semibold ${activeTab === "digital-recycler" ? 'text-[#00ff00]' : 'text-white'}`}>Digital Recycler</p>
                              <p>Burn your unused NFTs to recover SOL rent. This process is <span className="text-red-400 font-semibold">irreversible</span>.</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className={`font-semibold ${activeTab === "claim-sol" ? 'text-teal-300' : 'text-white'}`}>Claim SOL</p>
                              <p>Close empty token accounts to recover SOL rent. This process is <span className="text-green-400 font-semibold">reversible</span>.</p>
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>

  )
}
