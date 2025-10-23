import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { WalletContextProvider } from "@/components/wallet-provider"
import "./globals.css"

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
})

export const metadata: Metadata = {
  title: "RecycleMinds - NFT Recycling Platform",
  description: "Recycle your NFTs and earn rewards while saving the planet",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
        <Analytics />
      </body>
    </html>
  )
}
