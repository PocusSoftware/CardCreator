import { englishLocale } from "./en";

const locale: Record<string, unknown> = englishLocale as unknown as Record<string, unknown>;

function lookup(obj: unknown, key: string): unknown {
  const parts = key.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

function interpolate(value: string, tOptions?: Record<string, string | number>): string {
  if (!tOptions) return value;
  return value.replace(/%\{(\w+)\}/g, (_, key: string) => {
    const option = tOptions[key];
    return option !== undefined ? String(option) : `%{${key}}`;
  });
}

export function t(
  key: string,
  tOptions?: Record<string, string | number>,
  defaultValue?: string,
): string {
  const found = lookup(locale, key);
  if (typeof found === "string") return interpolate(found, tOptions);
  if (defaultValue !== undefined) return interpolate(defaultValue, tOptions);
  return key;
}

export type LocaleT = typeof t;
