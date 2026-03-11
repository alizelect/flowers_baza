const DB_NAME = 'flowers-baza-db';
const STORE_NAME = 'kv';
const HANDLE_KEY = 'json-handle';
function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
async function kvSet(key, value) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    db.close();
}
async function kvGet(key) {
    const db = await openDb();
    const result = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
}
async function kvDelete(key) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    db.close();
}
export function isFileSystemApiAvailable() {
    return 'showOpenFilePicker' in window;
}
export async function pickJsonFile() {
    const handles = await window.showOpenFilePicker({
        multiple: false,
        types: [
            {
                description: 'JSON data',
                accept: { 'application/json': ['.json'] },
            },
        ],
    });
    return handles[0];
}
export async function storeHandle(handle) {
    await kvSet(HANDLE_KEY, handle);
}
export async function loadStoredHandle() {
    return kvGet(HANDLE_KEY);
}
export async function clearStoredHandle() {
    await kvDelete(HANDLE_KEY);
}
export async function ensureReadPermission(handle) {
    const result = await handle.queryPermission({ mode: 'read' });
    if (result === 'granted') {
        return true;
    }
    return (await handle.requestPermission({ mode: 'read' })) === 'granted';
}
export async function ensureReadWritePermission(handle) {
    const result = await handle.queryPermission({ mode: 'readwrite' });
    if (result === 'granted') {
        return true;
    }
    return (await handle.requestPermission({ mode: 'readwrite' })) === 'granted';
}
export async function readJsonFile(handle) {
    const file = await handle.getFile();
    return JSON.parse(await file.text());
}
export async function writeJsonFile(handle, payload) {
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(payload, null, 2));
    await writable.close();
}
