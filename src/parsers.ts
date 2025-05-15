import { load } from "cheerio";
import { log } from "apify";

export function parseTechnologyContainer(
    technologyHtml: string,
): Record<string, any[]> {
    if (!technologyHtml) {
        log.error("There was no html provided in parseTechnologyContainer");
        return {};
    }

    log.info("⚙️ Processing technology container with Cheerio...");

    const $ = load(technologyHtml);

    const results: Record<string, any[]> = {};

    // const mainHeader = $("h3.mb-4").text().trim();

    const categoryCards = $("div.mb-4.v-card");

    if (categoryCards.length === 0) {
        log.error(
            "No category cards found. Check the selector for 'categoryCards'.",
        );
    }

    categoryCards.each((__, cardNode) => {
        const card = $(cardNode);

        const cardHeader = card
            .find("div.v-card__title.subtitle-2 a")
            .text()
            .trim();

        const technologies: any = [];
        const techItemElements = card.find(
            "div.v-card__text div.col-sm-6.col-12",
        );

        techItemElements.each((_, techItemNode) => {
            const techItem = $(techItemNode);
            const linkElement = techItem.find("a.body-2.text-decoration-none");

            if (linkElement.length > 0) {
                const nameElement = linkElement.find("div.ml-2 span");
                const techName = nameElement.text().trim();

                const versionElement = linkElement.find(
                    "div.ml-2 small.text--disabled",
                );
                let techVersion = null;
                if (versionElement.length > 0) {
                    techVersion = versionElement.text().trim();
                }

                if (techName) {
                    technologies.push({
                        name: techName,
                        version: techVersion || undefined,
                    });
                }
            }
        });

        if (cardHeader && technologies.length > 0) {
            results[cardHeader] = technologies;
        } else if (cardHeader && technologies.length === 0) {
            results[cardHeader] = [];
        }
    });
    return results;
}

export function parserInfoContainer(infoHtml: string) {
    if (!infoHtml) {
        log.error("There was no html provided in parseTechnologyContainer");
        return {};
    }

    log.info("⚙️ Processing info container with Cheerio...");

    const $ = load(infoHtml);

    const results: any = {};

    const categoryCards = $("div.v-card.v-sheet--outlined");

    if (categoryCards.length === 0) {
        log.error(
            "No category cards found. Check the selector for 'categoryCards'.",
        );
    }

    categoryCards.each((index, cardNode) => {
        if (index === 0) return; // Skipping the paywall card

        const card = $(cardNode);

        const cardHeader = card
            .find("div.v-sheet > div.v-card__title.subtitle-2")
            .text()
            .trim();

        if (!cardHeader) {
            return;
        }

        if (cardHeader === "Keywords") {
            const keywords: string[] = [];
            card.find("div.v-card__text a.v-chip span.v-chip__content").each(
                (_, chipNode) => {
                    const keyword = $(chipNode).text().trim();
                    if (keyword) keywords.push(keyword);
                },
            );
            results[cardHeader] = keywords;
            return;
        }

        const cardData: any = {};

        const subCategoryElements = card.find(":scope > div:not([class])");

        subCategoryElements.each((__, subCategoryNode) => {
            const subCategory = $(subCategoryNode);
            const subCategoryHeaderElement = subCategory.find(
                ":scope > .v-card__title.subtitle-2",
            );
            const subCategoryHeader = subCategoryHeaderElement.text().trim();
            const subCategoryContentElement = subCategory.find(
                ":scope > .v-card__text",
            );

            if (!subCategoryHeader) {
                return;
            }

            switch (subCategoryHeader) {
                case "Email addresses":
                    const emails: Record<string, string | undefined>[] = [];
                    subCategoryContentElement
                        .find("table tbody tr")
                        .each((_, trNode) => {
                            const row = $(trNode);
                            const linkElement = row.find(
                                "td a[href^='/verify/']",
                            );
                            const emailText = linkElement
                                .find("span:not([class*='v-icon'])")
                                .text()
                                .trim(); // Get span that's not the icon

                            const detailsDiv = linkElement.siblings("div"); // Div containing name and title
                            let name = "";
                            let title = "";
                            if (detailsDiv.length > 0) {
                                name = detailsDiv
                                    .contents()
                                    .filter((___, el) => el.type === "text")
                                    .first()
                                    .text()
                                    .trim();
                                title = detailsDiv
                                    .find("span.text--disabled")
                                    .text()
                                    .replace("—", "")
                                    .trim();
                            }
                            if (emailText) {
                                emails.push({
                                    email: emailText,
                                    name: name || undefined,
                                    title: title || undefined,
                                });
                            }
                        });
                    cardData[subCategoryHeader] = emails;
                    break;

                case "Locations":
                    const locations: Record<string, string | undefined>[] = [];
                    subCategoryContentElement
                        .find("div > span > a")
                        .each((_, linkNode) => {
                            const link = $(linkNode);
                            const name = link.text().trim();
                            const href = link.attr("href");
                            if (name) {
                                locations.push({ name, mapLink: href });
                            }
                        });
                    cardData[subCategoryHeader] = locations;
                    break;

                case "GitHub":
                case "TikTok":
                case "YouTube":
                case "LinkedIn":
                    const socialLinks: Record<string, string | undefined>[] =
                        [];
                    subCategoryContentElement.find("a").each((_, linkNode) => {
                        const link = $(linkNode);
                        let text: string | undefined = link.text().trim();
                        const href = link.attr("href");

                        if (
                            !text &&
                            link.find("span:not([class*='v-icon'])").length > 0
                        ) {
                            text = link
                                .find("span:not([class*='v-icon'])")
                                .text()
                                .trim();
                        }
                        if (!text && link.find("img[alt]").length > 0) {
                            text = link.find("img[alt]")?.attr("alt")?.trim();
                        }
                        if (!text) text = href; // Fallback to href if no other text

                        if (href) {
                            socialLinks.push({ text, link: href });
                        }
                    });
                    cardData[subCategoryHeader] =
                        socialLinks.length === 1 ? socialLinks[0] : socialLinks;
                    break;

                case "SSL/TLS enabled":
                    const isEnabled =
                        subCategoryContentElement.find(
                            "span.v-icon.success--text",
                        ).length > 0;
                    cardData[subCategoryHeader] = isEnabled;
                    break;

                default:
                    let defaultText = subCategoryContentElement.text().trim();
                    defaultText = defaultText.replace(/\s\s+/g, " ").trim();
                    cardData[subCategoryHeader] = defaultText;
            }
        });

        if (Object.keys(cardData).length > 0) {
            results[cardHeader] = cardData;
        } else if (!results[cardHeader]) {
            const directCardText = card
                .find(":scope > div.v-card__text")
                .text()
                .trim();
            if (directCardText) {
                results[cardHeader] = directCardText;
            }
        }
    });

    return results;
}
