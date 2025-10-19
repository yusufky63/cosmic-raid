import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import Joi from 'joi';

// Cosmos Raid game validation schema
const gameDataSchema = Joi.object({
  score: Joi.number().integer().min(0).max(10000000).required(),
  level: Joi.number().integer().min(1).max(50).required(),
  time: Joi.number().integer().min(0).required(), // No time limit - infinity gaming!
  lives: Joi.number().integer().min(0).max(5).required(),
  playerAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
});

// Game data interface
interface CosmosRaidGameData {
  score: number;
  level: number;
  time: number;
  lives: number;
  playerAddress: string;
}

// Game validation service
class CosmosRaidValidationService {
  private gameDataSchema = gameDataSchema;

  validateGameData(gameData: unknown): {
    isValid: boolean;
    errors: string[];
    type: string;
    data?: CosmosRaidGameData;
  } {
    const { error, value } = this.gameDataSchema.validate(gameData);
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message),
        type: 'schema_validation'
      };
    }

    const validation = this.validateGameLogic(value);
    return {
      isValid: validation.isValid,
      data: validation.isValid ? value : undefined,
      errors: validation.errors,
      type: validation.type
    };
  }

  private validateGameLogic(data: CosmosRaidGameData): {
    isValid: boolean;
    errors: string[];
    type: string;
  } {
    const { score, level, time } = data;

    // Basic score validation
    if (!this.isScoreReasonable(score, level)) {
      return {
        isValid: false,
        errors: ['Score not reasonable for given level'],
        type: 'logic_validation'
      };
    }

    // Time validation
    if (!this.isTimeReasonable(time, level)) {
      return {
        isValid: false,
        errors: ['Time not reasonable for given level'],
        type: 'logic_validation'
      };
    }

    // Basic level validation  
    if (level > 50) {
      return {
        isValid: false,
        errors: ['Maximum level exceeded'],
        type: 'game_validation'
      };
    }

    return { isValid: true, errors: [], type: 'success' };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private isScoreReasonable(score: number, _level: number): boolean {
    // Basic bounds check
    if (score < 0 || score > 10000000) return false;
    
    // Very generous validation for infinity gaming!
    // Allow any score as long as it's positive and under 10M
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private isTimeReasonable(time: number, _level: number): boolean {
    // Very generous for infinity gaming - just check it's positive
    return time >= 0;
  }

}

// Contract service
class CosmosRaidContractService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    const rpcUrl = process.env.BASE_RPC_URL || 'https://base-mainnet.g.alchemy.com/v2/0Zc6p8Szd1xVg1TW7LX_1';
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const privateKey = process.env.BACKEND_PRIVATE_KEY;

    if (!contractAddress || !privateKey) {
      throw new Error('Missing required environment variables');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    const contractABI = [
      "function nonces(address owner) view returns (uint256)",
      "function DOMAIN_SEPARATOR() view returns (bytes32)"
    ];
    
    this.contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
  }

  async generateSignature(gameData: CosmosRaidGameData): Promise<{
    signature: {
      v: number;
      r: string;
      s: string;
      deadline: number;
      nonce: string;
    };
    score: number;
    level: number;
    time: number;
  }> {
    const { playerAddress, score, level, time } = gameData;
    
    const nonce = await this.contract.nonces(playerAddress);
    const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minute deadline
    const network = await this.provider.getNetwork();
    const chainId = Number(network.chainId);
    
    const domain = {
      name: 'CosmosRaid',
      version: '1',
      chainId: chainId,
      verifyingContract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    };

    const types = {
      Score: [
        { name: 'player', type: 'address' },
        { name: 'score', type: 'uint256' },
        { name: 'level', type: 'uint256' },
        { name: 'time', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    };

    const value = {
      player: playerAddress,
      score: score,
      level: level,
      time: time,
      nonce: nonce,
      deadline: deadline
    };

    const signature = await this.wallet.signTypedData(domain, types, value);
    const sig = ethers.Signature.from(signature);

    return {
      signature: {
        v: sig.v,
        r: sig.r,
        s: sig.s,
        deadline: deadline,
        nonce: nonce.toString()
      },
      score: score,
      level: level,
      time: time,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const gameData = await request.json();
    
    const validationService = new CosmosRaidValidationService();
    const validation = validationService.validateGameData(gameData);

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid game data',
        details: validation.errors,
        type: validation.type
      }, { status: 400 });
    }

    const contractService = new CosmosRaidContractService();
    const signatureResult = await contractService.generateSignature(validation.data!);

    return NextResponse.json({
      success: true,
      message: 'Signature generated successfully',
      data: signatureResult
    });

  } catch (error) {
    console.error('Error generating signature:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
