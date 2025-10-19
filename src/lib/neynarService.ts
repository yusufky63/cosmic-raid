export interface FarcasterProfile {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  verifications: string[];
  activeStatus: string;
}

// Cache interface
interface CachedProfile {
  profile: FarcasterProfile | null;
  timestamp: number;
}

// In-memory cache for profiles
const profileCache = new Map<string, CachedProfile>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

// Helper function to check if cache is valid
function isCacheValid(cachedItem: CachedProfile | undefined): boolean {
  if (!cachedItem) return false;
  return (Date.now() - cachedItem.timestamp) < CACHE_DURATION;
}

// Helper function to get from cache
function getFromCache(key: string): FarcasterProfile | null | undefined {
  const cached = profileCache.get(key);
  if (cached && isCacheValid(cached)) {
    return cached.profile;
  }
  if (cached) {
    profileCache.delete(key);
  }
  return undefined;
}

// Helper function to set cache
function setCache(key: string, profile: FarcasterProfile | null): void {
  profileCache.set(key, {
    profile,
    timestamp: Date.now()
  });
}

/**
 * Get Farcaster profile by wallet address via backend API
 * @param address - Wallet address (0x...)
 * @returns Farcaster profile or null if not found
 */
export async function getFarcasterProfileByAddress(address: string): Promise<FarcasterProfile | null> {
  // Check cache first
  const cached = getFromCache(address);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await fetch(`/api/game/farcaster-profile/${address}`);
    
    let profile: FarcasterProfile | null = null;
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        profile = data.data;
      }
    }
    
    // Cache the result (even if null)
    setCache(address, profile);
    return profile;
  } catch (error) {
    console.error('Error fetching Farcaster profile:', error);
    // Cache null result to prevent repeated failed requests
    setCache(address, null);
    return null;
  }
}

/**
 * Get multiple Farcaster profiles by wallet addresses
 * @param addresses - Array of wallet addresses
 * @returns Array of Farcaster profiles
 */
export async function getFarcasterProfilesByAddresses(addresses: string[]): Promise<FarcasterProfile[]> {
  if (addresses.length === 0) return [];

  // Check cache for all addresses
  const results: { [address: string]: FarcasterProfile | null } = {};
  const uncachedAddresses: string[] = [];
  
  addresses.forEach(address => {
    const cached = getFromCache(address);
    if (cached !== undefined) {
      results[address] = cached;
    } else {
      uncachedAddresses.push(address);
    }
  });
  
  // If all addresses are cached, return cached results
  if (uncachedAddresses.length === 0) {
    return Object.values(results).filter((p): p is FarcasterProfile => p !== null);
  }
  
  // Fetch uncached addresses
  try {
    const response = await fetch('/api/game/farcaster-profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addresses: uncachedAddresses }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        // Cache all fetched profiles
        data.data.forEach((profile: FarcasterProfile) => {
          // Find matching address for this profile
          const matchingAddress = uncachedAddresses.find(addr =>
            profile.verifications.some(verification => 
              verification.toLowerCase() === addr.toLowerCase()
            )
          );
          if (matchingAddress) {
            results[matchingAddress] = profile;
            setCache(matchingAddress, profile);
          }
        });
        
        // Cache null results for addresses that had no profile
        uncachedAddresses.forEach(address => {
          if (!results[address]) {
            results[address] = null;
            setCache(address, null);
          }
        });
      }
    }
    
    // Return all profiles (cached + newly fetched)
    return Object.values(results).filter((p): p is FarcasterProfile => p !== null);
  } catch (error) {
    console.error('Error fetching Farcaster profiles:', error);
    
    // Cache null results for failed addresses to prevent retry loops
    uncachedAddresses.forEach(address => {
      results[address] = null;
      setCache(address, null);
    });
    
    // Return only cached results if API call failed
    return Object.values(results).filter((p): p is FarcasterProfile => p !== null);
  }
}

/**
 * Get Farcaster profile by FID (Farcaster ID)
 * @param fid - Farcaster ID
 * @returns Farcaster profile or null if not found
 */
export async function getFarcasterProfileByFid(fid: number): Promise<FarcasterProfile | null> {
  const fidKey = `fid:${fid}`;
  
  // Check cache first
  const cached = getFromCache(fidKey);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await fetch(`/api/game/farcaster-profile-by-fid/${fid}`);
    
    let profile: FarcasterProfile | null = null;
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        profile = data.data;
      }
    }
    
    // Cache the result
    setCache(fidKey, profile);
    return profile;
  } catch (error) {
    console.error('Error fetching Farcaster profile by FID:', error);
    // Cache null result to prevent repeated failed requests
    setCache(fidKey, null);
    return null;
  }
}

// Export cache management functions for debugging
export const neynarCache = {
  size: () => profileCache.size,
  clear: () => profileCache.clear(),
  keys: () => Array.from(profileCache.keys()),
  get: (key: string) => profileCache.get(key),
  stats: () => ({
    size: profileCache.size,
    keys: Array.from(profileCache.keys()),
    cacheHits: 0 // Could be tracked if needed
  })
};
