import { Button } from "@/components/ui/button"
import { Clock, Gift, Globe } from "lucide-react"
import Image from "next/image"

export function WhyRecycleBanner() {
  return (
    <div className="space-y-16">
      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 w-full min-h-[274px] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-0 p-6 shadow-2xl shadow-black/50 overflow-hidden rounded-2xl">
        <Image
          src="/banner_first_recycler_recycle_minds.jpg"
          alt="Futuristic recycling machine"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center"><h1 className="text-4xl font-bold text-white text-center">Welcome to the World's First Digital Recycler</h1></div>
      </div>
    </div>
  )
}
