import "../styles/Footer.css";
import Logo from "../images/logo.png";
export function Footer() {
    return (
        <footer>
            <div className="green-line"></div>
            <div className="footer-content">
                <img src={Logo} alt={"logo"} />
                <div className="raccourcis">
                    <a href="/">Mentions légales</a>
                    <a href="/">CGU</a>
                    <a href="/">Contact</a>
                </div>
               <div>{"2024"}</div>
                <p>Ce site est destiné aux gérants d'association orientée médicale souhaitant créer un site web et l'heberger rapidement. Arcadia Solutions. Il s’agit d’une entreprise fictive. By HILDERAL - HIRSCH - RUTH @ ESGI PARIS
                </p>
            </div>
        </footer>
    )
}