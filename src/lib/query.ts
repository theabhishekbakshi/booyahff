/** URL query helpers shared by listing pages (filters persist in the URL). */

export type QueryValue = string | string[] | undefined;
export type RawQuery = Record<string, QueryValue>;

export function queryToString(query: string | QueryValue[] | undefined): string | undefined {
  if (Array.isArray(query)) return typeof query[0] === "string" ? query[0] : undefined;
  if (typeof query === "string" && query !== "") return query;
  return undefined;
}

export function queryToNum(query: string | QueryValue[] | undefined): number | null {
  const s = queryToString(query);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** clone params, apply updates, drop empty values */
export function buildHref(
  basePath: string,
  params: URLSearchParams | RawQuery,
  updates: Record<string, string | number | null>,
): string {
  const usp = new URLSearchParams(
    params instanceof URLSearchParams ? params.toString() : stringifyRaw(params),
  );
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "") usp.delete(key);
    else usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function stringifyRaw(raw: RawQuery): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => usp.append(key, v));
    else usp.set(key, value);
  }
  return usp.toString();
}

export function hasActiveFilters(
  params: URLSearchParams | RawQuery,
  keys: string[],
): boolean {
  if (params instanceof URLSearchParams) return keys.some((k) => params.get(k));
  return keys.some((k) => queryToString(params[k]));
}
