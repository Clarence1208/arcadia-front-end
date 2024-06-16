import { createTheme } from '@mui/material/styles';
import {useContext} from "react";
import {ConfigContext} from "../index";

//API CALL TO GET THE THEME FROM WEBSITE SETTINGS
async function getConfiguration(){
    const config = useContext(ConfigContext);
    const response = await fetch(`${config.apiURL}/websiteSettings`);
    const data = await response.json();
    console.log(data[2]); //TODO : récupérer la valeur directement pas comme ça mais c'est déjà cool
    return data[2].value
}

// Define your custom theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#074032', // Your custom primary color
        },
        secondary: {
            main: '#f5f5f5', // Your custom secondary color
        },
        // Add more customizations as needed
    },
});
getConfiguration().then(data => {
    theme.palette.primary.main = data;
});

export default theme;