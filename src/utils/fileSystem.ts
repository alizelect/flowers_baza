const DB_NAME = 'flowers-baza-db'
const STORE_NAME = 'kv'
const HANDLE_KEY = 'json-handle'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function kvSet(key: string, value: unknown): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

async function kvGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb()
  const result = await new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return result
}

async function kvDelete(key: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export function isFileSystemApiAvailable(): boolean {
  return 'showOpenFilePicker' in window
}

export async function pickJsonFile(): Promise<FileSystemFileHandle> {
  const handles = await window.showOpenFilePicker({
    multiple: false,
    types: [
      {
        description: 'JSON data',
        accept: { 'application/json': ['.json'] },
      },
    ],
  })
  return handles[0]
}

export async function storeHandle(handle: FileSystemFileHandle): Promise<void> {
  await kvSet(HANDLE_KEY, handle)
}

export async function loadStoredHandle(): Promise<FileSystemFileHandle | undefined> {
  return kvGet<FileSystemFileHandle>(HANDLE_KEY)
}

export async function clearStoredHandle(): Promise<void> {
  await kvDelete(HANDLE_KEY)
}

export async function ensureReadPermission(handle: FileSystemFileHandle): Promise<boolean> {
  const result = await handle.queryPermission({ mode: 'read' })
  if (result === 'granted') {
    return true
  }
  return (await handle.requestPermission({ mode: 'read' })) === 'granted'
}

export async function ensureReadWritePermission(handle: FileSystemFileHandle): Promise<boolean> {
  const result = await handle.queryPermission({ mode: 'readwrite' })
  if (result === 'granted') {
    return true
  }
  return (await handle.requestPermission({ mode: 'readwrite' })) === 'granted'
}

export async function readJsonFile<T>(handle: FileSystemFileHandle): Promise<T> {
  const file = await handle.getFile()
  return JSON.parse(await file.text()) as T
}

export async function writeJsonFile(handle: FileSystemFileHandle, payload: unknown): Promise<void> {
  const writable = await handle.createWritable()
  await writable.write(JSON.stringify(payload, null, 2))
  await writable.close()
}
