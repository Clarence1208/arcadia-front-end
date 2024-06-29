import {Alert, Button, IconButton, TextField, Tooltip} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import "../../styles/Chatbot.css"
import ChatIcon from '@mui/icons-material/Chat';
import HelpIcon from "@mui/icons-material/Help";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import SendIcon from '@mui/icons-material/Send';
import {ConfigContext} from "../../index";
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
        }
    }
    const setNewAssistant = async () => {
        try {
            setAssistant(await openai.beta.assistants.create({
                name: APP_NAME + " Chatbot",
                instructions: chatbotConfig,
                model: "gpt-3.5-turbo"
            }));
        }catch (error){
            console.error(error);
            setErrorMessage("Erreur de l'API OpenAI");
            setOpen(true)
        }
    }
    const setNewThread = async (message: string) => {
        try {
            return await openai.beta.threads.create({messages: [{role: "user", content: message}]})
        }catch (error){
            console.error(error);
            setErrorMessage("Erreur de l'API OpenAI");
            setOpen(true)
        }
    }
    const chat = async (newThread: OpenAI.Beta.Threads.Thread) => {

        try{
            if(!assistant){
                setErrorMessage("Erreur de l'API OpenAI");
                setOpen(true)
                return;
            }

            let run = await openai.beta.threads.runs.create(
                newThread.id,
                { assistant_id: assistant.id }
            );

            while (run.status !== 'completed' && run.status !== 'failed') {
                run = await openai.beta.threads.runs.retrieve(
                    newThread.id,
                    run.id
                );
                console.log(run.status);
                await timeout(100);
            }

            if (run.status === 'completed') {
                const messages = await openai.beta.threads.messages.list(
                  run.thread_id
                );
                for (const message of messages.data.reverse()) {
                  console.log(`${message.role} > ${message.content[0]}`);
                }
              } else {
                console.log(run.status);
              }

            console.log(run)

            const threadMessages = await openai.beta.threads.messages.list(
                newThread.id
            );

            for (const message of threadMessages.data.reverse()) {
                console.log(`${message.role} > ${message.content[0]}`);
            }

            return run
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

        if(!assistant){
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

        const newThread = await setNewThread(message)

        if (!newThread) {
            setErrorMessage("Erreur de l'API OpenAI");
            setOpen(true)
            return;
        }

        // await createMessage(message)

        chat(newThread).then((response) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    role: "assistant",
                    content: "la réponse de l'IA",
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
                        <h1>{APP_NAME} Chatbot
                            <Tooltip title="Posez une question à l'assistant IA (service externe OPENAI).">
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
                    <form onSubmit={handleSubmit}>
                        <TextField name={"userMessage"} variant={"filled"} label={"Message"}
                                   placeholder={"Ex: Qu'est ce qu'un adhérent ?"}
                                   fullWidth multiline/>
                        <Button variant={"contained"} type={"submit"}>
                            <SendIcon/>
                        </Button>
                    </form>

                </div>
            );
        }
    }

    function MessageBox({message, role, key}: {message: string, role: string, key: number}) {

    let sender = "";
    if (role === "assistant") {
        sender = "Arcadia Bot";
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