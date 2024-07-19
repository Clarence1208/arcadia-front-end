import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {SyntheticEvent, useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../contexts/user-session";
import {Link, Tab, Tabs} from "@mui/material";
import "../styles/Dashboard.css";
import {MeetingsListUser} from "./meetings/MeetingsListUser";
import {EditUser} from "./users/EditUser";
import {DocumentList} from "../documents/DocumentList";
import {MySubscription} from "./users/MySubscription";
import {useNavigate} from "react-router-dom";

//tabs comes from MUI API docs https://mui.com/material-ui/react-tabs/
function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}
function TabPanel(props: any) {
    const { children, value, index, ...other } = props;

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

export function MemberDashboard(){
    const userSession = useContext(UserSessionContext)?.userSession
    const [tabsValue, setTabsValue] = useState(0);
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    if (!userSession?.isLoggedIn) {
        navigate("/login")
    }
    else if (!userSession?.roles.includes("adherent") && ( !userSession?.roles.includes("admin") && !userSession?.roles.includes("superadmin"))){
        navigate("/users/subscribe")
    }
    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setTabsValue(newValue);
        event.currentTarget.className = "active"; //doesn't seem to work as intended
    };
    return (
        <div>
            <Header />
            { isPageLoaded &&
            <div>

            <div id="dahsboard-main" className="main">

                <Tabs
                    className="panels-tabs"
                    orientation="vertical"
                    variant="scrollable"
                    value={tabsValue}
                    onChange={handleChange}
                    aria-label="Vertical tabs for member"
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                >
                    <Tab label="Mes assemblées générales" {...a11yProps(0)}/>
                    <Tab label="Mes informations personnelles" {...a11yProps(1)}/>
                    <Tab label="Mes paiements" {...a11yProps(2)}/>
                    <Tab label="Mes documents" {...a11yProps(3)}/>
                </Tabs>

                <div className={"board"}>
                    <h1>Tableau de bord de {userSession?.fullName || "l'adhérent"}</h1>

                    {/*TABS PANEL: */}
                    <TabPanel value={tabsValue} index={0}>
                       <MeetingsListUser />
                    </TabPanel>
                    <TabPanel value={tabsValue} index={1}>
                        {userSession && <EditUser userId={userSession?.userId} userToken={userSession?.loginToken}/>}
                    </TabPanel>
                    <TabPanel value={tabsValue} index={2}>
                        <MySubscription />
                    </TabPanel>
                    <TabPanel value={tabsValue} index={3}>
                        <DocumentList />
                    </TabPanel>
                </div>

            </div>

            </div>
            }
            <Footer />
        </div>
    );
}