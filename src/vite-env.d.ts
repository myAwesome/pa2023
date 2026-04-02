/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_OAUTH_ID?: string;
  readonly REACT_APP_API_URL?: string;
  readonly REACT_APP_OAUTH_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
