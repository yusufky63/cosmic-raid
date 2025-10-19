import {  NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET() {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const rpcUrl = process.env.BASE_RPC_URL || 'https://base-mainnet.g.alchemy.com/v2/0Zc6p8Szd1xVg1TW7LX_1';

    if (!contractAddress) {
      return NextResponse.json({
        success: false,
        error: 'Contract address not configured'
      }, { status: 500 });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const contractABI = [
      "function getStats() view returns (uint256 totalPlayers, uint256 currentFee, address currentFeeRecipient, address currentBackend, uint256 maxPlayersCap)"
    ];
    
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    const [totalPlayers, currentFee, feeRecipient, backend, maxPlayers] = await contract.getStats();
    
    // Get current fee from contract
    const feeAmountWei = currentFee.toString();
    const feeAmount = ethers.formatEther(currentFee);

    return NextResponse.json({
      success: true,
      data: {
        feeAmount, // ETH amount
        feeAmountWei, // Wei amount
        feeRecipient: feeRecipient,
        contractAddress,
        totalPlayers: totalPlayers.toString(),
        maxPlayers: maxPlayers.toString(),
        backend: backend,
        isActive: true,
        isFree: currentFee.toString() === "0"
      }
    });

  } catch (error) {
    console.error('Error getting Cosmos Raid fee info:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get fee information',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
