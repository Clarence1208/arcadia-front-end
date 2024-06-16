import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {Chatbot} from "./components/Chatbot";
import mainPic from "../images/template_home_pic.jpg";
import "../styles/Home.css";
import {ConfigContext} from "../index";
import {useContext} from "react";
export function Home() {
    const config = useContext(ConfigContext);

        return (
            <div>
                <Header />
                    <div className={"main home"}>
                        <div>
                            <h1>Test: {config.apiURL}</h1>
                            <h1>Association française des personnes malades</h1>
                            <h3>Vous nous avez vu mais nous avez vous regardé ?</h3>
                        </div>
                        <img src={mainPic}/>
                    </div>
                <Chatbot />
                <Footer/>
            </div>
        );
}