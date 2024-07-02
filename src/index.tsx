import React, {createContext, useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {AppConfig} from "./config/config";
import fetchConfig from "./config/fetchConfig";

export const ConfigContext = createContext<AppConfig>({} as AppConfig);

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

const RootComponent = () => {
    const [config, setConfig] = useState<AppConfig | null>(null);

    useEffect(() => {
        fetchConfig().then(data => {
            setConfig(data);
        }).catch(error => {
            console.error("Error fetching Arcadia configuration:", error);
        });
    }, []);

    if (!config) {
        return <div>Loading configuration...</div>;
    }

    return (
        <ConfigContext.Provider value={config}>
            <React.StrictMode>
                <App/>
            </React.StrictMode>
        </ConfigContext.Provider>
    );
};

root.render(<RootComponent/>);

reportWebVitals();
