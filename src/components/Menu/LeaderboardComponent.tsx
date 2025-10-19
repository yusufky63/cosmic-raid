'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLeaderboard } from '@/hooks/useCosmosRaidContract';
import { getFarcasterProfilesByAddresses, FarcasterProfile } from '@/lib/neynarService';

interface LeaderboardComponentProps {
  className?: string;
}

export const LeaderboardComponent: React.FC<LeaderboardComponentProps> = ({ className = '' }) => {
  const { entries, isLoading, error, fetchLeaderboard } = useLeaderboard();
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [profiles, setProfiles] = useState<{ [address: string]: FarcasterProfile }>({});

  useEffect(() => {
    fetchLeaderboard(showAll ? 50 : 5); // Show 5 or all
  }, [showAll, fetchLeaderboard]); // fetchLeaderboard is now stable via useCallback

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard(showAll ? 50 : 5);
    setRefreshing(false);
  };

  // Memoize addresses to prevent unnecessary re-fetches
  const addresses = useMemo(() => 
    entries.map(entry => entry.address), [entries]
  );
  
  // Fetch profiles when addresses change (cache handled by neynarService)
  useEffect(() => {
    if (addresses.length === 0) {
      setProfiles({});
      return;
    }
    
    const fetchProfiles = async () => {
      try {
        const fetchedProfiles = await getFarcasterProfilesByAddresses(addresses);
        
        const profilesMap: { [address: string]: FarcasterProfile } = {};
        fetchedProfiles.forEach(profile => {
          const matchingEntry = entries.find(entry => 
            profile.verifications.some(verification => 
              verification.toLowerCase() === entry.address.toLowerCase()
            )
          );
          if (matchingEntry) {
            profilesMap[matchingEntry.address] = profile;
          }
        });
        
        setProfiles(profilesMap);
      } catch (error) {
        console.error('❌ Error fetching profiles:', error);
      }
    };
    
    fetchProfiles();
  }, [addresses, entries]); // Include entries to satisfy linter

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 40, 0.8) 100%)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      minHeight: '320px',
      width: '100%'
    }} className={className}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '4px',
            height: '20px',
            background: 'linear-gradient(180deg, #60a5fa, #3b82f6)',
            borderRadius: '2px'
          }}></div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#60a5fa',
            fontFamily: '"Orbitron", sans-serif',
            margin: 0,
            letterSpacing: '1px'
          }}>
            TOP PILOTS
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              padding: '6px 12px',
              background: showAll 
                ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                : 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '8px',
              color: showAll ? '#fff' : '#60a5fa',
              fontSize: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontWeight: '600',
              fontFamily: '"Orbitron", sans-serif',
              letterSpacing: '0.5px'
            }}
          >
            {showAll ? 'TOP 5' : 'ALL'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading || refreshing}
            style={{
              padding: '6px 8px',
              background: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '8px',
              color: '#60a5fa',
              fontSize: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              opacity: isLoading || refreshing ? 0.5 : 1,
              fontWeight: '600'
            }}
          >
            {isLoading || refreshing ? 'LOADING' : 'REFRESH'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          color: '#f87171',
          fontSize: '12px',
          textAlign: 'center',
          padding: '12px',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
          borderRadius: '10px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          marginBottom: '16px'
        }}>
          ERROR: {error}
        </div>
      )}

      {(isLoading && entries.length === 0) ? (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#9ca3af',
          fontSize: '12px'
        }}>
          Loading...
        </div>
      ) : entries.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#9ca3af',
          fontSize: '12px'
        }}>
          No scores yet - play to be first!
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '6px', 
          maxHeight: showAll ? '400px' : 'auto', 
          overflowY: showAll ? 'auto' : 'visible' 
        }}>
          {entries.map((entry, index) => {
            const profile = profiles[entry.address];
            return (
              <div
                key={entry.address}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: index === 0
                    ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(234, 179, 8, 0.1))'
                    : index === 1
                    ? 'linear-gradient(135deg, rgba(156, 163, 175, 0.2), rgba(107, 114, 128, 0.1))'
                    : index === 2
                    ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(234, 88, 12, 0.1))'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                  border: index === 0
                    ? '1px solid rgba(250, 204, 21, 0.4)'
                    : index === 1
                    ? '1px solid rgba(156, 163, 175, 0.4)'
                    : index === 2
                    ? '1px solid rgba(251, 146, 60, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: index < 3 
                    ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
                    : '0 1px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    minWidth: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: index === 0
                      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                      : index === 1
                      ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                      : index === 2
                      ? 'linear-gradient(135deg, #fb923c, #ea580c)'
                      : 'linear-gradient(135deg, #374151, #1f2937)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: index < 3 ? '#000' : '#fff',
                    boxShadow: index < 3 
                      ? '0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                      : '0 1px 3px rgba(0, 0, 0, 0.2)',
                    border: index < 3 ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
                  }}>
                    {index + 1}
                  </div>
                  {profile?.pfpUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.pfpUrl}
                      alt={profile.displayName}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    />
                  ) : null}
                  <div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#fff',
                      fontFamily: profile?.displayName ? '"Inter", sans-serif' : 'monospace',
                      marginBottom: '4px'
                    }}>
                      {profile?.displayName || formatAddress(entry.address)}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '500' }}>
                      Level {entry.level} - {formatTime(entry.time)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '15px', 
                    fontWeight: 'bold', 
                    color: index < 3 ? '#fbbf24' : '#fff',
                    fontFamily: 'monospace',
                    textShadow: index < 3 ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none'
                  }}>
                    {entry.score.toLocaleString()}
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#6b7280',
                    fontWeight: '500',
                    marginTop: '2px'
                  }}>
                    POINTS
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};