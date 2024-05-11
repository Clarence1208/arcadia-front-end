import {createContext, FC, ReactNode, useEffect, useState} from "react";

export interface IUserSession {
    userId?: number;
    isLoggedIn: boolean;
    fullName: string;
    backPage: string;
    loginToken: string;
    roles: [];
}

interface IUserSessionContext {
    userSession: IUserSession;
    updateUserSession: (newUserSession: Partial<IUserSession>) => void;
}

interface IProps {
    children: ReactNode;
}

export const UserSessionContext = createContext<IUserSessionContext | null>(null);

export const UserSessionProvider: FC<IProps> = ({ children }) => {
    const [userSession, setUserSession] = useState<IUserSession>({
        isLoggedIn: false,
        fullName: "",
        backPage: "",
        loginToken: "",
        roles: [],
    });

    useEffect(() => {
        // Retrieve user session data from local storage on component mount
        const storedUserSession = localStorage.getItem("userSession");
        if (storedUserSession) {
            setUserSession(JSON.parse(storedUserSession));
        }else{
            console.warn("no user session exists")
        }
    }, []);

    const updateUserSession = (newUserSession: Partial<IUserSession>) => {
        setUserSession(prevUserSession => {
            const updatedUserSession = { ...prevUserSession, ...newUserSession };
            localStorage.setItem("userSession", JSON.stringify(updatedUserSession));
            return updatedUserSession;
        })
    };


    return (
        <UserSessionContext.Provider value={{userSession, updateUserSession}}>
            {children}
        </UserSessionContext.Provider>
    );
}