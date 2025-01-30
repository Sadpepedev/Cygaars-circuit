import { createPublicClient, http, parseUnits, formatUnits } from 'viem';
import { abstractChain } from './chains';
import { CYGAAR_TOKEN_ADDRESS, RECEIVING_WALLET } from './web3Config';

const publicClient = createPublicClient({
  chain: abstractChain,
  transport: http(),
});

const ERC20_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export const calculateGameFee = async (): Promise<number> => {
  try {
    const balance = await publicClient.readContract({
      address: CYGAAR_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [RECEIVING_WALLET]
    });

    const balanceNumber = Number(formatUnits(balance, 18));
    return 10; // Fixed fee for now
  } catch (error) {
    console.error('Error calculating fee:', error);
    return 10; // Default to base fee on error
  }
};

export const processGamePayment = async (
  walletClient: any,
  fee: number,
  onSuccess: () => void,
  onError: (error: string) => void
) => {
  try {
    const feeInWei = parseUnits(fee.toString(), 18);
    
    const hash = await walletClient.writeContract({
      address: CYGAAR_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [RECEIVING_WALLET, feeInWei],
      chain: abstractChain,
    });

    await publicClient.waitForTransactionReceipt({ hash });
    onSuccess();
  } catch (error: any) {
    console.error('Payment error:', error);
    onError(error?.shortMessage || 'Transaction failed. Please try again.');
  }
};