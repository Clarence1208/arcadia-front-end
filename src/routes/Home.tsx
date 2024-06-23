import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {Chatbot} from "./components/Chatbot";
import mainPic from "../images/template_home_pic.jpg";
import "../styles/Home.css";
import {CookieConsent} from "react-cookie-consent";
import {useEffect, useState} from "react";
import {Skeleton} from "@mui/material";
import {ConfigContext} from "../index";
import {useContext} from "react";


type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}
export function Home() {
    const config = useContext(ConfigContext);

    if (!config) {
        return <div>Loading...</div>; // or any other placeholder
    }

    const [dataFetched, setDataFetched] = useState(false);
    const [data, setData] = useState<string[]>([]);

    useEffect(() => {
        async function getConfiguration(){
            try{
                const response = await fetch(`${config.apiURL}/websiteSettings`);
                const data : WebSetting[] = await response.json();
                const title = data.find( item => item.name === 'titleHomePage');
                const subTitle = data.find( item => item.name === 'subTitleHomePage');
                const showChatbot = data.find( item => item.name === 'displayChatbot');
                return [title ? title.value : "Association française des personnes malades", subTitle ? subTitle.value : "Vous nous avez vu mais nous avez vous regardé ?", showChatbot ? showChatbot.value : "false"];
            }catch (e) {
                console.warn(e)
                return [];
            }
        }

        getConfiguration().then(data => {
            setData(data);
            // setDataFetched(true);
        });

    }, []);
        if (data === undefined || data.length === 0) {
            return (
                <div>
                    <Header/>
                    <div className={"main home"}>
                        <Skeleton variant="rectangular" animation="wave" width={"70vw"} height={"40vh"} />
                    </div>
                    <Footer />
                </div>
            )
        }else {

            return (
                <div>
                    <Header/>
                    <div className={"main home"}>
                        <div>
                            <h1>{data[0]}</h1>
                            <h3>{data[1]}</h3>
                        </div>
                        <img src={mainPic}/>
                    </div>
                    <CookieConsent location={"bottom"} buttonStyle={{
                        background: "linear-gradient(to left, orange , yellow, green, cyan, blue, violet)",
                        color: "white",
                        fontWeight: "bolder",
                        textShadow: "2px 2px black",
                    }}>Ce site utilise les cookies :)</CookieConsent>

                    {data[2].toLowerCase() === "true" && <Chatbot/>}
                    <Footer/>
                </div>
            );
        }
}