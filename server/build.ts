import { sveltePlugin } from "./plugin";

const OUTDIR = new URL("../.build/", import.meta.url).pathname;
const ENTRY = new URL("../src/index.html", import.meta.url).pathname;

export interface BuildResult {
  outdir: string;
  htmlPath: string;
  assets: Map<string, string>;
  mtime: number;
}

let current: BuildResult | null = null;

function servedPath(absPath: string): string {
  const base = absPath.slice(OUTDIR.length);
  if (base === "index.html") return "/";
  return "/" + base.replace(/^\//, "");
}

export async function buildFrontend(): Promise<BuildResult> {
  const res = await Bun.build({
    entrypoints: [ENTRY],
    outdir: OUTDIR,
    target: "browser",
    splitting: true,
    format: "esm",
    minify: process.env.NODE_ENV === "production",
    sourcemap: process.env.NODE_ENV !== "production" ? "inline" : "none",
    plugins: [sveltePlugin],
    conditions: ["svelte", "browser", "import", "default"],
    publicPath: "/",
  });

  if (!res.success) {
    const msgs = res.logs.map((l) => String(l)).join("\n");
    throw new Error(`frontend build failed:\n${msgs}`);
  }

  const assets = new Map<string, string>();
  let htmlPath = "";
  for (const o of res.outputs) {
    if (o.path.endsWith(".html")) {
      htmlPath = o.path;
    }
    assets.set(servedPath(o.path), o.path);
  }
  if (!htmlPath) throw new Error("build produced no index.html");

  current = { outdir: OUTDIR, htmlPath, assets, mtime: Date.now() };
  return current;
}

export function getBuild(): BuildResult | null {
  return current;
}
