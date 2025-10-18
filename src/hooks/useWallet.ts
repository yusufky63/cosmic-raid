"use client";

import { useEffect, useState, useCallback } from "react";
import {
  createConfig,
  http,
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";
import { base } from "wagmi/chains";
import { useFarcaster } from "./useFarcaster";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

// Wagmi configuration for Base network
export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    // Farcaster Mini App connector (auto-selects the user's wallet in host)
    miniAppConnector(),
  ],
});

export const useWallet = () => {
  const { isInMiniApp } = useFarcaster();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-connect if in Farcaster Mini App
  useEffect(() => {
    if (isInMiniApp && !isConnected && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [isInMiniApp, isConnected, connectors, connect]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Use first available connector (Mini App connector is injected by host)
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      } else {
        throw new Error("No wallet connectors available");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [connectors, connect, isConnecting]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect();
    setError(null);
  }, [disconnect]);

  // Get formatted address
  const formattedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : undefined;

  return {
    address,
    formattedAddress,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  };
};
