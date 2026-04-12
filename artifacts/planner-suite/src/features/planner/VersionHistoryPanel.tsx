"use client";

import { useState, useCallback } from "react";
import { usePlanVersions, type PlanVersion } from "@/hooks/use-plan-versions";
import { usePlannerStore } from "./planner-store";
import { format } from "date-fns";
import {
  History, X, Save, RotateCcw, GitCompare, Loader2,
  ChevronRight, Clock, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VersionHistoryPanelProps {
  planId: number | null;
  onRestore?: (documentJson: string) => void;
  getCurrentDocument?: () => string | null;
}

export function VersionHistoryPanel({ planId, onRestore, getCurrentDocument }: VersionHistoryPanelProps) {
  const { showVersionHistory, toggleVersionHistory } = usePlannerStore();
  const { versions, loading, error, createVersion, restoreVersion, refetch } = usePlanVersions(planId);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  const handleSave = useCallback(async () => {
    if (!planId) return;
    setSaving(true);
    const currentDoc = getCurrentDocument?.() ?? undefined;
    await createVersion(saveName || undefined, currentDoc);
    setSaveName("");
    setSaving(false);
  }, [planId, saveName, createVersion, getCurrentDocument]);

  const handleRestore = useCallback(async (versionId: number) => {
    setRestoringId(versionId);
    const plan = await restoreVersion(versionId);
    if (plan && onRestore) {
      onRestore(plan.documentJson);
    }
    setRestoringId(null);
  }, [restoreVersion, onRestore]);

  const toggleCompare = useCallback((id: number) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 2) {
          const first = [...next][0];
          next.delete(first);
        }
        next.add(id);
      }
      return next;
    });
  }, []);

  if (!showVersionHistory) return null;

  const compareArray = [...compareIds];

  return (
    <div className="absolute right-0 top-12 bottom-8 z-40 w-80 border-l bg-white/95 backdrop-blur-md shadow-xl flex flex-col animate-in slide-in-from-right-4 duration-200">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-white">
        <History className="h-4 w-4 text-navy" />
        <span className="text-sm font-semibold text-navy-text flex-1">Version History</span>
        <button
          onClick={toggleVersionHistory}
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-navy/10 text-navy-text/50 hover:text-navy transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-4 py-3 border-b bg-slate-50/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Snapshot name (optional)"
            className="flex-1 h-8 rounded-md border bg-white px-2.5 text-xs text-navy-text outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-all"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={saving || !planId}
            className={cn(
              "h-8 px-3 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
              "bg-navy text-white hover:bg-navy/90 disabled:opacity-40",
            )}
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </button>
        </div>
      </div>

      {compareArray.length === 2 && (
        <div className="px-4 py-2 border-b bg-blue-50/80">
          <button
            onClick={() => setShowCompare(true)}
            className="w-full h-8 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5"
          >
            <GitCompare className="h-3 w-3" />
            Compare Selected ({compareArray.length}/2)
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-navy/30" />
          </div>
        )}

        {error && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-red-500">{error}</p>
            <button onClick={refetch} className="mt-2 text-xs text-navy underline">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && versions.length === 0 && (
          <div className="px-4 py-12 text-center">
            <FileText className="h-8 w-8 text-navy/15 mx-auto mb-3" />
            <p className="text-xs text-navy-text/40 font-medium">No versions saved yet</p>
            <p className="text-[10px] text-navy-text/30 mt-1">
              Save a snapshot to track your progress
            </p>
          </div>
        )}

        {versions.map((v) => (
          <VersionItem
            key={v.id}
            version={v}
            isRestoring={restoringId === v.id}
            isCompareSelected={compareIds.has(v.id)}
            onRestore={() => handleRestore(v.id)}
            onToggleCompare={() => toggleCompare(v.id)}
          />
        ))}
      </div>

      {showCompare && compareArray.length === 2 && planId && (
        <VersionCompareModal
          planId={planId}
          versionA={versions.find((v) => v.id === compareArray[0])!}
          versionB={versions.find((v) => v.id === compareArray[1])!}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}

function VersionThumbnail({ documentJson }: { documentJson: string }) {
  const items = parseItems(documentJson);
  if (items.length === 0) return null;

  const allX = items.map((i) => i.x);
  const allY = items.map((i) => i.y);
  const allR = items.map((i) => i.x + i.widthCm);
  const allB = items.map((i) => i.y + i.depthCm);
  const minX = Math.min(...allX) - 20;
  const minY = Math.min(...allY) - 20;
  const maxX = Math.max(...allR) + 20;
  const maxY = Math.max(...allB) + 20;
  const viewW = maxX - minX || 200;
  const viewH = maxY - minY || 200;

  return (
    <svg viewBox={`${minX} ${minY} ${viewW} ${viewH}`} className="w-full h-12 rounded bg-slate-50 border border-slate-100 mt-1.5">
      {items.map((item) => (
        <rect
          key={item.id}
          x={item.x}
          y={item.y}
          width={item.widthCm}
          height={item.depthCm}
          fill={item.color + "30"}
          stroke={item.color}
          strokeWidth={Math.max(viewW, viewH) * 0.005}
          rx={1}
        />
      ))}
    </svg>
  );
}

function VersionItem({
  version,
  isRestoring,
  isCompareSelected,
  onRestore,
  onToggleCompare,
}: {
  version: PlanVersion;
  isRestoring: boolean;
  isCompareSelected: boolean;
  onRestore: () => void;
  onToggleCompare: () => void;
}) {
  const itemCount = (() => {
    try {
      const doc = JSON.parse(version.documentJson);
      const items = doc?.items || doc?.furniture || [];
      return Array.isArray(items) ? items.length : 0;
    } catch {
      return 0;
    }
  })();

  return (
    <div className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center text-[10px] font-bold text-navy/60">
            v{version.versionNumber}
          </div>
          <input
            type="checkbox"
            checked={isCompareSelected}
            onChange={onToggleCompare}
            className="mt-2 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
            title="Select for comparison"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-navy-text truncate">{version.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-navy-text/40 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {format(new Date(version.createdAt), "MMM d, h:mm a")}
            </span>
            {itemCount > 0 && (
              <span className="text-[10px] text-navy-text/40">
                {itemCount} items
              </span>
            )}
          </div>
          <VersionThumbnail documentJson={version.documentJson} />
        </div>
        <button
          onClick={onRestore}
          disabled={isRestoring}
          className="opacity-0 group-hover:opacity-100 h-7 px-2 rounded text-[10px] font-semibold text-navy bg-navy/5 hover:bg-navy/10 transition-all flex items-center gap-1"
        >
          {isRestoring ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RotateCcw className="h-3 w-3" />
          )}
          Restore
        </button>
      </div>
    </div>
  );
}

function VersionCompareModal({
  planId,
  versionA,
  versionB,
  onClose,
}: {
  planId: number;
  versionA: PlanVersion;
  versionB: PlanVersion;
  onClose: () => void;
}) {
  const [left, right] = versionA.versionNumber < versionB.versionNumber
    ? [versionA, versionB]
    : [versionB, versionA];

  const leftItems = parseItems(left.documentJson);
  const rightItems = parseItems(right.documentJson);

  const diff = computeDiff(leftItems, rightItems);

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-5xl h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b bg-slate-50">
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-navy" />
            <span className="text-sm font-semibold text-navy-text">Version Comparison</span>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-navy/10 text-navy-text/50 hover:text-navy transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 px-5 py-2 border-b text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-300" />
            <span className="text-navy-text/60">Removed ({diff.removed.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-300" />
            <span className="text-navy-text/60">Added ({diff.added.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            <span className="text-navy-text/60">Modified ({diff.modified.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
            <span className="text-navy-text/60">Unchanged ({diff.unchanged.length})</span>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 border-r overflow-auto">
            <div className="px-4 py-2 bg-red-50/50 border-b sticky top-0">
              <p className="text-xs font-semibold text-navy-text">
                v{left.versionNumber} — {left.name}
              </p>
              <p className="text-[10px] text-navy-text/40">
                {format(new Date(left.createdAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
            <CompareCanvas items={leftItems} diff={diff} side="left" />
          </div>
          <div className="flex-1 overflow-auto">
            <div className="px-4 py-2 bg-green-50/50 border-b sticky top-0">
              <p className="text-xs font-semibold text-navy-text">
                v{right.versionNumber} — {right.name}
              </p>
              <p className="text-[10px] text-navy-text/40">
                {format(new Date(right.createdAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
            <CompareCanvas items={rightItems} diff={diff} side="right" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DiffItem {
  id: string;
  name: string;
  x: number;
  y: number;
  widthCm: number;
  depthCm: number;
  color: string;
  rotation?: number;
}

interface DiffResult {
  added: DiffItem[];
  removed: DiffItem[];
  modified: { old: DiffItem; new: DiffItem }[];
  unchanged: DiffItem[];
}

function parseTldrawItems(store: Record<string, any>): DiffItem[] {
  return Object.values(store)
    .filter((r: any) => r.typeName === "shape" && r.id && typeof r.x === "number")
    .map((shape: any) => ({
      id: shape.id,
      name: shape.props?.text || shape.meta?.label || shape.type || "Shape",
      x: shape.x,
      y: shape.y,
      widthCm: shape.props?.w || shape.props?.width || 60,
      depthCm: shape.props?.h || shape.props?.height || 60,
      color: shape.props?.fill === "none" ? "#6b7280" : (shape.props?.color || "#6b7280"),
      rotation: shape.rotation || 0,
    }));
}

function parseItems(documentJson: string): DiffItem[] {
  try {
    const doc = JSON.parse(documentJson);

    if (doc?.store && typeof doc.store === "object") {
      return parseTldrawItems(doc.store);
    }

    const items = doc?.items || doc?.furniture || [];
    if (!Array.isArray(items)) return [];
    return items.filter((item: any) => item.instanceId || item.id).map((item: any) => ({
      id: item.instanceId || item.id,
      name: item.name || "Item",
      x: item.x || 0,
      y: item.y || 0,
      widthCm: item.widthCm || item.width || 60,
      depthCm: item.depthCm || item.depth || 60,
      color: item.color || "#6b7280",
      rotation: item.rotation || 0,
    }));
  } catch {
    return [];
  }
}

function computeDiff(leftItems: DiffItem[], rightItems: DiffItem[]): DiffResult {
  const leftMap = new Map(leftItems.map((i) => [i.id, i]));
  const rightMap = new Map(rightItems.map((i) => [i.id, i]));

  const added: DiffItem[] = [];
  const removed: DiffItem[] = [];
  const modified: { old: DiffItem; new: DiffItem }[] = [];
  const unchanged: DiffItem[] = [];

  for (const [id, item] of leftMap) {
    if (!rightMap.has(id)) {
      removed.push(item);
    } else {
      const rightItem = rightMap.get(id)!;
      const changed =
        item.x !== rightItem.x ||
        item.y !== rightItem.y ||
        item.widthCm !== rightItem.widthCm ||
        item.depthCm !== rightItem.depthCm ||
        item.rotation !== rightItem.rotation;
      if (changed) {
        modified.push({ old: item, new: rightItem });
      } else {
        unchanged.push(item);
      }
    }
  }

  for (const [id, item] of rightMap) {
    if (!leftMap.has(id)) {
      added.push(item);
    }
  }

  return { added, removed, modified, unchanged };
}

function CompareCanvas({
  items,
  diff,
  side,
}: {
  items: DiffItem[];
  diff: DiffResult;
  side: "left" | "right";
}) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-navy-text/30">
        No items in this version
      </div>
    );
  }

  const allX = items.map((i) => i.x);
  const allY = items.map((i) => i.y);
  const allR = items.map((i) => Math.max(i.x + i.widthCm, i.x));
  const allB = items.map((i) => Math.max(i.y + i.depthCm, i.y));

  const minX = Math.min(...allX) - 50;
  const minY = Math.min(...allY) - 50;
  const maxX = Math.max(...allR) + 50;
  const maxY = Math.max(...allB) + 50;
  const viewW = maxX - minX || 400;
  const viewH = maxY - minY || 400;

  const removedIds = new Set(diff.removed.map((i) => i.id));
  const addedIds = new Set(diff.added.map((i) => i.id));
  const modifiedIds = new Set(diff.modified.map((m) => m.old.id));

  return (
    <div className="p-4">
      <svg viewBox={`${minX} ${minY} ${viewW} ${viewH}`} className="w-full h-auto max-h-[60vh]">
        <rect x={minX} y={minY} width={viewW} height={viewH} fill="#fafafa" />
        {items.map((item) => {
          let strokeColor = "#d1d5db";
          let fillColor = item.color + "20";
          let strokeWidth = 1;

          if (side === "left" && removedIds.has(item.id)) {
            strokeColor = "#ef4444";
            fillColor = "#fecaca40";
            strokeWidth = 2;
          } else if (side === "right" && addedIds.has(item.id)) {
            strokeColor = "#22c55e";
            fillColor = "#bbf7d040";
            strokeWidth = 2;
          } else if (modifiedIds.has(item.id)) {
            strokeColor = "#f59e0b";
            fillColor = "#fef3c740";
            strokeWidth = 2;
          }

          return (
            <g key={item.id}>
              <rect
                x={item.x}
                y={item.y}
                width={item.widthCm}
                height={item.depthCm}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                rx={2}
              />
              <text
                x={item.x + item.widthCm / 2}
                y={item.y + item.depthCm / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={Math.min(item.widthCm, item.depthCm) * 0.15}
                fill="#374151"
                className="select-none"
              >
                {item.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
