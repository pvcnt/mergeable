/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_COMMIT_SHA?: string
    readonly VITE_GITHUB_URLS?: string
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv
}