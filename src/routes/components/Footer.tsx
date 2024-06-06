import "../../styles/Footer.css";
import Logo from "../../images/logo.png";
import {useTheme} from "@mui/material";
export function Footer() {

    const theme = useTheme();
    return (
        <footer>
            <div className="green-line" style={{backgroundColor: theme.palette.primary.main}}></div>
            <div className="footer-content">
                <img src={Logo} alt={"logo"} />
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