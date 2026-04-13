import { useRef, useEffect, useMemo, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Text, Transformer, Group, Path, Circle } from 'react-konva';
import type Konva from 'konva';
import type { PlacedItem } from '@/hooks/use-canvas-planner';
import type { UnifiedDocument } from '@/lib/unified-document';
import { PlanBackgroundLayers } from '@/components/plan-background-layers';
import { getFurnitureShapeDef } from '@/lib/furniture-shapes';
import type { AlignmentGuide, DrawnShape } from './canvas-types';
import { GRID_CM, ALIGNMENT_GUIDE_COLOR } from './canvas-types';
import { DrawShapesLayer } from './DrawShapesLayer';

function FurnitureShape({
  item,
  isSelected,
  onSelect,
  onChange,
  onDragMove,
  pxPerCm,
  gridSnap,
  gridSize,
}: {
  item: PlacedItem;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange: (changes: Partial<PlacedItem>) => void;
  onDragMove?: (item: PlacedItem, x: number, y: number) => void;
  pxPerCm: number;
  gridSnap: boolean;
  gridSize: number;
}) {
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const snapVal = (v: number) => gridSnap ? Math.round(v / gridSize) * gridSize : v;

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (onDragMove) {
      const node = e.target;
      const xCm = node.x() / pxPerCm;
      const yCm = node.y() / pxPerCm;
      onDragMove(item, xCm, yCm);
    }
  };

  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const xCm = snapVal(node.x() / pxPerCm);
    const yCm = snapVal(node.y() / pxPerCm);
    onChange({ x: xCm, y: yCm });
  };

  const onTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    const sx = node.scaleX();
    const sy = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const newWidthCm = Math.max(5, Math.round((node.width() * sx) / pxPerCm));
    const newDepthCm = Math.max(5, Math.round((node.height() * sy) / pxPerCm));
    const xCm = snapVal(node.x() / pxPerCm);
    const yCm = snapVal(node.y() / pxPerCm);
    onChange({
      x: xCm,
      y: yCm,
      widthCm: newWidthCm,
      depthCm: newDepthCm,
      rotation: Math.round(node.rotation()),
    });
  };

  const wPx = item.widthCm * pxPerCm;
  const hPx = item.depthCm * pxPerCm;
  const xPx = item.x * pxPerCm;
  const yPx = item.y * pxPerCm;

  const shapeDef = useMemo(
    () => getFurnitureShapeDef(item.category || '', item.shape || 'rect', wPx, hPx, item.color),
    [item.category, item.shape, wPx, hPx, item.color]
  );

  const groupProps = {
    ref: shapeRef,
    x: xPx,
    y: yPx,
    width: wPx,
    height: hPx,
    rotation: item.rotation,
    draggable: !item.locked,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd,
    onDragMove: handleDragMove,
    onTransformEnd,
    opacity: item.opacity,
    name: `item-${item.instanceId}`,
  };

  const selectionStroke = isSelected ? 'hsl(221, 83%, 53%)' : undefined;

  return (
    <Group>
      <Group {...groupProps}>
        {isSelected && (
          <Rect
            x={-2}
            y={-2}
            width={wPx + 4}
            height={hPx + 4}
            stroke="hsl(221, 83%, 53%)"
            strokeWidth={1.5}
            cornerRadius={4}
            dash={[4, 3]}
            listening={false}
            shadowColor="hsl(221, 83%, 53%)"
            shadowBlur={6}
            shadowOpacity={0.2}
          />
        )}

        {shapeDef.paths.map((pathData, i) => (
          <Path
            key={i}
            data={pathData}
            fill={shapeDef.fills[i]}
            stroke={selectionStroke || shapeDef.strokes?.[i] || 'rgba(0,0,0,0.1)'}
            strokeWidth={isSelected ? 1.5 : (shapeDef.strokeWidths?.[i] || 0.5)}
          />
        ))}

        {pxPerCm > 0.3 && (
          <Text
            x={0}
            y={hPx / 2 - 6}
            width={wPx}
            height={14}
            text={item.name?.substring(0, 14) || ''}
            fontSize={Math.min(11, hPx * 0.35)}
            fill="#fff"
            fontFamily="Inter, system-ui, sans-serif"
            fontStyle="600"
            align="center"
            verticalAlign="middle"
            listening={false}
            shadowColor="rgba(0,0,0,0.5)"
            shadowBlur={2}
          />
        )}

        {pxPerCm > 0.3 && (
          <Text
            x={0}
            y={hPx / 2 + 6}
            width={wPx}
            height={10}
            text={`${item.widthCm}×${item.depthCm}`}
            fontSize={8}
            fontFamily="Inter, system-ui, sans-serif"
            fill="rgba(255,255,255,0.8)"
            align="center"
            verticalAlign="middle"
            listening={false}
            shadowColor="rgba(0,0,0,0.4)"
            shadowBlur={1}
          />
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={!item.locked}
          resizeEnabled={!item.locked}
          enabledAnchors={item.locked ? [] : [
            'top-left', 'top-right', 'bottom-left', 'bottom-right',
            'middle-left', 'middle-right', 'top-center', 'bottom-center',
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) return oldBox;
            return newBox;
          }}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotationSnapTolerance={5}
          anchorCornerRadius={2}
          anchorStrokeColor="hsl(221, 83%, 53%)"
          anchorFill="#fff"
          borderStroke="hsl(221, 83%, 53%)"
          borderStrokeWidth={1.5}
        />
      )}
    </Group>
  );
}

interface CanvasStageProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  stageSize: { width: number; height: number };
  zoom: number;
  panOffset: { x: number; y: number };
  onWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onMouseUp: () => void;
  showGrid: boolean;
  roomWidthCm: number;
  roomDepthCm: number;
  roomOffsetX: number;
  roomOffsetY: number;
  roomWidthPx: number;
  roomHeightPx: number;
  pxPerCm: number;
  showDimensions: boolean;
  unifiedDoc: UnifiedDocument;
  sortedItems: PlacedItem[];
  selectedItemIds: Set<string>;
  onItemSelect: (instanceId: string, e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onItemChange: (instanceId: string, changes: Partial<PlacedItem>) => void;
  onDragMoveItem: (item: PlacedItem, x: number, y: number) => void;
  setAlignmentGuides: (guides: AlignmentGuide[]) => void;
  alignmentGuides: AlignmentGuide[];
  gridSnap: boolean;
  measurePoints: { x: number; y: number }[];
  drawnShapes: DrawnShape[];
  previewShape?: DrawnShape | null;
  selectedDrawShapeId?: string | null;
  onSelectDrawShape?: (id: string | null) => void;
  isDrawMode?: boolean;
}

export function CanvasStage({
  stageRef, stageSize,
  zoom, panOffset,
  onWheel, onMouseDown, onMouseMove, onMouseUp,
  showGrid, roomWidthCm, roomDepthCm,
  roomOffsetX, roomOffsetY, roomWidthPx, roomHeightPx,
  pxPerCm, showDimensions,
  unifiedDoc, sortedItems, selectedItemIds,
  onItemSelect, onItemChange, onDragMoveItem,
  setAlignmentGuides, alignmentGuides,
  gridSnap, measurePoints, drawnShapes,
  previewShape, selectedDrawShapeId, onSelectDrawShape, isDrawMode,
}: CanvasStageProps) {
  const gridLines: React.ReactElement[] = [];
  if (showGrid) {
    const gridPx = GRID_CM * pxPerCm;
    const majorGridPx = 50 * pxPerCm;
    for (let x = 0; x <= roomWidthPx; x += gridPx) {
      const isMajor = Math.abs(x % majorGridPx) < 0.5;
      gridLines.push(
        <Line key={`gv${x}`} points={[roomOffsetX + x, roomOffsetY, roomOffsetX + x, roomOffsetY + roomHeightPx]}
          stroke={isMajor ? '#d1d5db' : '#e5e7eb'} strokeWidth={isMajor ? 0.7 : 0.3} listening={false} />
      );
    }
    for (let y = 0; y <= roomHeightPx; y += gridPx) {
      const isMajor = Math.abs(y % majorGridPx) < 0.5;
      gridLines.push(
        <Line key={`gh${y}`} points={[roomOffsetX, roomOffsetY + y, roomOffsetX + roomWidthPx, roomOffsetY + y]}
          stroke={isMajor ? '#d1d5db' : '#e5e7eb'} strokeWidth={isMajor ? 0.7 : 0.3} listening={false} />
      );
    }
  }

  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      scaleX={zoom}
      scaleY={zoom}
      x={panOffset.x}
      y={panOffset.y}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onMouseDown}
      data-testid="planner-canvas"
    >
      <Layer>
        <Rect
          x={0}
          y={0}
          width={stageSize.width / zoom}
          height={stageSize.height / zoom}
          fill="#f8fafc"
          listening={false}
        />

        <Rect
          x={roomOffsetX}
          y={roomOffsetY}
          width={roomWidthPx}
          height={roomHeightPx}
          fill="#ffffff"
          stroke="#94a3b8"
          strokeWidth={1.5}
          shadowColor="rgba(0,0,0,0.06)"
          shadowBlur={12}
          shadowOffsetY={2}
          cornerRadius={2}
          listening={false}
        />

        {gridLines}

        {showDimensions && (
          <>
            <Text
              x={roomOffsetX + roomWidthPx / 2 - 20}
              y={roomOffsetY - 22}
              text={`${(roomWidthCm / 100).toFixed(1)}m`}
              fontSize={11}
              fill="#64748b"
              fontFamily="Inter, system-ui, sans-serif"
              fontStyle="600"
              listening={false}
            />
            <Line
              points={[roomOffsetX, roomOffsetY - 10, roomOffsetX + roomWidthPx, roomOffsetY - 10]}
              stroke="#94a3b8"
              strokeWidth={0.5}
              listening={false}
            />
            <Line
              points={[roomOffsetX, roomOffsetY - 14, roomOffsetX, roomOffsetY - 6]}
              stroke="#94a3b8"
              strokeWidth={0.5}
              listening={false}
            />
            <Line
              points={[roomOffsetX + roomWidthPx, roomOffsetY - 14, roomOffsetX + roomWidthPx, roomOffsetY - 6]}
              stroke="#94a3b8"
              strokeWidth={0.5}
              listening={false}
            />
            <Group rotation={-90} x={roomOffsetX - 10} y={roomOffsetY + roomHeightPx / 2 + 20}>
              <Text
                text={`${(roomDepthCm / 100).toFixed(1)}m`}
                fontSize={11}
                fill="#64748b"
                fontFamily="Inter, system-ui, sans-serif"
                fontStyle="600"
                listening={false}
              />
            </Group>
            <Line
              points={[roomOffsetX - 10, roomOffsetY, roomOffsetX - 10, roomOffsetY + roomHeightPx]}
              stroke="#94a3b8"
              strokeWidth={0.5}
              listening={false}
            />
            <Line
              points={[roomOffsetX - 14, roomOffsetY, roomOffsetX - 6, roomOffsetY]}
              stroke="#94a3b8"
              strokeWidth={0.5}
              listening={false}
            />
            <Line
              points={[roomOffsetX - 14, roomOffsetY + roomHeightPx, roomOffsetX - 6, roomOffsetY + roomHeightPx]}
              stroke="#94a3b8"
              strokeWidth={0.5}
              listening={false}
            />
            <Text
              x={roomOffsetX + roomWidthPx / 2 - 20}
              y={roomOffsetY + roomHeightPx + 6}
              text={`${((roomWidthCm * roomDepthCm) / 10000).toFixed(1)} m²`}
              fontSize={10}
              fill="#94a3b8"
              fontFamily="Inter, system-ui, sans-serif"
              listening={false}
            />
          </>
        )}
      </Layer>

      <Layer
        clipX={roomOffsetX}
        clipY={roomOffsetY}
        clipWidth={roomWidthPx}
        clipHeight={roomHeightPx}
      >
        <Group x={roomOffsetX} y={roomOffsetY}>
          <PlanBackgroundLayers rooms={unifiedDoc.rooms} structure={unifiedDoc.structure} annotations={unifiedDoc.annotations} site={unifiedDoc.site} />
        </Group>
        {sortedItems.map(item => (
          <FurnitureShape
            key={item.instanceId}
            item={{ ...item, x: item.x + roomOffsetX / pxPerCm, y: item.y + roomOffsetY / pxPerCm }}
            isSelected={selectedItemIds.has(item.instanceId)}
            onSelect={(e) => onItemSelect(item.instanceId, e)}
            onChange={(changes) => {
              if (changes.x !== undefined) changes.x = changes.x - roomOffsetX / pxPerCm;
              if (changes.y !== undefined) changes.y = changes.y - roomOffsetY / pxPerCm;
              onItemChange(item.instanceId, changes);
              setAlignmentGuides([]);
            }}
            onDragMove={(dragItem, xCm, yCm) => {
              onDragMoveItem(
                { ...dragItem, x: xCm - roomOffsetX / pxPerCm, y: yCm - roomOffsetY / pxPerCm },
                xCm - roomOffsetX / pxPerCm,
                yCm - roomOffsetY / pxPerCm,
              );
            }}
            pxPerCm={pxPerCm}
            gridSnap={gridSnap}
            gridSize={GRID_CM}
          />
        ))}
      </Layer>

      <Layer listening={false}>
        {alignmentGuides.map((guide, i) =>
          guide.orientation === 'v' ? (
            <Line
              key={`ag-${i}`}
              points={[
                roomOffsetX + guide.position * pxPerCm, roomOffsetY - 8,
                roomOffsetX + guide.position * pxPerCm, roomOffsetY + roomHeightPx + 8,
              ]}
              stroke={ALIGNMENT_GUIDE_COLOR}
              strokeWidth={0.8}
              dash={[4, 3]}
              opacity={0.7}
            />
          ) : (
            <Line
              key={`ag-${i}`}
              points={[
                roomOffsetX - 8, roomOffsetY + guide.position * pxPerCm,
                roomOffsetX + roomWidthPx + 8, roomOffsetY + guide.position * pxPerCm,
              ]}
              stroke={ALIGNMENT_GUIDE_COLOR}
              strokeWidth={0.8}
              dash={[4, 3]}
              opacity={0.7}
            />
          )
        )}

        {measurePoints.length >= 1 && (
          <>
            <Circle
              x={roomOffsetX + measurePoints[0].x * pxPerCm}
              y={roomOffsetY + measurePoints[0].y * pxPerCm}
              radius={4}
              fill="#ef4444"
              stroke="#fff"
              strokeWidth={1.5}
            />
          </>
        )}
        {measurePoints.length === 2 && (() => {
          const p1x = roomOffsetX + measurePoints[0].x * pxPerCm;
          const p1y = roomOffsetY + measurePoints[0].y * pxPerCm;
          const p2x = roomOffsetX + measurePoints[1].x * pxPerCm;
          const p2y = roomOffsetY + measurePoints[1].y * pxPerCm;
          const distCm = Math.sqrt(
            Math.pow(measurePoints[1].x - measurePoints[0].x, 2) +
            Math.pow(measurePoints[1].y - measurePoints[0].y, 2)
          );
          const distStr = distCm >= 100
            ? `${(distCm / 100).toFixed(2)} m`
            : `${Math.round(distCm)} cm`;
          const midX = (p1x + p2x) / 2;
          const midY = (p1y + p2y) / 2;
          return (
            <>
              <Line
                points={[p1x, p1y, p2x, p2y]}
                stroke="#ef4444"
                strokeWidth={1.5}
                dash={[6, 3]}
              />
              <Circle
                x={p2x}
                y={p2y}
                radius={4}
                fill="#ef4444"
                stroke="#fff"
                strokeWidth={1.5}
              />
              <Rect
                x={midX - 30}
                y={midY - 18}
                width={60}
                height={16}
                fill="rgba(239,68,68,0.9)"
                cornerRadius={3}
              />
              <Text
                x={midX - 30}
                y={midY - 17}
                width={60}
                height={14}
                text={distStr}
                fontSize={10}
                fill="#fff"
                fontFamily="Inter, system-ui, sans-serif"
                fontStyle="700"
                align="center"
                verticalAlign="middle"
              />
            </>
          );
        })()}

        <DrawShapesLayer
          shapes={drawnShapes}
          previewShape={previewShape ?? undefined}
          selectedShapeId={selectedDrawShapeId ?? null}
          onSelectShape={onSelectDrawShape ?? (() => {})}
          isDrawMode={isDrawMode ?? false}
          pxPerCm={pxPerCm}
          roomOffsetX={roomOffsetX}
          roomOffsetY={roomOffsetY}
        />
      </Layer>
    </Stage>
  );
}
