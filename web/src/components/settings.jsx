import React, { useState } from 'react';

export default function Settings() {
    const [muteMusic, setMuteMusic] = useState(true);
    const [muteSfx, setMuteSfx] = useState(true);
    const [language, setLanguage] = useState('en');
    const [username, setUsername] = useState('Captain');
    const [email, setEmail] = useState('captain@example.com');
    const [country, setCountry] = useState('CZ');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSaveProfile = (event) => {
        event.preventDefault();     // Prevent form submission
        alert("Saved profile settings for ${username} ( ${email} ${country} )!");
    };

    const handleUpdatePassword = (event) => {           // When a user interacts with your page—like submitting a form, 
        event.preventDefault();                         // clicking a button, or typing in a box—JavaScript 
                                                        // automatically generates an Event object containing details 
                                                        // about that action and passes it as the first parameter to your function.
        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match!"); 
            return;
        }
        alert("Password updated successfully!");
    };


    return (
        <section id="settings">
        <a href="#home">Home</a>
        <h2>Settings</h2>
        <p>Make yourself at home. Manage your profile and game preferences.</p>

        <form>
            <fieldset>
                <label>
                    <input 
                    type="checkbox" 
                    name="muteMusic" 
                    // checked={} reads the current state of the checkbox 
                    checked={muteMusic} 
                    //onChange={ ... } (Listening for user action) "Execute this function every single time the user clicks or toggles this checkbox."
                    onChange={ (event) => setMuteMusic(event.target.checked) } 
                    // This is an inline arrow function that runs on click.
                    />   
                    Mute music
                </label>
            </fieldset>
            
        </form>




        </section>
        );
    }