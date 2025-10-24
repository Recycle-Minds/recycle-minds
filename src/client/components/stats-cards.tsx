"use client"

import { Card } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"
import Image from "next/image"
import { useStats } from "@/hooks/use-stats"
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useState, useEffect } from 'react'
import { StatsService } from '@/lib/stats-service'
import { useNFTs } from '@/hooks/use-nfts'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function StatsCards() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const { userStats, globalStats } = useStats()
  const { nfts } = useNFTs()
  const [recoverableSOL, setRecoverableSOL] = useState(0)
  const [burnableSOL, setBurnableSOL] = useState(0)

  useEffect(() => {
    const fetchRecoverableSOL = async () => {
      if (!publicKey) return

      try {
        const response = await fetch(`/api/token-accounts?owner=${encodeURIComponent(publicKey.toString())}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(`API error: ${data.error}`)
        }

        const emptyAccountsCount = data.emptyAccountsCount || 0
        const recoverable = StatsService.calculateRecoverableSOL(emptyAccountsCount)
        setRecoverableSOL(recoverable)
      } catch (error) {
        console.error('Error fetching recoverable SOL:', error)
        setRecoverableSOL(0)
      }
    }

    fetchRecoverableSOL()
  }, [publicKey])

  // Calculate SOL recoverable from burning NFTs
  useEffect(() => {
    const calculateBurnableSOL = async () => {
      if (!publicKey || !nfts?.length) {
        setBurnableSOL(0)
        return
      }

      try {
        let totalLamports = 0n
        const addressesToCheck: string[] = []
        
        for (const nft of nfts) {
          if (nft.interface === 'MplCoreAsset') {
            addressesToCheck.push(nft.mint)
          } else {
            const mintPk = new PublicKey(nft.mint)
            const ata = await getAssociatedTokenAddress(mintPk, publicKey, true)
            addressesToCheck.push(ata.toString())
          }
        }
        
        if (addressesToCheck.length > 0) {
          const response = await fetch(`/api/account-info?addresses=${addressesToCheck.join(',')}`)
          if (response.ok) {
            const data = await response.json()
            if (data.results) {
              for (const result of data.results) {
                if (result.accountInfo) {
                  totalLamports += BigInt(result.accountInfo.lamports)
                }
              }
            }
          }
        }
        
        const sol = Number(totalLamports) / 1_000_000_000
        setBurnableSOL(sol)
      } catch (error) {
        console.error('Error calculating burnable SOL:', error)
        setBurnableSOL(0)
      }
    }

    calculateBurnableSOL()
  }, [publicKey, nfts])

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-0 p-6 shadow-2xl shadow-black/50 hover:shadow-3xl hover:shadow-black/60 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg backdrop-blur-sm">
              <Image 
                src="/icon_dashboard_earned_points.png" 
                alt="Earned Points" 
                width={32} 
                height={32} 
                className="h-8 w-8"
              />
            </div>
            <span className="text-gray-400 text-sm font-medium">Earned Points</span>
          </div>
          <div className="text-3xl font-bold text-[#00ff00] mb-3">
            {publicKey ? Number(userStats.earnedPoints).toFixed(5) : '0.00000'}
          </div>
          <div className="text-xs text-gray-300 bg-[#1a1a1a] rounded-lg p-2 border border-[#292929]">
            <div className="font-medium text-white mb-1">Calculation:</div>
            <div className="text-gray-400">0.00268 points per recycle</div>
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
            <div className="p-2 rounded-lg backdrop-blur-sm">
              <Image 
                src="/icon_dashboard_points.png" 
                alt="My Recycled NFTs" 
                width={32} 
                height={32} 
                className="h-8 w-8"
              />
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
            <div className="p-2 rounded-lg backdrop-blur-sm">
              <Image 
                src="/icon_dashboard_co2.png" 
                alt="Global CO2 Saved" 
                width={32} 
                height={32} 
                className="h-8 w-8"
              />
            </div>
            <span className="text-gray-400 text-sm font-medium">Global CO₂ Saved</span>
          </div>
          <div className="text-2xl font-bold text-[#00ff00] mb-3">
            {(globalStats.totalCO2Saved / 1_000_000).toFixed(5)} t
          </div>
          <div className="text-xs text-gray-300 bg-[#1a1a1a] rounded-lg p-2 border border-[#292929]">
            <div className="font-medium text-white mb-1">Calculation:</div>
            <div className="text-gray-400">0.00268 gCO₂e per recycle</div>
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
            <div className="p-2 rounded-lg backdrop-blur-sm">
              <Image 
                src="/icon_dashboard_solana.png" 
                alt="SOL to Claim" 
                width={32} 
                height={32} 
                className="h-8 w-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-sm font-medium">SOL to Claim</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-teal-400 hover:text-teal-300 transition-colors cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm">
                  <div className="space-y-2">
                    <p className="font-semibold text-teal-400">SOL to Claim Breakdown</p>
                    <div className="space-y-1 text-xs">
                      <p><span className="text-teal-300 font-semibold">Empty Accounts:</span> SOL from closing empty token accounts (reversible)</p>
                      <p><span className="text-teal-300 font-semibold">From Recycling:</span> SOL from burning NFTs (irreversible)</p>
                    </div>
                    <p className="text-xs text-gray-400">Empty accounts are created when you receive tokens but later send them all away. The SOL comes from rent paid when creating accounts on Solana.</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          {/* Total SOL */}
          <div className="text-3xl font-bold text-teal-400 mb-3">
            {publicKey ? (recoverableSOL + burnableSOL).toFixed(6) : '0.000000'}
          </div>
          
          {/* Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-teal-300/80">Empty accounts:</span>
              <span className="text-teal-300 font-semibold">{publicKey ? recoverableSOL.toFixed(6) : '0.000000'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-teal-300/80">From recycling:</span>
              <span className="text-teal-300 font-semibold">{publicKey ? burnableSOL.toFixed(6) : '0.000000'}</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-300 mt-3 pt-2 border-t border-teal-400/20">
          Total available to claim
        </div>
      </Card>
      </div>
    </TooltipProvider>
  )
}
