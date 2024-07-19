import React, {useContext, useEffect} from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/fr';
import './styles/App.css';
import {Home} from "./routes/Home";
import {LogIn} from "./routes/LogIn";
import {Logout} from "./routes/Logout";
import {NotFound} from "./routes/NotFound";
import {UserSessionProvider} from "./contexts/user-session";
import {UsersDashboard} from "./routes/UsersDashboard";
import {CreateArticle} from "./routes/articles/CreateArticle";
import {CreateMeeting} from "./routes/meetings/CreateMeeting";
import {Dashboard} from "./routes/AdminDashboard";
import {MemberDashboard} from "./routes/MemberDashboard";
import {Blog} from "./routes/Blog";
import {Register} from "./routes/Register";
import {MeetingVotesList} from "./routes/meetings/MeetingVotesList";
import {CreateMeetingVote} from "./routes/meetings/CreateMeetingVote";
import {ShowArticle} from "./routes/articles/ShowArticle";
import {MeetingsListUser} from './routes/meetings/MeetingsListUser';
import {EditArticle} from "./routes/articles/EditArticle";
import {TermsOfServices} from "./routes/TermsOfServices";
import {Chatbot} from "./routes/components/Chatbot";
import {MeetingVoteApply} from './routes/meetings/MeetingVoteApply';
import {createTheme} from '@mui/material/styles';
import {ThemeProvider} from "@mui/material";
import {Contact} from "./routes/Contact";
import {VoteResults} from './routes/meetings/VoteResults';
import {CreatePoll} from './routes/polls/CreatePoll';
import {PollVoteApply} from './routes/polls/PollVoteApply';
import {PollResults} from './routes/polls/PollResults';
import {ConfigContext} from "./index";
import {CreatePremise} from './routes/premises/CreatePremise';
import ReturnStripeAccountPage from "./routes/stripe/ReturnStripeAccountPage";
import {RefreshStripe} from "./routes/stripe/RefreshStripe";
import {Donate} from "./routes/Donate";
import {Subscribe} from "./routes/users/Subscribe";
import {SubscriptionPayment} from "./routes/stripe/SubscriptionPayment";
import {ValidateSubscription} from "./routes/stripe/ValidateSubscription";
type WebSetting = {
    name: string,
    value: string,
    description: string,
    type: string
}
const DEFAULT_PRIMARY_COLOR = '#074032'

function App() {
    const [theme, setTheme] = React.useState(createTheme());
    const config = useContext(ConfigContext);


//API CALL TO GET THE THEME FROM WEBSITE SETTINGS
    async function getConfiguration() {
        try {
            if (!config || !config.apiURL) {
                return DEFAULT_PRIMARY_COLOR;
            }
            const response = await fetch(`${config.apiURL}/websiteSettings`);
            const data : WebSetting[] = await response.json();
            const primaryColor = data.find( item => item.name === 'primaryColor');
            const secondaryColor = data.find( item => item.name === 'secondaryColor');
            return [(primaryColor ? primaryColor.value : DEFAULT_PRIMARY_COLOR) , (secondaryColor ? secondaryColor.value : '#f5f5f5')];
        }catch (e) {
            console.warn(e)
            return [DEFAULT_PRIMARY_COLOR, DEFAULT_PRIMARY_COLOR];
        }
    }

// Define your custom theme
    useEffect(() => {
        const theme = createTheme({
            palette: {
                primary: {
                    main: DEFAULT_PRIMARY_COLOR, // DEFAULT COLOR
                    dark: DEFAULT_PRIMARY_COLOR,
                },
                secondary: {
                    main: '#f5f5f5',
                },

                // Add more customizations as needed
            },
        });
        getConfiguration().then(data => {
            theme.palette.primary.main = data[0];
            theme.palette.primary.dark = data[1];
            setTheme(theme)
        });

    }, []);

    return (
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                    <UserSessionProvider>
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/adminDashboard" element={<Dashboard/>}/>
                            <Route path="/memberDashboard" element={<MemberDashboard/>}/>
                            <Route path="/login" element={<LogIn/>}/>
                            <Route path="/logout" element={<Logout/>}/>
                            <Route path="/register" element={<Register/>}/>
                            <Route path="/blog" element={<Blog/>}/>
                            <Route path="/termsOfServices" element={<TermsOfServices/>}/>
                            <Route path='/contact' element={<Contact/>}/>
                            <Route path='/donate' element={<Donate />}/>

                            {/*Below needs to be inside admin dashboard*/}
                            <Route path='/users' element={<UsersDashboard/>}/>
                            <Route path='/createArticle' element={<CreateArticle/>}/>
                            <Route path='/createPoll' element={<CreatePoll/>}/>
                            <Route path="/articles/:articleId" element={<ShowArticle/>}/>
                            <Route path="/articles/:articleId/edit" element={<EditArticle/>}/>
                            <Route path='/createMeeting' element={<CreateMeeting/>}/>
                            <Route path='/meetings' element={<MeetingsListUser/>}/><Route path='/createPremise'
                                                                                          element={<CreatePremise/>}/>
                            <Route path='/meeting/:id/votes' element={<MeetingVotesList/>}/>
                            <Route path='/meeting/:id/createVote' element={<CreateMeetingVote/>}/>
                            <Route path='/meeting/:id/vote/:voteId' element={<MeetingVoteApply/>}/>
                            <Route path='/meeting/:id/vote/:voteId/results' element={<VoteResults/>}/>
                            <Route path='/polls/:id/vote' element={<PollVoteApply/>}/>
                            <Route path='/poll/:id/results' element={<PollResults/>}/>

                            {/*STRIPE*/}

                            <Route path='/users/subscribe' element={<Subscribe />}/>
                            <Route path='/users/subscribe/:subscriptionId/:clientSecret' element={<SubscriptionPayment />}/>
                            <Route path='/stripe/validateSubscription' element={<ValidateSubscription />}/>
                            <Route path='/stripe/return' element={<ReturnStripeAccountPage />}/>
                            <Route path='/refresh/:id' element={<RefreshStripe />}/>


                            <Route path='*' element={<NotFound/>}/>
                        </Routes>
                    </UserSessionProvider>
                </LocalizationProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
