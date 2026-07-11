export const CURRENT_USER_KEY = "airbnb_clone_current_user_id";
export const DEFAULT_USER_ID = 4;

export function readCurrentUserId(): number {
  if (typeof window === "undefined") {
    return DEFAULT_USER_ID;
  }

  const rawValue = window.localStorage.getItem(CURRENT_USER_KEY);
  const parsedValue = rawValue ? Number(rawValue) : DEFAULT_USER_ID;
  return Number.isFinite(parsedValue) ? parsedValue : DEFAULT_USER_ID;
}

export function writeCurrentUserId(userId: number) {
  window.localStorage.setItem(CURRENT_USER_KEY, String(userId));
  document.cookie = `current_user_id=${userId}; path=/; max-age=31536000; SameSite=Lax`;
}
