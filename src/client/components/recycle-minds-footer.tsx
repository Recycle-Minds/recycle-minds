import { Twitter, Instagram, Youtube, Linkedin, Send } from "lucide-react"

export function RecycleMindsFooter() {
  return (
    <footer className="border-t border-[#292929] bg-black mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center">
              <svg viewBox="0 0 40 40" className="h-full w-full">
                <rect x="15" y="5" width="10" height="10" fill="#00ff00" rx="2" />
                <rect x="5" y="15" width="10" height="10" fill="#00ff00" rx="2" />
                <rect x="25" y="15" width="10" height="10" fill="#00ff00" rx="2" />
                <rect x="15" y="25" width="10" height="10" fill="#00ff00" rx="2" />
              </svg>
            </div>
            <span className="text-2xl font-bold">RecycleMinds</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="text-[#999999] hover:text-white transition-colors">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-[#999999] hover:text-white transition-colors">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-[#999999] hover:text-white transition-colors">
              <Youtube className="h-6 w-6" />
            </a>
            <a href="#" className="text-[#999999] hover:text-white transition-colors">
              <Send className="h-6 w-6" />
            </a>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <a href="#" className="text-[#999999] hover:text-white transition-colors">
              Home
            </a>
            <a href="#" className="text-[#999999] hover:text-white transition-colors">
              $HEAD
            </a>
            <a href="#" className="text-[#999999] hover:text-white transition-colors">
              NFT Collections
            </a>
            <a href="#" className="text-[#00ff00] hover:text-[#00dd00] transition-colors">
              Digital Recycler
            </a>
            <a href="#" className="text-[#999999] hover:text-white transition-colors">
              DeFi
            </a>
            <a href="#" className="text-[#999999] hover:text-white transition-colors">
              Rewards Store
            </a>
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-[#292929] text-center text-sm text-[#666666]">
          Copyright © 2025 Recycle Minds | All Rights Reserved
        </div>
      </div>
    </footer>
  )
}
