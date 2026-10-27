/**
 * Official Dealoura Escrow Crypto Custody Configuration
 * 
 * Supports stablecoins (USDT & USDC) on low-fee, high-speed networks.
 * You can override these addresses via environment variables in .env.local:
 * - NEXT_PUBLIC_ESCROW_USDT_TRC20_ADDRESS
 * - NEXT_PUBLIC_ESCROW_USDC_POLYGON_ADDRESS
 * - NEXT_PUBLIC_ESCROW_USDT_ERC20_ADDRESS
 */

export interface CryptoNetworkConfig {
  id: string
  name: string
  token: 'USDT' | 'USDC'
  network: string
  symbol: string
  address: string
  explorerUrl: string
  confirmationsNeeded: number
  feeEstimate: string
  badgeColor: string
}

export const ESCROW_CRYPTO_NETWORKS: Record<string, CryptoNetworkConfig> = {
  usdt_trc20: {
    id: 'usdt_trc20',
    name: 'USDT (TRON / TRC-20)',
    token: 'USDT',
    network: 'TRON (TRC-20)',
    symbol: 'USDT-TRC20',
    address: process.env.NEXT_PUBLIC_ESCROW_USDT_TRC20_ADDRESS || 'TWd4Gk7K8H3m9Z7Z4QzY9nF8X2mP9A1B2C',
    explorerUrl: 'https://tronscan.org/#/transaction/',
    confirmationsNeeded: 19,
    feeEstimate: '~ $1.00 Network Fee',
    badgeColor: 'bg-emerald-500'
  },
  usdc_polygon: {
    id: 'usdc_polygon',
    name: 'USDC (Polygon PoS)',
    token: 'USDC',
    network: 'Polygon',
    symbol: 'USDC-POLYGON',
    address: process.env.NEXT_PUBLIC_ESCROW_USDC_POLYGON_ADDRESS || '0x71C0a5fF78C266858292850935A1c85639B07C64',
    explorerUrl: 'https://polygonscan.com/tx/',
    confirmationsNeeded: 32,
    feeEstimate: '~ $0.05 Network Fee',
    badgeColor: 'bg-purple-500'
  },
  usdt_erc20: {
    id: 'usdt_erc20',
    name: 'USDT (Ethereum / ERC-20)',
    token: 'USDT',
    network: 'Ethereum Mainnet',
    symbol: 'USDT-ERC20',
    address: process.env.NEXT_PUBLIC_ESCROW_USDT_ERC20_ADDRESS || '0x71C0a5fF78C266858292850935A1c85639B07C64',
    explorerUrl: 'https://etherscan.io/tx/',
    confirmationsNeeded: 12,
    feeEstimate: '~ $3.50 Network Gas',
    badgeColor: 'bg-blue-500'
  }
}
