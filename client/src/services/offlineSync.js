const DB_NAME = 'ExpenseAI_OfflineDB';
const STORE_NAME = 'pending_mutations';
const DB_VERSION = 1;

/**
 * Open/Initialize the IndexedDB
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Queue a mutation (POST, PUT, DELETE) to be synced later
 */
export const queueMutation = async (mutation) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add({
      ...mutation,
      timestamp: Date.now()
    });
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get all pending mutations
 */
export const getPendingMutations = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Remove a mutation from the queue
 */
export const removeMutation = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Sync pending data with the server
 */
export const syncData = async (apiInstance) => {
  const mutations = await getPendingMutations();
  if (mutations.length === 0) return;

  console.log(`[OfflineSync] Attempting to sync ${mutations.length} mutations...`);
  
  for (const mutation of mutations) {
    try {
      const { method, url, data, id } = mutation;
      await apiInstance({
        method,
        url,
        data,
        headers: { 'X-Offline-Sync': 'true' }
      });
      await removeMutation(id);
      console.log(`[OfflineSync] Successfully synced mutation ${id}`);
    } catch (error) {
      console.error(`[OfflineSync] Failed to sync mutation ${mutation.id}:`, error);
      
      // If the server responded with a 4xx error (except 401/429), the request is invalid.
      // We should remove it so it doesn't block the queue forever.
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        // Special case: 401 (Unauthorized) might mean token expired, keep it to retry after login
        if (error.response.status !== 401 && error.response.status !== 429) {
          console.warn(`[OfflineSync] Removing invalid mutation ${mutation.id} due to status ${error.response.status}`);
          await removeMutation(mutation.id);
          continue; // Move to next mutation
        }
      }
      
      // Stop syncing for network errors or server errors (5xx)
      break;
    }
  }
};
