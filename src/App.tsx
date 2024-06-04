import React, {useEffect} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/fr';
import './styles/App.css';
import {Home} from "./routes/Home";
import {LogIn} from "./routes/LogIn";
import {Logout} from "./routes/Logout";
import {NotFound} from "./routes/NotFound";
import {UserSessionProvider} from "./contexts/user-session";
import {UsersDashboard} from "./routes/UsersDashboard";
import {CreateArticle} from "./routes/articles/CreateArticle";
import {CreateMeeting} from "./routes/CreateMeeting";
import {Dashboard} from "./routes/Dashboard";
import {MemberDashboard} from "./routes/MemberDashboard";
import {Blog} from "./routes/Blog";
import {Register} from "./routes/Register";
import {MeetingVotesList} from "./routes/MeetingVotesList";
import {CreateMeetingVote} from "./routes/CreateMeetingVote";
import {ShowArticle} from "./routes/articles/ShowArticle";
import { MeetingsListUser } from './routes/components/MeetingsListUser';
import {EditArticle} from "./routes/articles/EditArticle";
import {TermsOfServices} from "./routes/TermsOfServices";
import {Chatbot} from "./routes/components/Chatbot";
import { MeetingVoteApply } from './routes/MeetingVoteApply';
import { createTheme } from '@mui/material/styles';
import {ThemeProvider} from "@mui/material";


function App() {
    const [theme, setTheme] = React.useState(createTheme());

//API CALL TO GET THE THEME FROM WEBSITE SETTINGS
    async function getConfiguration(){
       try{
           const response = await fetch(`${process.env.REACT_APP_API_URL}/websiteSettings`);
           const data = await response.json();
           return data[2].value
       }catch (e) {
           console.warn(e)
           return '#074032'
       }
    }

// Define your custom theme
    useEffect(() => {
        const theme = createTheme({
            palette: {
                primary: {
                    main: '#074032', // DEFAULT COLOR
                },
                secondary: {
                    main: '#f5f5f5',
                },
                // Add more customizations as needed
            },
        });
        getConfiguration().then(data => {
            theme.palette.primary.main = data;
            setTheme(theme)
        });

    }, []);

    return (
        <ThemeProvider theme={theme}>
        <BrowserRouter>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
            <UserSessionProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/adminDashboard" element={<Dashboard />} />
                <Route path="/memberDashboard" element={<MemberDashboard />} />
                <Route path="/login" element={<LogIn />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/register" element={<Register />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/termsOfServices" element={<TermsOfServices />} />

                {/*Below needs to be inside admin dashboard*/}
                <Route path='/users' element={<UsersDashboard />}/>
                <Route path='/createArticle' element={<CreateArticle />}/>
                <Route path="/articles/:articleId" element={<ShowArticle />} />
                <Route path="/articles/:articleId/edit" element={<EditArticle />} />
                <Route path='/createMeeting' element={<CreateMeeting />}/>
                <Route path='/meetings' element={<MeetingsListUser />} />
                <Route path='/meeting/:id/votes' element={<MeetingVotesList />}/>
                <Route path='/meeting/:id/createVote' element={<CreateMeetingVote />}/>
                <Route path='/meeting/:id/vote/:voteId' element={<MeetingVoteApply />}/>


                <Route path='*' element={<NotFound />}/>
            </Routes>
            </UserSessionProvider>
            </LocalizationProvider>
        </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
