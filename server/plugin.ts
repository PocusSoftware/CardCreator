import { compile, compileModule } from "svelte/compiler";
import type { BunPlugin } from "bun";
import { resolve } from "node:path";

const NAMESPACE = "svelte-compile";
const isDev = process.env.NODE_ENV !== "production";
const SPECIFIER_FILTER = /\.svelte([.][mc]?[jt]s)?$/;

function injectCss(css: string, hash: string): string {
  if (!css) return "";
  const id = `svelte-css-${hash}`;
  return [
    `if(typeof document!=="undefined"&&!document.getElementById(${JSON.stringify(id)})){`,
    `const s=document.createElement("style");`,
    `s.id=${JSON.stringify(id)};`,
    `s.textContent=${JSON.stringify(css)};`,
    `document.head.appendChild(s);`,
    `}`,
  ].join("");
}

function errorModule(filename: string, err: unknown): { contents: string; loader: "js" } {
  const msg = err instanceof Error ? err.message : String(err);
  return {
    contents: `throw new Error(${JSON.stringify(`[svelte] ${filename}: ${msg}`)});`,
    loader: "js",
  };
}

export const sveltePlugin: BunPlugin = {
  name: "svelte-compiler",
  setup(build) {
    build.onResolve({ filter: SPECIFIER_FILTER }, (args) => {
      const importerDir = args.importer ? resolve(args.importer, "..") : process.cwd();
      let abs: string;
      try {
        abs = Bun.resolveSync(args.path, importerDir);
      } catch {
        return undefined;
      }
      return { path: abs, namespace: NAMESPACE };
    });

    build.onLoad({ filter: /.*/, namespace: NAMESPACE }, async (args) => {
      const filename = args.path;
      if (process.env.DEBUG_SVELTE) process.stderr.write(`[svelte-plugin] ${filename}\n`);
      const source = await Bun.file(filename).text();
      const isModule = /\.svelte\.[mc]?[jt]s$/.test(filename);

      try {
        if (isModule) {
          const jsSource = filename.endsWith(".ts") || filename.endsWith(".cts")
            ? new Bun.Transpiler({ loader: "ts" }).transformSync(source)
            : source;
          const out = compileModule(jsSource, {
            filename,
            generate: "client",
            dev: isDev,
          });
          return { contents: out.js.code, loader: "js" };
        }

        const out = compile(source, {
          generate: "client",
          runes: true,
          filename,
          css: "external",
          dev: isDev,
          hmr: isDev,
        });
        const cssCode = out.css?.code ?? "";
        const hashMatch = cssCode.match(/\.svelte-([a-z0-9]+)/i);
        const hash = hashMatch?.[1] ?? Bun.hash(filename).toString(36);
        return { contents: injectCss(cssCode, hash) + "\n" + out.js.code, loader: "js" };
      } catch (err) {
        return errorModule(filename, err);
      }
    });
  },
};
