// Remembers that this device already uses the app, so the landing page can send
// returning visitors straight to their board (see the inline script in app/page.tsx).

export const ENTERED_KEY = "jasstafel:v1:entered";
export const LAST_GAME_KEY = "jasstafel:v1:last";

export function markEntered(gameId?: string) {
  try {
    localStorage.setItem(ENTERED_KEY, "1");
    if (gameId) localStorage.setItem(LAST_GAME_KEY, gameId);
  } catch {
    // private mode
  }
}

export function forgetLastGame(gameId: string) {
  try {
    if (localStorage.getItem(LAST_GAME_KEY) === gameId) localStorage.removeItem(LAST_GAME_KEY);
  } catch {}
}
