import Image from "next/image"

export function RecycleMindsFooter() {
  return (
    <footer className="border-t border-[#292929] bg-black mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="flex items-center gap-2 md:w-1/3">
            <a href="https://app.recycleminds.xyz" className="flex h-60 w-60 items-center justify-center hover:opacity-80 transition-opacity">
              <img src="/recycle_minds_logo.png" alt="RecycleMinds" className="h-full w-full object-contain" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 md:w-1/3">
            <a href="https://x.com/recycle_minds" className="text-[#999999] hover:text-white transition-colors">
              <Image src="/logo_social_x.png" alt="X" width={24} height={24} className="h-6 w-6" />
            </a>
            <a href="https://www.instagram.com/recycle_minds/" className="text-[#999999] hover:text-white transition-colors">
              <Image src="/logo_social_instagram.png" alt="Instagram" width={24} height={24} className="h-6 w-6" />
            </a>
            <a href="https://www.youtube.com/@RecycleMindsTV" className="text-[#999999] hover:text-white transition-colors">
              <Image src="/logo_social_youtube.png" alt="YouTube" width={24} height={24} className="h-6 w-6" />
            </a>
            <a href="#" className="text-[#999999] hover:text-white transition-colors">
              <Image src="/logo_social_linkedin.png" alt="LinkedIn" width={24} height={24} className="h-6 w-6" />
            </a>
            <a href="https://t.me/head_RecycleMinds" className="text-[#999999] hover:text-white transition-colors">
              <Image src="/logo_social_telegram.png" alt="Telegram" width={24} height={24} className="h-6 w-6" />
            </a>
          </div>

          <nav className="flex flex-col gap-2 text-sm md:w-1/3 md:items-end">
            <a href="https://recycleminds.xyz/" className="text-[#999999] hover:text-white transition-colors">
              Home
            </a>
            <a href="https://recycleminds.xyz/headcoin/ " className="text-[#999999] hover:text-white transition-colors">
              $HEAD
            </a>
            <a href="https://recycleminds.xyz/mindsbr/" className="text-[#999999] hover:text-white transition-colors">
              NFT Collections
            </a>
            <a href="https://app.recycleminds.xyz/" className="text-[#00ff00] hover:text-[#00dd00] transition-colors">
              Digital Recycler
            </a>
            <a href="https://recycleminds.xyz/defi/" className="text-[#999999] hover:text-white transition-colors">
              DeFi
            </a>
            <a href="https://recycleminds.xyz/loja/" className="text-[#999999] hover:text-white transition-colors">
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
