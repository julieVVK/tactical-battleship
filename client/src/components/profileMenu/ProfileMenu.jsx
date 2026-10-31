// File was created by Vladyslav Doroshenko

import { useLanguage } from '../../i18n/useLanguage.js';
import { useEffect, useRef, useState } from "react";

import profileLogo from "../../assets/logo.svg";
import "./profileMenu.css";
import { Link } from "react-router";


function ProfileMenu() {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const menu_items = {
        "nav.settings" : "/settings",
        "account.statistics": "/statistics",
        "account.matchHistory": "/statistics#match-history",
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


    const signOut = () => {
        alert(t('account.signedOut'));
        // Reload the app to create a new guest.
        window.location.replace("/");
    };


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

                    {Object.entries(menu_items).map( ([label, path]) => {
                     return (
                        <Link
                            to={path}
                            className="profile-menu-item"
                            key={label}
                            onClick={() => setIsOpen(false)}
                        >
                            {t(label)}
                        </Link>
                     );
                    })}

                    <button
                        type="button"
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
