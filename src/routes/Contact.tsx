import Clock from "react-clock";
import { Footer } from "./components/Footer";
import Header from "./components/Header";

export function Contact(){
    return (
        <div>
            <Header />
            <div className="main">
                <h1>Contact</h1>
            </div>
            <Footer />
        </div>
    );
}