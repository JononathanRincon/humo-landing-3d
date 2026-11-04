import { sql, ready } from "./db";
import { DEFAULT_SETTINGS } from "./defaults";

function merge(base, extra) {
  const out = { ...base };
  for (const k of Object.keys(extra || {})) {
    const v = extra[k];
    out[k] = v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k]) ? merge(base[k], v) : v;
  }
  return out;
}

export async function getSettings() {
  await ready();
  const [row] = await sql`select data from settings where id = 1`;
  return merge(DEFAULT_SETTINGS, row?.data || {});
}

export async function saveSettings(data) {
  await ready();
  const merged = merge(await getSettings(), data);
  await sql`update settings set data = ${sql.json(merged)} where id = 1`;
  return merged;
}
