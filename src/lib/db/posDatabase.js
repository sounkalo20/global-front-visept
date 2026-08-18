/**
 * lib/db/posDatabase.js
 * Wrapper IndexedDB natif Promise pour VISEPT POS Mode Hors-Ligne
 * Partitionnement strict par entreprise : `visept_pos_${companyId}`
 */

const DB_VERSION = 1;

/**
 * Ouvrir ou créer la base IndexedDB pour une entreprise donnée
 * @param {number|string} companyId 
 * @returns {Promise<IDBDatabase>}
 */
export function openPosDB(companyId) {
  if (!companyId) {
    return Promise.reject(new Error("companyId requis pour initialiser IndexedDB"));
  }

  const dbName = `visept_pos_${companyId}`;

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error("IndexedDB n'est pas supporté par cet environnement"));
    }

    const request = window.indexedDB.open(dbName, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Store: Catalogue des produits
      if (!db.objectStoreNames.contains('catalogue')) {
        const productStore = db.createObjectStore('catalogue', { keyPath: 'id' });
        productStore.createIndex('name', 'name', { unique: false });
        productStore.createIndex('barcode', 'barcode', { unique: false });
        productStore.createIndex('sku', 'sku', { unique: false });
        productStore.createIndex('category_id', 'category_id', { unique: false });
      }

      // 2. Store: Clients réguliers
      if (!db.objectStoreNames.contains('clients')) {
        const clientStore = db.createObjectStore('clients', { keyPath: 'id' });
        clientStore.createIndex('full_name', 'full_name', { unique: false });
        clientStore.createIndex('phone', 'phone', { unique: false });
      }

      // 3. Store: Session de caisse active
      if (!db.objectStoreNames.contains('active_session')) {
        db.createObjectStore('active_session', { keyPath: 'key' });
      }

      // 4. Store: File d'attente des ventes offline (FIFO)
      if (!db.objectStoreNames.contains('sync_queue')) {
        const queueStore = db.createObjectStore('sync_queue', { keyPath: 'offline_uuid' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('created_at', 'created_at', { unique: false });
      }

      // 5. Store: Bail d'authentification hors-ligne (Auth Lease)
      if (!db.objectStoreNames.contains('offline_auth')) {
        db.createObjectStore('offline_auth', { keyPath: 'key' });
      }

      // 6. Store: Configuration du terminal
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// ─── GESTION DU DEVICE ID ───────────────────────────────────────
export function getOrCreateDeviceId() {
  if (typeof window === 'undefined') return 'device_server';
  let deviceId = localStorage.getItem('visept_device_id');
  if (!deviceId) {
    deviceId = `pos_dev_${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now()}`;
    localStorage.setItem('visept_device_id', deviceId);
  }
  return deviceId;
}

// ─── CATALOGUE DES PRODUITS ─────────────────────────────────────
export async function saveCatalogue(companyId, products = []) {
  if (!products || !Array.isArray(products)) return;
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('catalogue', 'readwrite');
    const store = tx.objectStore('catalogue');
    
    // Nettoyer l'ancien catalogue et remplacer
    store.clear();
    for (const p of products) {
      store.put({
        ...p,
        id: Number(p.id),
        retail_price: parseFloat(p.retail_price || 0),
        wholesale_price: parseFloat(p.wholesale_price || 0),
        cost_price: parseFloat(p.cost_price || 0),
        current_stock: parseFloat(p.current_stock || 0),
      });
    }

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getCatalogue(companyId) {
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('catalogue', 'readonly');
    const store = tx.objectStore('catalogue');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function updateLocalStock(companyId, items = []) {
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('catalogue', 'readwrite');
    const store = tx.objectStore('catalogue');

    for (const item of items) {
      const getReq = store.get(Number(item.product_id));
      getReq.onsuccess = () => {
        const prod = getReq.result;
        if (prod && prod.manage_stock) {
          prod.current_stock = Math.max(0, (prod.current_stock || 0) - Number(item.quantity));
          store.put(prod);
        }
      };
    }

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

// ─── CLIENTS ────────────────────────────────────────────────────
export async function saveClients(companyId, clients = []) {
  if (!clients || !Array.isArray(clients)) return;
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('clients', 'readwrite');
    const store = tx.objectStore('clients');
    store.clear();
    for (const c of clients) {
      store.put({
        id: Number(c.id),
        full_name: c.full_name,
        phone: c.phone,
        email: c.email || null,
        current_debt: parseFloat(c.current_debt || 0),
      });
    }
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getClients(companyId) {
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('clients', 'readonly');
    const store = tx.objectStore('clients');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (e) => reject(e.target.error);
  });
}

// ─── SESSION DE CAISSE ACTIVE ───────────────────────────────────
export async function saveActiveSession(companyId, sessionData) {
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('active_session', 'readwrite');
    const store = tx.objectStore('active_session');
    if (!sessionData) {
      store.delete('current');
    } else {
      store.put({ key: 'current', ...sessionData, cached_at: new Date().toISOString() });
    }
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getActiveSession(companyId) {
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('active_session', 'readonly');
    const store = tx.objectStore('active_session');
    const req = store.get('current');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = (e) => reject(e.target.error);
  });
}

// ─── BAIL D'AUTHENTIFICATION (OFFLINE AUTH LEASE) ───────────────
export async function saveOfflineAuthLease(companyId, authData) {
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_auth', 'readwrite');
    const store = tx.objectStore('offline_auth');
    store.put({
      key: 'lease',
      user_id: authData.user_id,
      user_name: authData.user_name,
      role_name: authData.role_name,
      permissions: authData.permissions || [],
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // 24h lease
    });
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getOfflineAuthLease(companyId) {
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_auth', 'readonly');
    const store = tx.objectStore('offline_auth');
    const req = store.get('lease');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = (e) => reject(e.target.error);
  });
}

// ─── FILE DE SYNCHRONISATION (SYNC_QUEUE) ───────────────────────
export async function enqueueOfflineSale(companyId, saleRecord) {
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const entry = {
      offline_uuid: saleRecord.offline_uuid,
      temp_number: saleRecord.temp_number,
      device_id: saleRecord.device_id,
      payload: saleRecord.payload,
      status: 'pending', // 'pending' | 'syncing' | 'synced' | 'failed'
      attempts: 0,
      error: null,
      created_at: saleRecord.created_at || new Date().toISOString(),
    };
    store.put(entry);
    tx.oncomplete = () => resolve(entry);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getSyncQueue(companyId) {
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    const req = store.getAll();
    req.onsuccess = () => {
      const items = req.result || [];
      // Trier par date croissante (FIFO)
      items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      resolve(items);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function updateSyncQueueStatus(companyId, offlineUuid, status, details = {}) {
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const req = store.get(offlineUuid);
    req.onsuccess = () => {
      const item = req.result;
      if (item) {
        item.status = status;
        if (details.error !== undefined) item.error = details.error;
        if (details.attempts !== undefined) item.attempts = details.attempts;
        if (details.server_sale !== undefined) item.server_sale = details.server_sale;
        if (details.synced_at !== undefined) item.synced_at = details.synced_at;
        store.put(item);
      }
    };
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function removeSyncQueueItem(companyId, offlineUuid) {
  const db = await openPosDB(companyId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    store.delete(offlineUuid);
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function clearSyncedItems(companyId) {
  const db = await openPosDB(companyId);
  const items = await getSyncQueue(companyId);
  const syncedUuids = items.filter(i => i.status === 'synced').map(i => i.offline_uuid);

  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    for (const uuid of syncedUuids) {
      store.delete(uuid);
    }
    tx.oncomplete = () => resolve(syncedUuids.length);
    tx.onerror = (e) => reject(e.target.error);
  });
}
