"use client";

import { useState } from "react";
import type { CollabUser } from "./useCollaboration";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface CollaboratorIndicatorProps {
  collaborators: CollabUser[];
  connected: boolean;
}

export function CollaboratorIndicator({ collaborators, connected }: CollaboratorIndicatorProps) {
  const [showList, setShowList] = useState(false);

  if (!connected) return null;

  const totalOnline = collaborators.length + 1;

  return (
    <div className="relative">
      <button
        onClick={() => setShowList(!showList)}
        className="flex h-8 items-center gap-1.5 px-2 rounded-md text-[11px] font-medium transition-all text-navy-text/60 hover:bg-navy/10 hover:text-navy"
        title={`${totalOnline} collaborator${totalOnline !== 1 ? "s" : ""} online`}
      >
        <div className="flex -space-x-1.5">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white"
            style={{ backgroundColor: "#4f46e5" }}
          >
            You
          </div>
          {collaborators.slice(0, 3).map((user) => (
            <div
              key={user.clientId}
              className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {collaborators.length > 3 && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-400 text-[9px] font-bold text-white">
              +{collaborators.length - 3}
            </div>
          )}
        </div>
        <span className="hidden xl:inline">
          {totalOnline} online
        </span>
      </button>

      {showList && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowList(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border bg-white shadow-xl py-2">
            <div className="px-3 pb-1.5 text-[10px] font-semibold text-navy-text/40 uppercase tracking-wider">
              Collaborators
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: "#4f46e5" }}
              >
                Y
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-navy-text truncate">You</div>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>

            {collaborators.map((user) => (
              <div key={user.clientId} className="flex items-center gap-2 px-3 py-1.5">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-navy-text truncate">{user.name}</div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            ))}

            {collaborators.length === 0 && (
              <div className="px-3 py-2 text-xs text-navy-text/40 text-center">
                No other collaborators
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
