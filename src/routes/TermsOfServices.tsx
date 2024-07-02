import Header from "./components/Header";
import { Footer } from "./components/Footer";
import React, { useState, useEffect } from "react";
import { CircularProgress, Box } from "@mui/material";

export function TermsOfServices() {
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 10);
    }, []);

    return (
        <>
            {!isPageLoaded ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                    <CircularProgress />
                    <div>Loading...</div>
                </Box>
            ) : (
                <div>
                    <Header />
                    <div className={"main"}>
                        <h1>Mentions Légales</h1>
                        <p><strong>Nom du site :</strong> Template d'Arcadia</p>
                        <p><strong>URL du site :</strong> www.arcadia-solution.com</p>
                        <p><strong>Éditeur du site :</strong></p>
                        <p>Arcadia</p>
                        Adresse de l'association : 123 Rue des Étudiants, 75011 Paris, France<br/>
                        Email : fausse.email@arcadia-solution.com<br/>
                        Téléphone : +33 1 23 45 67 89

                        <p><strong>Directeur de la publication :</strong> Enairol Laredlih</p>
                        <p><strong>Hébergeur :</strong></p>
                        <p>Le pote de CHI<br/>
                            2 rue Kellermann - 59100 Roubaix - France<br/>
                            Téléphone : +33 XXXXXXXXX</p>

                        <h2>Conditions Générales d'Utilisation (CGU)</h2>
                        <h3>Article 1 : Objet</h3>
                        <p>Les présentes « conditions générales d'utilisation » ont pour objet l'encadrement juridique des modalités de mise à disposition des services du site Gestion Association Médicale Étudiante et leur utilisation par « l'Utilisateur ».</p>
                        <p>Les conditions générales d'utilisation doivent être acceptées par tout Utilisateur souhaitant accéder au site. Elles constituent le contrat entre le site et l'Utilisateur. L’accès au site par l’Utilisateur signifie son acceptation des présentes conditions générales d’utilisation.</p>

                        <h3>Article 2 : Mentions légales</h3>
                        <p>Le site Gestion Association Médicale Étudiante est édité par l'Association Étudiante en Médecine, dont le siège social est situé au 123 Rue des Étudiants, 75000 Paris, France.</p>

                        <h3>Article 3 : Accès aux services</h3>
                        <p>Le site permet à l'Utilisateur un accès gratuit aux services suivants :</p>
                        <ul>
                            <li>Consultation des informations sur les activités de l'association</li>
                            <li>Inscription aux événements organisés par l'association</li>
                            <li>Accès aux documents de gestion de l'association</li>
                        </ul>
                        <p>Le site est accessible gratuitement en tout lieu à tout Utilisateur ayant un accès à Internet. Tous les frais supportés par l'Utilisateur pour accéder au service (matériel informatique, logiciels, connexion Internet, etc.) sont à sa charge.</p>

                        <h3>Article 4 : Propriété intellectuelle</h3>
                        <p>Les marques, logos, signes ainsi que tous les contenus du site (textes, images, sons...) font l'objet d'une protection par le Code de la propriété intellectuelle et plus particulièrement par le droit d'auteur.</p>
                        <p>L'Utilisateur doit solliciter l'autorisation préalable du site pour toute reproduction, publication, copie des différents contenus. Il s'engage à une utilisation des contenus du site dans un cadre strictement privé. Toute utilisation à des fins commerciales et publicitaires est strictement interdite.</p>

                        <h3>Article 5 : Responsabilité</h3>
                        <p>Les sources des informations diffusées sur le site sont réputées fiables mais le site ne garantit pas qu’il soit exempt de défauts, d’erreurs ou d’omissions.</p>
                        <p>Les informations communiquées sont présentées à titre indicatif et général sans valeur contractuelle. Malgré des mises à jour régulières, le site Gestion Association Médicale Étudiante ne peut être tenu responsable de la modification des dispositions administratives et juridiques survenant après la publication. De même, le site ne peut être tenu responsable de l’utilisation et de l’interprétation de l’information contenue dans ce site.</p>

                        <h3>Article 6 : Liens hypertextes</h3>
                        <p>Des liens hypertextes peuvent être présents sur le site. L'Utilisateur est informé qu'en cliquant sur ces liens, il sortira du site Gestion Association Médicale Étudiante. Ce dernier n'a pas de contrôle sur les pages web sur lesquelles aboutissent ces liens et ne saurait, en aucun cas, être responsable de leur contenu.</p>

                        <h3>Article 7 : Évolution du contrat</h3>
                        <p>Le site se réserve à tout moment le droit de modifier les clauses stipulées dans le présent contrat.</p>

                        <h3>Article 8 : Durée</h3>
                        <p>La durée du présent contrat est indéterminée. Le contrat produit ses effets à l'égard de l'Utilisateur à compter du début de l'utilisation du service.</p>

                        <h3>Article 9 : Droit applicable et juridiction compétente</h3>
                        <p>Le présent contrat est soumis à la législation française. En cas de litige non résolu à l'amiable entre l'Utilisateur et l'Éditeur, les tribunaux de Paris sont compétents pour régler le contentieux.</p>
                    </div>
                    <Footer />
                </div>
            )}
        </>
    );
}
