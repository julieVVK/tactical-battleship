// File was created by Vladyslav Doroshenko
import shipImage from "../../assets/ship.svg";
import shipWavesImage from "../../assets/ship-waves.svg";
import "./ship.css";

function Ship() {
    return (
        <div className="ship main-page-ship">
            <img className="ship-image" src={shipImage} alt="" />
            {["ship-waves", "ship-waves ship-waves-back"].map((waveClass) => (
                <div className={waveClass} key={waveClass}>
                    <div className="ship-waves-track">
                        {Array.from({ length: 13 }, (_, index) => index - 6).map((copy) => (
                            <img
                                className="ship-waves-layer"
                                src={shipWavesImage}
                                alt=""
                                key={copy}
                                style={{ "--wave-copy": copy }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Ship;
