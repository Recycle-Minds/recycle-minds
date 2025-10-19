import { PublicKey } from '@solana/web3.js'

export interface UserStats {
  earnedPoints: number
  recycledNFTs: number
  solClaimed: number
  co2Saved: number
  lastRecycleDate?: string
}

export interface GlobalStats {
  totalRecycledNFTs: number
  totalCO2Saved: number
  totalSolClaimed: number
  totalUsers: number
}

export interface RecycledNFT {
  mint: string
  name: string
  image: string
  collection: string
  recycledAt: string
  solRecovered: number
  pointsEarned: number
  co2Saved: number
  txSignature: string
}

export class StatsService {
  private static readonly STORAGE_KEYS = {
    USER_STATS: 'recycle_minds_user_stats',
    RECYCLED_NFTS: 'recycle_minds_recycled_nfts',
    GLOBAL_STATS: 'recycle_minds_global_stats'
  }

  // Get user stats from local storage
  static getUserStats(walletAddress: string): UserStats {
    const key = `${this.STORAGE_KEYS.USER_STATS}_${walletAddress}`
    const stored = localStorage.getItem(key)
    
    if (stored) {
      return JSON.parse(stored)
    }
    
    return {
      earnedPoints: 0,
      recycledNFTs: 0,
      solClaimed: 0,
      co2Saved: 0
    }
  }

  // Update user stats
  static updateUserStats(walletAddress: string, updates: Partial<UserStats>): UserStats {
    const currentStats = this.getUserStats(walletAddress)
    const newStats = { ...currentStats, ...updates }
    
    const key = `${this.STORAGE_KEYS.USER_STATS}_${walletAddress}`
    localStorage.setItem(key, JSON.stringify(newStats))
    
    return newStats
  }

  // Add recycled NFT
  static addRecycledNFT(walletAddress: string, nft: RecycledNFT): void {
    const key = `${this.STORAGE_KEYS.RECYCLED_NFTS}_${walletAddress}`
    const stored = localStorage.getItem(key)
    const recycledNFTs: RecycledNFT[] = stored ? JSON.parse(stored) : []
    
    recycledNFTs.push(nft)
    localStorage.setItem(key, JSON.stringify(recycledNFTs))
    
    // Update user stats
    this.updateUserStats(walletAddress, {
      earnedPoints: this.getUserStats(walletAddress).earnedPoints + nft.pointsEarned,
      recycledNFTs: this.getUserStats(walletAddress).recycledNFTs + 1,
      solClaimed: this.getUserStats(walletAddress).solClaimed + nft.solRecovered,
      co2Saved: this.getUserStats(walletAddress).co2Saved + nft.co2Saved,
      lastRecycleDate: nft.recycledAt
    })
    
    // Update global stats
    this.updateGlobalStats({
      totalRecycledNFTs: this.getGlobalStats().totalRecycledNFTs + 1,
      totalCO2Saved: this.getGlobalStats().totalCO2Saved + nft.co2Saved,
      totalSolClaimed: this.getGlobalStats().totalSolClaimed + nft.solRecovered
    })
  }

  // Get recycled NFTs for user
  static getRecycledNFTs(walletAddress: string): RecycledNFT[] {
    const key = `${this.STORAGE_KEYS.RECYCLED_NFTS}_${walletAddress}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  // Get global stats
  static getGlobalStats(): GlobalStats {
    const stored = localStorage.getItem(this.STORAGE_KEYS.GLOBAL_STATS)
    
    if (stored) {
      return JSON.parse(stored)
    }
    
    return {
      totalRecycledNFTs: 0,
      totalCO2Saved: 0,
      totalSolClaimed: 0,
      totalUsers: 0
    }
  }

  // Update global stats
  static updateGlobalStats(updates: Partial<GlobalStats>): void {
    const currentStats = this.getGlobalStats()
    const newStats = { ...currentStats, ...updates }
    localStorage.setItem(this.STORAGE_KEYS.GLOBAL_STATS, JSON.stringify(newStats))
  }

  // Calculate points for NFT recycling
  static calculatePoints(nftValue: number, rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'): number {
    const basePoints = Math.floor(nftValue * 10) // 10 points per SOL value
    const rarityMultiplier = {
      common: 1,
      rare: 1.5,
      epic: 2,
      legendary: 3
    }
    
    return Math.floor(basePoints * rarityMultiplier[rarity])
  }

  // Calculate CO2 saved (estimated)
  static calculateCO2Saved(nftValue: number): number {
    // Estimate: 1 SOL worth of NFT recycling saves ~0.1 kg CO2
    return Math.round(nftValue * 0.1 * 100) / 100
  }

  // Calculate SOL recovery (rent + small bonus)
  static calculateSOLRecovery(nftValue: number): number {
    // Base rent recovery + 5% bonus
    const baseRent = 0.002 // ~0.002 SOL rent per NFT
    const bonus = nftValue * 0.05 // 5% bonus
    return Math.round((baseRent + bonus) * 1000) / 1000
  }

  // Get leaderboard data
  static getLeaderboard(): Array<{wallet: string, points: number, recycled: number}> {
    const leaderboard: Array<{wallet: string, points: number, recycled: number}> = []
    
    // Get all user stats from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.STORAGE_KEYS.USER_STATS)) {
        const walletAddress = key.replace(`${this.STORAGE_KEYS.USER_STATS}_`, '')
        const stats = this.getUserStats(walletAddress)
        
        if (stats.earnedPoints > 0) {
          leaderboard.push({
            wallet: walletAddress,
            points: stats.earnedPoints,
            recycled: stats.recycledNFTs
          })
        }
      }
    }
    
    return leaderboard.sort((a, b) => b.points - a.points).slice(0, 10)
  }

  // Reset user stats (for testing)
  static resetUserStats(walletAddress: string): void {
    const key = `${this.STORAGE_KEYS.USER_STATS}_${walletAddress}`
    localStorage.removeItem(key)
    
    const nftKey = `${this.STORAGE_KEYS.RECYCLED_NFTS}_${walletAddress}`
    localStorage.removeItem(nftKey)
  }

  // Export user data
  static exportUserData(walletAddress: string): string {
    const stats = this.getUserStats(walletAddress)
    const recycledNFTs = this.getRecycledNFTs(walletAddress)
    
    return JSON.stringify({
      stats,
      recycledNFTs,
      exportedAt: new Date().toISOString()
    }, null, 2)
  }
}
