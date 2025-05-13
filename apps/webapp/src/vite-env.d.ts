/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMMIT_SHA?: string;
  readonly MERGEABLE_NO_TELEMETRY: string;
  readonly MERGEABLE_PR_SIZES: string;
  readonly MERGEABLE_BACKEND_URL?: string;
  readonly MERGEABLE_GITHUB_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
