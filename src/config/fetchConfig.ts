import { AppConfig } from "./config";

const fetchConfig = async (): Promise<AppConfig> => {
    const response = await fetch('/config/config.json'); // Adjust the URL as necessary
    if (!response.ok) {
        throw new Error('Failed to fetch configuration');
    }
    return response.json() as Promise<AppConfig>;
}

export default fetchConfig;
