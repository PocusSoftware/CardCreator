import { buildFrontend, getBuild } from "./build";
import { buildTailwindCss, watchTailwindCss } from "./css";
import { watch } from "node:fs";

const isDev = process.env.NODE_ENV !== "production";

void buildTailwindCss(true);
await buildFrontend();

if (isDev) {
  watchTailwindCss();
  let rebuildTimer: ReturnType<typeof setTimeout> | undefined;
  const srcDir = new URL("../src/", import.meta.url).pathname;
  watch(srcDir, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    if (!/\.(svelte|html|ts)$/.test(filename)) return;
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(async () => {
      try {
        await buildFrontend();
      } catch {
      }
    }, 120);
  });
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  routes: {
    "/app.css": {
      GET: async () => {
        const css = await buildTailwindCss();
        return new Response(css, {
          headers: {
            "content-type": "text/css; charset=utf-8",
            "cache-control": isDev ? "no-store" : "public, max-age=3600",
          },
        });
      },
    },
    "/favicon.ico": {
      GET: () => new Response(null, { status: 204 }),
    },
  },
  async fetch(req): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const build = getBuild();
    if (!build) return new Response("build not ready", { status: 503 });

    if (path === "/") {
      const html = Bun.file(build.htmlPath);
      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    const abs = build.assets.get(path);
    if (abs) {
      const file = Bun.file(abs);
      return new Response(file, { headers: assetHeaders(path) });
    }

    const staticPath = new URL(`../static${path === "/" ? "" : path}`, import.meta.url).pathname;
    const staticFile = Bun.file(staticPath);
    if (await staticFile.exists()) {
      return new Response(staticFile, { headers: assetHeaders(path) });
    }

    if (path.startsWith("/node_modules/") && path.endsWith(".woff2")) {
      const nmPath = new URL(`..${path}`, import.meta.url).pathname;
      const nmFile = Bun.file(nmPath);
      if (await nmFile.exists()) {
        return new Response(nmFile, {
          headers: { "content-type": "font/woff2", "cache-control": "public, max-age=86400" },
        });
      }
    }

    return new Response("not found", { status: 404 });
  },
  development: {
    hmr: false,
    console: false,
  },
});

function assetHeaders(path: string): Record<string, string> {
  if (path.endsWith(".js")) return { "content-type": "text/javascript; charset=utf-8" };
  if (path.endsWith(".css")) return { "content-type": "text/css; charset=utf-8" };
  if (path.endsWith(".svg")) return { "content-type": "image/svg+xml" };
  if (path.endsWith(".map")) return { "content-type": "application/json" };
  return { "content-type": "application/octet-stream" };
}

process.stdout.write(`Card Creator → http://localhost:${server.port}\n`);
