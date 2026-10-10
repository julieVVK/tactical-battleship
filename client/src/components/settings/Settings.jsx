// File was created by Yuliia Vovk

// Later modified by Vladyslav Doroshenko

import { useState } from 'react';
import Button from '../button/Button';
import './settings.css';

export default function Settings({ onNavigateMain }) {

  const [muteMusic,        setMuteMusic] =        useState(true);
  const [muteSoundEffects, setMuteSoundEffects] = useState(false);

  const [language, setLanguage] = useState('en');
  const [username, setUsername] = useState('');   // was Captain
  const [email,    setEmail] =    useState('');   // was captain@example.com
  const [country,  setCountry] =  useState('CZ');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword] =     useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  /* TODO: add DB communication:
   *   1. Check if username and email are valid
   *   2. Check if username and email are unique
   *   3. Update the user's profile in the database
   *   4. Save the updated profile
   * */
  const handleSaveProfile = (event) => {
    event.preventDefault();
    alert(`Profile saved: ${username} (${email}, ${country})`);
  };


  /* TODO: add DB communication:
   *   1. Check if current password is correct
   *   2. Update the user's password in the database
   *   3. Save the updated password
   * */
  const handleUpdatePassword = (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password updated successfully!');
  };




  /* TODO: add DB communication:
   *   1. Fetch user profile information from the database
   *   2. Initialize state variables with fetched data
   * */
  return (
    <section id="settings" className="settings-container">

      <div className="settings-top-nav">
        <Button
          type="button"
          className="home-back-button"
          onClick={onNavigateMain}
        >
           Home
        </Button>
      </div>

      <header className="settings-header">
        <h2 className="settings-title">Settings</h2>
      </header>

      <div className="settings-grid">




        {/*MUSIC AND SOUND EFFECTS*/}
        {/*TODO: add correct logic to this section
                 add proper DB communication:
                  1. Fetch user sound settings from the database
                  2. Update user sound settings in the database
        */}
        <div className="settings-sound">

          <h3 className="sound-title">Sound</h3>

          <div className="button-group">

            {/*TODO: implement logic to toggle muteMusic*/}
            <Button
              variant={muteMusic ? 'dark' : 'light'}
              className={"sound-toggle-button"}
              aria-pressed={muteMusic}
              onClick={() => setMuteMusic(!muteMusic)}
            >
              Mute music
            </Button>

            <Button
              variant={muteSoundEffects ? 'dark' : 'light'}
              className={"sound-toggle-button"}
              aria-pressed={muteSoundEffects}
              onClick={() => setMuteSoundEffects(!muteSoundEffects)}
            >
              Mute sound effects
            </Button>

          </div>
        </div>

        {/*MUSIC AND SOUND EFFECTS*/}


        {/*LANGUAGE*/}

        <div className="settings-language">

          <h3 className="language-title">Language</h3>

          <div className="form-group">

            <label htmlFor="language" className="form-label">Language</label>

            <select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="language-select"
            >
              {/* TODO: implement map function to map
                          all supported countries and languages
                          from a separate dedicated file */}
              {/*TODO: add proper DB communication:
                  1. Fetch user language settings from the database
                  2. Update user language settings in the database */}
              <option value="en">English</option>
              <option value="cz">Czech</option>
            </select>
          </div>
        </div>

        {/*LANGUAGE*/}


        {/*ACCOUNT*/}
        {/* TODO: maybe refactor this whole section to a separate window or smth???
                  so the user know EXACTLY where to change things */}
        <div className="settings-account">
          <h3 className="account-title">Account</h3>

          <form onSubmit={handleSaveProfile} className="account-form">

            <div className="form-group">

              <label htmlFor="username" className="form-label">Username</label>

              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="nickname"
                className="form-input"
              />
            </div>

            <div className="form-group">

              <label htmlFor="email" className="form-label">Email</label>

              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="form-input"
              />
            </div>

            <div className="form-group">

              <label htmlFor="country" className="form-label">Country</label>

              <select
                id="country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="form-select"
              >
                {/* TODO: implement map function to map
                          all supported countries and languages
                          from a separate dedicated file */}
                <option value="CZ"> Czechia</option>
                <option value="UA"> Ukraine</option>
                <option value="SK"> Slovakia</option>
                <option value="PL"> Poland</option>
              </select>
            </div>

            {/* TODO: add change profile handler */}
            <div className="profile-picture-section">
              <p className="form-label">Profile picture</p>
              <div className="avatar-placeholder"></div>
              <Button type="button" className="change-picture-button">Change picture</Button>
              <p className="field-hint">JPG or PNG · Up to 2 MB</p>
            </div>

            <div className="form-actions">
              {/* TODO: disable Save until values differ from the saved profile */}
              <Button
                  type="submit"
                  variant="dark"
                  className="save-account-button"
                  disabled
              >
                Save changes
              </Button>
            </div>

          </form>
        </div>

        {/*ACCOUNT*/}


        {/*PASSWORD*/}
        {/*TODO: add correct logic to this section
                 check if fields are filled and filled correctly
                 check handleUpdatePassword() to\do for further work */}

        <div className="settings-password">
          <h3 className="password-title">Change password</h3>
          <form onSubmit={handleUpdatePassword} className="password-form">

            <div className="form-group">
              <label htmlFor="current-password" className="form-label">Current password</label>
              <input
                type="password"
                id="current-password"
                value={currentPassword}
                placeholder="Enter your current password"
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-password" className="form-label">New password</label>
              <input
                type="password"
                id="new-password"
                placeholder="Enter a new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">Confirm new password</label>
              <input
                type="password"
                id="confirm-password"
                placeholder="Repeat the new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <Button type="submit" variant="dark" className="button-submit">Update password</Button>
            </div>
          </form>
        </div>

        {/*PASSWORD*/}

      </div>
    </section>
  );
}
