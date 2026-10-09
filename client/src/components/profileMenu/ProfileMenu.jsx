// File was created by Vladyslav Doroshenko

import { useEffect, useRef, useState } from "react";

import profileLogo from "../../assets/logo.svg";
import "./profileMenu.css";

function ProfileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const containerRef = useRef(null);

    //TODO: connect React Router to this
    const menu_items = {
        "Profile" : "#Profile",
        "Statistics": "#Statistics",
        "Match history": "#MatchHistory",
    }

    useEffect(() => {
        if (!isOpen) return;

        function handlePointerDown(event) {
            if (!containerRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [isOpen]);



    /*TODO: Implement this function once the backend and API endpoint are ready.*/

    // USER ACCOUNT DATA TEMPLATE
    // const userData = () => {
    //     fetch('/api/userData', {
    //         method: 'GET',
    //         userID: null // some function will create session tocken which we will pass here instead of null
    //     }).then(res => res.json())
    //         .then((data) => {
    //             if (data.userID === null) {
    //                 setIsOpen(false);
    //             }
    //         })
    // }



    // Save the token under localStorage.token after user creation.
    const signOut = async () => {
        if (isSigningOut) return;

        setIsSigningOut(true);
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const response = await fetch('/api/signout', {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                const sessionMissing =
                    response.status === 401 &&
                    data.error?.code === "SESSION_NOT_FOUND";

                if (!response.ok && !sessionMissing) {
                    throw new Error(data.error?.message || "The server could not sign you out.");
                }
            }

            localStorage.removeItem("token");
            localStorage.removeItem("gameId");
            alert("Successfully signed out");
            location.reload();
        } catch (error) {
            alert("Failed to sign out\n" + error.message);
        } finally {
            setIsSigningOut(false);
        }
    }




    return (
        <div className="profile-menu main-page-profile" ref={containerRef}>
            <button
                className="profile-menu-toggle"
                type="button"
                aria-label="Account menu"
                aria-expanded={isOpen}
                aria-controls="profile-menu-panel"
                onClick={() => setIsOpen(!isOpen)}
            >
                <img src={profileLogo} alt="" />
            </button>


            <section id="profile-menu-panel" className="profile-menu-panel" hidden={!isOpen}>
                <header className="profile-menu-header">
                    <h2>Your account</h2>
                    <p>Player profile and preferences</p>
                </header>

                <div className="profile-menu-items">

                    {Object.entries(menu_items).map( ([label]) => {
                     return (
                        <button
                            type="button"
                            className="profile-menu-item"
                            key={label}
                            onClick={ () => {setIsOpen(false)} }
                        >
                            {label}
                        </button>
                     );
                    })}

                    <button
                        type="button"
                        disabled={isSigningOut}
                        onClick={() => signOut()}
                        className="profile-menu-item profile-menu-signout">
                        Sign out
                    </button>
                </div>
            </section>
        </div>
    );
}

export default ProfileMenu;
