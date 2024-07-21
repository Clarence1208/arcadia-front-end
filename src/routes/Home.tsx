import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {Chatbot} from "./components/Chatbot";
import mainPic from "../images/template_home_pic.jpg";
import "../styles/Home.css";
import {useContext, useEffect, useState} from "react";
import {Alert, Button, Snackbar, useTheme} from "@mui/material";
import {listFilesS3} from "../utils/s3";
import {ConfigContext} from "../index";
import {_Object} from "@aws-sdk/client-s3";


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
    const theme = useTheme();
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
                setErrorMessage("Erreur : " + error);
                setOpen(true);
            }
        };
        async function getConfiguration(){
            try{
                const response = await fetch(`${config.apiURL}/websiteSettings`);
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
                <div className="main">
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
                        <div className={"home"}>
                            <section className="quote">
                                <div className="quote-div" style={{backgroundColor: theme.palette.primary.main, color: "white"}}>
                                    <p>{data[0]}</p>
                                    <b>- {config.associationName}</b>
                                </div>
                                <div className="logo-div" style={{borderColor: theme.palette.primary.main}}>
                                    <img src={image ? image : mainPic} alt="logo" style={{maxHeight:"15vh"}}/>
                                </div>
                            </section>
                            <section className="cta-section">
                                <h2>{data[1]}</h2>
                                <Button variant="contained" style={{minWidth: "20vw", minHeight: "5vh"}} href="/donate"><b>Je fais un don !</b></Button>
                            </section>
                            <section id="about-home">
                                <img src={image ? image : mainPic} alt="main-pic"  />
                                <div className="text-home">
                                    <h2>Qui sommes-nous ?</h2>
                                    <p>
                                      Nous sommes intimement convaincus qu’un enfant qui vit ses passions et réalise ses rêves est un enfant qui trouve un surplus d’énergie pour affronter la maladie. Le personnel médical des 150 services hospitaliers avec lesquels nous collaborons au quotidien confirme d’ailleurs que le rêve aide leurs petits patients à se sentir mieux émotionnellement et parfois même physiquement.
                                        <br/><br/>
                                      L’Association est la seule association en France à réaliser plusieurs rêves pour un même enfant malade si son état le nécessite, en fonction de l'évolution de sa pathologie et de ses traitements. Les bénévoles de l’Association sont en contact régulier avec les enfants, leur famille et le personnel médical pour assurer un soutien dans la durée.
                                    </p>
                                </div>
                            </section>
                        </div>
                    <Chatbot />
                </div>
                }
            <Footer/>
        </div>
    );
}