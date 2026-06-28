/// <reference types="vite/client" />

declare module '*.jpg'
declare module '*.png'
declare module '*.svg'

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
