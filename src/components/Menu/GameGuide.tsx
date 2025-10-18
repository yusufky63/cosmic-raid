'use client';

import React from 'react';
import Image from 'next/image';

interface GameGuideProps {
  onBackToMenu: () => void;
}

export const GameGuide: React.FC<GameGuideProps> = ({ onBackToMenu }) => {
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: '"Orbitron", sans-serif',
      padding: 'clamp(4px, 1vw, 8px)',
      overflowY: 'auto',
      overflowX: 'hidden',
      position: 'relative',
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'clamp(8px, 2vw, 12px)',
        position: 'sticky',
        top: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: 'clamp(4px, 1vw, 8px) clamp(4px, 1vw, 8px)',
        zIndex: 100
      }}>
        <button
          onClick={onBackToMenu}
          style={{
            padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
            fontSize: 'clamp(11px, 2.5vw, 13px)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: '"Orbitron", sans-serif'
          }}
        >
          ← BACK
        </button>
        
        <h1 style={{
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          fontWeight: 'bold',
          color: '#ffcc00',
          margin: 0,
          textAlign: 'center',
          flex: 1
        }}>
          GUIDE
        </h1>
        
        <div style={{ width: 'clamp(40px, 10vw, 60px)' }}></div>
      </div>

      <div style={{ 
        width: '100%',
        paddingBottom: 'clamp(8px, 2vw, 12px)',
        boxSizing: 'border-box'
      }}>
        
        {/* Boss Guide Section */}
        <section style={{ marginBottom: 'clamp(8px, 2vw, 16px)' }}>
          <h2 style={{
            fontSize: 'clamp(12px, 2vw, 14px)',
            fontWeight: 'bold',
            color: '#ff6b35',
            marginBottom: 'clamp(4px, 1vw, 8px)',
            borderBottom: '1px solid #ff6b35',
            paddingBottom: 'clamp(2px, 0.5vw, 4px)'
          }}>
            🚀 BOSSES
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(255, 107, 53, 0.05)',
            borderRadius: '12px',
            padding: 'clamp(4px, 1vw, 8px)',
            border: '1px solid rgba(255, 107, 53, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gap: 'clamp(4px, 1vw, 8px)',
              fontSize: 'clamp(9px, 1.5vw, 11px)'
            }}>
              {/* Boss Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'clamp(30px, 8vw, 40px) clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 60px)',
                gap: 'clamp(4px, 1vw, 8px)',
                alignItems: 'center',
                padding: 'clamp(2px, 1vw, 4px)',
                borderBottom: '2px solid rgba(255, 107, 53, 0.3)',
                fontWeight: 'bold',
                color: '#ff6b35'
              }}>
                <div>LVL</div>
                <div>IMG</div>
                <div>NAME</div>
                <div>HP</div>
              </div>
              
              {/* Boss List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(30px, 8vw, 40px) clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 60px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>5</div>
                <Image src="/images/ships/boss/boss-interceptor.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Destroyer" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>DESTROYER</div>
                <div style={{ color: '#ffcc00' }}>180</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(30px, 8vw, 40px) clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 60px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>10</div>
                <Image src="/images/ships/boss/boss-destroyer.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Interceptor" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>INTERCEPTOR</div>
                <div style={{ color: '#ffcc00' }}>200</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(30px, 8vw, 40px) clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 60px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>15</div>
                <Image src="/images/ships/boss/boss-cruiser.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Cruiser" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>CRUISER</div>
                <div style={{ color: '#ffcc00' }}>300</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(30px, 8vw, 40px) clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 60px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>20</div>
                <Image src="/images/ships/boss/boss-battleship.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Battleship" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>BATTLESHIP</div>
                <div style={{ color: '#ffcc00' }}>450</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(30px, 8vw, 40px) clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 60px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>25</div>
                <Image src="/images/ships/boss/boss-dreadnought.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Dreadnought" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>DREADNOUGHT</div>
                <div style={{ color: '#ffcc00' }}>650</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(30px, 8vw, 40px) clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 60px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>30</div>
                <Image src="/images/ships/boss/boss-carrier.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Carrier" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>CARRIER</div>
                <div style={{ color: '#ffcc00' }}>850</div>
              </div>
              
              {/* Elite Bosses */}
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(30px, 8vw, 40px) clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 60px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)', backgroundColor: 'rgba(255, 215, 0, 0.1)', borderRadius: '6px' }}>
                <div style={{ color: '#ffd700', fontWeight: 'bold' }}>35</div>
                <Image src="/images/ships/boss/boss-titan.png" width={28} height={28} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 4px #ffd700)' }} alt="Titan" />
                <div style={{ fontWeight: 'bold', color: '#ffd700' }}>TITAN</div>
                <div style={{ color: '#ffd700' }}>1200</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(30px, 8vw, 40px) clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 60px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)', backgroundColor: 'rgba(255, 69, 0, 0.1)', borderRadius: '6px' }}>
                <div style={{ color: '#ff4500', fontWeight: 'bold' }}>40</div>
                <Image src="/images/ships/boss/boss-behemoth.png" width={28} height={28} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 4px #ff4500)' }} alt="Behemoth" />
                <div style={{ fontWeight: 'bold', color: '#ff4500' }}>BEHEMOTH</div>
                <div style={{ color: '#ff4500' }}>1600</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(30px, 8vw, 40px) clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 60px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)', backgroundColor: 'rgba(138, 43, 226, 0.1)', borderRadius: '6px' }}>
                <div style={{ color: '#8a2be2', fontWeight: 'bold' }}>45</div>
                <Image src="/images/ships/boss/boss-leviathan.png" width={28} height={28} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 4px #8a2be2)' }} alt="Leviathan" />
                <div style={{ fontWeight: 'bold', color: '#8a2be2' }}>LEVIATHAN</div>
                <div style={{ color: '#8a2be2' }}>2200</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(30px, 8vw, 40px) clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 60px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)', backgroundColor: 'rgba(220, 20, 60, 0.15)', border: '2px solid rgba(220, 20, 60, 0.5)', borderRadius: '6px' }}>
                <div style={{ color: '#dc143c', fontWeight: 'bold' }}>50</div>
                <Image src="/images/ships/boss/boss-colossus.png" width={28} height={28} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 6px #dc143c)' }} alt="Colossus" />
                <div style={{ fontWeight: 'bold', color: '#dc143c' }}>COLOSSUS</div>
                <div style={{ color: '#dc143c', fontWeight: 'bold' }}>3500</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Enemy Ships Section */}
        <section style={{ marginBottom: 'clamp(8px, 2vw, 16px)' }}>
          <h2 style={{
            fontSize: 'clamp(12px, 2vw, 14px)',
            fontWeight: 'bold',
            color: '#44ff44',
            marginBottom: 'clamp(4px, 1vw, 8px)',
            borderBottom: '1px solid #44ff44',
            paddingBottom: 'clamp(2px, 0.5vw, 4px)'
          }}>
            👾 ENEMIES
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(68, 255, 68, 0.05)',
            borderRadius: '12px',
            padding: 'clamp(4px, 1vw, 8px)',
            border: '1px solid rgba(68, 255, 68, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gap: 'clamp(3px, 1vw, 6px)',
              fontSize: 'clamp(9px, 1.5vw, 11px)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(40px, 10vw, 50px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/ships/enemy/enemy-basic.png" width={24} height={24} style={{ objectFit: 'contain' }} alt="Basic" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>BASIC</div>
                <div style={{ color: '#44ff44' }}>20 HP</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(40px, 10vw, 50px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/ships/enemy/enemy-shooter.png" width={24} height={24} style={{ objectFit: 'contain' }} alt="Shooter" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>SHOOTER</div>
                <div style={{ color: '#44ff44' }}>25 HP</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(40px, 10vw, 50px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/ships/enemy/enemy-kamikaze.png" width={24} height={24} style={{ objectFit: 'contain' }} alt="Kamikaze" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>KAMIKAZE</div>
                <div style={{ color: '#44ff44' }}>15 HP</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(40px, 10vw, 50px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/ships/enemy/enemy-bomber.png" width={24} height={24} style={{ objectFit: 'contain' }} alt="Bomber" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>BOMBER</div>
                <div style={{ color: '#44ff44' }}>35 HP</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(40px, 10vw, 50px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/ships/enemy/enemy-stealth.png" width={24} height={24} style={{ objectFit: 'contain' }} alt="Stealth" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>STEALTH</div>
                <div style={{ color: '#44ff44' }}>18 HP</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(40px, 10vw, 50px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/ships/enemy/enemy-assassin.png" width={24} height={24} style={{ objectFit: 'contain' }} alt="Assassin" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>ASSASSIN</div>
                <div style={{ color: '#44ff44' }}>22 HP</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Player Ships Section */}
        <section style={{ marginBottom: 'clamp(8px, 2vw, 16px)' }}>
          <h2 style={{
            fontSize: 'clamp(12px, 2vw, 14px)',
            fontWeight: 'bold',
            color: '#4444ff',
            marginBottom: 'clamp(4px, 1vw, 8px)',
            borderBottom: '1px solid #4444ff',
            paddingBottom: 'clamp(2px, 0.5vw, 4px)'
          }}>
            🚢 SHIPS
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(68, 68, 255, 0.05)',
            borderRadius: '12px',
            padding: 'clamp(4px, 1vw, 8px)',
            border: '1px solid rgba(68, 68, 255, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gap: 'clamp(4px, 1vw, 8px)',
              fontSize: 'clamp(9px, 1.5vw, 11px)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(60px, 15vw, 80px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/ships/player/player-ship-basic.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Basic Ship" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>BASIC (1-9)</div>
                <div style={{ color: '#4444ff' }}>Single Shot</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(60px, 15vw, 80px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)', backgroundColor: 'rgba(68, 68, 255, 0.1)', borderRadius: '6px' }}>
                <Image src="/images/ships/player/player-ship-elite.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Elite Ship" />
                <div style={{ fontWeight: 'bold', color: '#4444ff' }}>ELITE (10-19)</div>
                <div style={{ color: '#4444ff' }}>Double Shot</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(60px, 15vw, 80px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)', backgroundColor: 'rgba(255, 140, 0, 0.1)', borderRadius: '6px' }}>
                <Image src="/images/ships/player/player-ship-commander.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Commander Ship" />
                <div style={{ fontWeight: 'bold', color: '#ff8c00' }}>COMMANDER (20-29)</div>
                <div style={{ color: '#ff8c00' }}>Triple Shot</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(60px, 15vw, 80px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)', backgroundColor: 'rgba(255, 215, 0, 0.1)', borderRadius: '6px' }}>
                <Image src="/images/ships/player/player-ship-legend.png" width={28} height={28} style={{ objectFit: 'contain' }} alt="Legend Ship" />
                <div style={{ fontWeight: 'bold', color: '#ffd700' }}>LEGEND (30-39)</div>
                <div style={{ color: '#ffd700' }}>Quad Shot</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(60px, 15vw, 80px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)', backgroundColor: 'rgba(255, 0, 255, 0.15)', border: '2px solid rgba(255, 0, 255, 0.5)', borderRadius: '6px' }}>
                <Image src="/images/ships/player/player-ship-dreadnought.png" width={28} height={28} style={{ objectFit: 'contain', filter: 'hue-rotate(270deg) saturate(1.5)' }} alt="Supreme Ship" />
                <div style={{ fontWeight: 'bold', color: '#ff00ff' }}>SUPREME (40+)</div>
                <div style={{ color: '#ff00ff', fontWeight: 'bold' }}>Penta Shot</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Power-ups Section */}
        <section style={{ marginBottom: 'clamp(8px, 2vw, 16px)' }}>
          <h2 style={{
            fontSize: 'clamp(12px, 2vw, 14px)',
            fontWeight: 'bold',
            color: '#ffcc00',
            marginBottom: 'clamp(4px, 1vw, 8px)',
            borderBottom: '1px solid #ffcc00',
            paddingBottom: 'clamp(2px, 0.5vw, 4px)'
          }}>
            ⚡ POWER-UPS
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(255, 204, 0, 0.05)',
            borderRadius: '12px',
            padding: 'clamp(4px, 1vw, 8px)',
            border: '1px solid rgba(255, 204, 0, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gap: 'clamp(3px, 1vw, 6px)',
              fontSize: 'clamp(9px, 1.5vw, 11px)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 70px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/power-up/heart.png" width={24} height={24} style={{ objectFit: 'contain' }} alt="Heart" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>EXTRA LIFE</div>
                <div style={{ color: '#ff4444' }}>+1 Life</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 70px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/power-up/double-shot.png" width={24} height={24} style={{ objectFit: 'contain' }} alt="Double Shot" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>DOUBLE SHOT</div>
                <div style={{ color: '#ffcc00' }}>15s</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 70px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/power-up/triple-shot.png" width={24} height={24} style={{ objectFit: 'contain' }} alt="Triple Shot" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>TRIPLE SHOT</div>
                <div style={{ color: '#ffcc00' }}>12s</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 70px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/power-up/laser-beam.png" width={24} height={24} style={{ objectFit: 'contain' }} alt="Laser Beam" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>LASER BEAM</div>
                <div style={{ color: '#ff6b35' }}>10s</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 70px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/power-up/shield.png" width={24} height={24} style={{ objectFit: 'contain' }} alt="Shield" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>SHIELD</div>
                <div style={{ color: '#4444ff' }}>6s</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(25px, 6vw, 35px) 1fr clamp(50px, 12vw, 70px)', gap: 'clamp(4px, 1vw, 6px)', alignItems: 'center', padding: 'clamp(2px, 0.8vw, 4px)' }}>
                <Image src="/images/power-up/invincibility.png" width={24} height={24} style={{ objectFit: 'contain' }} alt="Invincibility" />
                <div style={{ fontWeight: 'bold', color: '#fff' }}>INVINCIBILITY</div>
                <div style={{ color: '#ffd700' }}>8s</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Game Tips */}
        <section style={{ marginBottom: 'clamp(6px, 1.5vw, 8px)' }}>
          <h2 style={{
            fontSize: 'clamp(12px, 2vw, 14px)',
            fontWeight: 'bold',
            color: '#ff44ff',
            marginBottom: 'clamp(4px, 1vw, 8px)',
            borderBottom: '1px solid #ff44ff',
            paddingBottom: 'clamp(2px, 0.5vw, 4px)'
          }}>
            💡 TIPS
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(255, 68, 255, 0.05)',
            borderRadius: '12px',
            padding: 'clamp(4px, 1vw, 8px)',
            border: '1px solid rgba(255, 68, 255, 0.2)',
            fontSize: 'clamp(9px, 1.8vw, 11px)',
            lineHeight: '1.4',
            color: '#ccc'
          }}>
            <div style={{ marginBottom: 'clamp(6px, 1.5vw, 8px)' }}>
              <strong style={{ color: '#ff44ff' }}>Priority:</strong> Heart → Invincibility → Triple Shot → Others
            </div>
            <div style={{ marginBottom: 'clamp(6px, 1.5vw, 8px)' }}>
              <strong style={{ color: '#ff44ff' }}>Combo:</strong> Hit enemies consecutively for higher scores
            </div>
            <div>
              <strong style={{ color: '#ff44ff' }}>Mobile:</strong> Touch & drag to move, auto-fire enabled
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
};