"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MousePointer2, Minus, Square, CircleIcon, Type, Trash2,
} from 'lucide-react';
import type { DrawToolType } from './canvas-types';

interface AnnotateToolbarProps {
  drawTool: DrawToolType;
  onSetDrawTool: (tool: DrawToolType) => void;
  strokeColor: string;
  onSetStrokeColor: (color: string) => void;
  fillColor: string;
  onSetFillColor: (color: string) => void;
  strokeWidth: number;
  onSetStrokeWidth: (width: number) => void;
  hasSelectedShape: boolean;
  onDeleteSelected: () => void;
}

const TOOLS: { id: DrawToolType; label: string; icon: React.ReactNode }[] = [
  { id: 'select', label: 'Select', icon: <MousePointer2 className="w-3.5 h-3.5" /> },
  { id: 'draw-line', label: 'Line', icon: <Minus className="w-3.5 h-3.5" /> },
  { id: 'draw-rect', label: 'Rect', icon: <Square className="w-3.5 h-3.5" /> },
  { id: 'draw-ellipse', label: 'Ellipse', icon: <CircleIcon className="w-3.5 h-3.5" /> },
  { id: 'draw-text', label: 'Text', icon: <Type className="w-3.5 h-3.5" /> },
];

export function AnnotateToolbar({
  drawTool,
  onSetDrawTool,
  strokeColor,
  onSetStrokeColor,
  fillColor,
  onSetFillColor,
  strokeWidth,
  onSetStrokeWidth,
  hasSelectedShape,
  onDeleteSelected,
}: AnnotateToolbarProps) {
  const isDrawMode = drawTool !== 'select';

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5">
        {TOOLS.map(t => (
          <Button
            key={t.id}
            variant={drawTool === t.id ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => onSetDrawTool(t.id)}
            title={t.label}
          >
            {t.icon}
          </Button>
        ))}
      </div>

      {isDrawMode && (
        <>
          <div className="w-px h-5 bg-border/40 mx-0.5" />
          <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-0.5 px-1.5">
            <label className="text-[10px] text-muted-foreground mr-0.5">Stroke</label>
            <input
              type="color"
              value={strokeColor}
              onChange={e => onSetStrokeColor(e.target.value)}
              className="w-6 h-6 p-0 border border-border/50 rounded cursor-pointer"
              aria-label="Stroke color"
            />
            <label className="text-[10px] text-muted-foreground ml-1.5 mr-0.5">Fill</label>
            <input
              type="color"
              value={fillColor === 'transparent' ? '#ffffff' : fillColor}
              onChange={e => onSetFillColor(e.target.value)}
              className="w-6 h-6 p-0 border border-border/50 rounded cursor-pointer"
              aria-label="Fill color"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1 text-[9px] text-muted-foreground"
              onClick={() => onSetFillColor('transparent')}
            >
              No fill
            </Button>
            <label className="text-[10px] text-muted-foreground ml-1.5 mr-0.5">W</label>
            <select
              aria-label="Stroke width"
              value={strokeWidth}
              onChange={e => onSetStrokeWidth(Number(e.target.value))}
              className="h-6 rounded border border-border/50 bg-transparent px-1 text-[10px]"
            >
              {[1, 2, 3, 5, 8].map(w => (
                <option key={w} value={w}>{w}px</option>
              ))}
            </select>
          </div>
        </>
      )}

      {hasSelectedShape && (
        <>
          <div className="w-px h-5 bg-border/40 mx-0.5" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={onDeleteSelected}
            title="Delete shape (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </>
      )}
    </div>
  );
}
