//File was created by Vladyslav Doroshenko
import { useEffect, useRef, useState } from "react";

import profileLogo from "../../assets/logo.svg";
import "./profileMenu.css";

function ProfileMenu({ onNavigateSettings }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const buttonRef = useRef(null);

    //TODO: add routing (React Router or (more likely)Express Router???) to this
    const menu_items = {
        "Profile" : "#Profile",
        "Statistics": "#Statistics",
        "Match history": "#MatchHistory",
        "Settings": "#Settings",
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



    //TODO: edit this after API endpoint for this is implemented
    const signOut = () => {
        fetch('/api/signout', {
            method: 'GET',
        }).then(res => res.json())
            .then(() => {
                alert("Successfully signed out");
                // force reload for backend to update user data, which after this will be NULL => no profile menu
                location.reload()
            }).catch((error) => {
            alert("Error 521: Failed to sign out \n Error message: " + error);
        })
    }




    return (
        <div className="profile-menu main-page-profile" ref={containerRef}>
            <button
                className="profile-menu-toggle"
                type="button"
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
            >
                <img src={profileLogo} alt="" />
            </button>


            <section className="profile-menu-panel" hidden={!isOpen}>
                <header className="profile-menu-header">
                    <h2>Your account</h2>
                    <p>Player profile and preferences</p>
                </header>

                <div className="profile-menu-items">

                    {Object.entries(menu_items).map( ([label, href]) => {
                     return (   
                       // <a className="profile-menu-item" href={href} key={label}> {label} </a>
                        <button
                            type="button"
                            className="profile-menu-item"
                            key={label}
                            onClick={() => {
                                setIsOpen(false);
                                if (onNavigateSettings) onNavigateSettings(); 
                            }}

                        >
                            {label}
                        </button>
                     );
                    })}

                    <button type="button" onClick={() => signOut()} className="profile-menu-item profile-menu-signout">
                        Sign out
                    </button>
                </div>
            </section>
        </div>
    );
}

export default ProfileMenu;
