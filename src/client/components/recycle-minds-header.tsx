import { Button } from "@/components/ui/button"
import { WalletButton } from "@/components/wallet-button"
import { Globe } from "lucide-react"

export function RecycleMindsHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#292929] bg-[#0a0a0a] backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <a href="https://app.recycleminds.xyz" className="flex w-40 items-center justify-center hover:opacity-80 transition-opacity">
            <img src="/recycle_minds_logo.png" alt="RecycleMinds" className="h-full w-full object-contain" />
          </a>
        </div>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="https://recycleminds.xyz/" className="hover:text-[#00ff00] transition-colors">
            Home
          </a>
          <a href="https://recycleminds.xyz/headcoin/" className="hover:text-[#00ff00] transition-colors">
            $HEAD
          </a>
          <a href="https://recycleminds.xyz/mindsbr/" className="hover:text-[#00ff00] transition-colors">
            NFT Collections
          </a>
          <a href="https://app.recycleminds.xyz/" className="text-[#00ff00] hover:text-[#00ff00] transition-colors">
            Digital Recycler
          </a>
          <a href="https://recycleminds.xyz/defi/" className="hover:text-[#00ff00] transition-colors">
            DeFi
          </a>
          <a href="https://recycleminds.xyz/loja/" className="hover:text-[#00ff00] transition-colors">
            Rewards Store
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <WalletButton />
        </div>
      </div>
    </header>
  )
}
