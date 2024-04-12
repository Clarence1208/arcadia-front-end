import { createTheme } from '@mui/material/styles';

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

export default theme;