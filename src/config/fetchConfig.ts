import { AppConfig } from "./config";

const fetchConfig = async (): Promise<AppConfig> => {
    const response = await fetch('/config.json');
    if (!response.ok) {
        throw new Error(`Failed to fetch configuration: ${response.status} ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new TypeError("Oops, we haven't got JSON!");
    }
    return await response.json() as Promise<AppConfig>;
}

export default fetchConfig;
