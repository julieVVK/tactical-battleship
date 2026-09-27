import {useEffect, useState} from 'react'


function App() {

    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/ping")
            .then(res => res.json())
            .then((data) => {
                setMessage(data.message)
            })
    }, []);

    return (
        <>
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    flexDirection: "column"
                }}
            >
                <div>
                    <h1>Hello World from frontend!</h1>
                </div>
                <div>
                    <h2>Ping to backend :</h2>
                    <h3> {message} </h3>
                </div>
            </div>
        </>
    )
}

export default App
