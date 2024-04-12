import Header from "../components/Header";
import { redirect } from "react-router-dom";

export function Home() {

        return (
            <div>
                <Header />
                <h1>Home</h1>
            </div>
        );
}