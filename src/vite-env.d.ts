/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_COMMIT_SHA: string
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv
}