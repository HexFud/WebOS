const COPY = {
  en: {
    session: 'WEBOS · LOCAL SESSION', setup: 'WEBOS · INITIAL SETUP', password: 'Password', signIn: 'Sign In', createAccount: 'Create Account',
    enterPassword: 'Enter your password', createTitle: 'Create your account', createSubtitle: 'Set up access to your desktop.', name: 'Display name', namePlaceholder: 'e.g. Federico',
    minimumPassword: 'At least {count} characters', confirmPassword: 'Confirm password', repeatPassword: 'Repeat your password', passwordValid: 'Password length is valid', passwordMinimum: 'Use at least {count} characters', passwordsMatch: 'Passwords match', passwordsMismatch: 'Passwords do not match',
    localOnly: 'Your data stays only in this browser.', accountLocalOnly: 'Your account is stored locally and is never sent to a server.', show: 'Show', hide: 'Hide',
    appearance: 'Appearance', dark: 'Dark', light: 'Light', wallpaper: 'Wallpaper', loading: 'Loading…', custom: 'Custom', uploadImage: '+ Upload image', imageHint: 'PNG, JPG or WebP · up to 6 MB · resized automatically and saved only in your browser.', systemInfo: 'System Info', user: 'User', theme: 'Theme', windows: 'Windows', uptime: 'Uptime', language: 'Language', account: 'Account', logOut: 'Log Out & Reset Account',
    wallpaperChanged: 'Wallpaper Changed', customWallpaperSet: 'Custom image applied.', unableToUpload: 'Unable to upload image.',
    accountCreated: 'Account Created', welcome: 'Welcome to WebOS, {name}.', enterPasswordError: 'Please enter your password.', incorrectPassword: 'Incorrect password. Try again.', enterName: 'Please enter a display name.', passwordLength: 'Password must be at least {count} characters.', languageChanged: 'Language Changed', english: 'English', italian: 'Italian'
  },
  it: {
    session: 'WEBOS · SESSIONE LOCALE', setup: 'WEBOS · PRIMA CONFIGURAZIONE', password: 'Password', signIn: 'Accedi', createAccount: 'Crea account',
    enterPassword: 'Inserisci la password', createTitle: 'Crea il tuo account', createSubtitle: 'Configura l’accesso al tuo desktop.', name: 'Nome visualizzato', namePlaceholder: 'Es. Federico',
    minimumPassword: 'Almeno {count} caratteri', confirmPassword: 'Conferma password', repeatPassword: 'Ripeti la password', passwordValid: 'Lunghezza password valida', passwordMinimum: 'Usa almeno {count} caratteri', passwordsMatch: 'Le password corrispondono', passwordsMismatch: 'Le password non corrispondono',
    localOnly: 'I dati rimangono solo in questo browser.', accountLocalOnly: 'L’account viene salvato localmente e non viene inviato a nessun server.', show: 'Mostra', hide: 'Nascondi',
    appearance: 'Aspetto', dark: 'Scuro', light: 'Chiaro', wallpaper: 'Sfondo', loading: 'Caricamento…', custom: 'Personalizzato', uploadImage: '+ Carica immagine', imageHint: 'PNG, JPG o WebP · fino a 6 MB · ridimensionata automaticamente e salvata solo nel browser.', systemInfo: 'Informazioni sistema', user: 'Utente', theme: 'Tema', windows: 'Finestre', uptime: 'Attività', language: 'Lingua', account: 'Account', logOut: 'Esci e reimposta account',
    wallpaperChanged: 'Sfondo modificato', customWallpaperSet: 'Immagine personalizzata impostata.', unableToUpload: 'Impossibile caricare l’immagine.',
    accountCreated: 'Account creato', welcome: 'Benvenuto in WebOS, {name}.', enterPasswordError: 'Inserisci la password.', incorrectPassword: 'Password non corretta. Riprova.', enterName: 'Inserisci un nome visualizzato.', passwordLength: 'La password deve avere almeno {count} caratteri.', languageChanged: 'Lingua modificata', english: 'Inglese', italian: 'Italiano'
  }
};

export function t(language, key, values = {}) {
  const text = COPY[language]?.[key] || COPY.en[key] || key;
  return text.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
}
