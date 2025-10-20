"use client"

import { Card } from "@/components/ui/card"
import { Layers, Battery, Trophy, Leaf } from "lucide-react"
import { useStats } from "@/hooks/use-stats"
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useState, useEffect } from 'react'
import { StatsService } from '@/lib/stats-service'

export function StatsCards() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const { userStats, globalStats } = useStats()
  const [recoverableSOL, setRecoverableSOL] = useState(0)

  useEffect(() => {
    const fetchRecoverableSOL = async () => {
      if (!publicKey || !connection) return

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        })

        const emptyAccountsCount = tokenAccounts.value.filter((acc) => {
          try {
            const info: any = acc.account.data.parsed.info
            const amount = info.tokenAmount?.uiAmount || 0
            return amount === 0
          } catch {
            return false
          }
        }).length

        const recoverable = StatsService.calculateRecoverableSOL(emptyAccountsCount)
        setRecoverableSOL(recoverable)
      } catch (error) {
        console.error('Error fetching recoverable SOL:', error)
        setRecoverableSOL(0)
      }
    }

    fetchRecoverableSOL()
  }, [publicKey, connection])

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-0 p-6 shadow-2xl shadow-black/50 hover:shadow-3xl hover:shadow-black/60 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#00ff00]/10 backdrop-blur-sm">
              <Trophy className="h-8 w-8 text-[#00ff00]" />
            </div>
            <span className="text-gray-400 text-sm font-medium">Earned Points</span>
          </div>
          <div className="text-3xl font-bold text-[#00ff00] mb-3">
            {publicKey ? Number(userStats.earnedPoints).toFixed(5) : '0.00000'}
          </div>
          <div className="text-xs text-gray-300 bg-[#1a1a1a] rounded-lg p-2 border border-[#292929]">
            <div className="font-medium text-white mb-1">Calculation:</div>
            <div className="text-gray-400">0.00268 points per burn/claim</div>
            <div className="text-gray-500 mt-1">Based on <a href="https://climate.solana.com/" target="_blank" rel="noopener noreferrer" className="text-[#00ff00] hover:underline">Solana Climate</a></div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {publicKey ? 'From recycling NFTs' : 'Connect wallet to see points'}
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-0 p-6 shadow-2xl shadow-black/50 hover:shadow-3xl hover:shadow-black/60 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#00ff00]/10 backdrop-blur-sm">
              <Battery className="h-8 w-8 text-[#00ff00]" />
            </div>
            <span className="text-gray-400 text-sm font-medium">My Recycled NFTs</span>
          </div>
          <div className="text-3xl font-bold text-[#00ff00] mb-3">
            {publicKey ? userStats.recycledNFTs : '0'}
          </div>
          {publicKey && userStats.recycledNFTs > 0 && (
            <div className="text-xs text-gray-300 bg-[#1a1a1a] rounded-lg p-2 border border-[#292929]">
              <div className="font-medium text-white mb-1">Stats:</div>
              <div className="text-gray-400">Avg: {(userStats.solClaimed / userStats.recycledNFTs).toFixed(6)} SOL/NFT</div>
              {userStats.lastRecycleDate && (
                <div className="text-gray-400 mt-1">
                  Last: {new Date(userStats.lastRecycleDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {publicKey ? 'NFTs recycled' : 'Connect wallet to see count'}
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-0 p-6 shadow-2xl shadow-black/50 hover:shadow-3xl hover:shadow-black/60 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#00ff00]/10 backdrop-blur-sm">
              <Leaf className="h-8 w-8 text-[#00ff00]" />
            </div>
            <span className="text-gray-400 text-sm font-medium">Global CO₂ Saved</span>
          </div>
          <div className="text-2xl font-bold text-[#00ff00] mb-3">
            {(globalStats.totalCO2Saved / 1_000_000).toFixed(5)} tons
          </div>
          <div className="text-xs text-gray-300 bg-[#1a1a1a] rounded-lg p-2 border border-[#292929]">
            <div className="font-medium text-white mb-1">Calculation:</div>
            <div className="text-gray-400">0.00268 gCO₂e per burn/claim</div>
            <div className="text-gray-500 mt-1">Based on <a href="https://climate.solana.com/" target="_blank" rel="noopener noreferrer" className="text-[#00ff00] hover:underline">Solana Climate</a></div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Community environmental impact
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-teal-900/80 to-teal-950/80 border-0 p-6 shadow-2xl shadow-teal-900/30 hover:shadow-3xl hover:shadow-teal-900/40 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-teal-400/20 backdrop-blur-sm">
              <Layers className="h-8 w-8 text-teal-400" />
            </div>
            <span className="text-gray-300 text-sm font-medium">SOL to Claim</span>
          </div>
          
          {/* Total SOL */}
          <div className="text-3xl font-bold text-teal-400 mb-3">
            {publicKey ? (recoverableSOL + userStats.solClaimed).toFixed(6) : '0.000000'}
          </div>
          
          {/* Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-teal-300/80">Empty accounts:</span>
              <span className="text-teal-300 font-semibold">{publicKey ? recoverableSOL.toFixed(6) : '0.000000'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-teal-300/80">From burns:</span>
              <span className="text-teal-300 font-semibold">{publicKey ? userStats.solClaimed.toFixed(6) : '0.000000'}</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-300 mt-3 pt-2 border-t border-teal-400/20">
          {publicKey ? 'Total available to claim' : 'Connect wallet to see SOL'}
        </div>
      </Card>
    </div>
  )
}
