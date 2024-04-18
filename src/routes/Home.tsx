import Header from "../components/Header";
import { redirect } from "react-router-dom";
export function Home() {

        return (
            <div>
                <Header />
                {}
                <h1>Test {process.env.REACT_APP_ASSOCIATION_NAME}</h1>
            </div>
        );
}