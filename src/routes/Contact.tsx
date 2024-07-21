import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {Button, TextField} from "@mui/material";
import '../styles/Contact.css';

export function Contact() {
    function contactUs(e: React.FormEvent) {
        e.preventDefault();
        alert("Votre message a bien été envoyé !(c'est faux)")
    }

    return (
        <div>
            <Header/>
                <div className={"main"}>
                    <div>
                        <h2>Contactez-nous</h2>
                        <p>Pour toute question ou demande d'information, veuillez nous contacter via les coordonnées suivantes :</p>

                        <h3>Adresse</h3>
                        <p>ESGI PARIS</p>
                        <p>242 RUE DU FAUBOURG SAINT ANTOINE</p>
                        <p>75011 Paris, France</p>

                        <h3>Email</h3>
                        <p><a href="mailto:arcadia.solution2024@gmail.com" className="link">arcadia.solution2024@gmail.com</a></p>

                        <h3>Téléphone</h3>
                        <p>+33 1 23 45 67 89</p>
                    </div>
                    <h2>Formulaire de Contact</h2>
                    <form className={"form"} onSubmit={contactUs}>
                        <div className={"contact-form-fields"}>
                        <TextField name={"name"} label={"Nom"} variant={"outlined"} className="contact-form-field"/>
                        <TextField name={"email"} label={"Email"} variant={"outlined"} className="contact-form-field"/>
                        <TextField name={"object"} label={"Objet du mail"} variant={"outlined"} className="contact-form-field"/>
                        <TextField name={"message"} label={"Message"} variant={"outlined"} multiline rows={4} className="contact-form-field"/>
                        <Button type={"submit"} variant={"contained"} className="contact-form-field">Envoyer</Button>
                        </div>
                    </form>
                    <h2>Réseaux Sociaux</h2>
                    <p>Suivez-nous sur nos réseaux sociaux pour rester informé des dernières nouvelles et événements :</p>
                    <ul>
                        <li><a href="/" className="link">Facebook</a></li>
                        <li><a href="/" className="link">Twitter</a></li>
                        <li><a href="/" className="link">Instagram</a></li>
                    </ul>
                </div>
            <Footer/>
        </div>
    );
}