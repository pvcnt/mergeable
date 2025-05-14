/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMMIT_SHA?: string;
  readonly MERGEABLE_NO_TELEMETRY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
