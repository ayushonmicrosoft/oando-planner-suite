"use client";

import { Rect, Line, Circle, Group, Text } from "react-konva";
import type { RoomLayer, StructureLayer, SiteLayer, AnnotationLayer } from "@/lib/unified-plan";

function RoomBackground({ rooms, opacity = 0.25 }: { rooms: RoomLayer[]; opacity?: number }) {
  return (
    <>
      {rooms.map((r) => (
        <Group key={r.id} x={r.x} y={r.y} rotation={r.rotation} listening={false} opacity={opacity}>
          <Rect
            width={r.width}
            height={r.height}
            fill={r.fill}
            stroke="rgba(148,163,184,0.4)"
            strokeWidth={1.5}
            cornerRadius={2}
            dash={[6, 3]}
          />
          <Text
            x={4}
            y={4}
            text={r.label}
            fontSize={11}
            fill="rgba(148,163,184,0.7)"
            listening={false}
          />
        </Group>
      ))}
    </>
  );
}

function StructureBackground({ items, opacity = 0.3 }: { items: StructureLayer[]; opacity?: number }) {
  return (
    <>
      {items.map((item) => (
        <Group key={item.id} x={item.x} y={item.y} rotation={item.rotation} listening={false} opacity={opacity}>
          {item.kind === "ellipse" ? (
            <Circle
              x={item.width / 2}
              y={item.height / 2}
              radius={Math.min(item.width, item.height) / 2}
              fill={item.fill}
              stroke="rgba(148,163,184,0.3)"
              strokeWidth={1}
            />
          ) : (
            <Rect
              width={item.width}
              height={item.height}
              fill={item.fill}
              stroke="rgba(148,163,184,0.3)"
              strokeWidth={1}
              cornerRadius={1}
            />
          )}
          {item.details?.map((d, di) => {
            if (d.type === "line" && d.points) {
              return <Line key={di} points={d.points} stroke={d.stroke || "#888"} strokeWidth={d.strokeWidth || 1} />;
            }
            if (d.type === "rect") {
              return <Rect key={di} x={d.x || 0} y={d.y || 0} width={d.w || 10} height={d.h || 10} fill={d.fill || "#888"} />;
            }
            if (d.type === "circle") {
              return <Circle key={di} x={d.x || 0} y={d.y || 0} radius={d.r || 5} fill={d.fill || "#888"} />;
            }
            return null;
          })}
        </Group>
      ))}
    </>
  );
}

function AnnotationBackground({ items, opacity = 0.2 }: { items: AnnotationLayer[]; opacity?: number }) {
  return (
    <>
      {items.map((a) => (
        <Group key={a.id} x={a.x} y={a.y} rotation={a.rotation} listening={false} opacity={opacity}>
          {a.tool === "line" ? (
            <Line points={a.points || [0, 0, a.width, a.height]} stroke={a.stroke} strokeWidth={a.strokeWidth} />
          ) : a.tool === "circle" ? (
            <Circle x={a.width / 2} y={a.height / 2} radius={Math.min(a.width, a.height) / 2} stroke={a.stroke} strokeWidth={a.strokeWidth} fill="transparent" />
          ) : a.tool === "text" ? (
            <Text text={a.text || ""} fontSize={14} fill={a.stroke} />
          ) : (
            <Rect width={a.width} height={a.height} stroke={a.stroke} strokeWidth={a.strokeWidth} fill="transparent" />
          )}
        </Group>
      ))}
    </>
  );
}

function SiteBackground({ items, opacity = 0.2 }: { items: SiteLayer[]; opacity?: number }) {
  return (
    <>
      {items.map((item) => (
        <Group key={item.id} x={item.x} y={item.y} rotation={item.rotation} listening={false} opacity={opacity}>
          <Rect
            width={item.width}
            height={item.height}
            fill={item.fill}
            cornerRadius={item.kind === "ellipse" ? Math.min(item.width, item.height) / 2 : 2}
            stroke="rgba(148,163,184,0.3)"
            strokeWidth={0.5}
          />
        </Group>
      ))}
    </>
  );
}

export function PlanBackgroundLayers({
  rooms,
  structure,
  annotations,
  site,
}: {
  rooms?: RoomLayer[];
  structure?: StructureLayer[];
  annotations?: AnnotationLayer[];
  site?: SiteLayer[];
}) {
  return (
    <>
      {rooms && rooms.length > 0 && <RoomBackground rooms={rooms} />}
      {site && site.length > 0 && <SiteBackground items={site} />}
      {structure && structure.length > 0 && <StructureBackground items={structure} />}
      {annotations && annotations.length > 0 && <AnnotationBackground items={annotations} />}
    </>
  );
}
