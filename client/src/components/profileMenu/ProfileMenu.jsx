// File was created by Vladyslav Doroshenko

import { useLanguage } from '../../i18n/useLanguage.js';
import { useEffect, useRef, useState } from "react";

import profileLogo from "../../assets/logo.svg";
import "./profileMenu.css";


function ProfileMenu({ onNavigateStatistics }) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const containerRef = useRef(null);

    //TODO: connect React Router to this
    const menu_items = {
        "account.profile" : "#Profile",
        "account.statistics": "#Statistics",
        "account.matchHistory": "#MatchHistory",
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
                    throw new Error('account.signOutServerError');
                }
            }

            localStorage.removeItem("token");
            localStorage.removeItem("gameId");
            alert(t('account.signedOut'));
            location.reload();
        } catch (error) {
            alert(t('account.signOutFailed') + '\n' + t(
                error.message === 'account.signOutServerError'
                    ? 'account.signOutServerError'
                    : 'account.networkError',
            ));
        } finally {
            setIsSigningOut(false);
        }
    }




    return (
        <div className="profile-menu main-page-profile" ref={containerRef}>
            <button
                className="profile-menu-toggle"
                type="button"
                aria-label={t('account.menu')}
                aria-expanded={isOpen}
                aria-controls="profile-menu-panel"
                onClick={() => setIsOpen(!isOpen)}
            >
                <img src={profileLogo} alt="" />
            </button>


            <section id="profile-menu-panel" className="profile-menu-panel" hidden={!isOpen}>
                <header className="profile-menu-header">
                    <h2>{t('account.title')}</h2>
                    <p>{t('account.subtitle')}</p>
                </header>

                <div className="profile-menu-items">

                    {Object.entries(menu_items).map( ([label]) => {
                     return (
                        <button
                            type="button"
                            className="profile-menu-item"
                            key={label}
                            onClick={ () => {
                                setIsOpen(false)
                                
                                if (label === "Statistics") {
                                    onNavigateStatistics?.();
                                }
                            } }
                        >
                            {t(label)}
                        </button>
                     );
                    })}

                    <button
                        type="button"
                        disabled={isSigningOut}
                        onClick={() => signOut()}
                        className="profile-menu-item profile-menu-signout">
                        {t('account.signOut')}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default ProfileMenu;
