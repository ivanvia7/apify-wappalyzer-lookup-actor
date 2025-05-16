import { Actor, Dataset } from 'apify';
import { PlaywrightCrawler } from 'crawlee';
import { firefox } from 'playwright';

import { htmlCollector, router } from './routes.js';
import { Input, CompanyProfileOutput } from './types.js';

import { prepareAllStartUrls } from './utils.js';
import { parseTechnologyContainer, parserInfoContainer } from './parsers.js';

await Actor.init();

const input = (await Actor.getInput<Input>())!;

const { startUrls } = input;

const fixedStartUrls = prepareAllStartUrls(startUrls);

const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['BUYPROXIES94952'],
});

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    requestHandler: router,
    requestHandlerTimeoutSecs: 360,
    launchContext: {
        launcher: firefox,
        launchOptions: {
            args: ['--disable-gpu'],
            headless: false,
        },
    },
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

const combinedData: CompanyProfileOutput = { ...companyData, ...techonologyData };

await Dataset.pushData(combinedData);

await Actor.exit();
