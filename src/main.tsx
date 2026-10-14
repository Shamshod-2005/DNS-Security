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
