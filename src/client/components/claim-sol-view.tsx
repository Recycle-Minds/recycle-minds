"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Layers3 } from "lucide-react"

const nftCollections = [
  { id: 1, name: "Collection Name", network: "Solana", ownedNFTs: 50 },
  { id: 2, name: "Collection Name", network: "Solana", ownedNFTs: 2 },
  { id: 3, name: "Collection Name", network: "Solana", ownedNFTs: 12 },
  { id: 4, name: "Collection Name", network: "Solana", ownedNFTs: 6 },
]

const tokenCollections = [
  { id: 1, name: "Token Name", network: "Solana", amount: "1,234.56" },
  { id: 2, name: "Token Name", network: "Solana", amount: "789.12" },
  { id: 3, name: "Token Name", network: "Solana", amount: "456.78" },
]

export function ClaimSolView() {
  const [activeSubTab, setActiveSubTab] = useState<"nfts" | "tokens">("nfts")

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-[#00ff00]">CLAIM YOUR SOL</h2>

      {/* Sub-tabs */}
      <div className="flex gap-0 mb-8">
        <Button
          className={
            activeSubTab === "nfts"
              ? "flex-1 bg-[#00ff00] text-black hover:bg-[#00dd00] rounded-r-none h-14 text-lg font-semibold"
              : "flex-1 bg-transparent border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10 rounded-r-none h-14 text-lg font-semibold"
          }
          onClick={() => setActiveSubTab("nfts")}
        >
          NFTs
        </Button>
        <Button
          className={
            activeSubTab === "tokens"
              ? "flex-1 bg-[#00ff00] text-black hover:bg-[#00dd00] rounded-l-none h-14 text-lg font-semibold"
              : "flex-1 bg-transparent border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10 rounded-l-none h-14 text-lg font-semibold"
          }
          onClick={() => setActiveSubTab("tokens")}
        >
          Tokens
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-4 px-4 text-[#00ff00] font-semibold">Collection</th>
              <th className="text-left py-4 px-4 text-[#00ff00] font-semibold">Network</th>
              <th className="text-left py-4 px-4 text-[#00ff00] font-semibold">
                {activeSubTab === "nfts" ? "Owned NFTs" : "Amount"}
              </th>
              <th className="text-left py-4 px-4 text-[#00ff00] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeSubTab === "nfts"
              ? nftCollections.map((collection) => (
                  <tr key={collection.id} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white" />
                        <span>{collection.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Layers3 className="w-5 h-5 text-purple-400" />
                        <span>{collection.network}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">{collection.ownedNFTs}</td>
                    <td className="py-4 px-4">
                      <Button
                        variant="outline"
                        className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black bg-transparent"
                      >
                        Claim
                      </Button>
                    </td>
                  </tr>
                ))
              : tokenCollections.map((token) => (
                  <tr key={token.id} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white" />
                        <span>{token.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Layers3 className="w-5 h-5 text-purple-400" />
                        <span>{token.network}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">{token.amount}</td>
                    <td className="py-4 px-4">
                      <Button
                        variant="outline"
                        className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black bg-transparent"
                      >
                        Claim
                      </Button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
