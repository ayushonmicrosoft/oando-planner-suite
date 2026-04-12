import { useState, useCallback, useRef } from "react";

export function useUndoRedo<T>(initial: T) {
  const historyRef = useRef<T[]>([initial]);
  const [index, setIndex] = useState(0);
  const [, forceRender] = useState(0);

  const current = historyRef.current[index];

  const push = useCallback((val: T | ((prev: T) => T)) => {
    const history = historyRef.current;
    const curIdx = historyRef.current.length > 0 ? Math.min(index, history.length - 1) : 0;
    const resolved = typeof val === "function" ? (val as (prev: T) => T)(history[curIdx]) : val;
    const trimmed = history.slice(0, curIdx + 1);
    trimmed.push(resolved);
    historyRef.current = trimmed;
    const newIdx = trimmed.length - 1;
    setIndex(newIdx);
    forceRender((n) => n + 1);
  }, [index]);

  const undo = useCallback(() => {
    setIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setIndex((prev) => Math.min(historyRef.current.length - 1, prev + 1));
  }, []);

  const canUndo = index > 0;
  const canRedo = index < historyRef.current.length - 1;

  const reset = useCallback((val: T) => {
    historyRef.current = [val];
    setIndex(0);
    forceRender((n) => n + 1);
  }, []);

  return { current, set: push, undo, redo, canUndo, canRedo, reset };
}
