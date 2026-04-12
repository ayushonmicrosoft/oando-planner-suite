import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "http";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { logger } from "./lib/logger";
import { db, plansTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const MSG_SYNC = 0;
const MSG_AWARENESS = 1;

interface CollabRoom {
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  conns: Map<WebSocket, Set<number>>;
  persistTimer: ReturnType<typeof setInterval> | null;
  hydrated: boolean;
}

const rooms = new Map<string, CollabRoom>();

async function hydrateRoomFromDb(planId: string, room: CollabRoom) {
  if (room.hydrated) return;
  room.hydrated = true;

  const numericId = parseInt(planId, 10);
  if (isNaN(numericId) || numericId <= 0) return;

  try {
    const rows = await db
      .select({ documentJson: plansTable.documentJson })
      .from(plansTable)
      .where(eq(plansTable.id, numericId))
      .limit(1);

    if (rows.length > 0 && rows[0].documentJson) {
      const parsed = JSON.parse(rows[0].documentJson);
      const candidates = parsed.tldrawShapes ?? parsed.items ?? parsed;
      if (candidates && typeof candidates === "object" && !Array.isArray(candidates)) {
        const validEntries = Object.entries(candidates).filter(
          ([, v]) => v && typeof v === "object" && "typeName" in (v as Record<string, unknown>)
        );
        if (validEntries.length > 0) {
          const shapesMap = room.doc.getMap("shapes");
          room.doc.transact(() => {
            for (const [key, val] of validEntries) {
              shapesMap.set(key, val);
            }
          });
          logger.info({ planId, shapeCount: validEntries.length }, "Hydrated room from DB");
        } else {
          logger.info({ planId }, "Skipped hydration – no valid tldraw records found");
        }
      }
    }
  } catch (err) {
    logger.error({ err, planId }, "Failed to hydrate room from DB");
  }
}

async function persistRoom(planId: string, room: CollabRoom) {
  const numericId = parseInt(planId, 10);
  if (isNaN(numericId) || numericId <= 0) return;

  try {
    const shapesMap = room.doc.getMap("shapes");
    const shapes: Record<string, unknown> = {};
    shapesMap.forEach((val, key) => {
      shapes[key] = val;
    });

    const documentJson = JSON.stringify({ tldrawShapes: shapes });

    await db
      .update(plansTable)
      .set({ documentJson })
      .where(eq(plansTable.id, numericId));

    logger.debug({ planId }, "Persisted collab room state");
  } catch (err) {
    logger.error({ err, planId }, "Failed to persist collab room");
  }
}

async function getOrCreateRoom(planId: string): Promise<CollabRoom> {
  let room = rooms.get(planId);
  if (room) return room;

  const doc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(doc);

  room = {
    doc,
    awareness,
    conns: new Map(),
    persistTimer: null,
    hydrated: false,
  };

  awareness.on("update", ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }, wsOrigin: WebSocket | null) => {
    const changedClients = added.concat(updated, removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MSG_AWARENESS);
    encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients));
    const msg = encoding.toUint8Array(encoder);

    room!.conns.forEach((_controlledIds, conn) => {
      if (conn !== wsOrigin && conn.readyState === WebSocket.OPEN) {
        conn.send(msg);
      }
    });
  });

  doc.on("update", (update: Uint8Array, origin: WebSocket | null) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MSG_SYNC);
    syncProtocol.writeUpdate(encoder, update);
    const msg = encoding.toUint8Array(encoder);

    room!.conns.forEach((_controlledIds, conn) => {
      if (conn !== origin && conn.readyState === WebSocket.OPEN) {
        conn.send(msg);
      }
    });
  });

  room.persistTimer = setInterval(() => {
    persistRoom(planId, room!);
  }, 30_000);

  rooms.set(planId, room);
  await hydrateRoomFromDb(planId, room);

  return room;
}

function cleanupRoom(planId: string, room: CollabRoom) {
  if (room.conns.size > 0) return;

  persistRoom(planId, room).then(() => {
    if (room.conns.size > 0) return;
    if (room.persistTimer) {
      clearInterval(room.persistTimer);
    }
    room.awareness.destroy();
    room.doc.destroy();
    rooms.delete(planId);
    logger.info({ planId }, "Collab room closed and persisted");
  });
}

function handleMessage(conn: WebSocket, room: CollabRoom, message: Uint8Array) {
  const decoder = decoding.createDecoder(message);
  const messageType = decoding.readVarUint(decoder);

  switch (messageType) {
    case MSG_SYNC: {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MSG_SYNC);
      syncProtocol.readSyncMessage(decoder, encoder, room.doc, conn);
      if (encoding.length(encoder) > 1) {
        conn.send(encoding.toUint8Array(encoder));
      }
      break;
    }
    case MSG_AWARENESS: {
      awarenessProtocol.applyAwarenessUpdate(
        room.awareness,
        decoding.readVarUint8Array(decoder),
        conn
      );
      break;
    }
  }
}

export function setupCollabWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request: IncomingMessage, socket, head) => {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    const match = url.pathname.match(/^\/api\/collab\/([a-zA-Z0-9_-]+)$/);
    if (!match) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request, match[1]);
    });
  });

  wss.on("connection", async (ws: WebSocket, _request: IncomingMessage, planId: string) => {
    const room = await getOrCreateRoom(planId);
    const controlledIds = new Set<number>();
    room.conns.set(ws, controlledIds);

    logger.info({ planId, connections: room.conns.size }, "Client connected to collab room");

    const syncEncoder = encoding.createEncoder();
    encoding.writeVarUint(syncEncoder, MSG_SYNC);
    syncProtocol.writeSyncStep1(syncEncoder, room.doc);
    ws.send(encoding.toUint8Array(syncEncoder));

    const awarenessStates = room.awareness.getStates();
    if (awarenessStates.size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, MSG_AWARENESS);
      encoding.writeVarUint8Array(
        awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(
          room.awareness,
          Array.from(awarenessStates.keys())
        )
      );
      ws.send(encoding.toUint8Array(awarenessEncoder));
    }

    ws.on("message", (data: Buffer | ArrayBuffer | Buffer[]) => {
      try {
        const message = data instanceof Buffer
          ? new Uint8Array(data)
          : new Uint8Array(data as ArrayBuffer);
        handleMessage(ws, room, message);
      } catch (err) {
        logger.warn({ err }, "Invalid collab message");
      }
    });

    ws.on("close", () => {
      const controlled = room.conns.get(ws);
      room.conns.delete(ws);

      if (controlled) {
        awarenessProtocol.removeAwarenessStates(
          room.awareness,
          Array.from(controlled),
          null
        );
      }

      logger.info({ planId, connections: room.conns.size }, "Client disconnected from collab room");
      cleanupRoom(planId, room);
    });

    ws.on("error", (err) => {
      logger.error({ err, planId }, "WebSocket error");
    });
  });

  logger.info("Collaboration WebSocket server ready");
}
