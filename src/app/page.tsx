"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SpaceImpactGame } from "@/components/Game/SpaceImpactGame";
import { GameGuide } from "@/components/Menu/GameGuide";
import { LeaderboardComponent } from "@/components/Menu/LeaderboardComponent";
import { useFarcaster } from "@/hooks/useFarcaster";
import { useWallet } from "@/hooks/useWallet";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<
    "mainMenu" | "loading" | "game" | "guide"
  >("loading");

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { isInMiniApp, sdk } = useFarcaster();
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();

  // Asset preloading function
  const preloadAssets = useCallback(async () => {
    const imageUrls = [
      // Player ships
      "/images/ships/player/player-ship-basic.png",
      "/images/ships/player/player-ship-elite.png",
      "/images/ships/player/player-ship-commander.png",
      "/images/ships/player/player-ship-legend.png",

      // Enemy ships
      "/images/ships/enemy/enemy-basic.png",
      "/images/ships/enemy/enemy-shooter.png",
      "/images/ships/enemy/enemy-kamikaze.png",
      "/images/ships/enemy/enemy-bomber.png",
      "/images/ships/enemy/enemy-stealth.png",
      "/images/ships/enemy/enemy-assassin.png",

      // Boss ships
      "/images/ships/boss/boss-destroyer.png",
      "/images/ships/boss/boss-interceptor.png",
      "/images/ships/boss/boss-cruiser.png",
      "/images/ships/boss/boss-battleship.png",
      "/images/ships/boss/boss-dreadnought.png",
      "/images/ships/boss/boss-carrier.png",
      "/images/ships/boss/boss-titan.png",
      "/images/ships/boss/boss-behemoth.png",
      "/images/ships/boss/boss-leviathan.png",
      "/images/ships/boss/boss-colossus.png",

      // Power-ups
      "/images/power-up/heart.png",
      "/images/power-up/double-shot.png",
      "/images/power-up/triple-shot.png",
      "/images/power-up/speed-boost.png",
      "/images/power-up/shield.png",
      "/images/power-up/invincibility.png",
      "/images/power-up/laser-beam.png",
      "/images/power-up/magnet.png",
      "/images/power-up/time-slow.png",

      // Effects
      "/images/effects/explosion.png",
      "/images/effects/shield-effect.png",
      "/images/effects/engine-trail.png",
    ];

    let loaded = 0;
    const total = imageUrls.length;

    const loadPromises = imageUrls.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loaded++;
          setLoadingProgress((loaded / total) * 100);
          // Debug laser beam loading

          resolve();
        };
        img.onerror = () => {
          loaded++;
          setLoadingProgress((loaded / total) * 100);
          // Debug laser beam loading error
          if (url.includes("laser-beam")) {
            console.error(`❌ Failed to load laser beam image: ${url}`);
          }
          resolve(); // Continue even if some images fail
        };
        img.src = url;
      });
    });

    await Promise.all(loadPromises);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Brief pause for UX
    setAssetsLoaded(true);
    setCurrentScreen("mainMenu");
  }, []);

  // Farcaster Mini App initialization
  useEffect(() => {
    if (isInMiniApp && sdk) {
      // Hide the Farcaster splash screen and initialize properly
      sdk.actions.ready();
    }
  }, [isInMiniApp, sdk]);

  // Start asset preloading on mount
  useEffect(() => {
    preloadAssets();
  }, [preloadAssets]);

  // Loading screen component with fixed hydration mismatch
  const LoadingScreen = () => {
    const [stars, setStars] = useState<
      Array<{
        id: number;
        left: number;
        top: number;
        width: number;
        height: number;
        duration: number;
        delay: number;
      }>
    >([]);

    // Generate stars only on client-side to prevent hydration mismatch
    useEffect(() => {
      const starArray = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: Math.random() * 2 + 1,
        height: Math.random() * 2 + 1,
        duration: Math.random() * 2 + 1,
        delay: Math.random() * 2,
      }));
      setStars(starArray);
    }, []);

    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Orbitron", sans-serif',
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated background stars - client-side only */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {stars.map((star) => (
            <div
              key={star.id}
              style={{
                position: "absolute",
                backgroundColor: "#fff",
                borderRadius: "50%",
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.width}px`,
                height: `${star.height}px`,
              }}
            />
          ))}
        </div>

        {/* Loading content */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
          {/* Game title */}
          <h1
            style={{
              fontSize: "clamp(2.5rem, 8vw, 4rem)",
              fontWeight: "bold",
              color: "#ffcc00",
              marginBottom: "16px",
              textShadow: "0 0 20px #ffcc00",
            }}
          >
            COSMIC RAID
          </h1>

          <p
            style={{
              color: "#ccc",
              fontSize: "clamp(14px, 3vw, 18px)",
              marginBottom: "40px",
              opacity: 0.8,
            }}
          >
            Loading assets...
          </p>

          {/* Loading bar */}
          <div
            style={{
              width: "300px",
              height: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
              overflow: "hidden",
              margin: "0 auto 20px",
              border: "1px solid rgba(255, 204, 0, 0.3)",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "linear-gradient(90deg, #ffcc00, #ff6b35)",
                background: "linear-gradient(90deg, #ffcc00, #ff6b35)",
                width: `${loadingProgress}%`,
                transition: "width 0.3s ease",
                borderRadius: "4px",
                boxShadow: "0 0 10px rgba(255, 204, 0, 0.5)",
              }}
            />
          </div>

          {/* Progress percentage */}
          <div
            style={{
              color: "#ffcc00",
              fontSize: "14px",
              fontFamily: "monospace",
            }}
          >
            {Math.round(loadingProgress)}%
          </div>
        </div>
      </div>
    );
  };

  // Enhanced main menu component
  const MainMenu = () => (
    <div
      className="bg-black flex flex-col w-full"
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        fontFamily: '"Orbitron", sans-serif',
        width: "100vw",
        boxSizing: "border-box",
        position: "relative",
        overflowX: "hidden",
        overflowY: "visible",
        paddingBottom: "40px",
      }}
    >
      {/* Top Bar - Wallet & Exit */}
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "clamp(8px, 2vw, 16px) clamp(12px, 3vw, 24px)",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Wallet Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isConnected ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#6b7280" }}
              >
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 0 2H5a2 2 0 0 0 0 4h14a1 1 0 0 0 1-1v-2.5a2.5 2.5 0 0 1 0-5Z" />
                <path d="M12 12h.01" />
              </svg>
              <span
                style={{
                  color: "#6b7280",
                  fontSize: "clamp(10px, 2.5vw, 12px)",
                  fontFamily: "monospace",
                }}
              >
                {address?.slice(0, 4)}...{address?.slice(-2)}
              </span>
              <button
                onClick={disconnectWallet}
                style={{
                  background: "none",
                  border: "none",
                  color: "#dc2626",
                  fontSize: "clamp(14px, 3.5vw, 16px)",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Disconnect Wallet"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={connectWallet}
              style={{
                background: "none",
                border: "none",
                color: "#f59e0b",
                fontSize: "clamp(10px, 2.5vw, 12px)",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              title="Connect Wallet"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 0 2H5a2 2 0 0 0 0 4h14a1 1 0 0 0 1-1v-2.5a2.5 2.5 0 0 1 0-5Z" />
                <path d="M12 12h.01" />
              </svg>
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          flex: 1,
          padding: "clamp(20px, 5vw, 40px) clamp(10px, 3vw, 30px)",
          paddingTop: "clamp(80px, 12vw, 100px)", // Space for fixed top bar
          minHeight: "calc(100vh - 60px)",
        }}
      >
        {/* Enhanced Space Background - Matching Banner */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          {/* Stars */}
          {Array.from({ length: 80 }).map((_, i) => {
            const size =
              Math.random() > 0.7 ? "3px" : Math.random() > 0.4 ? "2px" : "1px";
            const intensity = size === "3px" ? 0.8 : size === "2px" ? 0.5 : 0.3;
            const twinkle = Math.random() > 0.5;
            return (
              <div
                key={`star-${i}`}
                style={{
                  position: "absolute",
                  backgroundColor: "#ffffff",
                  borderRadius: "50%",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: size,
                  height: size,
                  opacity: intensity,
                  boxShadow: `0 0 ${
                    size === "3px" ? "6px" : "3px"
                  } rgba(255, 255, 255, ${intensity})`,
                  animation: twinkle
                    ? "twinkle 3s ease-in-out infinite alternate"
                    : "none",
                }}
              />
            );
          })}

          {/* Colored Stars */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`color-star-${i}`}
              style={{
                position: "absolute",
                backgroundColor:
                  i % 3 === 0 ? "#00bfff" : i % 3 === 1 ? "#ffd700" : "#ff69b4",
                borderRadius: "50%",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: "1px",
                height: "1px",
                opacity: 0.4,
                boxShadow: `0 0 4px ${
                  i % 3 === 0 ? "#00bfff" : i % 3 === 1 ? "#ffd700" : "#ff69b4"
                }`,
              }}
            />
          ))}

          {/* Distant Nebula Effect */}
          <div
            style={{
              position: "absolute",
              top: "20%",
              right: "10%",
              width: "300px",
              height: "200px",
              background:
                "radial-gradient(circle, rgba(0, 191, 255, 0.1) 0%, rgba(0, 80, 255, 0.05) 50%, transparent 100%)",
              borderRadius: "50%",
              filter: "blur(40px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: "15%",
              left: "5%",
              width: "250px",
              height: "150px",
              background:
                "radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, rgba(255, 140, 0, 0.04) 50%, transparent 100%)",
              borderRadius: "50%",
              filter: "blur(35px)",
            }}
          />
        </div>

        {/* Game Title - Matching Banner Style */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "clamp(30px, 5vw, 40px)",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Enhanced Laser Beam Effects - Matching Banner */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "20%",
              width: "200px",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, #00bfff, #ffffff, #00bfff, transparent)",
              transform: "rotate(-25deg)",
              opacity: 0.6,
              pointerEvents: "none",
              boxShadow: "0 0 10px #00bfff, 0 0 20px rgba(0, 191, 255, 0.5)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "30%",
              right: "15%",
              width: "150px",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, #00bfff, #ffffff, #00bfff, transparent)",
              transform: "rotate(35deg)",
              opacity: 0.4,
              pointerEvents: "none",
              boxShadow: "0 0 8px #00bfff, 0 0 16px rgba(0, 191, 255, 0.4)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "40%",
              left: "70%",
              width: "100px",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, #ffd700, #ffffff, #ffd700, transparent)",
              transform: "rotate(-45deg)",
              opacity: 0.3,
              pointerEvents: "none",
              boxShadow: "0 0 6px #ffd700, 0 0 12px rgba(255, 215, 0, 0.3)",
            }}
          />

          <h1
            style={{
              fontSize: "clamp(2rem, 8vw, 3.5rem)",
              fontWeight: "700",
              background: "linear-gradient(135deg, #ffd700, #ffb000, #ff8c00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "clamp(4px, 1vw, 8px)",
              fontFamily: '"Orbitron", sans-serif',
              letterSpacing: "clamp(2px, 1vw, 4px)",
              textShadow: "0 0 8px rgba(255, 215, 0, 0.3)",
              lineHeight: 0.9,
            }}
          >
            COSMIC
          </h1>
          <h1
            style={{
              fontSize: "clamp(2rem, 8vw, 3.5rem)",
              fontWeight: "700",
              background: "linear-gradient(135deg, #00bfff, #0080ff, #0040ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "clamp(12px, 2vw, 20px)",
              fontFamily: '"Orbitron", sans-serif',
              letterSpacing: "clamp(2px, 1vw, 4px)",
              textShadow: "0 0 8px rgba(0, 191, 255, 0.3)",
              lineHeight: 0.9,
            }}
          >
            RAID
          </h1>
          <p
            style={{
              color: "#ffffff",
              fontSize: "clamp(10px, 2.5vw, 14px)",
              fontWeight: "400",
              fontFamily: '"Orbitron", sans-serif',
              opacity: 0.9,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              textShadow: "0 0 3px rgba(255, 255, 255, 0.2)",
            }}
          >
            DEFEND THE GALAXY FROM COSMIC INVADERS!
          </p>

          {/* Enhanced Feature Tags */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {[
              "Progressive Bosses",
              "5-Tier Ship Upgrades",
              "Cosmic Combat",
            ].map((feature, index) => (
              <span
                key={feature}
                style={{
                  fontSize: "clamp(9px, 2.2vw, 11px)",
                  color:
                    index === 0
                      ? "#ffd700"
                      : index === 1
                      ? "#00bfff"
                      : "#ff69b4",
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  padding: "4px 8px",
                  borderRadius: "16px",
                  border: `1px solid ${
                    index === 0
                      ? "rgba(255, 215, 0, 0.3)"
                      : index === 1
                      ? "rgba(0, 191, 255, 0.3)"
                      : "rgba(255, 105, 180, 0.3)"
                  }`,
                  backdropFilter: "blur(10px)",
                  textShadow: `0 0 4px ${
                    index === 0
                      ? "#ffd700"
                      : index === 1
                      ? "#00bfff"
                      : "#ff69b4"
                  }`,
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Enhanced Menu Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "400px",
            width: "100%",
            position: "relative",
            zIndex: 10,
          }}
        >
          <button
            onClick={() => (!assetsLoaded ? null : setCurrentScreen("game"))}
            disabled={!assetsLoaded}
            style={{
              fontSize: "clamp(16px, 3.5vw, 20px)",
              fontWeight: "700",
              fontFamily: '"Orbitron", sans-serif',
              padding: "14px 32px",
              borderRadius: "12px",
              border: assetsLoaded ? "2px solid #ffd700" : "2px solid #666",
              background: assetsLoaded
                ? "linear-gradient(135deg, #ffd700 0%, #ffb000 50%, #ff8c00 100%)"
                : "linear-gradient(135deg, #333, #222)",
              color: assetsLoaded ? "#000" : "#666",
              cursor: assetsLoaded ? "pointer" : "not-allowed",
              textShadow: assetsLoaded ? "0 2px 4px rgba(0,0,0,0.4)" : "none",
              boxShadow: assetsLoaded
                ? "0 0 30px rgba(255, 215, 0, 0.4), 0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
                : "0 4px 10px rgba(0,0,0,0.2)",
              transform: "scale(1)",
              transition: "all 0.3s ease",
              letterSpacing: "2px",
              textTransform: "uppercase",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (assetsLoaded) {
                e.currentTarget.style.transform =
                  "scale(1.05) translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 0 40px rgba(255, 215, 0, 0.6), 0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (assetsLoaded) {
                e.currentTarget.style.transform = "scale(1) translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(255, 215, 0, 0.4), 0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)";
              }
            }}
          >
            {assetsLoaded ? "START MISSION" : "LOADING ASSETS..."}
          </button>

          {/* Quick Stats */}
          {assetsLoaded && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: "8px",
                fontSize: "clamp(10px, 2vw, 12px)",
                color: "#888",
              }}
            >
              <span>50 Levels</span>
              <span>10+ Boss Types</span>
              <span>9 Power-ups</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCurrentScreen("guide")}
          style={{
            marginTop: "20px",
            padding: "16px 48px",
            fontSize: "14px",
            fontWeight: "600",
            backgroundColor: "rgba(0, 191, 255, 0.1)",
            border: "1px solid rgba(0, 191, 255, 0.3)",
            borderRadius: "12px",
            color: "#00bfff",
            cursor: "pointer",
            fontFamily: '"Orbitron", sans-serif',
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
            position: "relative",
            zIndex: 9999,
            pointerEvents: "auto",
            letterSpacing: "2px",
            textTransform: "uppercase",
            boxShadow:
              "0 0 15px rgba(0, 191, 255, 0.2), 0 3px 10px rgba(0,0,0,0.2)",
            minWidth: "200px",
            width: "100%",
            maxWidth: "300px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 191, 255, 0.2)";
            e.currentTarget.style.transform = "scale(1.05) translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "0 0 25px rgba(0, 191, 255, 0.4), 0 5px 15px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 191, 255, 0.1)";
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 0 15px rgba(0, 191, 255, 0.2), 0 3px 10px rgba(0,0,0,0.2)";
          }}
        >
          📖 GAME GUIDE
        </button>

        {/* Leaderboard Panel */}
        <div
          style={{
            marginTop: "24px",
            maxWidth: "600px",
            width: "100%",
            position: "relative",
            zIndex: 10,
          }}
        >
          <LeaderboardComponent />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style jsx global>{`
        /* Enable scrolling */
        body,
        html {
          overflow-y: auto !important;
          overflow-x: hidden !important;
          height: auto !important;
          min-height: 100vh !important;
        }

        /* Static styles only - animations removed */
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#000",
          color: "#fff",
          fontFamily: '"Orbitron", sans-serif',
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {currentScreen === "loading" && <LoadingScreen />}
        {currentScreen === "mainMenu" && <MainMenu />}
        {currentScreen === "guide" && (
          <GameGuide onBackToMenu={() => setCurrentScreen("mainMenu")} />
        )}
        {currentScreen === "game" && (
          <SpaceImpactGame onBackToMenu={() => setCurrentScreen("mainMenu")} />
        )}
      </main>
    </>
  );
}
