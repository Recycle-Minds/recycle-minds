"use client"

interface ActionButtonsProps {
  activeTab: "digital-recycler" | "view-collection" | "recycling-history" | "claim-sol" | "why-recycle"
  onTabChange: (tab: "digital-recycler" | "view-collection" | "recycling-history" | "claim-sol" | "why-recycle") => void
}

export function ActionButtons({ activeTab, onTabChange }: ActionButtonsProps) {
  const tabs = [
    { id: "why-recycle", label: "Why Recycle?", color: "green" },
    { id: "digital-recycler", label: "Digital Recycler", color: "green" },
    { id: "recycling-history", label: "History", color: "green" },
    { id: "view-collection", label: "View Collection", color: "gray" },
    { id: "claim-sol", label: "Claim SOL", color: "teal" }
  ]

  return (
    <div className="relative mb-8">
      {/* Tab Container with Background */}
      <div className="relative bg-[#0f0f0f] rounded-2xl p-2 border border-gray-800/30 backdrop-blur-sm">
        {/* Active Tab Background */}
        <div 
          className="absolute top-2 bottom-2 bg-gradient-to-r from-[#00ff00]/20 to-[#00ff00]/10 rounded-xl transition-all duration-500 ease-out"
          style={{
            left: `${tabs.findIndex(tab => tab.id === activeTab) * (100 / tabs.length)}%`,
            width: `${100 / tabs.length}%`,
          }}
        />
        
        {/* Tab Buttons */}
        <div className="relative flex">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const isDisabled = tab.id === "view-collection" && activeTab !== "view-collection"
            
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && onTabChange(tab.id as any)}
                disabled={isDisabled}
                className={`
                  relative flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ease-out
                  ${isActive 
                    ? 'text-[#00ff00] font-semibold' 
                    : isDisabled
                    ? 'text-gray-500 cursor-not-allowed'
                    : tab.color === 'teal'
                    ? 'text-teal-400 hover:text-teal-300'
                    : 'text-gray-400 hover:text-[#00ff00]'
                  }
                `}
              >
                <span className="relative z-10">{tab.label}</span>
                
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
