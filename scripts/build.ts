import { sveltePlugin } from "../server/plugin";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { cp, mkdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const ENTRY = join(ROOT, "src/index.html");

await mkdir(DIST, { recursive: true });

const res = await Bun.build({
	entrypoints: [ENTRY],
	outdir: DIST,
	target: "browser",
	splitting: true,
	format: "esm",
	minify: true,
	sourcemap: "none",
	plugins: [sveltePlugin],
	conditions: ["svelte", "browser", "import", "default"],
	publicPath: "/",
});

if (!res.success) {
	const msgs = res.logs.map(String).join("\n");
	throw new Error(`Build failed:\n${msgs}`);
}

const cssInput = await Bun.file(join(ROOT, "src/styles.css")).text();
const cssResult = await postcss([tailwindcss()]).process(cssInput, {
	from: join(ROOT, "src/styles.css"),
	to: join(DIST, "app.css"),
});
await Bun.write(join(DIST, "app.css"), cssResult.css);

for (const family of ["inter", "jetbrains-mono"]) {
	const dst = join(DIST, `node_modules/@fontsource-variable/${family}/files`);
	await mkdir(dst, { recursive: true });
	await cp(
		join(ROOT, `node_modules/@fontsource-variable/${family}/files`),
		dst,
		{ recursive: true },
	);
}

await cp(join(ROOT, "static"), DIST, { recursive: true });

process.stdout.write("dist/ ready\n");
