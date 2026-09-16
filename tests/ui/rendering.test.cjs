const path = require("node:path");
const assert = require("node:assert/strict");
const { writeFile } = require("node:fs/promises");
const { ActivityBar, By, EditorView, TextEditor, VSBrowser } = require("vscode-extension-tester");
const { Key } = require("selenium-webdriver");

function rgb(hex) {
  const value = hex.slice(1, 7);
  return `rgb(${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)})`;
}

async function waitForColor(driver, selector, property, expected) {
  let actual;
  await driver.wait(
    async () => {
      const candidate = await driver.findElement(By.css(selector));
      actual = await driver.executeScript(
        "return window.getComputedStyle(arguments[0])[arguments[1]]",
        candidate,
        property,
      );
      return actual === expected;
    },
    10_000,
    `${selector} did not render ${expected}`,
  ).catch((error) => {
    error.message += `; actual ${property}: ${actual}`;
    throw error;
  });
  return driver.findElement(By.css(selector));
}

describe("Lumen rendering", function () {
  this.timeout(60_000);

  it("applies the selected theme to real workbench surfaces", async function () {
    const browser = VSBrowser.instance;
    await browser.waitForWorkbench();
    const driver = browser.driver;
    const expected = rgb(process.env.LUMEN_EXPECTED_BACKGROUND);

    for (const selector of [
      ".part.activitybar",
      ".part.sidebar",
      ".monaco-editor-background",
    ]) {
      const element = await waitForColor(driver, selector, "backgroundColor", expected);
      const actual = await driver.executeScript(
        "return window.getComputedStyle(arguments[0]).backgroundColor",
        element,
      );
      assert.equal(actual, expected, `${selector} rendered ${actual}, expected ${expected}`);
    }

    if (process.env.LUMEN_THEME_SLUG === "blanc") {
      await new TextEditor().click();
      const indicator = await waitForColor(driver, ".tabs-container .tab.active .tab-border-bottom-container", "backgroundColor", rgb("#496d91"));
      assert.ok(await indicator.isDisplayed(), "active tab underline must be visible");
    }

    const expectedStatus = rgb(process.env.LUMEN_EXPECTED_STATUS_BACKGROUND);
    const statusBar = await waitForColor(
      driver,
      ".part.statusbar",
      "backgroundColor",
      expectedStatus,
    );
    const statusColor = await driver.executeScript(
      "return window.getComputedStyle(arguments[0]).backgroundColor",
      statusBar,
    );
    assert.equal(statusColor, expectedStatus);

    const renderedTokenColors = new Set(
      await driver.executeScript(
        "return Array.from(document.querySelectorAll('.view-lines span')).map((node) => window.getComputedStyle(node).color)",
      ),
    );
    for (const color of process.env.LUMEN_EXPECTED_TOKEN_COLORS.split(",")) {
      assert.ok(renderedTokenColors.has(rgb(color)), `syntax token color ${color} was not rendered`);
    }

    await browser.takeScreenshot(`lumen-${process.env.LUMEN_THEME_SLUG}`);
    const light = process.env.LUMEN_THEME_SLUG === "blanc";
    const foreground = light ? "#1a1a1a" : "#e0e0e0";
    const accent = light ? "#496d91" : "#f54e00";
    const link = light ? "#496d91" : "#7eb6f6";
    // Check resolved theme variables too: these catch independent defaults and
    // inheritance regressions in controls that aren't visible in this fixture.
    const roles = {
      "focusBorder": accent,
      "textLink.foreground": link,
      "textLink.activeForeground": link,
      "list.highlightForeground": link,
      "activityBarBadge.background": accent,
      "progressBar.background": accent,
      "statusBarItem.remoteForeground": accent,
      "editorError.foreground": light ? "#a04a3a" : "#bf616a",
      "editorWarning.foreground": light ? "#a67c00" : "#ebcb8b",
      "editorInfo.foreground": link,
      "tab.activeBackground": light ? "#eaeae7" : "#302f28",
      "tab.inactiveBackground": process.env.LUMEN_EXPECTED_BACKGROUND,
    };
    for (const component of ["input", "dropdown", "checkbox", "editorWidget", "editorHoverWidget", "editorSuggestWidget", "quickInput", "menu", "notifications"]) {
      roles[`${component}.background`] = process.env.LUMEN_EXPECTED_BACKGROUND;
      roles[`${component}.foreground`] = foreground;
    }
    for (const component of ["list.activeSelection", "quickInputList.focus", "menu.selection", "editorSuggestWidget.selected"]) {
      roles[`${component}Foreground`] = foreground;
    }
    const resolved = await driver.executeScript(
      "const s = getComputedStyle(document.querySelector('.monaco-workbench')); return Object.fromEntries(arguments[0].map(k => [k, s.getPropertyValue('--vscode-' + k.replaceAll('.', '-')).trim().toLowerCase()]));",
      Object.keys(roles),
    );
    for (const [key, color] of Object.entries(roles)) {
      assert.equal(resolved[key], color.toLowerCase(), `${key} must follow the palette`);
    }
    if (process.env.LUMEN_THEME_SLUG === "blanc") {
      await (await new ActivityBar().getViewControl("Explorer")).openView();
      const selector = ".part.sidebar .monaco-button:not(.secondary)";
      const button = await waitForColor(driver, selector, "backgroundColor", rgb("#496d91"));
      await waitForColor(driver, selector, "color", rgb("#f7f7f4"));
      await driver.actions().move({ x: 500, y: 300, origin: "viewport" }).perform();
      await driver.actions().move({ origin: button }).perform();
      await waitForColor(driver, selector, "backgroundColor", rgb("#3f607f"));
      await browser.takeScreenshot("lumen-blanc-button-hover");
    }
    await driver.actions().sendKeys(Key.F1).perform();
    await waitForColor(driver, ".quick-input-widget", "backgroundColor", expected);
    await waitForColor(driver, ".quick-input-widget .monaco-inputbox", "backgroundColor", expected);
    const selected = ".quick-input-list .monaco-list-row.focused";
    await waitForColor(driver, selected, "color", rgb(foreground));
    // VS Code serializes the theme's alpha byte to two decimal places.
    await waitForColor(driver, selected, "backgroundColor", light ? rgb("#EAEAE7") : "rgba(255, 255, 255, 0.13)");
    await browser.takeScreenshot(`lumen-${process.env.LUMEN_THEME_SLUG}-command-palette`);
    await driver.actions().sendKeys(Key.ESCAPE).perform();

  });

  const light = process.env.LUMEN_THEME_SLUG === "blanc";
  const palette = {
    key: light ? "#496d91" : "#7eb6f6",
    string: light ? "#5a765c" : "#99c794",
    constant: light ? "#6a4a7a" : "#c594c5",
    tag: light ? "#4a6d6c" : "#f54e00",
    comment: light ? "#706d6b" : "#909090",
  };
  const cases = {
    "json.json": [["\"title\"", "key"], ["\"nested\"", "key"], ["Paper lantern", "string"], ["42", "constant"], ["true", "constant"], ["null", "constant"], ["\\n", "constant"]],
    "jsonc.jsonc": [["\"title\"", "key"], ["Paper lantern", "string"], ["Configuration with comments", "comment"]],
    "json-lines.jsonl": [["\"title\"", "key"], ["Paper lantern", "string"], ["true", "constant"]],
    "example.code-snippets": [["\"prefix\"", "key"], ["Warm light", "string"]],
    "styles.css": [["lantern", "tag"], ["preview", "tag"], ["hover", "tag"], ["display", "key"], ["block", "constant"], ["rebeccapurple", "constant"], ["Warm light", "string"]],
    "config.ini": [["lantern", "tag"], ["title", "key"], ["Paper lantern", "string"]],
    "application.properties": [["title", "key"], ["Paper lantern", "string"]],
    "markup.html": [["section", "tag"], ["class", "key"], ["Warm light", "string"]],
    "document.xml": [["lantern", "tag"], ["title", "key"], ["Warm light", "string"], ["kind", "key"], ["paper:kind", "key", "paper"]],
    "image.svg": [["circle", "tag"], ["viewBox", "key"], ["currentColor", "string"]],
    "javascript.js": [["title:", "key", "title"], ["label", "key"], ["Paper lantern", "string"], ["describe()", "key", "describe"]],
    "javascript.jsx": [["title:", "key", "title"], ["className", "key"], ["Paper lantern", "string"]],
    "typescript.tsx": [["className", "key"], ["title: string", "key", "title"]],
    "typescript.ts": [["label: string", "key", "label"], ["lantern.label", "key", "label"], ["lantern.title", "key", "title"], ["Paper lantern", "string"]],
    "config.yaml": [["title", "tag"], ["Paper lantern", "string"], ["true", "constant"]],
    "config.toml": [["lantern", "tag"], ["title", "key"], ["Paper lantern", "string"], ["true", "constant"]],
    ".env.example": [["TITLE", "key"], ["Paper lantern", "string"], ["true", "constant"], ["42", "constant"], ["${TITLE}", "key", "TITLE"]],
  };
  for (const [file, tokens] of Object.entries(cases)) {
    it(`renders ${file} roles (semantic highlighting ${process.env.LUMEN_SEMANTIC_MODE})`, async function () {
      const browser = VSBrowser.instance;
      await browser.openResources(path.resolve(__dirname, "../../samples", file));
      await new EditorView().openEditor(file);
      await browser.driver.wait(async () => {
        try { return path.basename(await new TextEditor().getFilePath()) === file; }
        catch { return false; }
      }, 10000, `Expected the text editor for ${file}`);
      // Bring the fixture start into view, including when reopening a persisted tab.
      const modifier = process.platform === "darwin" ? Key.COMMAND : Key.CONTROL;
      await browser.driver.actions().keyDown(modifier).sendKeys(Key.HOME).keyUp(modifier).perform();
      for (const [needle, role, token = needle] of tokens) {
        let actual;
        await browser.driver.wait(async () => {
          actual = await browser.driver.executeScript(function (needle, token) {
            for (const line of document.querySelectorAll(".monaco-editor .view-lines .view-line")) {
              if (!line.getClientRects().length) continue;
              const text = line.textContent.replaceAll("\u00a0", " ");
              const start = text.indexOf(needle);
              if (start < 0) continue;
              const colors = [];
              const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
              while (walker.nextNode()) {
                colors.push(...Array(walker.currentNode.textContent.length).fill(getComputedStyle(walker.currentNode.parentElement).color));
              }
              return colors.slice(start + needle.indexOf(token), start + needle.indexOf(token) + token.length);
            }
            return [];
          }, needle, token);
          return actual.length === token.length && actual.every(color => color === rgb(palette[role]));
        }, 10000, `${file}: ${token} should use ${role}`).catch(error => {
          error.message += `; rendered ${JSON.stringify(actual)}`;
          throw error;
        });
      }
      await browser.takeScreenshot(`syntax-${process.env.LUMEN_THEME_SLUG}-${process.env.LUMEN_SEMANTIC_MODE}-${file.replaceAll(".", "-")}`);
    });
  }

  after(async function () {
    if (this.test.parent.tests.every(test => test.state === "passed")) {
      await writeFile(process.env.LUMEN_RESULT_FILE, "passed\n");
    }
  });

});
