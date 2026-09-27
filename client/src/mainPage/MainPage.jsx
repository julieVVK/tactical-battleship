import Button from "../assets/button/Button.jsx";
import "./mainPage.css";
function MainPage(){

    return (
        <div className="main-page">
            <div className="main-page-dialogue">
                <h1 className="mainPageh1">Play</h1>
                <div className="main-page-button-container">
                    <Button text="Button 1"/>
                    <Button text="Button 2"/>
                </div>
            </div>

        </div>
    );
}


export default MainPage