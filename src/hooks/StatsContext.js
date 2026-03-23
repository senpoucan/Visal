import React, { createContext, useContext } from 'react';
import { useStats } from '../hooks/useStats';

const StatsContext = createContext(null);

export function StatsProvider({ children }) {
  const stats = useStats();
  return <StatsContext.Provider value={stats}>{children}</StatsContext.Provider>;
}

export function useStatsContext() {
  return useContext(StatsContext);
}
