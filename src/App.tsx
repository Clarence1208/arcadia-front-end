import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './styles/App.css';
import {Home} from "./routes/Home";
import {LogIn} from "./routes/LogIn";
import {Logout} from "./routes/Logout";
import {NotFound} from "./routes/NotFound";
import {UserSessionProvider} from "./contexts/user-session";
import {UsersDashboard} from "./routes/UsersDashboard";


function App() {

    return (
        <BrowserRouter>
            <UserSessionProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LogIn />} />
                <Route path="/logout" element={<Logout />} />
                <Route path='/users' element={<UsersDashboard />}/>

                <Route path='*' element={<NotFound />}/>
            </Routes>
            </UserSessionProvider>
        </BrowserRouter>
    );
}

export default App;
