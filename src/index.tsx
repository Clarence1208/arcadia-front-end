import React, {createContext, useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import theme from "./utils/theme";
import {ThemeProvider} from "@mui/material";

export const ConfigContext = createContext<any>(null);

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

const fetchConfig = async (): Promise<any> => {
    try {
        const response = await fetch('/app/config.json');
        if (!response.ok) {
            throw new Error('Failed to fetch configuration');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching configuration:", error);
        return null;
    }
};

const RootComponent = () => {
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        fetchConfig().then(data => {
            setConfig(data);
        });
    }, []);

    if (!config) {
        return <div>Loading configuration...</div>; // Optionally add a spinner here
    }

    return (
        <ConfigContext.Provider value={config}>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </ConfigContext.Provider>
    );
};

root.render(<RootComponent />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
