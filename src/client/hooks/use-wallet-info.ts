"use client"

import { useWallet } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'

export function useWalletInfo() {
  const { connected, publicKey, wallet, connecting, disconnecting } = useWallet()

  const walletInfo = useMemo(() => {
    if (!connected || !publicKey) {
      return {
        isConnected: false,
        publicKey: null,
        address: null,
        walletName: null,
        shortAddress: null,
      }
    }

    return {
      isConnected: true,
      publicKey,
      address: publicKey.toString(),
      walletName: wallet?.adapter.name || 'Unknown',
      shortAddress: `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`,
    }
  }, [connected, publicKey, wallet])

  return {
    ...walletInfo,
    connecting,
    disconnecting,
  }
}
