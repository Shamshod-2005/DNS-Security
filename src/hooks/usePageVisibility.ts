import { useState, useEffect } from "react";

/**
 * usePageVisibility — brauzer tabi ko'rinayotganligini (active/visible) kuzatuvchi hook.
 * Foydalanuvchi boshqa tabga o'tsa yoki oynani kichraytirsa false qaytaradi.
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    return typeof document !== "undefined" ? !document.hidden : true;
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

export default usePageVisibility;

