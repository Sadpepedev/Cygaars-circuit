import React from 'react';
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useAccount } from 'wagmi';
import { Wallet } from 'lucide-react';

export function WalletButton() {
  const { login } = useLoginWithAbstract();
  const { address, isConnected } = useAccount();

  if (isConnected && address) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-colors"
      >
        <Wallet className="w-4 h-4" />
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
    >
      <Wallet className="w-4 h-4" />
      Connect with AGW
    </button>
  );
}