#!/usr/bin/env node
/**
 * Download the dataset's documented assets (imgur-hosted sprites referenced by
 * asset_manifest.json) into public/assets so pages never hotlink at runtime.
 *
 * Usage: node scripts/fetch-assets.mjs
 * Env  : FF_STARTER_KIT_DIR – path to the starter kit (for asset_manifest.json)
 */
import fs from "node:fs/promises";
import path from "node:path";

const APP_ROOT = process.cwd();
const STARTER_KIT =
  process.env.FF_STARTER_KIT_DIR ?? path.resolve(APP_ROOT, "..", "free_fire_data_starter_kit");
const MANIFEST = path.join(STARTER_KIT, "data", "imported_ff_center", "asset_manifest.json");
const OUT_ROOT = path.join(APP_ROOT, "public", "assets");

async function download(url, dest, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "BooyahFF/1.0 (fan project; asset sync)" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100) throw new Error("too small – likely an error page");
      await fs.writeFile(dest, buf);
      return true;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return false;
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf-8"));
  const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
  const targets = [{ kind: "characters", key: "character" }, { kind: "weapons", key: "weapon" }, { kind: "pets", key: "pet" }, { kind: "loadouts", key: "loadout" }];
  const out = [];
  let ok = 0, skip = 0, fail = 0;

  for (const a of assets) {
    const mapping = targets.find((t) => t.key === a.kind);
    if (!mapping || !a.remote_url) continue;
    const ext = path.posix.extname(new URL(a.remote_url).pathname) || ".png";
    const destDir = path.join(OUT_ROOT, mapping.kind);
    const dest = path.join(destDir, `${a.slug}${ext}`);
    out.push(`${mapping.kind}/${a.slug}${ext}`);
    await fs.mkdir(destDir, { recursive: true });
    try {
      await fs.access(dest);
      skip++;
      continue; // already downloaded
    } catch {}
    try {
      await download(a.remote_url, dest);
      ok++;
    } catch (err) {
      fail++;
      console.warn(`  ! failed ${mapping.kind}/${a.slug}: ${err}`);
    }
  }
  await fs.writeFile(path.join(APP_ROOT, "src", "data", "status", "asset-sync.json"), JSON.stringify({
    syncedAt: new Date().toISOString(),
    downloaded: ok,
    skipped: skip,
    failed: fail,
    files: out,
  }, null, 2));
  console.log(`assets: downloaded=${ok} skipped(already)=${skip} failed=${fail}`);
  if (fail > 0 && ok === 0) process.exitCode = 1;
}

main();
