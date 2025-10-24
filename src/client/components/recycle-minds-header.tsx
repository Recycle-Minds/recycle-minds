import { Button } from "@/components/ui/button"
import { WalletButton } from "@/components/wallet-button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function RecycleMindsHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#292929] bg-[#1f1f1f] backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <a href="https://app.recycleminds.xyz" className="flex w-32 md:w-40 items-center justify-center hover:opacity-80 transition-opacity">
            <img src="/recycle_minds_logo.png" alt="RecycleMinds" className="h-full w-full object-contain" />
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 lg:gap-6 text-sm lg:flex">
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

        <div className="flex items-center gap-2 md:gap-3">
          <WalletButton />
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#292929] bg-[#1f1f1f] backdrop-blur-sm">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            <a 
              href="https://recycleminds.xyz/" 
              className="block py-2 text-sm hover:text-[#00ff00] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="https://recycleminds.xyz/headcoin/" 
              className="block py-2 text-sm hover:text-[#00ff00] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              $HEAD
            </a>
            <a 
              href="https://recycleminds.xyz/mindsbr/" 
              className="block py-2 text-sm hover:text-[#00ff00] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              NFT Collections
            </a>
            <a 
              href="https://app.recycleminds.xyz/" 
              className="block py-2 text-sm text-[#00ff00] hover:text-[#00ff00] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Digital Recycler
            </a>
            <a 
              href="https://recycleminds.xyz/defi/" 
              className="block py-2 text-sm hover:text-[#00ff00] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              DeFi
            </a>
            <a 
              href="https://recycleminds.xyz/loja/" 
              className="block py-2 text-sm hover:text-[#00ff00] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rewards Store
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
