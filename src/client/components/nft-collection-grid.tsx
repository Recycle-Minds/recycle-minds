"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Loader2, Trash2, Recycle } from "lucide-react"
import { useNFTs } from "@/hooks/use-nfts"
import { useRecycling } from "@/hooks/use-recycling"
import { useWalletInfo } from "@/hooks/use-wallet-info"
import { useState, useEffect } from "react"

interface NFTCollectionGridProps {
  collectionAddress?: string
}

export function NFTCollectionGrid({ collectionAddress }: NFTCollectionGridProps) {
  const { nfts, loading, error } = useNFTs()
  const { burnSingle, isBurning, isBurned } = useRecycling()
  const { isConnected } = useWalletInfo()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([])
  const itemsPerPage = 6

  const collectionNFTs = collectionAddress 
    ? nfts.filter(nft => nft.collection?.address === collectionAddress)
    : nfts

  const totalPages = Math.ceil(collectionNFTs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedNFTs = collectionNFTs.slice(startIndex, startIndex + itemsPerPage)

  const handleSelectNFT = (mintAddress: string) => {
    setSelectedNFTs(prev => 
      prev.includes(mintAddress) 
        ? prev.filter(mint => mint !== mintAddress)
        : [...prev, mintAddress]
    )
  }

  const handleRecycleSelected = async () => {
    if (!isConnected || selectedNFTs.length === 0) return

    for (const mintAddress of selectedNFTs) {
      try {
        await burnSingle(mintAddress)
      } catch (err) {
        console.error(`Failed to recycle NFT ${mintAddress}:`, err)
      }
    }
    setSelectedNFTs([])
  }

  const handleRecycleSingle = async (mintAddress: string) => {
    if (!isConnected) return
    try {
      await burnSingle(mintAddress)
    } catch (err) {
      console.error(`Failed to recycle NFT ${mintAddress}:`, err)
    }
  }

  const toggleSelectAll = () => {
    if (selectedNFTs.length === paginatedNFTs.length) {
      setSelectedNFTs([])
    } else {
      setSelectedNFTs(paginatedNFTs.map(nft => nft.mint))
    }
  }

  const selectedPoints = selectedNFTs.length * 10 // 10 points per NFT

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-[#00ff00] mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to view your NFT collections</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#00ff00]" />
        <p className="text-gray-400">Loading NFT collection...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Collection</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          {collectionAddress ? 'Select NFTs to Recycle' : 'All NFTs to Recycle'}
        </h2>
        <p className="text-gray-400 text-lg">Owned: {collectionNFTs.length} NFTs</p>
      </div>

      {collectionNFTs.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-2xl p-12 shadow-2xl shadow-black/50 border border-[#292929]">
            <h3 className="text-2xl font-bold text-gray-300 mb-4">No NFTs Found</h3>
            <p className="text-gray-500 text-lg">This collection doesn't have any NFTs</p>
          </div>
        </div>
      ) : (
        <>
          {/* Control Bar */}
          <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-2xl p-6 shadow-2xl shadow-black/50 border border-[#292929] backdrop-blur-sm mb-8">
            <div className="flex items-center justify-between gap-6">
              {/* Select All */}
              <div className="flex items-center gap-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl px-6 py-4 min-w-[220px] border border-[#292929]">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedNFTs.length === paginatedNFTs.length && paginatedNFTs.length > 0}
                  onChange={toggleSelectAll}
                  className="h-6 w-6 rounded border-2 border-[#00ff00] bg-transparent text-[#00ff00] focus:ring-2 focus:ring-[#00ff00]/20"
                />
                <label htmlFor="select-all" className="text-white font-semibold text-lg cursor-pointer">
                  Select All
                </label>
              </div>

              {/* Selected Points */}
              <div className="flex items-center gap-4 bg-gradient-to-r from-[#00ff00]/10 to-[#00ff00]/5 rounded-xl px-8 py-4 border border-[#00ff00]/20">
                <span className="text-white font-semibold text-lg">Selected Points:</span>
                <span className="text-white text-6xl font-black">{selectedPoints}</span>
              </div>

              {/* Recycle Button */}
              <Button
                className="bg-[#00ff00] text-white hover:bg-[#00dd00] px-10 py-6 text-xl font-black min-w-[240px] border-2 border-[#00ff00] transition-all duration-300 rounded-xl"
                disabled={selectedNFTs.length === 0}
                onClick={handleRecycleSelected}
              >
                <Recycle className="mr-3 h-8 w-8" />
                Recycle
              </Button>
            </div>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {paginatedNFTs.map((nft) => {
              const isSelected = selectedNFTs.includes(nft.mint)
              const isCurrentlyBurning = isBurning(nft.mint)
              const isCurrentlyBurned = isBurned(nft.mint)
              
              return (
                <div
                  key={nft.mint}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-2xl hover:shadow-3xl hover:shadow-[#00ff00]/20 ${
                    isSelected ? "ring-4 ring-[#00ff00] shadow-[#00ff00]/30" : "ring-2 ring-gray-600/50"
                  } ${isCurrentlyBurned ? 'opacity-50' : 'hover:scale-105'}`}
                  onClick={() => !isCurrentlyBurned && !isCurrentlyBurning && handleSelectNFT(nft.mint)}
                >
                  {/* NFT Image */}
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 relative">
                    <img
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Burning Overlay */}
                    {isCurrentlyBurning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                        <div className="text-center">
                          <Loader2 className="h-16 w-16 animate-spin text-[#00ff00] mx-auto mb-4" />
                          <div className="text-white font-bold text-lg">Recycling...</div>
                        </div>
                      </div>
                    )}

                    {/* Burned Overlay */}
                    {isCurrentlyBurned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
                        <div className="text-center">
                          <Trash2 className="h-16 w-16 mx-auto mb-4 text-red-400" />
                          <div className="text-red-400 font-bold text-lg">Burned</div>
                        </div>
                      </div>
                    )}

                    {/* Recycle Icon Overlay for non-burned NFTs */}
                    {!isCurrentlyBurned && !isCurrentlyBurning && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
                        <div className="bg-gradient-to-r from-[#00ff00] to-[#00dd00] rounded-full p-6 shadow-2xl shadow-[#00ff00]/50">
                          <Recycle className="h-16 w-16 text-black" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Checkbox at bottom */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                    <div
                      className={`h-8 w-8 rounded-full border-4 flex items-center justify-center shadow-lg transition-all duration-300 ${
                        isSelected ? "bg-[#00ff00] border-[#00ff00] shadow-[#00ff00]/50" : "bg-black/80 border-white backdrop-blur-sm"
                      }`}
                    >
                      {isSelected && <div className="h-4 w-4 rounded-full bg-black" />}
                    </div>
                  </div>

                  {/* NFT Name */}
                  <div className="absolute top-3 left-3 right-3">
                    <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                      <p className="text-white text-sm font-bold truncate">{nft.name}</p>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-[#00ff00] rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-3 h-3 bg-black rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black bg-transparent"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <span className="text-gray-400 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black bg-transparent"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}