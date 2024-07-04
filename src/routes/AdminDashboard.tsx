import Header from "./components/Header";
import {Footer} from "./components/Footer";
import React, {SyntheticEvent, useContext, useState} from "react";
import {UserSessionContext} from "../contexts/user-session";
import {Button, Tab, Tabs} from "@mui/material";
import "../styles/Dashboard.css";
import {UsersDashboard} from "./UsersDashboard";
import {MeetingsList} from "./meetings/MeetingsList";
import AddBoxIcon from '@mui/icons-material/AddBox';
import {WebsiteSettings} from "./WebsiteSettings";
import {PollList} from "./polls/PollList";
import StripeSettings from "./stripe/StripeSettings";

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

function TabPanel(props: any) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <div>
                    {children}
                </div>
            )}
        </div>
    );
}

export function Dashboard() {
    const userSession = useContext(UserSessionContext)?.userSession
    const [tabsValue, setTabsValue] = useState(0);

    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setTabsValue(newValue);
        event.currentTarget.className = "active"; //doesn't seem to work as intended
    };
    return (
        <div>
            <Header/>

            <div id="dahsboard-main" className="main">

                <Tabs
                    className="panels-tabs"
                    orientation="vertical"
                    variant="scrollable"
                    value={tabsValue}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{borderRight: 1, borderColor: 'divider'}}
                >
                    <Tab label="Gestion des Assemblées Générales" {...a11yProps(0)}/>
                    <Tab label="Gestion des utilisateurs" {...a11yProps(1)}/>
                    <Tab label="Gestions des événements" {...a11yProps(2)}/>
                    <Tab label="Gestions des paramètres globaux du site" {...a11yProps(3)}/>
                    <Tab label="Gestions des sondages" {...a11yProps(4)}/>
                    <Tab label="Gestions des dons" {...a11yProps(5)}/>
                </Tabs>

                <div className={"board"}>
                    <h1>Tableau de bord de {userSession?.fullName || "l'administrateur"}</h1>
                    <TabPanel value={tabsValue} index={0} className={"tab-panel"}>
                        <Button href="/createMeeting" variant="contained" color="primary"
                                endIcon={<AddBoxIcon></AddBoxIcon>}>Créer une nouvelle assemblée générale</Button>
                        <MeetingsList/>
                    </TabPanel>
                    <TabPanel value={tabsValue} index={1}>
                        <UsersDashboard/>
                    </TabPanel>
                    <TabPanel value={tabsValue} index={2}>
                        <h1>2</h1>
                    </TabPanel>
                    <TabPanel value={tabsValue} index={3}>
                        <WebsiteSettings/>
                    </TabPanel>
                    <TabPanel value={tabsValue} index={4}>
                        <Button href="/createPoll" variant="contained" color="primary"
                                endIcon={<AddBoxIcon></AddBoxIcon>}>Créer un nouveau sondage</Button>
                        <div className={"board"}>
                            <PollList/>
                        </div>
                    </TabPanel>
                    <TabPanel value={tabsValue} index={5}>
                        <StripeSettings/>
                    </TabPanel>

                </div>

            </div>
            <Footer/>
        </div>
    );
}