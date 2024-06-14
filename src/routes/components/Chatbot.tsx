import React, {SyntheticEvent, useState} from "react";
import {Alert, Button, IconButton, TextField, Tooltip} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import "../../styles/Chatbot.css"
import HelpIcon from "@mui/icons-material/Help";
import OpenAI from "openai";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';

type PromptMessages =  OpenAI.Chat.Completions.ChatCompletionMessageParam[];
const initialMessages : PromptMessages = [
    {
        role: "assistant",
        content: "Bonjour, comment puis-je t'aider aujourd'hui ?",
    }
    ]
export function Chatbot() {
    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    const [messages, setMessages] = useState<PromptMessages>(initialMessages);
    const [open, setOpen] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState("")
    const [showChatBot, setShowChatBot] = useState(false)

    const handleClose = () => {
        setOpen(false)
    }
    const handleShowChatBot = () => {
        setShowChatBot(!showChatBot)
    }
    const chat = async (messages: PromptMessages) => {

        try{
            const client = new OpenAI({ apiKey: API_KEY, dangerouslyAllowBrowser:true});

            const response = await client.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
            })
            return response
        }catch (error){
            console.error(error);
            setErrorMessage("Erreur de l'API OpenAI");
            setOpen(true)
        }
    }

    function handleSubmit(e: SyntheticEvent) {
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
        setMessages([...messages, {role: "user", content: message}]);

        chat(messages).then((response) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    role: "assistant",
                    //content: response.choices[0].message.content,
                    content:"FAKE ANSWER"
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
                        <h1>Arcadia Chatbot
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