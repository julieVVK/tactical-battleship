import React, { useState } from 'react';
import './settings.css'; 

export default function Settings() {

  const [muteMusic, setMuteMusic] = useState(true);
  const [muteSoundEffects, setMuteSoundEffects] = useState(false);
  const [language, setLanguage] = useState('en');
  const [username, setUsername] = useState('Captain');
  const [email, setEmail] = useState('captain@example.com');
  const [country, setCountry] = useState('CZ');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = (event) => {
    event.preventDefault();
    alert(`Profile saved: ${username} (${email}, ${country})`);
  };

  const handleUpdatePassword = (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password updated successfully!');
  };




  return (
    <section id="settings" className="settings-container">

      <div className="settings-top-nav">
        <a href="#home" className="back-link"> Home</a>
      </div>

      <header className="settings-header">
        <h2 className="settings-title">Settings</h2>
        <p className="settings-subtitle">
          Make yourself at home. Manage your profile and game preferences.
        </p>
      </header>

      <div className="settings-grid">




        {/*MUSIC AND SOUND EFFECTS*/}

        <fieldset className="settings-sound"> 

          <legend className="sound-title">Sound</legend>

          <div className="button-group">

            <label className={`toggle-button ${muteMusic ? 'active' : ''}`}>
              <input 
                type="checkbox" 
                name="muteMusic" 
                checked={muteMusic} 
                onChange={(event) => setMuteMusic(event.target.checked)} 
                className="checkbox-input"
              />
              Mute music
            </label>

            <label className={`toggle-button ${muteSoundEffects ? 'active' : ''}`}>
              <input 
                type="checkbox" 
                name="muteSoundEffects" 
                checked={muteSoundEffects} 
                onChange={(event) => setMuteSoundEffects(event.target.checked)} 
                className="checkbox-input"
              />
              Mute sound effects
            </label>

          </div>
        </fieldset>

        {/*MUSIC AND SOUND EFFECTS*/}


        {/*LANGUAGE*/}

        <fieldset className="settings-language">

          <legend className="language-title">Language</legend>

          <div className="form-group">

            <label htmlFor="language" className="form-label">Language</label>

            <select 
              id="language" 
              value={language} 
              onChange={(event) => setLanguage(event.target.value)}
              className="language-select"
            >
              <option value="en">English</option>
              <option value="cz">Czech</option>
            </select>

            <p className="language-description">Language used across the game.</p>

          </div>
        </fieldset>

        {/*LANGUAGE*/}


        {/*ACCOUNT*/}
        <fieldset className="settings-account">
          <legend className="account-title">Account</legend>

          <form onSubmit={handleSaveProfile} className="account-form">

            <div className="form-group">

              <label htmlFor="username" className="form-label">Username</label>

              <input 
                type="text" 
                id="username" 
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
                <option value="CZ"> Czechia</option>
                <option value="UA"> Ukraine</option>
                <option value="SK"> Slovakia</option>
                <option value="PL"> Poland</option>
              </select>
            </div>

            <div className="profile-picture-section">
              <p className="form-label">Profile picture</p>
              <div className="avatar-placeholder"></div>
              <button type="button" className="button-avatar">Change picture</button>
              <p className="field-hint">JPG or PNG · Up to 2 MB</p>
            </div>

            <div className="form-actions">
              <button type="submit" className="button-submit">Save changes</button>
              <span className="field-hint">Your name will appear in your profile.</span>
            </div>

          </form>
        </fieldset>

        {/*ACCOUNT*/}


        {/*PASSWORD*/}

        <fieldset className="settings-password">
          <legend className="password-title">Change password</legend>
          <p className="password-subtitle">Keep your account secure.</p>

          <form onSubmit={handleUpdatePassword} className="password-form">

            <div className="form-group">
              <label htmlFor="current-password" className="form-label">Current password</label>
              <input 
                type="password" 
                id="current-password" 
                value={currentPassword} 
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
              <button type="submit" className="button-submit">Update password</button>
              <span className="field-hint">Use a password you do not use elsewhere.</span>
            </div>
          </form>
        </fieldset>

        {/*PASSWORD*/}

      </div>
    </section>
  );
}