import { Dataset, createPlaywrightRouter } from "crawlee";
import { Actor } from "apify";

export let htmlCollector = {
    techContainerHtml: "",
    infoContainerHtml: "",
};

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ request, log, page }) => {
    //navigation to the page
    log.info(`🏃Going to the target page: ${request.url}`);
    // log.info("⏰ Waiting 15 seconds for the page to load");

    await page.waitForTimeout(15000);

    // log.info("🔁 Reload in progress");
    await page.reload({ timeout: 120_000, waitUntil: 'domcontentloaded' })

    await page.waitForTimeout(30000);

    //setting up the result object
    const result: any = {};

    //getting level up data from the page
    const header = await page.locator("h1.mb-4.mt-n3").textContent();
    result["header"] = header?.trim();
    result["url"] = request.url;

    //selecting the main containers of the page
    const mainContainersLocator = page.locator(
        ".container > div > .row > .col-sm-6.col-12",
    );

    try {
        await mainContainersLocator.first().waitFor({
            state: "attached",
            timeout: 10000,
        });
    } catch (e) {
        await Dataset.pushData(result);
        Actor.fail(
            `Main containers are not found. Failing the Actor. Error: ${e}`,
        );
        return;
    }

    const techContainer = await mainContainersLocator.first().innerHTML();
    const infoContainer = await mainContainersLocator.nth(1).innerHTML();

    htmlCollector["techContainerHtml"] = techContainer;
    htmlCollector["infoContainerHtml"] = infoContainer;

    // log.info("📍Finished inside the route. Proceeding with parsing the data.");
});
