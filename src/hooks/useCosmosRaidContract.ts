import { useWriteContract, useReadContract } from 'wagmi';
// Removed waitForTransactionReceipt import - not needed for immediate feedback
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
      {"name": "deadline", "type": "uint256"},
      {"name": "v", "type": "uint8"},
      {"name": "r", "type": "bytes32"},
      {"name": "s", "type": "bytes32"}
    ],
    "name": "submitScoreWithSig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "player", "type": "address"}],
    "name": "getPlayerScore",
    "outputs": [
      {"name": "bestScore", "type": "uint256"},
      {"name": "bestLevel", "type": "uint256"},
      {"name": "bestTime", "type": "uint256"},
      {"name": "exists", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "limit", "type": "uint256"}],
    "name": "getLeaderboard",
    "outputs": [
      {"name": "", "type": "address[]"},
      {"name": "", "type": "uint256[]"},
      {"name": "", "type": "uint256[]"},
      {"name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

// Debug: Log contract address
console.log('🚀 Cosmos Raid Contract Address:', CONTRACT_ADDRESS);

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
      console.error('Backend validation error:', errorData);
      const errorMsg = errorData.details 
        ? `${errorData.error}: ${errorData.details.join(', ')}`
        : errorData.error || 'Failed to get signature';
      throw new Error(errorMsg);
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
      
      console.log('Submitting to contract:', {
        address: CONTRACT_ADDRESS,
        player: gameData.playerAddress,
        gameData,
        signature: signatureData.signature
      });
      
      // Retry mechanism for RPC errors
      const maxRetries = 3;
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Transaction attempt ${attempt}/${maxRetries}`);
          setRetryCount(attempt);
          
          // Get current fee amount (could be 0)
          const feeAmount = await getCurrentFee();
          
          // Submit transaction and wait for confirmation
          const args = [
            gameData.playerAddress as `0x${string}`,
            BigInt(signatureData.score),
            BigInt(signatureData.level),
            BigInt(signatureData.time),
            BigInt(signatureData.signature.deadline),
            signatureData.signature.v,
            signatureData.signature.r as `0x${string}`,
            signatureData.signature.s as `0x${string}`
          ] as const;
          
          let hash;
          if (feeAmount !== '0') {
            hash = await writeContractAsync({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: CONTRACT_ABI,
              functionName: 'submitScoreWithSig',
              args,
              value: BigInt(feeAmount)
            } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
          } else {
            hash = await writeContractAsync({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: CONTRACT_ABI,
              functionName: 'submitScoreWithSig',
              args
            });
          }

          console.log('Waiting for transaction confirmation:', hash);
          
          if (!hash || typeof hash !== 'string' || !hash.startsWith('0x')) {
            throw new Error(`Invalid transaction hash: ${String(hash)}`);
          }

          // Wait for transaction confirmation using the hash directly
          console.log('Transaction hash received, waiting for confirmation...');
          
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

  // Get current fee from API
  const getCurrentFee = async (): Promise<string> => {
    try {
      const response = await fetch('/api/game/fee');
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        // Return fee in Wei (even if it's "0")
        return data.data.feeAmountWei || '0';
      } else {
        throw new Error(data.error || 'Failed to fetch fee amount');
      }
    } catch (err) {
      console.error('Error fetching current fee:', err);
      return '0'; // Default to 0 Wei if fetch fails
    }
  };

  return {
    submitScore,
    getCurrentFee,
    isPending,
    error,
    contractAddress: CONTRACT_ADDRESS,
    retryCount
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
    enemiesKilled: 0, // Not tracked in Cosmos Raid contract
    bossesDefeated: 0, // Not tracked in Cosmos Raid contract
    exists: data[3]
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
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.data.leaderboard);
      } else {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Leaderboard fetch error:', errorMessage);
      setError(errorMessage);
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
