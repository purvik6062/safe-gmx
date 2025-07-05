/**
 * Standard addresses used across DeFi protocols and DEX aggregators
 */

// Standard address for native ETH across DEX aggregators (0x, 1inch, ParaSwap, etc.)
export const NATIVE_ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// Polygon native MATIC contract address (specific to Polygon network)
export const NATIVE_MATIC_ADDRESS =
  "0x0000000000000000000000000000000000001010";

// Zero address (used for null/empty references)
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Check if an address represents a native token across different networks
 */
export function isNativeTokenAddress(address: string): boolean {
  const normalizedAddress = address.toLowerCase();
  return (
    normalizedAddress === NATIVE_ETH_ADDRESS.toLowerCase() ||
    normalizedAddress === NATIVE_MATIC_ADDRESS.toLowerCase()
  );
}

/**
 * Get the appropriate native token address for a given network
 */
export function getNativeTokenAddress(networkKey: string): string {
  switch (networkKey.toLowerCase()) {
    case "polygon":
      return NATIVE_MATIC_ADDRESS;
    case "ethereum":
    case "sepolia":
    case "arbitrum":
    case "arbitrum_sepolia":
    case "base":
    case "optimism":
    default:
      return NATIVE_ETH_ADDRESS;
  }
}
