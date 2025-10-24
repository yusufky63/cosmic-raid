'use client';

import { useEffect, useState, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

type MiniAppUser = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
};

export const useFarcaster = () => {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<MiniAppUser | undefined>();

  useEffect(() => {
    const initialize = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();
        setIsInMiniApp(inMiniApp);

        if (inMiniApp) {
          const context = (sdk as { context?: { user?: MiniAppUser } }).context;
          setUser(context?.user);
          await sdk.actions.ready();
        }
      } catch (err) {
        console.warn('Farcaster init warning:', err);

      } finally {
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  const composeCast = useCallback(async (score: number, level: number) => {
    try {
      const inMiniApp = await sdk.isInMiniApp();
      if (!inMiniApp) return;

      await sdk.actions.composeCast({
        text: `Just scored ${score} points and reached level ${level} in Space Impact! Can you beat my score?`,
        embeds: [window.location.href],
      });
    } catch (error) {
      console.error('Failed to compose cast:', error);
    }
  }, []);

  const getEthereumProvider = useCallback(() => {
    try {
      if (!isInMiniApp) return null;
      return sdk.wallet.getEthereumProvider();
    } catch (error) {
      console.error('Failed to get Ethereum provider:', error);
      return null;
    }
  }, [isInMiniApp]);

  const addMiniApp = useCallback(async () => {
    try {
      const inMiniApp = await sdk.isInMiniApp();
      if (!inMiniApp) {
        console.warn('Not in mini app environment');
        return false;
      }

      await sdk.actions.addMiniApp();
      return true;
    } catch (error) {
      console.error('Failed to add mini app:', error);
      return false;
    }
  }, []);

  return {
    isInMiniApp,
    isReady,
    user,
    sdk,
    composeCast,
    getEthereumProvider,
    addMiniApp,
  };
};

