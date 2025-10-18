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
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: '"Orbitron", sans-serif',
      padding: 'clamp(10px, 4vw, 20px)',
      overflowY: 'auto',
      overflowX: 'hidden',
      position: 'relative',
      WebkitOverflowScrolling: 'touch', // Enable smooth scrolling on mobile
      scrollBehavior: 'smooth'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        position: 'sticky',
        top: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '16px 0',
        zIndex: 100
      }}>
        <button
          onClick={onBackToMenu}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: '"Orbitron", sans-serif'
          }}
        >
          ← BACK TO MENU
        </button>
        
        <h1 style={{
          fontSize: 'clamp(20px, 4vw, 28px)',
          fontWeight: 'bold',
          color: '#ffcc00',
          margin: 0,
          textAlign: 'center',
          flex: 1
        }}>
          COSMIC RAID GUIDE
        </h1>
        
        <div style={{ width: '120px' }}></div> {/* Spacer for centering */}
      </div>

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        paddingBottom: '40px' // Extra space at bottom for better scrolling
      }}>
        
        {/* Boss Guide Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: 'clamp(18px, 3vw, 22px)',
            fontWeight: 'bold',
            color: '#ff6b35',
            marginBottom: '24px',
            borderBottom: '2px solid #ff6b35',
            paddingBottom: '8px'
          }}>
            🚀 BOSS SHIPS
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(255, 107, 53, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255, 107, 53, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gap: '12px',
              fontSize: 'clamp(11px, 2.2vw, 13px)'
            }}>
              {/* Boss Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '50px 50px 1fr 80px 120px',
                gap: '12px',
                alignItems: 'center',
                padding: '8px',
                borderBottom: '2px solid rgba(255, 107, 53, 0.3)',
                fontWeight: 'bold',
                color: '#ff6b35'
              }}>
                <div>LEVEL</div>
                <div>IMAGE</div>
                <div>BOSS NAME</div>
                <div>HEALTH</div>
                <div>SPECIAL ABILITY</div>
              </div>
              
              {/* Boss List */}
              <div style={{ display: 'grid', gridTemplateColumns: '50px 50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>5</div>
                <Image src="/images/ships/boss/boss-interceptor.png" width={40} height={40} style={{ objectFit: 'contain' }} alt="Destroyer" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>DESTROYER</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Light assault ship</div>
                </div>
                <div style={{ color: '#ffcc00' }}>180 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Horizontal sweep</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>10</div>
                <Image src="/images/ships/boss/boss-destroyer.png" width={40} height={40} style={{ objectFit: 'contain' }} alt="Interceptor" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>INTERCEPTOR</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Fast attack craft</div>
                </div>
                <div style={{ color: '#ffcc00' }}>200 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Figure-8 pattern</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>15</div>
                <Image src="/images/ships/boss/boss-cruiser.png" width={40} height={40} style={{ objectFit: 'contain' }} alt="Cruiser" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>CRUISER</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Medium warship</div>
                </div>
                <div style={{ color: '#ffcc00' }}>300 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Circle formation</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>20</div>
                <Image src="/images/ships/boss/boss-battleship.png" width={40} height={40} style={{ objectFit: 'contain' }} alt="Battleship" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>BATTLESHIP</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Heavy combat vessel</div>
                </div>
                <div style={{ color: '#ffcc00' }}>450 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Burst firing</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>25</div>
                <Image src="/images/ships/boss/boss-dreadnought.png" width={40} height={40} style={{ objectFit: 'contain' }} alt="Dreadnought" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>DREADNOUGHT</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Super battleship</div>
                </div>
                <div style={{ color: '#ffcc00' }}>650 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Multi-shot salvo</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>30</div>
                <Image src="/images/ships/boss/boss-carrier.png" width={40} height={40} style={{ objectFit: 'contain' }} alt="Carrier" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>CARRIER</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Fleet command ship</div>
                </div>
                <div style={{ color: '#ffcc00' }}>850 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Spread pattern</div>
              </div>
              
              {/* Elite Bosses */}
              <div style={{ display: 'grid', gridTemplateColumns: '50px 50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px', backgroundColor: 'rgba(255, 215, 0, 0.1)', borderRadius: '6px' }}>
                <div style={{ color: '#ffd700', fontWeight: 'bold' }}>35</div>
                <Image src="/images/ships/boss/boss-titan.png" width={40} height={40} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 4px #ffd700)' }} alt="Titan" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#ffd700' }}>TITAN</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Elite fortress ship</div>
                </div>
                <div style={{ color: '#ffd700' }}>1200 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Devastator beam</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px', backgroundColor: 'rgba(255, 69, 0, 0.1)', borderRadius: '6px' }}>
                <div style={{ color: '#ff4500', fontWeight: 'bold' }}>40</div>
                <Image src="/images/ships/boss/boss-behemoth.png" width={40} height={40} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 4px #ff4500)' }} alt="Behemoth" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#ff4500' }}>BEHEMOTH</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Massive dreadnought</div>
                </div>
                <div style={{ color: '#ff4500' }}>1600 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Plasma storm</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px', backgroundColor: 'rgba(138, 43, 226, 0.1)', borderRadius: '6px' }}>
                <div style={{ color: '#8a2be2', fontWeight: 'bold' }}>45</div>
                <Image src="/images/ships/boss/boss-leviathan.png" width={40} height={40} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 4px #8a2be2)' }} alt="Leviathan" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#8a2be2' }}>LEVIATHAN</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Ancient war machine</div>
                </div>
                <div style={{ color: '#8a2be2' }}>2200 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Void cannon</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px', backgroundColor: 'rgba(220, 20, 60, 0.15)', border: '2px solid rgba(220, 20, 60, 0.5)', borderRadius: '6px' }}>
                <div style={{ color: '#dc143c', fontWeight: 'bold', fontSize: '14px' }}>50</div>
                <Image src="/images/ships/boss/boss-colossus.png" width={40} height={40} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 6px #dc143c)' }} alt="Colossus" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#dc143c' }}>COLOSSUS</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Final boss - Ultimate weapon</div>
                </div>
                <div style={{ color: '#dc143c', fontWeight: 'bold' }}>3500 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Galaxy buster</div>
              </div>
            </div>
            
            {/* Boss Features */}
            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 107, 53, 0.2)'
            }}>
              <div style={{ fontSize: '12px', color: '#ff6b35', fontWeight: 'bold', marginBottom: '8px' }}>
                BOSS AI FEATURES:
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.4' }}>
                • <span style={{ color: '#ffcc00' }}>Dynamic Movement:</span> Pattern switching every 8-12 seconds with aggression boosts<br/>
                • <span style={{ color: '#ff6b35' }}>Progressive Bullets:</span> 1 bullet (first boss) up to 10 bullets (final boss)<br/>
                • <span style={{ color: '#ff4444' }}>Health Scaling:</span> +8% base health per level after spawn level<br/>
                • <span style={{ color: '#44ff44' }}>Phase System:</span> Normal {'→'} Aggressive (75% HP) {'→'} Desperate (25% HP)<br/>
                • <span style={{ color: '#8844ff' }}>Anti-Teleport:</span> Movement speed limited to prevent instant jumps
              </div>
            </div>
          </div>
        </section>
        
        {/* Enemy Ships Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: 'clamp(18px, 3vw, 22px)',
            fontWeight: 'bold',
            color: '#44ff44',
            marginBottom: '24px',
            borderBottom: '2px solid #44ff44',
            paddingBottom: '8px'
          }}>
            👾 ENEMY SHIPS
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(68, 255, 68, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(68, 255, 68, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gap: '8px',
              fontSize: 'clamp(11px, 2.2vw, 13px)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 100px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/ships/enemy/enemy-basic.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Basic" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>BASIC FIGHTER</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Standard attack craft</div>
                </div>
                <div style={{ color: '#44ff44' }}>20 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Straight movement</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 100px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/ships/enemy/enemy-shooter.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Shooter" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>SHOOTER</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Fires bullets</div>
                </div>
                <div style={{ color: '#44ff44' }}>25 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Shooting attacks</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 100px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/ships/enemy/enemy-kamikaze.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Kamikaze" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>KAMIKAZE</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Suicide bomber</div>
                </div>
                <div style={{ color: '#44ff44' }}>15 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Fast & aggressive</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 100px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/ships/enemy/enemy-bomber.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Bomber" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>BOMBER</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Heavy assault</div>
                </div>
                <div style={{ color: '#44ff44' }}>35 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Slow but tough</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 100px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/ships/enemy/enemy-stealth.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Stealth" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>STEALTH</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Evasive maneuvers</div>
                </div>
                <div style={{ color: '#44ff44' }}>18 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Erratic movement</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 100px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/ships/enemy/enemy-assassin.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Assassin" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>ASSASSIN</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Elite hunter</div>
                </div>
                <div style={{ color: '#44ff44' }}>22 HP</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>High speed pursuit</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Player Ships Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: 'clamp(18px, 3vw, 22px)',
            fontWeight: 'bold',
            color: '#4444ff',
            marginBottom: '24px',
            borderBottom: '2px solid #4444ff',
            paddingBottom: '8px'
          }}>
            🚢 PLAYER SHIPS
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(68, 68, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(68, 68, 255, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gap: '12px',
              fontSize: 'clamp(11px, 2.2vw, 13px)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 100px 120px', gap: '12px', alignItems: 'center', padding: '8px' }}>
                <Image src="/images/ships/player/player-ship-basic.png" width={40} height={40} style={{ objectFit: 'contain' }} alt="Basic Ship" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>BASIC FIGHTER</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Level 1-9 • 80×80px • 1×DMG</div>
                </div>
                <div style={{ color: '#4444ff' }}>Single Shot</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Standard firepower</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 100px 120px', gap: '12px', alignItems: 'center', padding: '8px', backgroundColor: 'rgba(68, 68, 255, 0.1)', borderRadius: '6px' }}>
                <Image src="/images/ships/player/player-ship-elite.png" width={40} height={40} style={{ objectFit: 'contain' }} alt="Elite Ship" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#4444ff' }}>ELITE INTERCEPTOR</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Level 10-19 • 120×120px • 1.5×DMG • +1 Life</div>
                </div>
                <div style={{ color: '#4444ff' }}>Double Shot</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Enhanced firepower</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 100px 120px', gap: '12px', alignItems: 'center', padding: '8px', backgroundColor: 'rgba(255, 140, 0, 0.1)', borderRadius: '6px' }}>
                <Image src="/images/ships/player/player-ship-commander.png" width={40} height={40} style={{ objectFit: 'contain' }} alt="Commander Ship" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#ff8c00' }}>COMMANDER CRUISER</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Level 20-29 • 160×160px • 2×DMG • +1 Life</div>
                </div>
                <div style={{ color: '#ff8c00' }}>Triple Shot</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Heavy assault</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 100px 120px', gap: '12px', alignItems: 'center', padding: '8px', backgroundColor: 'rgba(255, 215, 0, 0.1)', borderRadius: '6px' }}>
                <Image src="/images/ships/player/player-ship-legend.png" width={40} height={40} style={{ objectFit: 'contain' }} alt="Legend Ship" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#ffd700' }}>LEGEND BATTLESHIP</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Level 30-39 • 180×180px • 2.5×DMG • +1 Life</div>
                </div>
                <div style={{ color: '#ffd700' }}>Quad Shot</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Elite warfare</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 100px 120px', gap: '12px', alignItems: 'center', padding: '8px', backgroundColor: 'rgba(255, 0, 255, 0.15)', border: '2px solid rgba(255, 0, 255, 0.5)', borderRadius: '6px' }}>
                <Image src="/images/ships/player/player-ship-dreadnought.png" width={40} height={40} style={{ objectFit: 'contain', filter: 'hue-rotate(270deg) saturate(1.5)' }} alt="Supreme Ship" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#ff00ff' }}>SUPREME DREADNOUGHT</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Level 40+ • 220×220px • 3×DMG • +1 Life</div>
                </div>
                <div style={{ color: '#ff00ff', fontWeight: 'bold' }}>Penta Shot</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Ultimate power</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Power-ups Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: 'clamp(18px, 3vw, 22px)',
            fontWeight: 'bold',
            color: '#ffcc00',
            marginBottom: '24px',
            borderBottom: '2px solid #ffcc00',
            paddingBottom: '8px'
          }}>
            ⚡ POWER-UPS
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(255, 204, 0, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255, 204, 0, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gap: '8px',
              fontSize: 'clamp(11px, 2.2vw, 13px)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/power-up/heart.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Heart" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>EXTRA LIFE</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Gain additional life</div>
                </div>
                <div style={{ color: '#ff4444' }}>+1 Life</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>Permanent</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/power-up/double-shot.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Double Shot" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>DOUBLE SHOT</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Fire two bullets</div>
                </div>
                <div style={{ color: '#ffcc00' }}>2x Fire</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>15 seconds</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/power-up/triple-shot.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Triple Shot" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>TRIPLE SHOT</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Fire three bullets</div>
                </div>
                <div style={{ color: '#ffcc00' }}>3x Fire</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>12 seconds</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/power-up/laser-beam.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Laser Beam" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>LASER BEAM</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Penetrating laser</div>
                </div>
                <div style={{ color: '#ff6b35' }}>Pierce</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>10 seconds</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/power-up/speed-boost.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Speed Boost" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>SPEED BOOST</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Faster movement</div>
                </div>
                <div style={{ color: '#44ff44' }}>+Speed</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>8 seconds</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/power-up/shield.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Shield" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>SHIELD</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Damage protection</div>
                </div>
                <div style={{ color: '#4444ff' }}>Defense</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>6 seconds</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/power-up/invincibility.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Invincibility" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>INVINCIBILITY</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Total immunity</div>
                </div>
                <div style={{ color: '#ffd700' }}>Immune</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>5 seconds</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/power-up/magnet.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Magnet" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>MAGNET</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Attract power-ups</div>
                </div>
                <div style={{ color: '#8844ff' }}>Attract</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>7 seconds</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px 120px', gap: '12px', alignItems: 'center', padding: '6px' }}>
                <Image src="/images/power-up/time-slow.png" width={32} height={32} style={{ objectFit: 'contain' }} alt="Time Slow" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>TIME SLOW</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>Slow down enemies</div>
                </div>
                <div style={{ color: '#44ffff' }}>Slow</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>6 seconds</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Game Tips */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: 'clamp(18px, 3vw, 22px)',
            fontWeight: 'bold',
            color: '#ff44ff',
            marginBottom: '24px',
            borderBottom: '2px solid #ff44ff',
            paddingBottom: '8px'
          }}>
            💡 STRATEGY TIPS
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(255, 68, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255, 68, 255, 0.2)',
            fontSize: '12px',
            lineHeight: '1.5',
            color: '#ccc'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#ff44ff' }}>Boss Strategy:</strong> Learn each boss&apos;s movement pattern. Most bosses switch patterns every 8-12 seconds, so adapt your positioning accordingly.
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#ff44ff' }}>Power-up Priority:</strong> Heart {'>'} Invincibility {'>'} Triple Shot {'>'} Laser Beam {'>'} Shield {'>'} Others. Always prioritize survival over firepower.
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#ff44ff' }}>Combo System:</strong> Hit enemies consecutively to build combo multipliers. Higher combos = more score, but missing resets the combo.
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#ff44ff' }}>Level Progression:</strong> Every 400 points = +1 level. Boss fights every 5 levels. Steady progression allows proper preparation.
            </div>
            <div>
              <strong style={{ color: '#ff44ff' }}>Mobile Controls:</strong> Touch & drag to move your ship. Auto-fire is enabled by default for smoother mobile gameplay.
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
};
