export type TargetWebUrl = {
    url: string;
};

export interface Input {
    startUrls: TargetWebUrl[];
}

export type Technology = {
    name: string;
    version?: string;
}

export type CompanyInformation = Record<string, string | { name: string; mapLink: string }[]>;

export type Email = {
    email: string;
    name?: string;
    title?: string;
};

export type Location = {
    name: string;
    mapLink?: string;
};

export type SocialLink = {
    text?: string;
    link: string;
};

type CardDataValue =
    | Email[]
    | Location[]
    | SocialLink[]
    | SocialLink // single social link object
    | boolean
    | string
    | string[];

export type CardData = Record<string, CardDataValue>

export interface CompanyProfileOutput {
    [key: string]: string[] | Technology[] | CardData | undefined;
}
