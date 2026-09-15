const assert = require("node:assert/strict");
const { writeFile } = require("node:fs/promises");
const { ActivityBar, By, VSBrowser } = require("vscode-extension-tester");

function rgb(hex) {
  const value = hex.slice(1, 7);
  return `rgb(${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)})`;
}

async function waitForColor(driver, selector, property, expected) {
  await driver.wait(
    async () => {
      const candidate = await driver.findElement(By.css(selector));
      return (await driver.executeScript(
        "return window.getComputedStyle(arguments[0])[arguments[1]]",
        candidate,
        property,
      )) === expected;
    },
    10_000,
    `${selector} did not render ${expected}`,
  );
  return driver.findElement(By.css(selector));
}

describe("Lumen rendering", function () {
  this.timeout(30_000);

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
    if (process.env.LUMEN_THEME_SLUG === "blanc") {
      await (await new ActivityBar().getViewControl("Explorer")).openView();
      const selector = ".part.sidebar .monaco-button:not(.secondary)";
      const button = await waitForColor(driver, selector, "backgroundColor", rgb("#496d91"));
      await waitForColor(driver, selector, "color", rgb("#f7f7f4"));
      await driver.actions().move({ origin: button }).perform();
      await waitForColor(driver, selector, "backgroundColor", rgb("#3f607f"));
      await browser.takeScreenshot("lumen-blanc-button-hover");
    }
    await writeFile(process.env.LUMEN_RESULT_FILE, "passed\n");
  });
});
