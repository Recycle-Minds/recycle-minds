"use client"

import { useState } from "react"
import { RecycleMindsHeader } from "@/components/recycle-minds-header"
import { StatsCards } from "@/components/stats-cards"
import { ActionButtons } from "@/components/action-buttons"
import { NFTRecycleTable } from "@/components/nft-recycle-table"
import { NFTCollectionGrid } from "@/components/nft-collection-grid"
import { RecyclingHistoryTable } from "@/components/recycling-history-table"
import { ClaimSolView } from "@/components/claim-sol-view"
import { WhyRecycleLanding } from "@/components/why-recycle-landing"
import { RecycleMindsFooter } from "@/components/recycle-minds-footer"

export default function Page() {
  const [activeTab, setActiveTab] = useState<
    "digital-recycler" | "view-collection" | "recycling-history" | "claim-sol" | "why-recycle"
  >("digital-recycler")

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <RecycleMindsHeader />

      <main className="container mx-auto px-4 py-8">
        {activeTab !== "why-recycle" && <StatsCards />}
        <ActionButtons activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === "digital-recycler" ? (
          <NFTRecycleTable />
        ) : activeTab === "view-collection" ? (
          <NFTCollectionGrid />
        ) : activeTab === "recycling-history" ? (
          <RecyclingHistoryTable />
        ) : activeTab === "claim-sol" ? (
          <ClaimSolView />
        ) : (
          <WhyRecycleLanding />
        )}
      </main>

      <RecycleMindsFooter />
    </div>
  )
}
