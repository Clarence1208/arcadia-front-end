import "../../styles/Chatbot.css"
import ChatIcon from '@mui/icons-material/Chat';
import HelpIcon from "@mui/icons-material/Help";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import SendIcon from '@mui/icons-material/Send';
import {ConfigContext} from "../../index";
import { Alert, Button, CircularProgress, IconButton, TextField, Tooltip } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import OpenAI from "openai";
import { SyntheticEvent, useEffect, useState, useContext } from "react";
import "../../styles/Chatbot.css";
import timeout from "../../utils/timeout";

type PromptMessages =  OpenAI.Chat.Completions.ChatCompletionMessageParam[];
const initialMessages : PromptMessages = [
    {
        role: "assistant",
        content: "Bonjour, comment puis-je t'aider aujourd'hui ?",
    }
]

type WebsiteSettings = {
    id?: number,
    name: string,
    description?: string,
    value: string,
    type?: string
}
export function Chatbot() {
    const config = useContext(ConfigContext);
    const API_KEY = config.openaiAPIKey;
    const APP_NAME = process.env.REACT_APP_ASSOCIATION_NAME;
    
    const [messages, setMessages] = useState<PromptMessages>(initialMessages);
    const [open, setOpen] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState("")
    const [showChatBot, setShowChatBot] = useState(false)
    const [settings, setSettings] = useState<WebsiteSettings[]>([])
    const [chatbotConfig, setChatbotConfig] = useState("")
    const openai = new OpenAI({apiKey: API_KEY, dangerouslyAllowBrowser:true});
    const [assistant, setAssistant] = useState<OpenAI.Beta.Assistants.Assistant>()
    const [thread, setThread] = useState<OpenAI.Beta.Threads.Thread>()
    const [isLoading, setIsLoading] = useState(false)
    
    useEffect(() => {
        const getSettings = async (): Promise<WebsiteSettings[]> => {
            const response: Response = await fetch(`${process.env.REACT_APP_API_URL}/websiteSettings`, {
                headers: {
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
    , [])

    useEffect(() => {
        for (const setting of settings) {
            if (setting.name === "chatbot_description") {
                setChatbotConfig(setting.value)
            }
        }
    }, [settings])

    const handleClose = () => {
        setOpen(false)
    }
    const handleShowChatBot = async () => {
        setShowChatBot(!showChatBot)
        if (!thread || !assistant) {
            await setNewAssistant()
            await setNewThread()
        }
    }
    const setNewAssistant = async () => {
        try {
            setAssistant(await openai.beta.assistants.create({
                name: APP_NAME + " Assistant IA",
                instructions: chatbotConfig,
                model: "gpt-3.5-turbo"
            }));
        }catch (error){
            console.error(error);
            setErrorMessage("Erreur de l'API OpenAI");
            setOpen(true)
        }
    }
    const setNewThread = async () => {
        try {
            setThread(await openai.beta.threads.create());
        }catch (error){
            console.error(error);
            setErrorMessage("Erreur de l'API OpenAI");
            setOpen(true)
        }
    }
    const chat = async () => {

        try{
            if(!assistant || !thread){
                setErrorMessage("Erreur de l'API OpenAI");
                setOpen(true)
                return;
            }

            setIsLoading(true)

            let run = await openai.beta.threads.runs.create(
                thread.id,
                { assistant_id: assistant.id }
            );

            while (run.status !== 'completed' && run.status !== 'failed') {
                run = await openai.beta.threads.runs.retrieve(
                    thread.id,
                    run.id
                );
                await timeout(500);
            }

            if (run.status === 'failed') {    
                setErrorMessage("Erreur de l'API OpenAI");
                setOpen(true)
                return;
            }

            const threadMessages = await openai.beta.threads.messages.list(
                thread.id
            );

            for (const message of threadMessages.data) {
                if (message["content"][0]["type"] === "text") {
                    setIsLoading(false)
                    return message.content[0].text.value;
                }
            }

        }catch (error){
            console.error(error);
            setErrorMessage("Erreur de l'API OpenAI");
            setOpen(true)
        }
    }

    async function createMessage(message: string) {
        if (!thread) {
            setErrorMessage("Erreur de l'API OpenAI");
            setOpen(true)
            return;
        }
        return await openai.beta.threads.messages.create(
            thread.id,
            {
              role: "user",
              content: message,
            }
        );
    }

    async function handleSubmit(e: SyntheticEvent) {
        e.preventDefault();
        const target = e.target as typeof e.target & {
            userMessage: { value: string };
        }
        const message = target.userMessage.value;

        if (message === "") {
            setErrorMessage("Veuillez entrer un message");
            setOpen(true)
            return;
        }

        if(!assistant || !thread){
            setErrorMessage("Erreur de l'API OpenAI");
            setOpen(true)
            return;
        }

        setMessages((prevMessages) => [
            ...prevMessages,
            {
                role: "user",
                content: message,
            },
        ]);

        await createMessage(message)

        chat().then((response) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    role: "assistant",
                    content: response as string,
                },
            ]);
        });
        target.userMessage.value = "";
    }

        if (!showChatBot) {
            return (
                <div onClick={handleShowChatBot} className={"chatbot-icon"}>
                    <Tooltip title="Posez une question à l'assistant IA (service externe OPENAI).">
                        <IconButton>
                            <ChatIcon fontSize={"large"} color={"primary"}/>
                        </IconButton>
                    </Tooltip>
                </div>
            );
        }else {
            return (
                <div className={"chatbot-box"}>
                    <Snackbar
                        open={open}
                        autoHideDuration={3000}
                        onClose={handleClose}
                        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                    >
                        <Alert
                            onClose={handleClose}
                            severity="error"
                            variant="filled"
                            sx={{width: '100%'}}
                        >{ErrorMessage}</Alert>
                    </Snackbar>

                    <div className={"close-icon"} onClick={handleShowChatBot}><HighlightOffIcon/></div>
                        <h1>{APP_NAME} Assistant IA
                            <Tooltip title="Posez une question à l'assistant d'intelligence articielle (service externe OPENAI).">
                                <IconButton>
                                    <HelpIcon/>
                                </IconButton>
                            </Tooltip></h1>
                    <div>
                        {messages.map((message, index) => (
                            MessageBox({
                                message: typeof message.content === 'string' ? message.content : "",
                                role: message.role,
                                key: index
                            })
                        ))
                        }
                    </div>
                    { isLoading && (
                        <div className='loader-chatbot'>
                            <CircularProgress />
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <TextField name={"userMessage"} variant={"filled"} label={"Message"}
                                   placeholder={"Ex: Qu'est ce qu'un adhérent ?"}
                                   fullWidth multiline/>
                        <Button variant={"contained"} type={"submit"} style={{maxHeight: "5vh", minHeight: "5vh"}}>
                            <SendIcon/>
                        </Button>
                    </form>
                </div>
            );
        }
    }

    function MessageBox({message, role, key}: {message: string, role: string, key: number}) {

    const APP_NAME = process.env.REACT_APP_ASSOCIATION_NAME;

    let sender = "";
    if (role === "assistant") {
        sender = APP_NAME +" Assistant IA";
    }else {
        sender = "Vous";
    }
    return (
            <div key={key} className={`message-box-${role}`}>
                <p>{sender}</p>
                <div className={`message ${role}`}>
                    <p>{message}</p>
                </div>
            </div>
            )
    }