import { access, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ExTester, ReleaseQuality } from "vscode-extension-tester";

const [slug, background, statusBackground, tokenColors, semanticMode = "true"] = process.argv.slice(2);
if (!slug || !background || !statusBackground || !tokenColors) {
  throw new Error("theme slug, backgrounds, and token colors are required");
}

const root = path.resolve(import.meta.dirname, "..");
const version = process.env.VSCODE_UI_VERSION ?? "1.109.4";
const results = path.join(root, "test-results");
const marker = path.join(results, `ui-${slug}.passed`);
await mkdir(results, { recursive: true });
await rm(marker, { force: true });

const tester = new ExTester(
  path.join(root, ".vscode-test", `ui-${version}`),
  ReleaseQuality.Stable,
  path.join(root, ".vscode-test", `extensions-syntax-${slug}`),
);
await tester.downloadCode(version);
await tester.downloadChromeDriver(version);
// Install only into this test profile, with reproducible grammar versions.
for (const extension of ["tamasfe.even-better-toml@0.21.2", "mikestead.dotenv@1.0.1"]) {
  await tester.installFromMarketplace(extension);
}
await tester.installVsix({ vsixFile: path.join(root, "dist/lumen-themes.vsix") });

const settingsPath = path.join(results, `settings-${slug}.json`);
const settings = JSON.parse(await readFile(path.join(root, `tests/ui/settings/${slug}.json`), "utf8"));
settings["editor.semanticHighlighting.enabled"] = semanticMode === "true";
settings["workbench.editorAssociations"] = { "*.svg": "default" };
settings["files.associations"] = { "*.svg": "xml", "*.properties": "properties", "*.code-snippets": "snippets" };
await writeFile(settingsPath, JSON.stringify(settings));
process.env.LUMEN_SEMANTIC_MODE = semanticMode;
process.env.LUMEN_THEME_SLUG = slug;
process.env.LUMEN_EXPECTED_BACKGROUND = background;
process.env.LUMEN_EXPECTED_STATUS_BACKGROUND = statusBackground;
process.env.LUMEN_EXPECTED_TOKEN_COLORS = tokenColors;
process.env.LUMEN_RESULT_FILE = marker;
const status = await tester.runTests([path.join(root, "tests/ui/rendering.test.cjs")], {
  vscodeVersion: version,
  settings: settingsPath,
  resources: [path.join(root, "samples/typescript.tsx")],
  cleanup: false,
});
if (status !== 0) process.exit(status);

try {
  await access(marker);
} catch {
  throw new Error(`${slug} UI test returned success without completing every assertion`);
}
