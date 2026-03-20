export const ALL_APP_KEYS = [
  'days',
  'projects',
  'last-time',
  'countdown',
  'notes',
  'watch',
  'world-map',
  'transactions',
  'wishlist',
] as const;

export type AppKey = (typeof ALL_APP_KEYS)[number];

export function parseUserApps(appsJson: string | null | undefined): AppKey[] {
  if (!appsJson) return [...ALL_APP_KEYS];
  try {
    const parsed = JSON.parse(appsJson);
    if (Array.isArray(parsed)) return parsed as AppKey[];
    return [...ALL_APP_KEYS];
  } catch {
    return [...ALL_APP_KEYS];
  }
}

export function isAppEnabled(enabledApps: AppKey[], key: AppKey): boolean {
  return enabledApps.includes(key);
}
