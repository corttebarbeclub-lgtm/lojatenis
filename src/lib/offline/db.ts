import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface CachedVariant {
  id: string;
  color: string;
  size: string;
  sku: string | null;
  barcode: string | null;
  price_cents: number;
  product_name: string;
  brand_name?: string;
  available_quantity: number;
  image_url?: string | null;
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
    dbPromise = openDB<LojatenisDB>('lojatenis-pdv', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('catalog')) {
          const catalog = db.createObjectStore('catalog', { keyPath: 'id' });
          catalog.createIndex('by-sku', 'sku');
        }
        if (!db.objectStoreNames.contains('queue')) {
          const queue = db.createObjectStore('queue', { keyPath: 'clientOperationId' });
          queue.createIndex('by-createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function replaceCatalog(variants: CachedVariant[]) {
  try {
    const db = await getDb();
    const tx = db.transaction('catalog', 'readwrite');
    await tx.store.clear();
    await Promise.all(variants.map((v) => tx.store.put(v)));
    await tx.done;
  } catch (err) {
    console.warn('Erro ao atualizar catálogo IndexedDB:', err);
  }
}

export async function searchCatalog(query: string): Promise<CachedVariant[]> {
  try {
    const db = await getDb();
    const all = await db.getAll('catalog');
    const q = query.toLowerCase().trim();
    if (!q) return all.slice(0, 15);

    return all
      .filter((v) => {
        const prodName = (v.product_name || '').toLowerCase();
        const brandName = (v.brand_name || '').toLowerCase();
        const color = (v.color || '').toLowerCase();
        const size = (v.size || '').toLowerCase();
        const sku = (v.sku || '').toLowerCase();
        const barcode = (v.barcode || '').toLowerCase();

        return (
          prodName.includes(q) ||
          brandName.includes(q) ||
          color.includes(q) ||
          size.includes(q) ||
          sku.includes(q) ||
          barcode.includes(q)
        );
      })
      .slice(0, 20);
  } catch {
    return [];
  }
}

export async function decrementLocalStock(variantId: string, quantity: number) {
  try {
    const db = await getDb();
    const variant = await db.get('catalog', variantId);
    if (variant) {
      variant.available_quantity = Math.max(0, variant.available_quantity - quantity);
      await db.put('catalog', variant);
    }
  } catch (err) {
    console.warn('Erro ao decrementar estoque local:', err);
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
  try {
    const db = await getDb();
    return await db.count('queue');
  } catch {
    return 0;
  }
}
