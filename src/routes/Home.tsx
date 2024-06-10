import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {Chatbot} from "./components/Chatbot";
import mainPic from "../images/template_home_pic.jpg";
import "../styles/Home.css";
import {CookieConsent} from "react-cookie-consent";
import { useContext, useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import {Skeleton} from "@mui/material";
import { getS3Config } from "../utils/s3Config";
import { listFilesS3, getObjectS3 } from "../utils/s3";
import { ConfigContext } from "../index";
import { _Object } from "@aws-sdk/client-s3";


type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}
export function Home() {

    const [errorMessage, setErrorMessage] = useState("");
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState<string>("");
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const config = useContext(ConfigContext);
    const [data, setData] = useState<string[]>([]);

    useEffect(() => {
        if (isDataFetched) {
            setTimeout(() => {
                setIsPageLoaded(true);
            }, 100);
        }
    }, [isDataFetched]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fileList = await listFilesS3();
                fileList?.Contents?.forEach((value: _Object, index: number, array: _Object[]) => {
                    if (!value?.Key) {
                        return;
                    }
                    const check = value?.Key?.split("/");
                    if ((check[0] === config.associationName) && (check[1] === "common") && (check[2].startsWith("imageHomePage-"))) {
                        setImage("https://arcadia-bucket.s3.eu-west-3.amazonaws.com/" + value?.Key);
                    }
                });
                setIsDataFetched(true);
            } catch (error) {
                console.error('List error:', error);
                setErrorMessage("Erreur : " + error);
                setOpen(true);
            }
        };
        async function getConfiguration(){
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/websiteSettings`);
                const data : WebSetting[] = await response.json();
                const title = data.find( item => item.name === 'titleHomePage');
                const subTitle = data.find( item => item.name === 'subTitleHomePage');
                const showChatbot = data.find( item => item.name === 'displayChatbot');
                return [
                    title ? title.value : "Association française des personnes malades",
                    subTitle ? subTitle.value : "Vous nous avez vu mais nous avez vous regardé ?",
                    showChatbot ? showChatbot.value : "false"
                ];
            }catch (e) {
                console.warn(e)
                return [];
            }
        }

        getConfiguration().then(data => {
            setData(data);
        });
        fetchData();
    }, []);

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("");
    };

        return (
            <div>
                <Header />
                {isPageLoaded &&
                <div>
                    <Snackbar
                    open={open}
                    autoHideDuration={3000}
                    onClose={handleClose}
                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                >
                    <Alert
                        onClose={handleClose}
                        severity={errorMessage.includes("Erreur") ? "error" : "success"}
                        variant="filled"
                        sx={{width: '100%'}}
                    >{errorMessage}</Alert>
                </Snackbar>
                        <div className={"main home"}>
                            <div>
                                <h1>{config.associationName}</h1>
                                <h1>{data[0]}</h1>
                                <h3>{data[1]}</h3>
                            </div>
                            <img src={image ? image : mainPic} alt="main-pic" />
                        </div>
                    <Chatbot />
                </div>
                }
            <Footer/>
        </div>
    );
}