"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import type { Editor, TLRecord, TLStoreEventInfo, RecordId } from "tldraw";
import { storeHasRecord, storeRemoveRecords } from "./tldraw-compat";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { Awareness } from "y-protocols/awareness";

export interface CollabUser {
  clientId: number;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
}

interface UseCollaborationOptions {
  planId: string | null;
  editor: Editor | null;
  userName?: string;
}

const COLORS = [
  "#4f46e5", "#0891b2", "#059669", "#d97706", "#dc2626",
  "#7c3aed", "#db2777", "#2563eb", "#16a34a", "#ea580c",
];

const IGNORED_TYPES = new Set([
  "instance", "pointer", "instance_page_state",
  "instance_presence", "camera",
]);

export function useCollaboration({ planId, editor, userName }: UseCollaborationOptions) {
  const [collaborators, setCollaborators] = useState<CollabUser[]>([]);
  const [connected, setConnected] = useState(false);
  const suppressRemoteRef = useRef(false);
  const awarenessRef = useRef<Awareness | null>(null);
  const editorRef = useRef(editor);
  editorRef.current = editor;

  const wsUrl = useMemo(() => {
    if (typeof window === "undefined") return null;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/api/collab`;
  }, []);

  useEffect(() => {
    if (!planId || !editor || !wsUrl) return;

    const ydoc = new Y.Doc();
    const shapesMap = ydoc.getMap("shapes");

    const provider = new WebsocketProvider(wsUrl, planId, ydoc, {
      connect: true,
      maxBackoffTime: 30000,
    });

    const awareness = provider.awareness;
    awarenessRef.current = awareness;
    const clientId = ydoc.clientID;

    awareness.setLocalStateField("user", {
      name: userName ?? `User ${clientId}`,
      color: COLORS[clientId % COLORS.length],
    });

    provider.on("status", ({ status }: { status: string }) => {
      setConnected(status === "connected");
      if (status !== "connected") {
        setCollaborators([]);
      }
    });

    const updateCollaborators = () => {
      const states = awareness.getStates();
      const users: CollabUser[] = [];
      states.forEach((state, id) => {
        if (id === clientId) return;
        const user = state.user as { name?: string; color?: string } | undefined;
        const cursor = state.cursor as { x: number; y: number } | undefined;
        users.push({
          clientId: id,
          name: user?.name ?? `User ${id}`,
          color: user?.color ?? "#888",
          cursor: cursor ?? null,
        });
      });
      setCollaborators(users);
    };

    awareness.on("change", updateCollaborators);

    shapesMap.observe((event) => {
      if (suppressRemoteRef.current) return;
      if (event.transaction.origin === editor) return;

      const currentEditor = editorRef.current;
      if (!currentEditor) return;

      suppressRemoteRef.current = true;
      try {
        const toAdd: TLRecord[] = [];
        const toRemove: RecordId<TLRecord>[] = [];

        event.changes.keys.forEach((change, key) => {
          if (change.action === "add" || change.action === "update") {
            const value = shapesMap.get(key) as TLRecord | undefined;
            if (value && value.typeName && !IGNORED_TYPES.has(value.typeName)) {
              toAdd.push(value);
            }
          } else if (change.action === "delete") {
            if (storeHasRecord(currentEditor, key)) {
              toRemove.push(key as RecordId<TLRecord>);
            }
          }
        });

        if (toAdd.length > 0) currentEditor.store.put(toAdd);
        if (toRemove.length > 0) storeRemoveRecords(currentEditor, toRemove);
      } finally {
        suppressRemoteRef.current = false;
      }
    });

    const handleStoreChange = (entry: TLStoreEventInfo) => {
      if (suppressRemoteRef.current) return;

      const changes = entry.changes;
      if (!changes) return;

      suppressRemoteRef.current = true;
      try {
        ydoc.transact(() => {
          if (changes.added) {
            for (const [id, record] of Object.entries(changes.added)) {
              if (!IGNORED_TYPES.has(record.typeName)) {
                shapesMap.set(id, record);
              }
            }
          }

          if (changes.updated) {
            for (const [id, pair] of Object.entries(changes.updated)) {
              const to = Array.isArray(pair) ? pair[1] : pair;
              if (to && !IGNORED_TYPES.has(to.typeName)) {
                shapesMap.set(id, to);
              }
            }
          }

          if (changes.removed) {
            for (const [id, record] of Object.entries(changes.removed)) {
              if (!IGNORED_TYPES.has(record.typeName)) {
                shapesMap.delete(id);
              }
            }
          }
        }, editor);
      } finally {
        suppressRemoteRef.current = false;
      }
    };

    const unsubscribeStore = editor.store.listen(handleStoreChange, {
      source: "user",
      scope: "document",
    });

    return () => {
      unsubscribeStore();
      awarenessRef.current = null;
      provider.disconnect();
      provider.destroy();
      ydoc.destroy();
      setConnected(false);
      setCollaborators([]);
    };
  }, [planId, editor, wsUrl, userName]);

  const sendCursor = useCallback(
    (cursor: { x: number; y: number } | null) => {
      if (awarenessRef.current) {
        awarenessRef.current.setLocalStateField("cursor", cursor);
      }
    },
    []
  );

  return {
    collaborators,
    connected,
    sendCursor,
  };
}
