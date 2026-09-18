import {useEffect, useState} from 'react'
import './App.css'


function App() {

    const [message, setMessage] = useState("");
    const [message2, setMessage2] = useState("");

    useEffect(() => {
        fetch("/api/helloWorld")
            .then(res => res.json())
            .then((data) => {
                setMessage(data.message)
                setMessage2(data.message2)
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
                    <h2>And Hello World from backend:</h2>
                    <h3> {message} </h3>
                    <h3> {message2} </h3>
                </div>
            </div>
        </>
    )
}

export default App
