// File was created by Yuliia Vovk

// Later modified by Vladyslav Doroshenko

import { LANGUAGES } from '../../i18n/translation.js';
import { useLanguage } from '../../i18n/useLanguage.js';
import { useState } from 'react';
import Button from '../button/Button';
import './settings.css';

export default function Settings({ onNavigateMain }) {
  // importing context from LanguageProvider.jsx using "custom" useLanguage hook
  const { language, setLanguage, t } = useLanguage();

  const [muteMusic,        setMuteMusic] =        useState(true);
  const [muteSoundEffects, setMuteSoundEffects] = useState(false);

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
    alert(t('settings.saved', { username, email, country: t(`country.${country}`) }));
  };


  /* TODO: add DB communication:
   *   1. Check if current password is correct
   *   2. Update the user's password in the database
   *   3. Save the updated password
   * */
  const handleUpdatePassword = (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      alert(t('password.mismatch'));
      return;
    }
    alert(t('password.updated'));
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
           {t('nav.home')}
        </Button>
      </div>

      <header className="settings-header">
        <h2 className="settings-title">{t('nav.settings')}</h2>
      </header>

      <div className="settings-grid">




        {/*MUSIC AND SOUND EFFECTS*/}
        {/*TODO: add correct logic to this section
                 add proper DB communication:
                  1. Fetch user sound settings from the database
                  2. Update user sound settings in the database
        */}
        <div className="settings-sound">

          <h3 className="sound-title">{t('settings.sound')}</h3>

          <div className="button-group">

            {/*TODO: implement logic to toggle muteMusic*/}
            <Button
              variant={muteMusic ? 'dark' : 'light'}
              className={"sound-toggle-button"}
              aria-pressed={muteMusic}
              onClick={() => setMuteMusic(!muteMusic)}
            >
              {t('settings.muteMusic')}
            </Button>

            <Button
              variant={muteSoundEffects ? 'dark' : 'light'}
              className={"sound-toggle-button"}
              aria-pressed={muteSoundEffects}
              onClick={() => setMuteSoundEffects(!muteSoundEffects)}
            >
              {t('settings.muteEffects')}
            </Button>

          </div>
        </div>

        {/*MUSIC AND SOUND EFFECTS*/}


        {/*LANGUAGE*/}

        <div className="settings-language">

          <h3 className="language-title">{t('settings.language')}</h3>

          <div className="form-group">

            <label htmlFor="language" className="form-label">{t('settings.language')}</label>

            <select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="language-select"
            >
              {LANGUAGES.map( ({code, name}) => (
                <option key={code} value={code} lang={code}> {name} </option>
              ))}
            </select>
          </div>
        </div>

        {/*LANGUAGE*/}


        {/*ACCOUNT*/}
        {/* TODO: maybe refactor this whole section to a separate window or smth???
                  so the user know EXACTLY where to change things */}
        <div className="settings-account">
          <h3 className="account-title">{t('settings.account')}</h3>

          <form onSubmit={handleSaveProfile} className="account-form">

            <div className="form-group">

              <label htmlFor="username" className="form-label">{t('settings.username')}</label>

              <input
                type="text"
                id="username"
                placeholder={t('settings.usernamePlaceholder')}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="nickname"
                className="form-input"
              />
            </div>

            <div className="form-group">

              <label htmlFor="email" className="form-label">{t('settings.email')}</label>

              <input
                type="email"
                id="email"
                placeholder={t('settings.emailPlaceholder')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="form-input"
              />
            </div>

            <div className="form-group">

              <label htmlFor="country" className="form-label">{t('settings.country')}</label>

              <select
                id="country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="form-select"
              >
                {/* TODO: implement map function to map
                          all supported countries and languages
                          from a separate dedicated file */}
                <option value="CZ"> {t('country.CZ')}</option>
                <option value="UA"> {t('country.UA')}</option>
                <option value="SK"> {t('country.SK')}</option>
                <option value="PL"> {t('country.PL')}</option>
              </select>
            </div>

            {/* TODO: add change profile handler */}
            <div className="profile-picture-section">
              <p className="form-label">{t('settings.picture')}</p>
              <div className="avatar-placeholder"></div>
              <Button type="button" className="change-picture-button">{t('settings.changePicture')}</Button>
              <p className="field-hint">{t('settings.pictureHint')}</p>
            </div>

            <div className="form-actions">
              {/* TODO: disable Save until values differ from the saved profile */}
              <Button
                  type="submit"
                  variant="dark"
                  className="save-account-button"
                  disabled
              >
                {t('settings.save')}
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
          <h3 className="password-title">{t('password.title')}</h3>
          <form onSubmit={handleUpdatePassword} className="password-form">

            <div className="form-group">
              <label htmlFor="current-password" className="form-label">{t('password.current')}</label>
              <input
                type="password"
                id="current-password"
                value={currentPassword}
                placeholder={t('password.currentPlaceholder')}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-password" className="form-label">{t('password.new')}</label>
              <input
                type="password"
                id="new-password"
                placeholder={t('password.newPlaceholder')}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">{t('password.confirm')}</label>
              <input
                type="password"
                id="confirm-password"
                placeholder={t('password.confirmPlaceholder')}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <Button type="submit" variant="dark" className="button-submit">{t('password.update')}</Button>
            </div>
          </form>
        </div>

        {/*PASSWORD*/}

      </div>
    </section>
  );
}
