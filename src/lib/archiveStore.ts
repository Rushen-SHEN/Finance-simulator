// IndexedDB-backed versioned document archive
// Stores Financial Plan, BP, and Roadshow snapshots with model state

import { ModelInputs } from './calculator';

const DB_NAME = 'aria-archive';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

export type ArchiveType = 'financial_plan' | 'bp' | 'roadshow' | 'hicool';

export interface ArchiveEntry {
  id?: number;                // auto-increment
  timestamp: number;
  version: string;            // e.g. "v2.4.1"
  type: ArchiveType;
  label: string;              // user-visible description
  content: string;            // markdown or HTML content
  modelSnapshot: ModelInputs; // full parameter state at time of export
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('type_timestamp', ['type', 'timestamp'], { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Save a document archive entry. Returns the auto-generated id. */
export async function saveArchive(entry: Omit<ArchiveEntry, 'id'>): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(entry);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

/** List all archives, optionally filtered by type. Sorted newest first. */
export async function listArchives(type?: ArchiveType): Promise<ArchiveEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      let results = req.result as ArchiveEntry[];
      if (type) results = results.filter(e => e.type === type);
      results.sort((a, b) => b.timestamp - a.timestamp);
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

/** Load a specific archive entry by id. */
export async function loadArchive(id: number): Promise<ArchiveEntry | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

/** Delete a specific archive entry. */
export async function deleteArchive(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Get count of archives by type. */
export async function countArchives(type?: ArchiveType): Promise<number> {
  const entries = await listArchives(type);
  return entries.length;
}

/** Download content as a file. */
export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
