"use client";

import { useEffect, useState } from "react";
import type { Editor } from "tldraw";
import type { CollabUser } from "./useCollaboration";

interface CollaboratorCursorsProps {
  editor: Editor | null;
  collaborators: CollabUser[];
}

interface ScreenPos {
  x: number;
  y: number;
}

export function CollaboratorCursors({ editor, collaborators }: CollaboratorCursorsProps) {
  const [screenPositions, setScreenPositions] = useState<Map<number, ScreenPos>>(new Map());

  useEffect(() => {
    if (!editor) return;

    const updatePositions = () => {
      const newPositions = new Map<number, ScreenPos>();
      const camera = editor.getCamera();
      const zoom = editor.getZoomLevel();
      for (const user of collaborators) {
        if (user.cursor) {
          const x = (user.cursor.x + camera.x) * zoom;
          const y = (user.cursor.y + camera.y) * zoom;
          newPositions.set(user.clientId, { x, y });
        }
      }
      setScreenPositions(newPositions);
    };

    updatePositions();
    const interval = setInterval(updatePositions, 50);
    return () => clearInterval(interval);
  }, [editor, collaborators]);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {collaborators.map((user) => {
        const pos = screenPositions.get(user.clientId);
        if (!pos) return null;

        return (
          <div
            key={user.clientId}
            className="absolute transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="-translate-x-[2px] -translate-y-[2px]"
            >
              <path
                d="M3 3L10 18L12.5 10.5L18 8L3 3Z"
                fill={user.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="absolute left-4 top-4 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-md"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
