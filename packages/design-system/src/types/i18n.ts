export type bonkxbtLocaleTranslateFnOptions = string[] | Record<string, unknown>;

export type bonkxbtLocaleTranslateFn = (path: string, options?: bonkxbtLocaleTranslateFnOptions) => string;

export type bonkxbtLocale = Record<string, string | ((...args: unknown[]) => string)>;
