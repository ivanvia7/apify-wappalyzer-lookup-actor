import { createPlaywrightRouter } from 'crawlee';

export const htmlCollector = {
    techContainerHtml: '',
    infoContainerHtml: '',
};

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ request, log, page }) => {
    log.info(`🏃Going to the target page: ${request.url}`);

    await page.waitForTimeout(15000);

    await page.reload({ timeout: 120_000, waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(30000);

    // selecting the main containers of the page
    const mainContainersLocator = page.locator(
        '.container > div > .row > .col-sm-6.col-12',
    );

    try {
        await mainContainersLocator.first().waitFor({
            state: 'attached',
            timeout: 10000,
        });
    } catch (e) {
        log.error(
            `Main containers are not found. Skipping this url. Error: ${e}. RequestUrl: ${request.url} `,
        );
        return;
    }

    const techContainer = await mainContainersLocator.first().innerHTML();
    const infoContainer = await mainContainersLocator.nth(1).innerHTML();

    htmlCollector.techContainerHtml = techContainer;
    htmlCollector.infoContainerHtml = infoContainer;
});
