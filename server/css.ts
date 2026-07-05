import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { watch } from "node:fs";

let cachedCss = "";
let lastHash = "";
let building: Promise<string> | null = null;

const INPUT = new URL("../src/styles.css", import.meta.url).pathname;

async function collectSourceHash(): Promise<string> {
  const glob = new Bun.Glob("src/**/*.{svelte,html,ts,css}");
  const parts: string[] = [await Bun.file(INPUT).text()];
  for await (const path of glob.scan({ cwd: process.cwd(), absolute: true })) {
    try {
      parts.push(await Bun.file(path).text());
    } catch {
    }
  }
  const joined = parts.join("\n");
  return `${parts.length}:${joined.length}:${joined.slice(0, 64)}`;
}

export async function buildTailwindCss(force = false): Promise<string> {
  const hash = await collectSourceHash();
  if (!force && hash === lastHash && cachedCss) return cachedCss;
  if (building) return building;

  building = (async () => {
    const input = await Bun.file(INPUT).text();
    const result = await postcss([tailwindcss()]).process(input, {
      from: INPUT,
      to: "app.css",
    });
    cachedCss = result.css;
    lastHash = hash;
    building = null;
    return cachedCss;
  })();
  return building;
}

export function watchTailwindCss(onChange?: (css: string) => void): void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    watch(
      new URL("../src/", import.meta.url).pathname,
      { recursive: true },
      (_event, filename) => {
        if (!filename) return;
        if (!/\.(svelte|html|ts|css)$/.test(filename)) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(async () => {
          try {
            const css = await buildTailwindCss(true);
            onChange?.(css);
          } catch {
          }
        }, 120);
      },
    );
  } catch {
  }
}
