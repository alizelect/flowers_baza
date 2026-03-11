/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

type FileSystemPermissionMode = 'read' | 'readwrite'

interface FileSystemHandlePermissionDescriptor {
  mode?: FileSystemPermissionMode
}

interface FileSystemHandle {
  kind: 'file' | 'directory'
  name: string
  queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
  requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file'
  getFile(): Promise<File>
  createWritable(): Promise<FileSystemWritableFileStream>
}

interface Window {
  showOpenFilePicker(options?: {
    multiple?: boolean
    types?: Array<{ description?: string; accept: Record<string, string[]> }>
  }): Promise<FileSystemFileHandle[]>
}
