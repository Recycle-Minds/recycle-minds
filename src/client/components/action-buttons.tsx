"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface ActionButtonsProps {
  activeTab: "digital-recycler" | "view-collection" | "recycling-history" | "claim-sol" | "why-recycle" | "rewards-store"
  onTabChange: (tab: "digital-recycler" | "view-collection" | "recycling-history" | "claim-sol" | "why-recycle" | "rewards-store") => void
}

export function ActionButtons({ activeTab, onTabChange }: ActionButtonsProps) {
  const tabs = [
    { id: "why-recycle", label: "Why Recycle?", shortLabel: "Why?", color: "green" },
    { id: "digital-recycler", label: "Digital Recycler", shortLabel: "Recycler", color: "green" },
    { id: "rewards-store", label: "Rewards Store", shortLabel: "Rewards", color: "green" },
    { id: "view-collection", label: "View Collection", shortLabel: "Collection", color: "gray" },
    { id: "recycling-history", label: "History", shortLabel: "History", color: "green" },
    { id: "claim-sol", label: "Empty Accounts", shortLabel: "Claim", color: "teal" }
  ]

  return (
    <TooltipProvider>
      <div className="relative mb-8">
        {/* Tab Container with Background */}
        <div className="relative bg-[#0f0f0f] rounded-2xl p-0 border border-[#292929] backdrop-blur-sm">
        {/* Active Tab Background */}
        <div 
          className={`absolute top-0 bottom-0 rounded-xl transition-all duration-500 ease-out ${
            activeTab === "claim-sol" 
              ? "bg-gradient-to-r from-teal-500/20 to-teal-500/10" 
              : "bg-gradient-to-r from-[#00ff00]/20 to-[#00ff00]/10"
          }`}
          style={{
            left: `${tabs.findIndex(tab => tab.id === activeTab) * (100 / tabs.length)}%`,
            width: `${100 / tabs.length}%`,
          }}
        />
          
          {/* Tab Buttons */}
          <div className="relative flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              const isDisabled = tab.id === "view-collection" && activeTab !== "view-collection"
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && onTabChange(tab.id as any)}
                  disabled={isDisabled}
                  className={`
                    relative flex-1 min-w-0 px-3 sm:px-4 py-3 sm:py-4 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 ease-out whitespace-nowrap
                  ${isActive 
                    ? tab.color === 'teal' 
                      ? 'text-teal-300 font-semibold'
                      : 'text-[#00ff00] font-semibold'
                    : isDisabled
                    ? 'text-gray-500 cursor-not-allowed'
                    : tab.color === 'teal'
                    ? 'text-teal-400 hover:text-teal-300'
                    : 'text-gray-400 hover:text-[#00ff00]'
                  }
                  `}
                >
                  <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    {(tab.id === "digital-recycler" || tab.id === "claim-sol") && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-teal hover:text-[#00ff00] transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          {tab.id === "digital-recycler" ? (
                            <div className="space-y-2">
                              <p className={`font-semibold ${activeTab === "digital-recycler" ? 'text-[#00ff00]' : 'text-white'}`}>Digital Recycler</p>
                              <p>Burn your unused NFTs to recover SOL rent. This process is <span className="text-red-400 font-semibold">irreversible</span> - once burned, NFTs cannot be recovered.</p>
                              <p className="text-xs text-gray-400">The SOL comes from the rent paid when creating NFT accounts on Solana.</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className={`font-semibold ${activeTab === "claim-sol" ? 'text-teal-300' : 'text-white'}`}>Claim SOL</p>
                              <p>Close empty token accounts to recover SOL rent. This process is <span className="text-green-400 font-semibold">reversible</span> - you can recreate accounts later.</p>
                              <p className="text-xs text-gray-400">Empty accounts are created when you receive tokens but later send them all away.</p>
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
