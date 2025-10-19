import { useWriteContract, useReadContract } from 'wagmi';
// Note: Ensure wagmi config is properly set up in your project
// import { config } from '@/lib/wagmi';
import { useState, useCallback } from 'react';
import { CosmosRaidGameData, PlayerStats } from '@/types/blockchain';

// Contract ABI - Cosmos Raid functions
const CONTRACT_ABI = [
  {
    "inputs": [
      {"name": "player", "type": "address"},
      {"name": "score", "type": "uint256"},
      {"name": "level", "type": "uint256"},
      {"name": "time", "type": "uint256"},
      {"name": "enemiesKilled", "type": "uint256"},
      {"name": "bossesDefeated", "type": "uint256"},
      {"name": "deadline", "type": "uint256"},
      {"name": "v", "type": "uint8"},
      {"name": "r", "type": "bytes32"},
      {"name": "s", "type": "bytes32"}
    ],
    "name": "submitScoreWithSig",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeAmount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "player", "type": "address"}],
    "name": "getPlayerScore",
    "outputs": [
      {"name": "bestScore", "type": "uint256"},
      {"name": "bestLevel", "type": "uint256"},
      {"name": "bestTime", "type": "uint256"},
      {"name": "enemiesKilled", "type": "uint256"},
      {"name": "bossesDefeated", "type": "uint256"},
      {"name": "exists", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xYourContractAddress') as `0x${string}`;

export function useCosmosRaidContract() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const [retryCount, setRetryCount] = useState(0);

  // Get signature from backend
  const getSignature = async (gameData: CosmosRaidGameData) => {
    const response = await fetch('/api/game/get-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get signature');
    }

    const data = await response.json();
    return data.data;
  };

  const submitScore = async (
    gameData: CosmosRaidGameData
  ) => {
    try {
      console.log('Getting signature for game data:', gameData);
      
      // Get signature from backend
      const signatureData = await getSignature(gameData);
      
      console.log('Received signature data:', signatureData);

      // Validate signature
      if (!signatureData.signature || 
          signatureData.signature.v === undefined || 
          !signatureData.signature.r || 
          !signatureData.signature.s) {
        throw new Error('Invalid signature data received from backend');
      }

      // Get current fee amount
      const feeAmount = await getCurrentFee();
      
      console.log('Submitting to contract:', {
        address: CONTRACT_ADDRESS,
        player: gameData.playerAddress,
        gameData,
        signature: signatureData.signature,
        feeAmount
      });
      
      // Retry mechanism for RPC errors
      const maxRetries = 3;
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Transaction attempt ${attempt}/${maxRetries}`);
          setRetryCount(attempt);
          
          // Submit transaction and wait for confirmation
          const hash = await writeContractAsync({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'submitScoreWithSig',
            args: [
              gameData.playerAddress as `0x${string}`,
              BigInt(signatureData.score),
              BigInt(signatureData.level),
              BigInt(signatureData.time),
              BigInt(signatureData.enemiesKilled),
              BigInt(signatureData.bossesDefeated),
              BigInt(signatureData.signature.deadline),
              signatureData.signature.v,
              signatureData.signature.r as `0x${string}`,
              signatureData.signature.s as `0x${string}`
            ]
            // No fee for Cosmos Raid - FREE TO PLAY!
          });

          console.log('Waiting for transaction confirmation:', hash);
          
          if (!hash || typeof hash !== 'string' || !hash.startsWith('0x')) {
            throw new Error(`Invalid transaction hash: ${String(hash)}`);
          }

          // Return the hash immediately - the UI can show success
          // Transaction will be confirmed in the background
          return { hash };
          
        } catch (error) {
          lastError = error as Error;
          console.error(`Transaction attempt ${attempt} failed:`, error);
          
          // Check if it's a retryable error
          const isRetryableError = error instanceof Error && (
            error.message.includes('RPC') ||
            error.message.includes('network') ||
            error.message.includes('timeout') ||
            error.message.includes('connection') ||
            error.message.includes('ECONNRESET') ||
            error.message.includes('ETIMEDOUT')
          );
          
          if (!isRetryableError || attempt === maxRetries) {
            throw error;
          }
          
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      throw lastError || new Error('Transaction failed after all retries');
      
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  };

  const getCurrentFee = async (): Promise<string> => {
    try {
      // Try to get fee from API first
      const response = await fetch('/api/game/fee');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.feeAmount) {
          return data.data.feeAmount;
        }
      }
    } catch (error) {
      console.warn('Failed to get fee from API, using default:', error);
    }
    
    // Cosmos Raid is FREE TO PLAY!
    return '0'; // NO FEE!
  };

  return {
    submitScore,
    isPending,
    error,
    contractAddress: CONTRACT_ADDRESS,
    retryCount,
    getCurrentFee
  };
}

export function usePlayerScore(address: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getPlayerScore',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address
    }
  });

  // Convert BigInt values to numbers for easier use
  const playerScore: PlayerStats | undefined = data ? {
    bestScore: Number(data[0]),
    bestLevel: Number(data[1]),
    bestTime: Number(data[2]),
    enemiesKilled: Number(data[3]),
    bossesDefeated: Number(data[4]),
    exists: data[5]
  } : undefined;

  return {
    playerScore,
    isLoading,
    error
  };
}

export function useLeaderboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [entries, setEntries] = useState<Array<{
    address: string;
    score: number;
    level: number;
    time: number;
  }>>([]);

  const fetchLeaderboard = useCallback(async (limit: number = 10) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const response = await fetch(`/api/game/leaderboard?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.data.leaderboard);
      } else {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array - fetchLeaderboard is now stable

  return {
    entries,
    isLoading,
    error,
    fetchLeaderboard
  };
}
