import '../../styles/Header.css';
import logo from '../../images/logo.png';
import {Link} from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonRemoveAlt1Icon from '@mui/icons-material/PersonRemoveAlt1';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../../contexts/user-session";
import { Alert, Snackbar } from "@mui/material";
import { uploadToS3, listFilesS3 } from "../../utils/s3";
import { ConfigContext } from "../../index";
import { _Object } from "@aws-sdk/client-s3";

interface CustomNavItemProps {
    link: string;
    text: string;
    expand?: boolean
}
export function CustomNavItem(props: CustomNavItemProps){
    return (
        <div className="navItem">
            <Link href={props.link} underline={"none"}>{props.text}</Link>
            {props.expand && <ExpandMoreIcon />}
        </div>
    )
}

function LogInOutButton() {
    const userSession = useContext(UserSessionContext);
    const userIsLoggedIn = userSession?.userSession.isLoggedIn;
    if (userIsLoggedIn) {
        return (
            <a className="icon" href={"/logout"}>
                <PersonRemoveAlt1Icon  fontSize={"large"} />
            </a>
        )
    }else{
        return (
            <a href={"/login"}>
                <PersonOutlineIcon className="icon" fontSize={"large"} />
            </a>
        )
    }
}
export default function Header() {

    const userSession = useContext(UserSessionContext)?.userSession;
    const [s3Logo, sets3Logo] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState("");
    const [open, setOpen] = useState(false);
    const config = useContext(ConfigContext);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

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
        <div className="main-header"> 
            <div className="header-logo">
                <a href="/"><img src={s3Logo ? s3Logo : logo} alt="logo" /></a>
            </div>
            <div className="nav-header">
                <CustomNavItem link="/" text="Accueil"/>
                <CustomNavItem link="/blog" text="Actualités" />
                <CustomNavItem link="/donate" text="Nous soutenir" />
                
                {userSession?.roles.includes("adherent") && <CustomNavItem link="/memberdashboard" text="Espace adhérent" /> }
                {(userSession?.roles.includes("admin") || userSession?.roles.includes("superadmin") || userSession?.roles.includes("manager") || userSession?.roles.includes("treasurer")) && <CustomNavItem link="/adminDashboard" text="Espace admin" /> }
            </div>

            <LogInOutButton />
        </div>
                <div className="footer-header"></div>
                </div>
        }
        </div>
    )
  }
  