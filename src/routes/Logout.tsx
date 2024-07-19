import { useNavigate } from "react-router-dom";
import {Home} from "./Home";

export function Logout(){
    try {
        localStorage.removeItem("userSession")
    }catch (e){
        console.error(e)
    }

    window.location.href = "/"
    return <Home />

}