"use client"

import { useStats } from "@/hooks/use-stats"
import { useWallet } from '@solana/wallet-adapter-react'

export function RecyclingHistoryTable() {
  const { publicKey } = useWallet()
  const { recycledNFTs } = useStats()

  // Group recycled NFTs by collection and date
  const historyData = recycledNFTs.reduce((acc, nft) => {
    const date = new Date(nft.recycledAt).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
    
    const key = `${nft.collection}-${date}`
    
    if (!acc[key]) {
      acc[key] = {
        collection: nft.collection,
        network: "Solana", // All NFTs are on Solana
        date: date,
        nftCount: 0,
        points: 0,
        image: nft.image
      }
    }
    
    acc[key].nftCount += 1
    acc[key].points += nft.pointsEarned
    
    return acc
  }, {} as Record<string, {
    collection: string
    network: string
    date: string
    nftCount: number
    points: number
    image: string
  }>)

  const historyArray = Object.values(historyData).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // If no recycled NFTs, show empty state
  if (!publicKey || historyArray.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-[#00ff00] text-center mb-6">HISTORY</h2>
        <div className="border border-[#292929] rounded-lg overflow-hidden">
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-4">
              {!publicKey ? 'Connect your wallet to view recycling history' : 'No NFTs recycled yet'}
            </p>
            {!publicKey && (
              <p className="text-sm text-gray-500">
                Your recycling history will appear here once you start recycling NFTs
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const getNetworkIcon = (network: string) => {
    switch (network) {
      case "Solana":
        return (
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <div className="w-4 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded" />
              <div className="w-4 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded" />
              <div className="w-4 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded" />
            </div>
            <span className="text-white">{network}</span>
          </div>
        )
      case "Polygon":
        return (
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M13.5 6.5L10 4.5L6.5 6.5V10.5L10 12.5L13.5 10.5V6.5Z"
                stroke="#8247e5"
                strokeWidth="1.5"
                fill="none"
              />
              <path d="M10 4.5V12.5M6.5 6.5L13.5 10.5M13.5 6.5L6.5 10.5" stroke="#8247e5" strokeWidth="1.5" />
            </svg>
            <span className="text-white">{network}</span>
          </div>
        )
      case "Ethereum":
        return (
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3L10 11L15 8.5L10 3Z" fill="#8c8c8c" />
              <path d="M10 3L5 8.5L10 11L10 3Z" fill="#393939" />
              <path d="M10 12L10 17L15 9.5L10 12Z" fill="#8c8c8c" />
              <path d="M10 17L10 12L5 9.5L10 17Z" fill="#393939" />
            </svg>
            <span className="text-white">{network}</span>
          </div>
        )
      case "Base":
        return (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <span className="text-white">{network}</span>
          </div>
        )
      default:
        return <span className="text-white">{network}</span>
    }
  }

  return (
    <div className="mt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Recycling History</h2>
        <p className="text-gray-400">Track your environmental impact and earned rewards</p>
      </div>

      <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-2xl p-6 shadow-2xl shadow-black/50 border border-[#292929] backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#292929]">
                <th className="text-left py-3 px-6 text-white font-semibold text-base">Collection</th>
                <th className="text-left py-3 px-6 text-white font-semibold text-base">Network</th>
                <th className="text-left py-3 px-6 text-white font-semibold text-base">Date</th>
                <th className="text-left py-3 px-6 text-white font-semibold text-base">NFTs Recycled</th>
                <th className="text-left py-3 px-6 text-white font-semibold text-base">Points Earned</th>
              </tr>
            </thead>
            <tbody>
              {historyArray.map((item, index) => (
                <tr key={index} className="border-b border-[#292929] last:border-b-0 hover:bg-gradient-to-r hover:from-[#00ff00]/5 hover:to-transparent transition-all duration-300 group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.collection}
                          className="w-10 h-10 rounded-xl object-cover shadow-lg"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.jpg'
                          }}
                        />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-black"></div>
                      </div>
                      <div>
                        <span className="text-white font-semibold text-base">{item.collection}</span>
                        <div className="text-xs text-gray-400">Recycled Collection</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">{getNetworkIcon(item.network)}</td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">{item.date}</div>
                    <div className="text-xs text-gray-400">Recycled</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-lg">{item.nftCount}</span>
                      <span className="text-gray-400 text-sm">NFTs</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-lg">{item.points}</span>
                      <span className="text-gray-400 text-sm">points</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
