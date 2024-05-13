import Header from "../components/Header";
import {Footer} from "../components/Footer";
export function Home() {

        return (
            <div>
                <Header />
                    <div className={"main"}>
                        <h1>Test {process.env.REACT_APP_ASSOCIATION_NAME}</h1>
                    </div>
                <Footer/>
            </div>
        );
}