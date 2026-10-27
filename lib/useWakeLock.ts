"use client";

import { useEffect } from "react";

/** Keeps the screen on while the component is mounted (Screen Wake Lock API). */
export function useWakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let active = true;

    const request = async () => {
      if (document.visibilityState !== "visible" || (lock && !lock.released)) return;
      try {
        lock = await navigator.wakeLock.request("screen");
        if (!active) lock.release();
      } catch {
        // denied (e.g. low battery) – ignore
      }
    };
    const onVisibility = () => void request();

    request();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibility);
      lock?.release().catch(() => {});
    };
  }, []);
}
