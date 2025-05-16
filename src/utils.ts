import { URL_BASE_LOOKUP } from './consts.js';
import { TargetWebUrl } from './types.js';

export function createStartUrl(targetWeb: string): string {
    const sanitizedTargetUrl = targetWeb
        .replace(/^https?:\/\//, '')
        .split('/')[0];
    return `${URL_BASE_LOOKUP}${sanitizedTargetUrl}`;
}

export function prepareAllStartUrls(
    startUrlsFromInput: TargetWebUrl[],
): TargetWebUrl[] {
    return startUrlsFromInput.map((urlObj) => ({
        url: createStartUrl(urlObj.url),
    }));
}
