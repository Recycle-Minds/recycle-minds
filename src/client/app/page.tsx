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
import { WhyRecycleBanner } from "@/components/why-recycle-banner"
import { RecycleMindsFooter } from "@/components/recycle-minds-footer"
import { Toaster } from "react-hot-toast"

export default function Page() {
  const [activeTab, setActiveTab] = useState<
    "digital-recycler" | "view-collection" | "recycling-history" | "claim-sol" | "why-recycle"
  >("digital-recycler")
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>(undefined)

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white flex flex-col">
      <RecycleMindsHeader />

      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        {activeTab !== "why-recycle" && <StatsCards />}
        {activeTab === "why-recycle" && <WhyRecycleBanner />}
        <ActionButtons activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === "digital-recycler" ? (
          <NFTRecycleTable onViewCollection={(collectionAddress) => {
            setSelectedCollection(collectionAddress)
            setActiveTab("view-collection")
          }} />
        ) : activeTab === "view-collection" ? (
          <NFTCollectionGrid collectionAddress={selectedCollection} />
        ) : activeTab === "recycling-history" ? (
          <RecyclingHistoryTable />
        ) : activeTab === "claim-sol" ? (
          <ClaimSolView />
        ) : (
          <WhyRecycleLanding />
        )}
      </main>

      <RecycleMindsFooter />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(26, 26, 26, 0.95)',
            color: '#fff',
            border: '1px solid rgba(51, 51, 51, 0.3)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          },
          success: {
            style: {
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
            },
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            style: {
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
          loading: {
            style: {
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#3b82f6',
            },
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  )
}
