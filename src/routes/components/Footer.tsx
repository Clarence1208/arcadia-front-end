import "../../styles/Footer.css";
import logo from "../../images/logo.png";
import {useTheme} from "@mui/material";
import { Alert, Snackbar } from "@mui/material";
import {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../../contexts/user-session";
import { uploadToS3, listFilesS3 } from "../../utils/s3";
import { _Object } from "@aws-sdk/client-s3";
import { ConfigContext } from "../../index";
export function Footer() {

    const theme = useTheme();

    const [s3Logo, sets3Logo] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState("");
    const [open, setOpen] = useState(false);
    const config = useContext(ConfigContext);
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [isDataFetched, setIsDataFetched] = useState(false);

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
                    const check = value.Key.split("/");
                    if ((check[0] === config.associationName) && (check[1] === "common") && (check[2].startsWith("logo-"))) {
                        sets3Logo("https://arcadia-bucket.s3.eu-west-3.amazonaws.com/" + value?.Key);
                    }
                });
                setIsDataFetched(true);
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
            <div className="green-line" style={{backgroundColor: theme.palette.primary.main}}></div>
            <div className="footer-content">
                <img src={s3Logo ? s3Logo : logo } alt={"logo"} style={{maxHeight:"10vh"}} />
                <div className="raccourcis">
                    <a href="/termsOfServices">Mentions légales et CGU</a>
                    <a href="/contact">Contact</a>
                </div>
               <div>{"2024"}</div>
                <p>Ce site est destiné aux gérants d'association orientée médicale souhaitant créer un site web et l'heberger rapidement. Arcadia Solutions. Il s’agit d’une entreprise fictive. By HILDERAL - HIRSCH - RUTH @ ESGI PARIS
                </p>
            </div>
            </div>
            }
        </footer>
    )
}