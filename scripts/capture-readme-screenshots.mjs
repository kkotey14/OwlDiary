import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const screenshotDir = path.join(rootDir, "docs", "screenshots");
const playwrightEntry = pathToFileURL(
    "/Users/kingsleykotey/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs",
).href;

const { chromium } = await import(playwrightEntry);

const browser = await chromium.launch({
    headless: true,
    executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

const context = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
    colorScheme: "light",
});

const page = await context.newPage();
const baseUrl = "http://localhost:5173";

await fs.mkdir(screenshotDir, { recursive: true });

const goto = async (pathname) => {
    await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
};

const shot = async (name, fullPage = false) => {
    await page.screenshot({
        path: path.join(screenshotDir, `${name}.png`),
        fullPage,
    });
    console.log(`saved ${name}`);
};

const loginAs = async (label) => {
    await goto("/login");
    await page.getByRole("button", { name: label }).click();
    await page.waitForURL(/localhost:5173\/$/);
    await page.waitForTimeout(1200);
};

try {
    await goto("/login");
    await shot("01-login");

    await goto("/signup");
    await shot("02-signup");

    await goto("/forgot-password");
    await shot("03-forgot-password");

    await loginAs("Continue as Guest Student");
    await shot("04-guest-dashboard");

    await page.getByTitle("Create Post").click();
    await page.waitForTimeout(500);
    await shot("05-create-post-modal");
    await page.getByRole("button", { name: "Cancel" }).click();
    await page.waitForTimeout(400);

    await page.getByTitle("Classroom Directory").click();
    await page.waitForTimeout(900);
    await shot("06-directory");

    await page.getByTitle("My Profile").click();
    await page.waitForTimeout(1200);
    await shot("07-profile");

    await page.locator("article").first().click();
    await page.waitForTimeout(1000);
    await shot("08-post-detail");

    await page.goBack({ waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await page.getByTitle("Home").click();
    await page.waitForTimeout(900);
    await page.getByTitle("Notifications").click();
    await page.waitForTimeout(500);
    await shot("09-notification-dropdown");

    await page.getByTitle("Settings").click();
    await page.waitForTimeout(900);
    await shot("10-guest-settings");

    await loginAs("Continue as Admin");
    await page.getByTitle("Settings").click();
    await page.waitForTimeout(900);
    await shot("11-admin-settings");

    await page.getByRole("button", { name: /Manage Students/ }).click();
    await page.waitForTimeout(900);
    await shot("12-admin-manage-students");
    await page.mouse.click(20, 20);
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: /Manage Codes/ }).click();
    await page.waitForTimeout(900);
    await shot("13-admin-registration-codes");
} finally {
    await browser.close();
}
