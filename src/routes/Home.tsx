import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {Chatbot} from "./components/Chatbot";
import mainPic from "../images/template_home_pic.jpg";
import "../styles/Home.css";
import { useContext, useEffect, useState } from "react";
import ReactS3Client from 'react-aws-s3-typescript';
import { Alert, Snackbar } from "@mui/material";
import { s3Config } from "../utils/s3Config";
import { ConfigContext } from "../index";

export function Home() {

    const [errorMessage, setErrorMessage] = useState("");
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState<string>("");
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const config = useContext(ConfigContext);

    useEffect(() => {
        const fetchData = async () => {
            const s3 = new ReactS3Client(s3Config);
            try {
                const fileList = await s3.listFiles();
                fileList.data.Contents.forEach((file: { Key: string, publicUrl: string }) => {
                    const check = file.Key.split("/");
                    if ((check[0] === config.associationName) && (check[1] === "common") && (check[2].startsWith("imageHomePage-"))) {
                        setImage(file.publicUrl);
                    }
                });
            } catch (error) {
                console.error('List error:', error);
                setErrorMessage("Erreur : " + error);
                setOpen(true);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (image) {
            setIsPageLoaded(true);
        }
    }, [image]);

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("");
    };

        return (
            <div>
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
                    <Header />
                        <div className={"main home"}>
                            <div>
                                <h1>{process.env.REACT_APP_ASSOCIATION_NAME}</h1>
                                <h2>Association française des personnes malades</h2>
                                <h3>Vous nous avez vu mais nous avez vous regardé ?</h3>
                            </div>
                            <img src={image ? image : mainPic} alt="main-pic" />
                        </div>
                    <Chatbot />
                    <Footer/>
                </div>
                }
        </div>
    );
}