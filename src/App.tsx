import React from 'react';
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
import {CreateArticle} from "./routes/CreateArticle";
import {CreateMeeting} from "./routes/CreateMeeting";
import {Dashboard} from "./routes/Dashboard";
import {MemberDashboard} from "./routes/MemberDashboard";
import {Blog} from "./routes/Blog";
import {Register} from "./routes/Register";


function App() {

    return (
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

                {/*Below needs to be inside admin dashboard*/}
                <Route path='/users' element={<UsersDashboard />}/>
                <Route path='/createArticle' element={<CreateArticle />}/>
                <Route path='/createMeeting' element={<CreateMeeting />}/>
                {/* <Route path='/article/:id' element={<Article />}/> */}

                <Route path='*' element={<NotFound />}/>
            </Routes>
            </UserSessionProvider>
            </LocalizationProvider>
        </BrowserRouter>
    );
}

export default App;
