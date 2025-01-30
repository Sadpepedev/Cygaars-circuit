import { Chain } from 'wagmi';

export const abstractChain: Chain = {
  id: 2741,
  name: 'Abstract Chain',
  network: 'abstract',
  nativeCurrency: {
    decimals: 18,
    name: 'Abstract',
    symbol: 'ABS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.abstract.network'],  // Updated to mainnet RPC
    },
    public: {
      http: ['https://rpc.abstract.network'],  // Updated to mainnet RPC
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.abstract.network',  // Updated to mainnet explorer
    },
  },
  testnet: false,  // Changed to false since we're on mainnet
};