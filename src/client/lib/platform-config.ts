import { PublicKey } from '@solana/web3.js'

// Fee distribution configuration
export interface FeeRecipient {
  address: PublicKey
  percentage: number
  name: string
}

// Platform fee configuration from environment variables
export const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE || '4.5')
export const PLATFORM_FEE_ACCOUNT = new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_FEE_ACCOUNT || 'F8hnUSr5xGUGK7wYbmYQX8QCKPFajwU6QxqVw9cLV7S1')

// Member fee configuration
export const MEMBER_FEE_PERCENTAGE = parseFloat(process.env.NEXT_PUBLIC_PLATFORM_FEE_MEMBER_PERCENTAGE || '2.5')
export const MEMBER_FEE_ACCOUNTS = [
  new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_FEE_ACCOUNT_MEMBER1 || 'v1t1nCTfxttsTFW3t7zTQFUsdpznu8kggzYSg7SDJMs'),
  new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_FEE_ACCOUUNT_MEMBER2 || 'AVeoYy96tykMVd46XkG4ZYrbE1xnMYdpEe8bFUXK5VT7'),
  new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_FEE_ACCOUNT_MEMBER3 || '9xJTPr5vybPEnw1WWNu4dGRfFpvQBvP71n6Qj4DU9tk7')
]

// Get all fee recipients
export function getFeeRecipients(): FeeRecipient[] {
  const recipients: FeeRecipient[] = [
    {
      address: PLATFORM_FEE_ACCOUNT,
      percentage: PLATFORM_FEE_PERCENTAGE,
      name: 'Platform'
    }
  ]

  // Add member accounts
  MEMBER_FEE_ACCOUNTS.forEach((account, index) => {
    recipients.push({
      address: account,
      percentage: MEMBER_FEE_PERCENTAGE,
      name: `Member ${index + 1}`
    })
  })

  return recipients
}

// Calculate total fee percentage
export function getTotalFeePercentage(): number {
  return PLATFORM_FEE_PERCENTAGE + (MEMBER_FEE_PERCENTAGE * MEMBER_FEE_ACCOUNTS.length)
}

// Calculate individual fee amounts for each recipient
export function calculateFeeDistribution(solAmount: number): { recipient: FeeRecipient; amount: number }[] {
  const recipients = getFeeRecipients()
  
  return recipients.map(recipient => ({
    recipient,
    amount: (solAmount * recipient.percentage) / 100
  }))
}

// Legacy function for backward compatibility
export function calculatePlatformFee(solAmount: number): number {
  return (solAmount * getTotalFeePercentage()) / 100
}

// Calculate net amount after platform fee
export function calculateNetAmount(solAmount: number): number {
  return solAmount - calculatePlatformFee(solAmount)
}

// Debug function to log fee configuration
export function logFeeConfiguration(): void {
  console.log('=== Fee Distribution Configuration ===')
  console.log('Platform Fee:', PLATFORM_FEE_PERCENTAGE + '%')
  console.log('Member Fee (per member):', MEMBER_FEE_PERCENTAGE + '%')
  console.log('Total Fee Percentage:', getTotalFeePercentage() + '%')
  console.log('')
  
  const recipients = getFeeRecipients()
  console.log('Fee Recipients:')
  recipients.forEach((recipient, index) => {
    console.log(`${index + 1}. ${recipient.name}: ${recipient.percentage}% -> ${recipient.address.toString()}`)
  })
  console.log('')
  
  // Test with 0.1 SOL
  const testAmount = 0.1
  const distribution = calculateFeeDistribution(testAmount)
  console.log(`Fee Distribution for ${testAmount} SOL:`)
  let totalFees = 0
  distribution.forEach(({ recipient, amount }) => {
    console.log(`  ${recipient.name}: ${amount.toFixed(6)} SOL`)
    totalFees += amount
  })
  console.log(`  Total Fees: ${totalFees.toFixed(6)} SOL`)
  console.log(`  Net Amount: ${(testAmount - totalFees).toFixed(6)} SOL`)
  console.log('=====================================')
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
