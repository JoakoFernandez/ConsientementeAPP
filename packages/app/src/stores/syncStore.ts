import { create } from "zustand";
import { getDatabase } from "../adapters/sqlite/database";
import { api } from "../adapters/ApiClient";

interface SyncState {
  lastSync: Date | null;
  syncing: boolean;
  syncNow: () => Promise<void>;
  getStatus: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set) => ({
  lastSync: null,
  syncing: false,
  syncNow: async () => {
    set({ syncing: true });
    try {
      const db = await getDatabase();
      const pendingOps: any[] = await db.getAllAsync(
        "SELECT * FROM sync_queue WHERE synced = 0 ORDER BY timestamp ASC"
      );
      if (pendingOps.length > 0) {
        await api.sync.push(pendingOps);
        await db.runAsync("UPDATE sync_queue SET synced = 1 WHERE synced = 0");
      }
      const now = new Date();
      await db.runAsync("UPDATE sync_queue SET synced = 1 WHERE synced = 0");
      set({ lastSync: now, syncing: false });
    } catch {
      set({ syncing: false });
    }
  },
  getStatus: async () => {
    const db = await getDatabase();
    const row: any = await db.getFirstAsync(
      "SELECT MAX(timestamp) as lastSync FROM sync_queue WHERE synced = 1"
    );
    if (row?.lastSync) set({ lastSync: new Date(row.lastSync) });
  },
}));
