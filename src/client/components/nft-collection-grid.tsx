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

  const selectedPoints = (selectedNFTs.length * 0.00268).toFixed(5)

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
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

  // Get collection name from the first NFT or use a default
  const collectionName = collectionNFTs.length > 0 ? collectionNFTs[0].collection?.name || 'Unknown Collection' : 'Collection'

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{collectionName}</h2>
        <p className="text-gray-400">Select NFTs to Recycle • {collectionNFTs.length} NFTs</p>
      </div>

      {collectionNFTs.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-xl p-8 shadow-lg shadow-black/30 border border-[#292929]">
            <h3 className="text-xl font-bold text-gray-300 mb-2">No NFTs Found</h3>
            <p className="text-gray-500">This collection doesn't have any NFTs</p>
          </div>
        </div>
      ) : (
        <>
          {/* Control Bar */}
          <div className="flex items-center justify-between mb-6">
            {/* Left Side - Select All */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedNFTs.length === paginatedNFTs.length && paginatedNFTs.length > 0}
                onChange={toggleSelectAll}
                className="h-5 w-5 rounded border-2 border-[#00ff00] bg-transparent text-[#00ff00] focus:ring-2 focus:ring-[#00ff00]/20"
              />
              <label htmlFor="select-all" className="text-white font-semibold cursor-pointer">
                Select All
              </label>
            </div>

            {/* Center - Selected Points */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Selected:</span>
              <span className="text-white text-2xl font-bold">{selectedNFTs.length}</span>
              <span className="text-gray-400 text-sm">NFTs</span>
              <div className="w-px h-6 bg-gray-600"></div>
              <span className="text-gray-400 text-sm">Points:</span>
              <span className="text-white text-2xl font-bold">{selectedPoints}</span>
            </div>

          {/* Right Side - Recycle Button */}
            <Button
              className="relative bg-gradient-to-r from-[#00ff00] to-[#00dd00] text-black hover:from-[#00ff00] hover:to-[#00ff00] px-10 py-6 text-base font-black border-0 transition-all duration-500 rounded-xl shadow-[0_0_20px_rgba(0,255,0,0.4)] hover:shadow-[0_0_30px_rgba(0,255,0,0.6)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-[0_0_10px_rgba(0,255,0,0.2)]"
              disabled={selectedNFTs.length === 0}
              onClick={handleRecycleSelected}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ff00]/20 to-[#00dd00]/20 rounded-xl blur-sm"></div>
              <div className="relative flex items-center gap-3">
                <Recycle className="h-6 w-6" />
                <span>Recycle Selected</span>
                {selectedNFTs.length > 0 && (
                  <div className="bg-black/20 rounded-full px-2 py-1 text-xs font-bold">
                    {selectedNFTs.length}
                  </div>
                )}
              </div>
            </Button>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {paginatedNFTs.map((nft) => {
              const isSelected = selectedNFTs.includes(nft.mint)
              const isCurrentlyBurning = isBurning(nft.mint)
              const isCurrentlyBurned = isBurned(nft.mint)
              
              return (
                <div
                  key={nft.mint}
                  className={`bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-xl border border-[#292929] overflow-hidden cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isSelected
                      ? "ring-2 ring-[#00ff00] ring-offset-1 ring-offset-[#0a0a0a] shadow-[0_0_24px_2px_rgba(0,255,0,0.15)]"
                      : "hover:shadow-2xl hover:shadow-black/40"
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
                          <Loader2 className="h-8 w-8 animate-spin text-[#00ff00] mx-auto mb-2" />
                          <div className="text-white font-bold text-sm">Recycling...</div>
                        </div>
                      </div>
                    )}

                    {/* Burned Overlay */}
                    {isCurrentlyBurned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
                        <div className="text-center">
                          <Trash2 className="h-8 w-8 mx-auto mb-2 text-red-400" />
                          <div className="text-red-400 font-bold text-sm">Burned</div>
                        </div>
                      </div>
                    )}

                    {/* Recycle Icon Overlay for non-burned NFTs */}
                    {!isCurrentlyBurned && !isCurrentlyBurning && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
                        <div className="bg-gradient-to-r from-[#00ff00] to-[#00dd00] rounded-full p-4 shadow-2xl shadow-[#00ff00]/50">
                          <Recycle className="h-8 w-8 text-black" />
                        </div>
                      </div>
                    )}

                    {/* Selection Indicator */}
                    <div className="absolute top-3 right-3">
                      <div
                        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? "bg-[#00ff00] border-[#00ff00] shadow-[0_0_12px_rgba(0,255,0,0.6)]"
                            : "bg-black/80 border-white backdrop-blur-sm shadow-lg"
                        }`}
                      >
                        {isSelected && <div className="h-3 w-3 rounded-full bg-black" />}
                      </div>
                    </div>
                  </div>

                  {/* NFT Name */}
                  <div className="p-3">
                    <p className="text-white text-sm font-semibold truncate">{nft.name}</p>
                    <p className="text-gray-400 text-xs mt-1">NFT</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                className="border-[#292929] text-white hover:bg-[#00ff00] hover:text-black bg-transparent px-4 py-2"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-gray-400 px-3 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-[#292929] text-white hover:bg-[#00ff00] hover:text-black bg-transparent px-4 py-2"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}