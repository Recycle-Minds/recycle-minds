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
        <h2 className="text-2xl font-bold text-[#00ff00] mb-2">
          {collectionAddress ? 'SELECT NFTS TO RECYCLE' : 'ALL NFTS TO RECYCLE'}
        </h2>
        <p className="text-gray-400">Owned: {collectionNFTs.length} NFTs</p>
      </div>

      {collectionNFTs.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-gray-400 mb-2">No NFTs Found</h3>
          <p className="text-gray-500">This collection doesn't have any NFTs</p>
        </div>
      ) : (
        <>
          {/* Control Bar */}
          <div className="flex items-center justify-between mb-8 gap-4">
            {/* Select All */}
            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-gray-800 rounded-lg px-6 py-4 min-w-[200px]">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedNFTs.length === paginatedNFTs.length && paginatedNFTs.length > 0}
                onChange={toggleSelectAll}
                className="h-5 w-5 rounded border-white bg-transparent text-[#00ff00] focus:ring-[#00ff00]"
              />
              <label htmlFor="select-all" className="text-white font-medium cursor-pointer">
                SELECT ALL
              </label>
            </div>

            {/* Selected Points */}
            <div className="flex items-center gap-3">
              <span className="text-white font-medium">SELECTED POINTS:</span>
              <span className="text-[#00ff00] text-5xl font-bold">{selectedPoints}</span>
            </div>

            {/* Recycle Button */}
            <Button
              className="bg-[#00ff00] text-black hover:bg-[#00dd00] px-8 py-6 text-lg font-bold min-w-[200px] border-2 border-[#00ff00]"
              disabled={selectedNFTs.length === 0}
              onClick={handleRecycleSelected}
            >
              <Recycle className="mr-2 h-6 w-6" />
              RECYCLE
            </Button>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {paginatedNFTs.map((nft) => {
              const isSelected = selectedNFTs.includes(nft.mint)
              const isCurrentlyBurning = isBurning(nft.mint)
              const isCurrentlyBurned = isBurned(nft.mint)
              
              return (
                <div
                  key={nft.mint}
                  className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                    isSelected ? "ring-4 ring-[#00ff00]" : "ring-2 ring-[#00ff00]"
                  } ${isCurrentlyBurned ? 'opacity-50' : ''}`}
                  onClick={() => !isCurrentlyBurned && !isCurrentlyBurning && handleSelectNFT(nft.mint)}
                >
                  {/* NFT Image */}
                  <div className="aspect-square bg-gray-900 relative">
                    <img
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Burning Overlay */}
                    {isCurrentlyBurning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <Loader2 className="h-12 w-12 animate-spin text-[#00ff00]" />
                      </div>
                    )}

                    {/* Burned Overlay */}
                    {isCurrentlyBurned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                        <div className="text-white font-bold text-center">
                          <Trash2 className="h-12 w-12 mx-auto mb-2" />
                          <div>BURNED</div>
                        </div>
                      </div>
                    )}

                    {/* Recycle Icon Overlay for non-burned NFTs */}
                    {!isCurrentlyBurned && !isCurrentlyBurning && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-[#00ff00] rounded-full p-4">
                          <Recycle className="h-12 w-12 text-black" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Checkbox at bottom */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <div
                      className={`h-6 w-6 rounded-full border-4 flex items-center justify-center ${
                        isSelected ? "bg-white border-white" : "bg-black border-white"
                      }`}
                    >
                      {isSelected && <div className="h-3 w-3 rounded-full bg-black" />}
                    </div>
                  </div>

                  {/* NFT Name */}
                  <div className="absolute top-2 left-2 right-2">
                    <div className="bg-black bg-opacity-50 rounded px-2 py-1">
                      <p className="text-white text-xs font-medium truncate">{nft.name}</p>
                    </div>
                  </div>
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