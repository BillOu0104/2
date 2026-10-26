export class LocalStore {
  constructor() {
    this.db = null;
    this.ready = new Promise(resolve => {
      if (!globalThis.indexedDB) return resolve(null);
      const request = indexedDB.open('three-body-observatory', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore('history', { keyPath: 'key' }); db.createObjectStore('assets');
      };
      request.onsuccess = () => { this.db = request.result; resolve(this.db); };
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });
  }
  async getAll(store) {
    const db = await this.ready; if (!db) return [];
    return new Promise(resolve => { const request = db.transaction(store).objectStore(store).getAll(); request.onsuccess = () => resolve(request.result); request.onerror = () => resolve([]); });
  }
  async getAsset(key) {
    const db = await this.ready; if (!db) return null;
    return new Promise(resolve => { const request = db.transaction('assets').objectStore('assets').get(key); request.onsuccess = () => resolve(request.result); request.onerror = () => resolve(null); });
  }
  async put(store, value, key) {
    const db = await this.ready; if (!db) return false;
    return new Promise(resolve => {
      const tx = db.transaction(store, 'readwrite');
      if (key === undefined) tx.objectStore(store).put(value); else tx.objectStore(store).put(value, key);
      tx.oncomplete = () => resolve(true); tx.onerror = () => resolve(false); tx.onabort = () => resolve(false);
    });
  }
  async clearHistory() {
    const db = await this.ready;
    if (!db) return false;
    // A transaction on this store waits for all earlier history writes.
    // Assets (including the custom background) are intentionally untouched.
    return new Promise(resolve => {
      const tx = db.transaction('history', 'readwrite');
      tx.objectStore('history').clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = tx.onabort = () => resolve(false);
    });
  }
}
