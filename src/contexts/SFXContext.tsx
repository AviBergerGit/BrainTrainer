import React, { createContext, useContext } from 'react';
import { useSFX } from '../hooks/useSFX';

type SFXType = ReturnType<typeof useSFX>;

const SFXContext = createContext<SFXType | null>(null);

export function SFXProvider({ children }: { children: React.ReactNode }) {
  const sfx = useSFX();
  return <SFXContext.Provider value={sfx}>{children}</SFXContext.Provider>;
}

export function useSFXContext(): SFXType {
  const ctx = useContext(SFXContext);
  if (!ctx) throw new Error('useSFXContext must be used inside SFXProvider');
  return ctx;
}
