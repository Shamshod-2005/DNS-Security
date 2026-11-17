import { useState, useEffect, useCallback, useRef } from "react";
import { usePageVisibility } from "./usePageVisibility";

export interface UseSmartPollingOptions {
  /** Harakatsizlik deb hisoblash vaqti (millisekundda). Standart: 5 daqiqa (300,000 ms) */
  idleTimeoutMs?: number;
  /** Polling yoqilgan/o'chirilganligi (masalan liveStreaming bayrog'i) */
  enabled?: boolean;
}

export interface UseSmartPollingResult {
  /** Tab brauzerda faol ko'rinib turibdimi */
  isTabVisible: boolean;
  /** Foydalanuvchi belgilangan vaqt davomida harakatsizmi (idle) */
  isIdle: boolean;
  /** Backendga so'rov yuborish kerakmi: (isTabVisible && !isIdle && enabled) */
  shouldPoll: boolean;
  /** Harakatsizlik taymerini qayta ishga tushirish (masalan biror tugma bosilganda) */
  resetIdleTimer: () => void;
}

/**
 * useSmartPolling — Backend yuklamasini kamaytirish uchun aqlli polling nazoratchisi.
 *
 * Quyidagi hollarda `shouldPoll: false` bo'ladi va so'rovlar to'xtatiladi:
 * 1. Foydalanuvchi boshqa vkladkaga o'tganda yoki brauzerni kichraytirganda (`isTabVisible === false`).
 * 2. Foydalanuvchi 5 daqiqa davomida sichqoncha/klaviaturaga tegmasa (`isIdle === true`).
 * 3. Qo'lda to'xtatilganda (`enabled === false`).
 */
export function useSmartPolling({
  idleTimeoutMs = 5 * 60 * 1000, // 5 daqiqa
  enabled = true,
}: UseSmartPollingOptions = {}): UseSmartPollingResult {
  const isTabVisible = usePageVisibility();
  const [isIdle, setIsIdle] = useState(false);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => {
      setIsIdle(true);
    }, idleTimeoutMs);
  }, [idleTimeoutMs]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Harakat kuzatuvchi hodisalar
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "wheel",
      "scroll",
    ];

    // Hodisalarni boshlash
    resetIdleTimer();

    // Throttling: har bir piksel harakatida emas, har 500ms da bir marta taymerni yangilaymiz
    let lastActivityTime = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastActivityTime > 500) {
        lastActivityTime = now;
        resetIdleTimer();
      }
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [resetIdleTimer]);

  // Agar tab ko'rinmay qolsa, idle taymerini to'xtatish yoki to'g'ridan-to'g'ri shouldPoll = false qilish
  const shouldPoll = isTabVisible && !isIdle && enabled;

  return {
    isTabVisible,
    isIdle,
    shouldPoll,
    resetIdleTimer,
  };
}

export default useSmartPolling;
