import Clock from "react-clock";
import { Footer } from "./components/Footer";
import Header from "./components/Header";
import { useEffect, useState } from "react";

export function Contact(){

    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 10);
    }, []);

    
    return (
        <>
        <Header />
            {isPageLoaded &&
            <div>
                <div className="main">
                    <h1>Contact</h1>
                </div>
            </div>
        }
        <Footer />
        </>
    );
}