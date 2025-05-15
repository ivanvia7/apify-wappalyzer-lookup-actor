import { Actor, Dataset } from "apify";
import { PlaywrightCrawler } from "crawlee";

import { router, htmlCollector } from "./routes.js";
import { Input } from "./types.js";

import { prepareAllStartUrls } from "./utils.js";

import { parseTechnologyContainer, parserInfoContainer } from "./parsers.js";

await Actor.init();

const input = await Actor.getInput<Input>();

if (!input) {
    throw new Error("Input is missing.");
}

const { startUrls } = input;

const fixedStartUrls = prepareAllStartUrls(startUrls);

const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ["BUYPROXIES94952"],
});

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    requestHandler: router,
    requestHandlerTimeoutSecs: 360,
    launchContext: {
        launchOptions: {
            args: ["--disable-gpu"],
            headless: true,
        },
    },
    // preNavigationHooks: [
    //     async (crawlingContext) => {
    //         const { page, request, log } = crawlingContext;
    //         const mainTargetUrl = request.loadedUrl || request.url;

    //         page.on("console", (msg) => {
    //             const type = msg.type();
    //             const text = msg.text();
    //             if (
    //                 ["error", "warning", "log", "info", "debug"].includes(type)
    //             ) {
    //                 crawlingContext.log.info(
    //                     `[BROWSER ${type.toUpperCase()}]: ${text}`,
    //                 );
    //             }
    //         });
    //         page.on("pageerror", (error) => {
    //             crawlingContext.log.error(
    //                 `[BROWSER PAGE_ERROR]: ${error.message}`,
    //                 { stack: error.stack, url: mainTargetUrl },
    //             );
    //         });
    //     },
    // ],
    useSessionPool: true,
    persistCookiesPerSession: false,
    sessionPoolOptions: {
        sessionOptions: {
            maxUsageCount: 1,
        },
    },
});

await crawler.run(fixedStartUrls);

const techonologyData = parseTechnologyContainer(
    htmlCollector.techContainerHtml,
);

const companyData = parserInfoContainer(htmlCollector.infoContainerHtml);

await Dataset.pushData({ ...companyData, ...techonologyData });

await Actor.exit();
