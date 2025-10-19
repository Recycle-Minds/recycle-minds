"use client"

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { StatsService, UserStats, GlobalStats, RecycledNFT } from '@/lib/stats-service'

export function useStats() {
  const { publicKey } = useWallet()
  const [userStats, setUserStats] = useState<UserStats>({
    earnedPoints: 0,
    recycledNFTs: 0,
    solClaimed: 0,
    co2Saved: 0
  })
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalRecycledNFTs: 0,
    totalCO2Saved: 0,
    totalSolClaimed: 0,
    totalUsers: 0
  })
  const [recycledNFTs, setRecycledNFTs] = useState<RecycledNFT[]>([])
  const [loading, setLoading] = useState(false)

  const walletAddress = publicKey?.toString()

  // Load stats when wallet connects
  useEffect(() => {
    if (walletAddress) {
      setLoading(true)
      
      // Load user stats
      const stats = StatsService.getUserStats(walletAddress)
      setUserStats(stats)
      
      // Load recycled NFTs
      const nfts = StatsService.getRecycledNFTs(walletAddress)
      setRecycledNFTs(nfts)
      
      // Load global stats
      const global = StatsService.getGlobalStats()
      setGlobalStats(global)
      
      setLoading(false)
    } else {
      // Reset when wallet disconnects
      setUserStats({
        earnedPoints: 0,
        recycledNFTs: 0,
        solClaimed: 0,
        co2Saved: 0
      })
      setRecycledNFTs([])
    }
  }, [walletAddress])

  // Add recycled NFT
  const addRecycledNFT = (nft: RecycledNFT) => {
    if (!walletAddress) return
    
    StatsService.addRecycledNFT(walletAddress, nft)
    
    // Update local state
    const updatedStats = StatsService.getUserStats(walletAddress)
    const updatedNFTs = StatsService.getRecycledNFTs(walletAddress)
    const updatedGlobal = StatsService.getGlobalStats()
    
    setUserStats(updatedStats)
    setRecycledNFTs(updatedNFTs)
    setGlobalStats(updatedGlobal)
  }

  // Get leaderboard
  const getLeaderboard = () => {
    return StatsService.getLeaderboard()
  }

  // Export user data
  const exportUserData = () => {
    if (!walletAddress) return null
    return StatsService.exportUserData(walletAddress)
  }

  // Reset user stats (for testing)
  const resetUserStats = () => {
    if (!walletAddress) return
    
    StatsService.resetUserStats(walletAddress)
    setUserStats({
      earnedPoints: 0,
      recycledNFTs: 0,
      solClaimed: 0,
      co2Saved: 0
    })
    setRecycledNFTs([])
  }

  return {
    userStats,
    globalStats,
    recycledNFTs,
    loading,
    addRecycledNFT,
    getLeaderboard,
    exportUserData,
    resetUserStats
  }
}
