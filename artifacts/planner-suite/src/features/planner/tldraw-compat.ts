import type { Editor, TLRecord, RecordId } from "tldraw";

type TLRecordId = RecordId<TLRecord>;

interface StoreWithLegacyApi {
  getSnapshot(scope: string): unknown;
  loadSnapshot(snapshot: unknown): void;
  has(id: TLRecordId): boolean;
  remove(ids: TLRecordId[]): void;
}

function asLegacyStore(store: Editor["store"]): StoreWithLegacyApi {
  return store as unknown as StoreWithLegacyApi;
}

export function storeGetDocumentSnapshot(editor: Editor): string | null {
  try {
    const legacyStore = asLegacyStore(editor.store);
    const snapshot = legacyStore.getSnapshot("document");
    return JSON.stringify(snapshot);
  } catch {
    return null;
  }
}

export function storeLoadDocumentSnapshot(
  editor: Editor,
  documentJson: string,
): boolean {
  try {
    const snapshot = JSON.parse(documentJson);
    if (snapshot?.store && snapshot?.schema) {
      const legacyStore = asLegacyStore(editor.store);
      legacyStore.loadSnapshot(snapshot);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function storeHasRecord(editor: Editor, id: string): boolean {
  const legacyStore = asLegacyStore(editor.store);
  return legacyStore.has(id as TLRecordId);
}

export function storeRemoveRecords(
  editor: Editor,
  ids: RecordId<TLRecord>[],
): void {
  const legacyStore = asLegacyStore(editor.store);
  legacyStore.remove(ids);
}

export function editorOn(
  editor: Editor,
  eventName: string,
  handler: (...args: unknown[]) => void,
): void {
  const emitter = editor as unknown as {
    on(name: string, fn: (...a: unknown[]) => void): void;
  };
  emitter.on(eventName, handler);
}

export function editorOff(
  editor: Editor,
  eventName: string,
  handler: (...args: unknown[]) => void,
): void {
  const emitter = editor as unknown as {
    off(name: string, fn: (...a: unknown[]) => void): void;
  };
  emitter.off(eventName, handler);
}
