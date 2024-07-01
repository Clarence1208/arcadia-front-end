import "../../styles/Footer.css";
import logo from "../../images/logo.png";
import {useTheme} from "@mui/material";
import ReactS3Client from 'react-aws-s3-typescript';
import { Alert, Snackbar } from "@mui/material";
import {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../../contexts/user-session";
import { s3Config } from "../../utils/s3Config";
export function Footer() {

    const theme = useTheme();

    const [s3Logo, sets3Logo] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const s3 = new ReactS3Client(s3Config);
            try {
                const fileList = await s3.listFiles();
                fileList.data.Contents.forEach((file: { Key: string, publicUrl: string }) => {
                    const check = file.Key.split("/");
                    if ((check[0] === process.env.REACT_APP_ASSOCIATION_NAME) && (check[1] === "common") && (check[2].startsWith("logo-"))) {
                        sets3Logo(file.publicUrl);
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


    const handleClose = () => {
        setOpen(false);
        setErrorMessage("");
    };

    return (
        <footer>
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
            <div className="green-line" style={{backgroundColor: theme.palette.primary.main}}></div>
            <div className="footer-content">
                <img src={s3Logo ? s3Logo : logo } alt={"logo"} style={{maxHeight:"10vh"}} />
                <div className="raccourcis">
                    <a href="/termsOfServices">Mentions légales</a>
                    <a href="/">CGU</a>
                    <a href="/contact">Contact</a>
                </div>
               <div>{"2024"}</div>
                <p>Ce site est destiné aux gérants d'association orientée médicale souhaitant créer un site web et l'heberger rapidement. Arcadia Solutions. Il s’agit d’une entreprise fictive. By HILDERAL - HIRSCH - RUTH @ ESGI PARIS
                </p>
            </div>
        </footer>
    )
}