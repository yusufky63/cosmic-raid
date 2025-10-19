import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const rpcUrl = process.env.BASE_RPC_URL || 'https://base-mainnet.g.alchemy.com/v2/demo';

    console.log('🏆 Cosmos Raid Leaderboard API Called');
    console.log('🏆 Contract Address:', contractAddress);
    console.log('🏆 RPC URL:', rpcUrl);
    console.log('🏆 Limit:', limit);

    if (!contractAddress || contractAddress === '') {
      console.log('🚨 Contract address not configured, returning mock data');
      
      // Return mock data for development
      return NextResponse.json({
        success: true,
        data: {
          leaderboard: [
            {
              rank: 1,
              address: '0x1234567890123456789012345678901234567890',
              score: '125000',
              level: '15',
              time: '450',
            },
            {
              rank: 2,
              address: '0x9876543210987654321098765432109876543210',
              score: '98000',
              level: '12',
              time: '380',
            },
            {
              rank: 3,
              address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
              score: '75000',
              level: '10',
              time: '320',
            }
          ],
          total: 3,
          limit: limit
        }
      });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const contractABI = [
      "function getLeaderboard(uint256 limit) view returns (address[] memory, uint256[] memory, uint256[] memory, uint256[] memory)"
    ];
    
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    const [addresses, scores, levels, times] = await contract.getLeaderboard(limit);

    const leaderboard = addresses.map((address: string, index: number) => ({
      rank: index + 1,
      address: address,
      score: scores[index].toString(),
      level: levels[index].toString(),
      time: times[index].toString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: leaderboard,
        total: leaderboard.length,
        limit: limit
      }
    });

  } catch (error) {
    console.error('Error getting Cosmos Raid leaderboard:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get leaderboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
