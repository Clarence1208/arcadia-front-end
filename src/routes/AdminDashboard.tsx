import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {SyntheticEvent, useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../contexts/user-session";
import {Alert, Button, Tab, Tabs} from "@mui/material";
import "../styles/Dashboard.css";
import {UsersDashboard} from "./UsersDashboard";
import {MeetingsList} from "./meetings/MeetingsList";
import AddBoxIcon from '@mui/icons-material/AddBox';
import {WebsiteSettings} from "./WebsiteSettings";
import {PollList} from "./polls/PollList";
import {PremisesList} from "./premises/PremisesList";
import { DocumentListAdmin } from "../documents/DocumentListAdmin";
import { ChatBotConfig } from "./components/ChatBotConfig";
import StripeSettings from "./stripe/StripeSettings";
import {useNavigate, useSearchParams} from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";

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
    const [queryParameters] = useSearchParams();
    const userSession = useContext(UserSessionContext)?.userSession
    const [tabsValue, setTabsValue] = useState(0);
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [open, setOpen] = useState(queryParameters.get("successMessage") === "true");
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    if (!userSession?.isLoggedIn || (!userSession?.roles.includes("admin") && !userSession?.roles.includes("superadmin") && !userSession?.roles.includes("manager") && !userSession?.roles.includes("treasurer"))) {
        navigate("/login")
    }
    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setTabsValue(newValue);
        event.currentTarget.className = "active";
    };
    return (
        <div>
            <Header />
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={()=>setOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={()=>setOpen(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >Le compte a été créé avec succès</Alert>
            </Snackbar>
            {isPageLoaded &&
            <div>

            <div id="dahsboard-main" className="main">

                <Tabs
                    className="panels-tabs"
                    orientation="vertical"
                    variant="scrollable"
                    value={tabsValue}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                >
                    { (userSession?.roles.includes("superadmin") || userSession?.roles.includes("admin") || userSession?.roles.includes("manager")) &&
                        <Tab label="Gestion des Assemblées Générales" {...a11yProps(0)}/>
                    }
                    { (userSession?.roles.includes("superadmin") || userSession?.roles.includes("admin") || userSession?.roles.includes("manager")) &&
                    <Tab label="Gestions des sondages" {...a11yProps(1)}/>
                    }
                    { (userSession?.roles.includes("superadmin") || userSession?.roles.includes("admin") || userSession?.roles.includes("manager")) &&
                        <Tab label="Gestion des utilisateurs" {...a11yProps(2)}/>
                    }
                    { (userSession?.roles.includes("superadmin") || userSession?.roles.includes("admin") || userSession?.roles.includes("manager")) &&
                        <Tab label="Gestions des salles" {...a11yProps(3)}/>
                    }
                    { (userSession?.roles.includes("superadmin") || userSession?.roles.includes("admin")) &&
                        <Tab label="Gestions des paramètres globaux du site" {...a11yProps(4)}/>
                    }
                    { (userSession?.roles.includes("superadmin") || userSession?.roles.includes("admin") || userSession?.roles.includes("treasurer")) &&
                    <Tab label="Gestions des documents" {...a11yProps(5)}/>
                    }
                    { (userSession?.roles.includes("superadmin") || userSession?.roles.includes("admin")) &&
                    <Tab label="Gestion du ChatBot" {...a11yProps(6)}/>
                    }
                    { (userSession?.roles.includes("superadmin") || userSession?.roles.includes("admin") || userSession?.roles.includes("treasurer")) &&
                    <Tab label="Gestions des dons" {...a11yProps(7)}/>
                    }
                </Tabs>

                <div className={"board"}>
                    <h1>Tableau de bord de {userSession?.fullName || "l'administrateur"}</h1>
                    <TabPanel value={tabsValue} index={userSession?.roles.includes("treasurer") ? 5 : 0} className={"tab-panel"}>
                        <Button href="/createMeeting" variant="contained" color="primary"
                                endIcon={<AddBoxIcon></AddBoxIcon>}>Créer une nouvelle assemblée générale</Button>
                        <MeetingsList/>
                    </TabPanel>
                    <TabPanel value={tabsValue} index={userSession?.roles.includes("treasurer") ? 7 : 1}>
                        <Button href="/createPoll" variant="contained" color="primary"
                                endIcon={<AddBoxIcon></AddBoxIcon>}>Créer un nouveau sondage</Button>
                            <PollList />
                    </TabPanel>
                    <TabPanel value={tabsValue} index={2}>
                        <UsersDashboard/>
                    </TabPanel>
                    <TabPanel value={tabsValue} index={3}>
                        <Button href="/createPremise" variant="contained" color="primary" endIcon={ <AddBoxIcon></AddBoxIcon>}>Créer une nouvelle salle</Button>
                            <PremisesList />
                    </TabPanel>
                    { (userSession?.roles.includes("superadmin") || userSession?.roles.includes("admin")) &&
                    <TabPanel value={tabsValue} index={4}>
                        <WebsiteSettings/>
                    </TabPanel>
                    }
                    { (userSession?.roles.includes("superadmin") || userSession?.roles.includes("admin") ||  userSession?.roles.includes("treasurer")) &&
                        <TabPanel value={tabsValue} index={userSession?.roles.includes("treasurer") ? 0 : 5}>
                            <div className="board-documents">
                                <DocumentListAdmin />
                            </div>
                        </TabPanel>
                    }
                    { (userSession?.roles.includes("superadmin") || userSession?.roles.includes("admin")) &&
                    
                        <TabPanel value={tabsValue} index={6}>
                            <div className="board-chatbot">
                                <ChatBotConfig />
                            </div>
                        </TabPanel>
                    }
                    { (userSession?.roles.includes("superadmin") || userSession?.roles.includes("admin") || userSession?.roles.includes("treasurer")) &&
                        <TabPanel value={tabsValue} index={userSession?.roles.includes("treasurer") ? 1 : 7}>
                            <StripeSettings />
                        </TabPanel>
                    }
                </div>
            </div>
            </div>
            }
            <Footer />
        </div>
    );
}