"use client"

import { Button } from "@/components/ui/button"

interface ActionButtonsProps {
  activeTab: "digital-recycler" | "view-collection" | "recycling-history" | "claim-sol" | "why-recycle"
  onTabChange: (tab: "digital-recycler" | "view-collection" | "recycling-history" | "claim-sol" | "why-recycle") => void
}

export function ActionButtons({ activeTab, onTabChange }: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <Button
        variant={activeTab === "why-recycle" ? "default" : "outline"}
        className={
          activeTab === "why-recycle"
            ? "bg-[#00ff00] text-black hover:bg-[#00dd00]"
            : "border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black bg-transparent"
        }
        onClick={() => onTabChange("why-recycle")}
      >
        Why Recycle NFTs?
      </Button>
      <Button
        className={
          activeTab === "digital-recycler"
            ? "bg-[#00ff00] text-black hover:bg-[#00dd00]"
            : "border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black bg-transparent"
        }
        variant={activeTab === "digital-recycler" ? "default" : "outline"}
        onClick={() => onTabChange("digital-recycler")}
      >
        Digital Recycler
      </Button>
      <Button
        variant="outline"
        className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black bg-transparent"
      >
        Rewards Store
      </Button>
      <Button
        variant={activeTab === "recycling-history" ? "default" : "outline"}
        className={
          activeTab === "recycling-history"
            ? "bg-[#00ff00] text-black hover:bg-[#00dd00]"
            : "border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black bg-transparent"
        }
        onClick={() => onTabChange("recycling-history")}
      >
        Recycling History
      </Button>
      <Button
        variant={activeTab === "view-collection" ? "default" : "outline"}
        className={
          activeTab === "view-collection"
            ? "bg-[#00ff00] text-black hover:bg-[#00dd00]"
            : "border-gray-600 text-gray-400 hover:bg-gray-800 bg-transparent"
        }
        onClick={() => onTabChange("view-collection")}
      >
        View Collection
      </Button>
      <Button
        variant={activeTab === "claim-sol" ? "default" : "outline"}
        className={
          activeTab === "claim-sol"
            ? "bg-[#00ff00] text-black hover:bg-[#00dd00]"
            : "border-teal-600 text-teal-400 hover:bg-teal-900 bg-transparent"
        }
        onClick={() => onTabChange("claim-sol")}
      >
        Claim SOL
      </Button>
    </div>
  )
}
