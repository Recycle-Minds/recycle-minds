import { PublicKey } from '@solana/web3.js'

// Platform fee configuration from environment variables
export const PLATFORM_FEE_PERCENTAGE = parseInt(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE || '12') // Platform fee percentage
// TODO: Replace with actual platform fee account address - using a valid system account for now
export const PLATFORM_FEE_ACCOUNT = new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_FEE_ACCOUNT || '') // Platform fee account

// Calculate platform fee from SOL amount
export function calculatePlatformFee(solAmount: number): number {
  return (solAmount * PLATFORM_FEE_PERCENTAGE) / 100
}

// Calculate net amount after platform fee
export function calculateNetAmount(solAmount: number): number {
  return solAmount - calculatePlatformFee(solAmount)
}

// Calculate the fee amount that should be transferred to platform
// This ensures the user gets exactly (100 - fee%) of the rent recovery
export function calculatePlatformFeeTransfer(rentRecovery: number): number {
  // If rent recovery is X, user should get X * (1 - fee%)
  // So platform fee = X - (X * (1 - fee%)) = X * fee%
  return rentRecovery * (PLATFORM_FEE_PERCENTAGE / 100)
}

// Convert SOL to lamports
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1_000_000_000)
}

// Convert lamports to SOL
export function lamportsToSol(lamports: number): number {
  return lamports / 1_000_000_000
}
