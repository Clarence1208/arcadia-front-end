import {Alert, Button, IconButton, TextField, Tooltip} from "@mui/material";
import '../../styles/ChatBotConfig.css';
import '../../styles/App.css';
import {FormEvent, useContext, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {UserSessionContext} from "../../contexts/user-session";
import Snackbar from "@mui/material/Snackbar";
import HelpIcon from '@mui/icons-material/Help';
import {ConfigContext} from "../../index";


type ChatBotConfigData = {
    id: number,
    value: string,
}

type WebsiteSettings = {
    id: number,
    name: string,
    description: string,
    value: string,
    type?: string
}

const body : ChatBotConfigData = {
    id: 0,
    value: "",
}

function ChatBotConfigForm() {
    const userSession = useContext(UserSessionContext)?.userSession
    const navigate = useNavigate();

    const [ErrorMessage, setErrorMessage] = useState("")
    const [settings, setSettings] = useState<WebsiteSettings[]>([])
    const [open, setOpen] = useState(false);
    const [data, setData] = useState(body)
    const [changed, setChanged] = useState(true)
    const [isCreated, setIsCreated] = useState(false)
    const config = useContext(ConfigContext);

    useEffect(() => {
        if (userSession?.loginToken) {
            const getSettings = async (): Promise<WebsiteSettings[]> => {
                const bearer = "Bearer " + userSession?.loginToken;
                const response: Response = await fetch(`${config.apiURL}/websiteSettings`, {
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    console.log(error)
                    setErrorMessage("Erreur : " + await error.message);
                    setOpen(true)
                    return []
                }
                const res = await response.json();
                if (res.length === 0) {
                    setErrorMessage("Aucun paramètre trouvé")
                    setOpen(true)
                }
                return res;
            }
            getSettings().then(setSettings)
        }
    }
    , [userSession?.loginToken, isCreated])

    useEffect(() => {
        for (const setting of settings) {
            if (setting.name === "chatbot_configuration") {
                setData(prev => {
                    return { ...prev, value: setting.value, id: setting.id}
                })
            }
        }
    }, [settings])

    if (!userSession?.isLoggedIn) {
        navigate('/login')
    }

    if(!(userSession?.roles.includes("admin") || !userSession?.roles.includes("superadmin"))){
        navigate('/')
    }

    function updateFields(fields: Partial<ChatBotConfigData>) {
        setChanged(false)
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()

        if (data.id === 0) {

            const newWebsiteSettings: WebsiteSettings = {
                id: 0,
                name: "chatbot_configuration",
                description: "Configuration du ChatBot",
                value: data.value,
                type: "config"
            }

            const bearer = "Bearer " + userSession?.loginToken;
            const response: Response = await fetch( config.apiURL+"/websiteSettings", {method: "POST", body: JSON.stringify(newWebsiteSettings),
                headers: {
                    "Authorization": bearer,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                const error =  await response.json()
                setErrorMessage("Erreur : " + await error.message);
                setOpen(true)
                return
            }
            setErrorMessage("Configuration du ChatBot mise à jour");
            setOpen(true)
            navigate('/adminDashboard')
            setIsCreated(true)
            return
        }

        const bearer = "Bearer " + userSession?.loginToken;
        const response: Response = await fetch( config.apiURL+"/websiteSettings/" + data.id, {method: "PATCH", body: JSON.stringify(data),
            headers: {
                "Authorization": bearer,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            const error =  await response.json()
            setErrorMessage("Erreur : " + await error.message);
            setOpen(true)
            return
        }
        setErrorMessage("Configuration du ChatBot mise à jour");
        setOpen(true)
        navigate('/adminDashboard')
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={ErrorMessage.includes("Erreur") ? "error" : "success"}
                    variant="filled"
                    sx={{ width: '100%' }}
                >{ErrorMessage}</Alert>
            </Snackbar>

            <div className="chatbot-config">
                <div className="chatbot-config-title">
                    <h2>Configuration du ChatBot :</h2>
                    <Tooltip title="La configuration de votre ChatBot se résume de toute les informations importantes dont vous voulez que votre assistant IA dispose pour qu'il puisse le mieux répondre à vos utilisateurs. Le ChatBot se trouvera en bas à droite de votre site.">
                            <IconButton>
                                <HelpIcon />
                            </IconButton>
                        </Tooltip>
                </div>
                <form id="create-meeting-form" onSubmit={onSubmit}>

                    <TextField 
                        label="Configuration" 
                        variant="outlined"
                        multiline
                        rows={20}
                        value={data.value}
                        style={{width: "60vw", marginBottom: "1em"}}
                        onChange={e => updateFields({ value: e.target.value })} 
                    />
                    <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    onClick={onSubmit}
                    disabled={changed}
                    >
                        Soumettre la nouvelle configuration
                    </Button>
                </form>
            </div>
        </div>
    );
}
export function ChatBotConfig() {
    return (
        <div>
            <ChatBotConfigForm />
        </div>
    );
}