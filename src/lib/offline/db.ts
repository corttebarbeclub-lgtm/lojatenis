import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface CachedVariant {
  id: string;
  color: string;
  size: string;
  sku: string | null;
  barcode: string | null;
  price_cents: number;
  product_name: string;
  available_quantity: number;
}

export type QueuedOperation =
  | {
      clientOperationId: string;
      type: 'SALE_CREATED';
      createdAt: string;
      payload: {
        cashRegisterId: string;
        items: { variantId: string; quantity: number; unitPriceCents: number }[];
        payments: { method: 'cash' | 'pix' | 'card'; amountCents: number }[];
        discountCents: number;
        customerId: string | null;
        sellerId: string | null;
      };
    }
  | {
      clientOperationId: string;
      type: 'CASH_MOVEMENT_CREATED';
      createdAt: string;
      payload: {
        cashRegisterId: string;
        type: 'withdrawal' | 'reinforcement';
        amountCents: number;
        reason: string | null;
      };
    };

interface LojatenisDB extends DBSchema {
  catalog: {
    key: string;
    value: CachedVariant;
    indexes: { 'by-sku': string };
  };
  queue: {
    key: string;
    value: QueuedOperation;
    indexes: { 'by-createdAt': string };
  };
}

let dbPromise: Promise<IDBPDatabase<LojatenisDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<LojatenisDB>('lojatenis-pdv', 1, {
      upgrade(db) {
        const catalog = db.createObjectStore('catalog', { keyPath: 'id' });
        catalog.createIndex('by-sku', 'sku');

        const queue = db.createObjectStore('queue', { keyPath: 'clientOperationId' });
        queue.createIndex('by-createdAt', 'createdAt');
      },
    });
  }
  return dbPromise;
}

export async function replaceCatalog(variants: CachedVariant[]) {
  const db = await getDb();
  const tx = db.transaction('catalog', 'readwrite');
  await tx.store.clear();
  await Promise.all(variants.map((v) => tx.store.put(v)));
  await tx.done;
}

export async function searchCatalog(query: string): Promise<CachedVariant[]> {
  const db = await getDb();
  const all = await db.getAll('catalog');
  const q = query.toLowerCase();
  return all
    .filter(
      (v) =>
        v.available_quantity > 0 &&
        (v.sku?.toLowerCase().includes(q) ||
          v.barcode?.toLowerCase().includes(q) ||
          v.product_name.toLowerCase().includes(q))
    )
    .slice(0, 10);
}

export async function decrementLocalStock(variantId: string, quantity: number) {
  const db = await getDb();
  const variant = await db.get('catalog', variantId);
  if (variant) {
    variant.available_quantity = Math.max(0, variant.available_quantity - quantity);
    await db.put('catalog', variant);
  }
}

export async function enqueueOperation(operation: QueuedOperation) {
  const db = await getDb();
  await db.put('queue', operation);
}

export async function getQueuedOperations(): Promise<QueuedOperation[]> {
  const db = await getDb();
  return db.getAllFromIndex('queue', 'by-createdAt');
}

export async function removeQueuedOperation(clientOperationId: string) {
  const db = await getDb();
  await db.delete('queue', clientOperationId);
}

export async function getQueueLength(): Promise<number> {
  const db = await getDb();
  return db.count('queue');
}
