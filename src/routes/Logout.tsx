import {Home} from "./Home";

export function Logout(){
    localStorage.removeItem("userSession")

    window.location.href = "/"
    return <Home />

}