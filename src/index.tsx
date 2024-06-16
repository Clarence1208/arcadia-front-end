import React, {createContext, useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {AppConfig} from "./config/config";
import fetchConfig from "./config/fetchConfig";

export const ConfigContext = createContext<AppConfig | null>(null);

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
        return <div>Loading configuration...</div>; // Optionally add a spinner here
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
