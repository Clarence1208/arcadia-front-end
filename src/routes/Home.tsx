import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {Chatbot} from "./components/Chatbot";
import mainPic from "../images/template_home_pic.jpg";
import "../styles/Home.css";
import { useContext, useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { listFilesS3, getObjectS3 } from "../utils/s3";
import { ConfigContext } from "../index";
import { _Object } from "@aws-sdk/client-s3";

export function Home() {

    const [errorMessage, setErrorMessage] = useState("");
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState<string>("");
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const config = useContext(ConfigContext);

    useEffect(() => {
        if (image) {
            setTimeout(() => {
                setIsPageLoaded(true);
            }, 100);
        }
    }, [image]);

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
            } catch (error) {
                console.error('List error:', error);
                setErrorMessage("Erreur : " + error);
                setOpen(true);
            }
        };
        fetchData();
        console.log("Image: " + image);
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
                                <h2>Association française des personnes malades</h2>
                                <h3>Vous nous avez vu mais nous avez vous regardé ?</h3>
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