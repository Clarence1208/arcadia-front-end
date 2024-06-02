import Header from "./components/Header";
import {Footer} from "./components/Footer";
import {Chatbot} from "./components/Chatbot";
export function Home() {

        return (
            <div>
                <Header />
                    <div className={"main"}>
                        <h1>Test {process.env.REACT_APP_ASSOCIATION_NAME}</h1>
                    </div>
                <Chatbot />
                <Footer/>
            </div>
        );
}