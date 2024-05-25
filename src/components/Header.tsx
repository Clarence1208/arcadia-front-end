import '../styles/Header.css';
import logo from '../images/logo.png';
import {Link} from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonRemoveAlt1Icon from '@mui/icons-material/PersonRemoveAlt1';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useContext} from "react";
import {UserSessionContext} from "../contexts/user-session";

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
            <a href={"/logout"}>
                <PersonRemoveAlt1Icon className="icon" fontSize={"large"} />
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

    return (
        <div>
      <div className="main-header">
        <div className="header-logo">
            <a href="/"><img src={logo} alt="logo" /></a>
        </div>
          <div className="nav-header">
             <CustomNavItem link="/" text="Accueil" expand={true} />
              <CustomNavItem link="/blog" text="Se renseigner(blog)" />
                <CustomNavItem link="/donate" text="Nous soutenir" />
                <CustomNavItem link="/memberdashboard" text="Espace adhérent" />
                <CustomNavItem link="/adminDashboard" text="Espace admin" />
              {/*{userSession?.isLoggedIn && <CustomNavItem link="/dashboard" text="Tableau de bord" />}*/}
          </div>

          <LogInOutButton />
      </div>
            <div className="footer-header"></div>
        </div>
    )
  }
  