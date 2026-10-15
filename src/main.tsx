import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Inter shrift — bundle ichida (CDN yo'q, CSP ga mos)
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

// Dizayn tokenlari va global stillar
import "./styles/tokens.css";
import "./styles/global.css";

// i18n ko'p tillilik tizimi
import "./i18n";

import App from "./App.tsx";

// Dastlabki mavzuni (Dark / Light) xavfsiz o'rnatish (CSP inline script talab qilmaslik uchun)
try {
  const saved = localStorage.getItem("mdns.theme");
  const theme = saved === "light" || saved === "dark" ? saved : "dark";
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  document.documentElement.setAttribute("data-theme", theme);
} catch {
  // ignore
}

// Agar brauzerda eski hash yo'llar (#/dashboard yoki #/login) qolgan bo'lsa, ularni toza yo'lga o'tkazamiz
if (typeof window !== "undefined" && window.location.hash.startsWith("#/")) {
  const cleanPath = window.location.hash.slice(1);
  window.history.replaceState(null, "", cleanPath);
}

import { queryClient } from "./config/queryClient";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
