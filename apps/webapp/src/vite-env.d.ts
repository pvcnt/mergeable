/// <reference types="vite/client" />
/// <reference types="vite-plugin-comlink/client" />

interface ImportMetaEnv {
    readonly VITE_COMMIT_SHA?: string
    readonly MERGEABLE_NO_TELEMETRY: string
    readonly MERGEABLE_GITHUB_URLS: string
    readonly MERGEABLE_PR_SIZES: string
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv
}