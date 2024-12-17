import React, { createContext, useContext, useState } from 'react';

type PlayerContextType = {
  currentPlayerId: string | null;
  setCurrentPlayerId: (id: string | null) => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  return (
    <PlayerContext.Provider value={{ currentPlayerId, setCurrentPlayerId }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
} 