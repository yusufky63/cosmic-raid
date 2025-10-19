export type CosmosRaidGameData = {
  score: number;
  level: number;
  time: number; // seconds
  lives: number;
  playerAddress: string;
};

export type LeaderboardEntry = {
  address: `0x${string}`;
  score: number;
  level: number;
  time: number;
  rank?: number;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
};

export type LeaderboardState = {
  isLoading: boolean;
  entries: LeaderboardEntry[];
  error?: string;
};

export type ScoreSignature = {
  v: number;
  r: string;
  s: string;
  deadline: number;
  nonce: string;
};

export type ScoreSubmissionData = {
  signature: ScoreSignature;
  score: number;
  level: number;
  time: number;
};

export type ContractPlayerScore = {
  bestScore: bigint;
  bestLevel: bigint;
  bestTime: bigint;
  exists: boolean;
};

export type PlayerStats = {
  bestScore: number;
  bestLevel: number;
  bestTime: number;
  enemiesKilled: number;
  bossesDefeated: number;
  exists: boolean;
};

export type SaveScoreModalProps = {
  isOpen: boolean;
  onClose: () => void;
  gameData: {
    score: number;
    level: number;
    gameStartTime: number;
  };
  playerAddress?: `0x${string}`;
};
