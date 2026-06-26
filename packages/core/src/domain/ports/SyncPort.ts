export interface SyncOperation {
  id: string;
  entityType: string;
  entityId: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  payload: string;
  timestamp: Date;
}

export interface SyncPort {
  pushOperations(operations: SyncOperation[]): Promise<void>;
  pullOperations(since: Date): Promise<SyncOperation[]>;
  getLastSyncTimestamp(): Promise<Date | null>;
  setLastSyncTimestamp(timestamp: Date): Promise<void>;
}
