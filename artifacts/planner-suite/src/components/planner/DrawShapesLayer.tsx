"use client";

import { Line, Rect, Ellipse, Text, Group } from 'react-konva';
import type { DrawnShape } from './canvas-types';

interface DrawShapesLayerProps {
  shapes: DrawnShape[];
  previewShape?: DrawnShape;
  selectedShapeId: string | null;
  onSelectShape: (id: string | null) => void;
  pxPerCm: number;
  roomOffsetX: number;
  roomOffsetY: number;
  isDrawMode: boolean;
}

function RenderShape({
  shape,
  isSelected,
  onSelect,
  pxPerCm,
  roomOffsetX,
  roomOffsetY,
  isPreview,
  listening,
}: {
  shape: DrawnShape;
  isSelected: boolean;
  onSelect?: () => void;
  pxPerCm: number;
  roomOffsetX: number;
  roomOffsetY: number;
  isPreview?: boolean;
  listening?: boolean;
}) {
  const x1 = roomOffsetX + shape.x1 * pxPerCm;
  const y1 = roomOffsetY + shape.y1 * pxPerCm;
  const x2 = roomOffsetX + shape.x2 * pxPerCm;
  const y2 = roomOffsetY + shape.y2 * pxPerCm;
  const opacity = isPreview ? 0.6 : 1;
  const selectionDash = isSelected ? [6, 3] : undefined;

  if (shape.type === 'line') {
    return (
      <Line
        points={[x1, y1, x2, y2]}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        hitStrokeWidth={12}
        opacity={opacity}
        dash={selectionDash}
        listening={listening !== false}
        onClick={onSelect}
        onTap={onSelect}
      />
    );
  }

  if (shape.type === 'rect') {
    const rx = Math.min(x1, x2);
    const ry = Math.min(y1, y2);
    const rw = Math.abs(x2 - x1);
    const rh = Math.abs(y2 - y1);
    return (
      <Rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        stroke={isSelected ? '#3b82f6' : shape.stroke}
        strokeWidth={isSelected ? shape.strokeWidth + 1 : shape.strokeWidth}
        fill={shape.fill === 'transparent' ? undefined : shape.fill}
        opacity={opacity}
        dash={selectionDash}
        listening={listening !== false}
        onClick={onSelect}
        onTap={onSelect}
      />
    );
  }

  if (shape.type === 'ellipse') {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const rx = Math.abs(x2 - x1) / 2;
    const ry = Math.abs(y2 - y1) / 2;
    return (
      <Ellipse
        x={cx}
        y={cy}
        radiusX={rx}
        radiusY={ry}
        stroke={isSelected ? '#3b82f6' : shape.stroke}
        strokeWidth={isSelected ? shape.strokeWidth + 1 : shape.strokeWidth}
        fill={shape.fill === 'transparent' ? undefined : shape.fill}
        opacity={opacity}
        dash={selectionDash}
        listening={listening !== false}
        onClick={onSelect}
        onTap={onSelect}
      />
    );
  }

  if (shape.type === 'text') {
    return (
      <Text
        x={x1}
        y={y1}
        text={shape.text || ''}
        fontSize={shape.fontSize || 14}
        fill={shape.stroke}
        fontFamily="Inter, system-ui, sans-serif"
        opacity={opacity}
        listening={listening !== false}
        onClick={onSelect}
        onTap={onSelect}
      />
    );
  }

  return null;
}

export function DrawShapesLayer({
  shapes,
  previewShape,
  selectedShapeId,
  onSelectShape,
  pxPerCm,
  roomOffsetX,
  roomOffsetY,
  isDrawMode,
}: DrawShapesLayerProps) {
  return (
    <Group>
      {shapes.map(shape => (
        <RenderShape
          key={shape.id}
          shape={shape}
          isSelected={shape.id === selectedShapeId}
          onSelect={() => onSelectShape(shape.id)}
          pxPerCm={pxPerCm}
          roomOffsetX={roomOffsetX}
          roomOffsetY={roomOffsetY}
          listening={!isDrawMode}
        />
      ))}
      {previewShape && (
        <RenderShape
          shape={previewShape}
          isSelected={false}
          pxPerCm={pxPerCm}
          roomOffsetX={roomOffsetX}
          roomOffsetY={roomOffsetY}
          isPreview
          listening={false}
        />
      )}
    </Group>
  );
}
