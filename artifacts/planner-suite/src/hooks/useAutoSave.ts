import { useEffect, useRef, useCallback, useState } from "react";

const AUTOSAVE_INTERVAL = 30000;

export function useAutoSave<T>(
  moduleKey: string,
  getState: () => T,
  restoreState: (state: T) => void,
  hasContent: () => boolean,
  isLoadingFromApi?: boolean,
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryData, setRecoveryData] = useState<T | null>(null);
  const hasCheckedRecovery = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const storageKey = `planner-autosave-${moduleKey}`;

  useEffect(() => {
    if (hasCheckedRecovery.current) return;
    if (isLoadingFromApi) return;

    hasCheckedRecovery.current = true;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { data: T; timestamp: number };
        if (parsed.data && !hasContent()) {
          setRecoveryData(parsed.data);
          setShowRecovery(true);
        }
      }
    } catch {}
  }, [isLoadingFromApi]);

  const doAutoSave = useCallback(() => {
    if (!hasContent()) return;
    try {
      const state = getState();
      localStorage.setItem(storageKey, JSON.stringify({ data: state, timestamp: Date.now() }));
      setLastSaved(new Date());
    } catch {}
  }, [getState, hasContent, storageKey]);

  useEffect(() => {
    intervalRef.current = setInterval(doAutoSave, AUTOSAVE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [doAutoSave]);

  const acceptRecovery = useCallback(() => {
    if (recoveryData) {
      restoreState(recoveryData);
    }
    setShowRecovery(false);
    setRecoveryData(null);
  }, [recoveryData, restoreState]);

  const dismissRecovery = useCallback(() => {
    setShowRecovery(false);
    setRecoveryData(null);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const clearAutoSave = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { lastSaved, showRecovery, acceptRecovery, dismissRecovery, clearAutoSave };
}
