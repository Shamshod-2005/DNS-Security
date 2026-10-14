import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_BACKEND_URL || "https://127.0.0.1:7000";

  // Proxy sozlamalari:
  // 1. Backend CSRF (_same_origin) tekshiruvini qondirish uchun Origin/Referer'ni target bilan moslash
  // 2. HTTP dev muhitida cookie'dagi "Secure" bayrog'ini olib tashlash
  const configureProxy = (proxy: any) => {
    proxy.on("proxyReq", (proxyReq: any) => {
      if (proxyReq.getHeader("origin")) {
        proxyReq.setHeader("origin", target);
      }
      const ref = proxyReq.getHeader("referer");
      if (ref) {
        try {
          const u = new URL(ref);
          const t = new URL(target);
          proxyReq.setHeader("referer", `${t.origin}${u.pathname}${u.search}`);
        } catch {
          // ignore
        }
      }
    });

    proxy.on("proxyRes", (proxyRes: any) => {
      const sc = proxyRes.headers["set-cookie"];
      if (sc) {
        if (Array.isArray(sc)) {
          proxyRes.headers["set-cookie"] = sc.map((c: string) =>
            c.replace(/;\s*Secure\b/gi, "")
          );
        } else {
          proxyRes.headers["set-cookie"] = sc.replace(/;\s*Secure\b/gi, "");
        }
      }
    });
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "spa-fallback-handler",
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            if (req.method === "GET" && req.url === "/") {
              req.headers.accept = "text/html, " + (req.headers.accept || "");
            }
            next();
          });
        },
      },
    ],
    server: {
      host: "127.0.0.1",
      port: 5173,
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
          configure: configureProxy,
        },
        "/login": {
          target,
          changeOrigin: true,
          secure: false,
          configure: configureProxy,
          bypass(req) {
            // GET /login browser navigation bo'lsa, React SPA ga yo'naltiramiz
            if (req.method === "GET") {
              return "/index.html";
            }
          },
        },
        "/logout": {
          target,
          changeOrigin: true,
          secure: false,
          configure: configureProxy,
        },
        "/static": { target, changeOrigin: true, secure: false },
      },
    },
    preview: {
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
          configure: configureProxy,
        },
        "/login": {
          target,
          changeOrigin: true,
          secure: false,
          configure: configureProxy,
          bypass(req) {
            if (req.method === "GET") {
              return "/index.html";
            }
          },
        },
        "/logout": {
          target,
          changeOrigin: true,
          secure: false,
          configure: configureProxy,
        },
        "/static": { target, changeOrigin: true, secure: false },
      },
    },
  };
});
