"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Recycle } from "lucide-react"

interface NFT {
  id: number
  image: string
  hasRecycleIcon: boolean
}

export function NFTCollectionGrid() {
  const [selectedNFTs, setSelectedNFTs] = useState<number[]>([])

  // Sample NFT data - using placeholder images with different colors for variety
  const nfts: NFT[] = [
    { id: 1, image: "/panda-astronaut-gray-background.jpg", hasRecycleIcon: true },
    { id: 2, image: "/panda-wizard-orange-background.jpg", hasRecycleIcon: false },
    { id: 3, image: "/panda-astronaut-blue-background.jpg", hasRecycleIcon: false },
    { id: 4, image: "/panda-pirate-dark-background.jpg", hasRecycleIcon: true },
    { id: 5, image: "/panda-warrior-brown-background.jpg", hasRecycleIcon: true },
    { id: 6, image: "/panda-cute-pink-background.jpg", hasRecycleIcon: false },
    { id: 7, image: "/panda-ninja-brown-background.jpg", hasRecycleIcon: true },
    { id: 8, image: "/panda-wizard-blue-background.jpg", hasRecycleIcon: false },
    { id: 9, image: "/panda-rocker-dark-background.jpg", hasRecycleIcon: true },
    { id: 10, image: "/panda-dj-cyan-background.jpg", hasRecycleIcon: false },
    { id: 11, image: "/panda-warrior-red-background.jpg", hasRecycleIcon: true },
    { id: 12, image: "/panda-samurai-green-background.jpg", hasRecycleIcon: true },
  ]

  const toggleNFT = (id: number) => {
    setSelectedNFTs((prev) => (prev.includes(id) ? prev.filter((nftId) => nftId !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedNFTs.length === nfts.length) {
      setSelectedNFTs([])
    } else {
      setSelectedNFTs(nfts.map((nft) => nft.id))
    }
  }

  const selectedPoints = selectedNFTs.length * 10 // Assuming 10 points per NFT

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#00ff00] mb-2">SELECT NFTS TO RECYCLE</h2>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between mb-8 gap-4">
        {/* Select All */}
        <div className="flex items-center gap-3 bg-[#1a1a1a] border border-gray-800 rounded-lg px-6 py-4 min-w-[200px]">
          <Checkbox
            id="select-all"
            checked={selectedNFTs.length === nfts.length}
            onCheckedChange={toggleSelectAll}
            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-black h-5 w-5"
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
        >
          <Recycle className="mr-2 h-6 w-6" />
          RECYCLE
        </Button>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {nfts.map((nft) => {
          const isSelected = selectedNFTs.includes(nft.id)
          return (
            <div
              key={nft.id}
              className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                isSelected ? "ring-4 ring-[#00ff00]" : "ring-2 ring-[#00ff00]"
              }`}
              onClick={() => toggleNFT(nft.id)}
            >
              {/* NFT Image */}
              <div className="aspect-square bg-gray-900 relative">
                <img
                  src={nft.image || "/placeholder.svg"}
                  alt={`NFT ${nft.id}`}
                  className="w-full h-full object-cover"
                />

                {/* Recycle Icon Overlay */}
                {nft.hasRecycleIcon && (
                  <div className="absolute inset-0 flex items-center justify-center">
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
