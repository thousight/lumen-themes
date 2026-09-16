import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
for (const [slug, background, statusBackground, tokenColors] of [
  ["blanc", "#f7f7f4", "#f7f7f4", "#a04a3a,#496d91,#32402f"],
  ["noir", "#26251e", "#26251e", "#f54e00,#7eb6f6,#99c794"],
]) {
  for (const semanticMode of ["true", "false"]) {
    const result = spawnSync(
      process.execPath,
      [path.join(root, "scripts/run-ui-case.mjs"), slug, background, statusBackground, tokenColors, semanticMode],
      {
        cwd: root,
        env: process.env,
        stdio: "inherit",
      },
    );
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
