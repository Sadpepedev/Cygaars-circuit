import React, { useState, useEffect } from 'react';
import { useAbstractClient } from "@abstract-foundation/agw-react";
import { useGameStore } from '../store/gameStore';
import { calculateGameFee } from '../lib/gamePayment';
import { Loader2 } from 'lucide-react';
import { CYGAAR_TOKEN_ADDRESS, RECEIVING_WALLET } from '../lib/web3Config';
import { parseUnits } from 'viem';

const ERC20_ABI = [
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

export const PaymentModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [fee, setFee] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: client } = useAbstractClient();
  
  useEffect(() => {
    const fetchFee = async () => {
      const calculatedFee = await calculateGameFee();
      setFee(calculatedFee);
    };
    
    fetchFee();
  }, []);

  const handlePayment = async () => {
    if (!client) return;
    
    setError(null);
    setIsProcessing(true);
    
    try {
      const hash = await client.writeContract({
        address: CYGAAR_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [RECEIVING_WALLET, parseUnits(fee.toString(), 18)],
      });

      const receipt = await client.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'success') {
        onSuccess();
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error?.shortMessage || 'Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Ready to Play?</h2>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-blue-800 font-medium">Game Fee:</p>
            <p className="text-2xl font-bold text-blue-600">{fee.toFixed(2)} CYGAAR</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl">
              {error}
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handlePayment}
              disabled={isProcessing || !client}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay & Play'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};