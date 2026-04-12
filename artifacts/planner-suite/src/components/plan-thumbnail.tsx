"use client";

interface ThumbnailItem {
  x: number;
  y: number;
  widthCm: number;
  depthCm: number;
  color?: string;
  shape?: string;
  rotation?: number;
  name?: string;
}

interface PlanThumbnailProps {
  roomWidthCm: number;
  roomDepthCm: number;
  items: ThumbnailItem[];
  width?: number;
  height?: number;
  className?: string;
}

export function PlanThumbnail({
  roomWidthCm,
  roomDepthCm,
  items,
  width = 200,
  height = 140,
  className = "",
}: PlanThumbnailProps) {
  const padding = 8;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const scale = Math.min(innerW / roomWidthCm, innerH / roomDepthCm);
  const roomW = roomWidthCm * scale;
  const roomH = roomDepthCm * scale;
  const offsetX = padding + (innerW - roomW) / 2;
  const offsetY = padding + (innerH - roomH) / 2;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ background: "#f8fafc" }}
    >
      <rect
        x={offsetX}
        y={offsetY}
        width={roomW}
        height={roomH}
        fill="#ffffff"
        stroke="#94a3b8"
        strokeWidth={1.5}
        rx={1}
      />

      {items.map((item, i) => {
        const ix = offsetX + item.x * scale;
        const iy = offsetY + item.y * scale;
        const iw = item.widthCm * scale;
        const ih = item.depthCm * scale;
        const isRound =
          item.shape === "circle" ||
          item.shape === "round" ||
          item.shape === "ellipse";
        const fill = item.color || "#6b7280";

        if (isRound) {
          return (
            <ellipse
              key={i}
              cx={ix + iw / 2}
              cy={iy + ih / 2}
              rx={iw / 2}
              ry={ih / 2}
              fill={fill}
              stroke="rgba(0,0,0,0.1)"
              strokeWidth={0.5}
            />
          );
        }

        return (
          <rect
            key={i}
            x={ix}
            y={iy}
            width={Math.max(iw, 1)}
            height={Math.max(ih, 1)}
            fill={fill}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={0.5}
            rx={1}
          />
        );
      })}

      <text
        x={offsetX + roomW / 2}
        y={offsetY + roomH + 6}
        textAnchor="middle"
        fontSize={7}
        fill="#94a3b8"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {(roomWidthCm / 100).toFixed(1)}m × {(roomDepthCm / 100).toFixed(1)}m
      </text>
    </svg>
  );
}
