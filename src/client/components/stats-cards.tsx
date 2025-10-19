"use client"

import { Card } from "@/components/ui/card"
import { Layers, Battery, Trophy, Leaf } from "lucide-react"
import { useStats } from "@/hooks/use-stats"
import { useWallet } from '@solana/wallet-adapter-react'

export function StatsCards() {
  const { publicKey } = useWallet()
  const { userStats, globalStats } = useStats()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-0 p-6 shadow-2xl shadow-black/50 hover:shadow-3xl hover:shadow-black/60 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#00ff00]/10 backdrop-blur-sm">
            <Trophy className="h-8 w-8 text-[#00ff00]" />
          </div>
          <span className="text-gray-400 text-sm font-medium">Earned Points</span>
        </div>
        <div className="text-3xl font-bold text-[#00ff00] mb-1">
          {publicKey ? userStats.earnedPoints.toLocaleString() : '0'}
        </div>
        <div className="text-xs text-gray-500">
          {publicKey ? 'From recycling NFTs' : 'Connect wallet to see points'}
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-0 p-6 shadow-2xl shadow-black/50 hover:shadow-3xl hover:shadow-black/60 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#00ff00]/10 backdrop-blur-sm">
            <Battery className="h-8 w-8 text-[#00ff00]" />
          </div>
          <span className="text-gray-400 text-sm font-medium">My Recycled NFTs</span>
        </div>
        <div className="text-3xl font-bold text-[#00ff00] mb-1">
          {publicKey ? userStats.recycledNFTs : '0'}
        </div>
        <div className="text-xs text-gray-500">
          {publicKey ? 'NFTs recycled' : 'Connect wallet to see count'}
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-0 p-6 shadow-2xl shadow-black/50 hover:shadow-3xl hover:shadow-black/60 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#00ff00]/10 backdrop-blur-sm">
            <Leaf className="h-8 w-8 text-[#00ff00]" />
          </div>
          <span className="text-gray-400 text-sm font-medium">Global CO₂ Saved</span>
        </div>
        <div className="text-2xl font-bold text-[#00ff00] mb-1">
          {globalStats.totalCO2Saved.toFixed(1)} kg
        </div>
        <div className="text-xs text-gray-500">
          Community environmental impact
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-teal-900/80 to-teal-950/80 border-0 p-6 shadow-2xl shadow-teal-900/30 hover:shadow-3xl hover:shadow-teal-900/40 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-teal-400/20 backdrop-blur-sm">
            <Layers className="h-8 w-8 text-teal-400" />
          </div>
          <span className="text-gray-300 text-sm font-medium">SOL to Claim</span>
        </div>
        <div className="text-3xl font-bold text-teal-400 mb-1">
          {publicKey ? userStats.solClaimed.toFixed(3) : '0.000'}
        </div>
        <div className="text-xs text-gray-300">
          {publicKey ? 'Rent recovered' : 'Connect wallet to see SOL'}
        </div>
      </Card>
    </div>
  )
}
