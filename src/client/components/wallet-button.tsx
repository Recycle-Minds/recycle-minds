"use client"

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut } from 'lucide-react'

export function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet()

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={disconnect}
          variant="outline"
          className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {`${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`}
        </Button>
      </div>
    )
  }

  return (
    <WalletMultiButton className="!bg-[#00ff00] !text-black hover:!bg-[#00dd00] !font-medium !rounded-md">
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </WalletMultiButton>
  )
}
