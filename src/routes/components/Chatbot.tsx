import React, {SyntheticEvent, useState} from "react";
import {Alert, Button, IconButton, TextField, Tooltip} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import "../../styles/Chatbot.css"
import HelpIcon from "@mui/icons-material/Help";


type Prompt ={
    role: string,
    content: string,
}

const initialMessages = [
    {
        role: "assistant",
        content: "Bonjour, comment puis-je t'aider aujourd'hui ?",
    }
    ]
export function Chatbot() {
    const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
    const [messages, setMessages] = useState<Prompt[]>(initialMessages);
    const [open, setOpen] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState("")

    const handleClose = () => {
        setOpen(false)
    }
    const chat = async (messages: Prompt[]) => {
        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    temperature: 0.5,
                }),
            }
        );

        if (!response.ok) {
            console.error(response);
            setErrorMessage("Erreur de l'API OpenAI");
            setOpen(true)
            return;
        }
        const data = await response.json();
        return data;
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

        return (
            <div className={"chatbot-box"}>
                <Snackbar
                    open={open}
                    autoHideDuration={3000}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleClose}
                        severity="error"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >{ErrorMessage}</Alert>
                </Snackbar>

                <div>
                    <h1>Arcadia Chatbot
                    <Tooltip title="Posez une question à l'assistant IA (service externe OPENAI).">
                        <IconButton>
                            <HelpIcon />
                        </IconButton>
                    </Tooltip></h1>
                </div>
                <div>
                    {messages.map((message, index) => (
                        message.role === "assistant" ?
                            <div key={index} className={"message assistant"}>{message.content}</div> :
                            <div key={index} className={"message user"}>{message.content}</div>
                    ))}
                </div>
                <form onSubmit={handleSubmit}>
                    <TextField name={"userMessage"} variant={"filled"} label={"Message"} placeholder={"Ex: Qu'est ce qu'un adhérent ?"} />
                    <Button variant={"contained"} type={"submit"} >Envoyer</Button>
                </form>
            </div>
        );
    }