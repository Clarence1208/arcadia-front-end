import {useContext, useEffect, useState} from "react";
import {UserRegisterForm} from "../components/UserRegisterForm";
import {Dayjs} from "dayjs";
import {ConfigContext} from "../../index";

type FormData = {
    firstName: string;
    surname: string;
    email: string;
    roles?: string;
    password: string;
    confirmPassword?: string,
    birthDate: Dayjs | null;
};
const editUserData: FormData = {
    firstName: "",
    surname: "",
    password: "",
    confirmPassword: "",
    email: "",
    birthDate: null
}
type EditUserProps = {
    userId: number |undefined,
    userToken: string
}



export function EditUser({userId, userToken}: EditUserProps){
    const [formData, setFormData] = useState<FormData>(editUserData);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const config = useContext(ConfigContext);
    function updateFields(fields: Partial<FormData>){
        setFormData(prev => {
            return {...prev, ...fields}
        })
    }

    useEffect(() => {
        if (userToken && userId) {
            const getUser = async (): Promise<FormData> => {
                const bearer = "Bearer " + userToken;
                const response: Response = await fetch(`${config.apiURL}/users/${userId}`, {
                    headers: {
                        "Authorization": bearer,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    return {} as FormData
                }
                const res = await response.json();
                if (res.length === 0) {
                    setErrorMessage("Aucun paramètre trouvé")
                    return {} as FormData
                }
                return res;
            }
            getUser().then(setFormData)
            setFormData({...formData, password: ""})
        }
    }, [userToken, userId])

    return(
        <div>
            <UserRegisterForm {...formData} formTitle={"Modifier les informations personnelles"} formDescription={""} formError={errorMessage} updateFields={updateFields}  />
        </div>
    )
}