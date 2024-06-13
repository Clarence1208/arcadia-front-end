import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

type User = {
    id: number,
    firstName: string,
    surname: string,
    email: string,
    roles: string,
}

export default class Mailer {

    async sendMail(users: User[]) {

        users.forEach(user => {
            
            const mailerSend = new MailerSend({
            apiKey: process.env.MAILERSEND_API_KEY || '',
            });

            const sentFrom = new Sender("arcadia@arcadia.com", "Arcadia");
            const recipients = [
            new Recipient(user.email, "Adhérent")
            ];

            const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject("Une nouvelle AG est disponible !")
            .setHtml("<h1>This is a test email</h1>")

            mailerSend.email.send(emailParams);

        });
    }
}