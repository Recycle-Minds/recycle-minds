"use client"

import { Card } from "@/components/ui/card"
import { Layers, Battery, Trophy, Leaf } from "lucide-react"
import { useStats } from "@/hooks/use-stats"
import { useWallet } from '@solana/wallet-adapter-react'

export function StatsCards() {
  const { publicKey } = useWallet()
  const { userStats, globalStats } = useStats()

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card className="bg-[#1a1a1a] border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-10 w-10 text-[#00ff00]" />
          <span className="text-gray-400 text-sm">Earned Points</span>
        </div>
        <div className="text-3xl font-bold text-[#00ff00]">
          {publicKey ? userStats.earnedPoints.toLocaleString() : '0'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {publicKey ? 'From recycling NFTs' : 'Connect wallet to see points'}
        </div>
      </Card>

      <Card className="bg-[#1a1a1a] border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Battery className="h-10 w-10 text-[#00ff00]" />
          <span className="text-gray-400 text-sm">My Recycled NFTs</span>
        </div>
        <div className="text-3xl font-bold text-[#00ff00]">
          {publicKey ? userStats.recycledNFTs : '0'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {publicKey ? 'NFTs recycled' : 'Connect wallet to see count'}
        </div>
      </Card>

      <Card className="bg-[#1a1a1a] border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="h-10 w-10 text-[#00ff00]" />
          <span className="text-gray-400 text-sm">Global CO₂ Saved</span>
        </div>
        <div className="text-2xl font-bold text-[#00ff00]">
          {globalStats.totalCO2Saved.toFixed(1)} kg
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Community environmental impact
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-teal-900 to-teal-950 border-teal-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="h-10 w-10 text-teal-400" />
          <span className="text-gray-300 text-sm">SOL to Claim</span>
        </div>
        <div className="text-3xl font-bold text-teal-400">
          {publicKey ? userStats.solClaimed.toFixed(3) : '0.000'}
        </div>
        <div className="text-xs text-gray-300 mt-1">
          {publicKey ? 'Rent recovered' : 'Connect wallet to see SOL'}
        </div>
      </Card>
    </div>
  )
}
