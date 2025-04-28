import { Stagehand, Page, BrowserContext } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import chalk from "chalk";
import boxen from "boxen";
import { drawObserveOverlay, clearOverlays, actWithCache } from "./utils.js";
import { z } from "zod";
 
async function main({
  page,
  context,
  stagehand,
}: {
  page: Page; // Playwright Page with act, extract, and observe methods
  context: BrowserContext; // Playwright BrowserContext
  stagehand: Stagehand; // Stagehand instance
}) {

    await page.goto("https://unstop.com/hackathons?oppstatus=open&domain=2&course=6&specialization=Computer%20Science&usertype=students&passingOutYear=2026&quickApply=true");

    await page.setViewportSize({ width: 375, height: 667 });

    const startTime = Date.now();
    const scrollDuration = 10000;

    while (Date.now() - startTime < scrollDuration) {
      await page.evaluate(() => {
        window.scrollBy(0, 100);
      });
      await page.waitForTimeout(100);
    }

    const { content } = await page.extract({
      instruction: "extract all visible content from the page",
      schema: z.object({
        content: z.string(),
      }),
      useTextExtract: true,
    });

    stagehand.log({
      category: "unstop-scraper",
      message: "Extracted content from Unstop hackathons page",
      auxiliary: {
        content: {
          value: content,
          type: "string",
        },
      },
    });
  }


async function run() {
  const stagehand = new Stagehand({
    ...StagehandConfig,
  });
  await stagehand.init();

  if (StagehandConfig.env === "BROWSERBASE" && stagehand.browserbaseSessionID) {
    console.log(
      boxen(
        `View this session live in your browser: \n${chalk.blue(
          `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`,
        )}`,
        {
          title: "Browserbase",
          padding: 1,
          margin: 3,
        },
      ),
    );
  }

  const page = stagehand.page;
  const context = stagehand.context;
  await main({
    page,
    context,
    stagehand,
  });
  await stagehand.close();

}

run();
