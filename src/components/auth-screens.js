// Login screen (returning user) and account setup screen (first run).
import { h, Fragment } from '../lib/dom.js';
import { MIN_PASSWORD_LENGTH } from '../lib/constants.js';
import { initials, formatDate, formatTime } from '../lib/utils.js';

export function LoginScreen({ userName, clock, password, unlocking, error, shake, onPasswordChange, onSubmit, onShakeEnd }) {
  return h('div', { className: `login-screen ${unlocking ? 'login-screen--unlocking' : ''}` },
    h('div', {
      className: `login-card ${shake ? 'login-card--shake' : ''}`,
      onAnimationEnd: (event) => { if (event.animationName === 'auth-shake') onShakeEnd(); }
    },
      h('div', { className: 'login-avatar' }, initials(userName)),
      h('div', { className: 'login-user' }, userName),
      h('div', { className: 'login-meta' }, `${formatDate(clock)} · ${formatTime(clock)}`),
      h('label', { className: 'login-label' }, 'Password'),
      h('input', {
        className: `login-input ${error ? 'login-input--error' : ''}`,
        type: 'password',
        value: password,
        onChange: (event) => onPasswordChange(event.target.value),
        onKeyDown: (event) => event.key === 'Enter' && onSubmit(),
        placeholder: '••••••••',
        autoFocus: true
      }),
      error && h('div', { className: 'auth-error' }, error),
      h('button', { className: 'login-button', type: 'button', onClick: onSubmit }, 'Unlock'),
      h('div', { className: 'login-hint' }, 'Enter the password you chose during setup.')
    )
  );
}

export function SetupScreen({ name, password, confirm, unlocking, error, shake, onNameChange, onPasswordChange, onConfirmChange, onSubmit, onShakeEnd }) {
  return h('div', { className: `login-screen ${unlocking ? 'login-screen--unlocking' : ''}` },
    h('div', {
      className: `login-card ${shake ? 'login-card--shake' : ''}`,
      onAnimationEnd: (event) => { if (event.animationName === 'auth-shake') onShakeEnd(); }
    },
      h('div', { className: 'login-avatar' }, initials(name)),
      h('div', { className: 'login-user' }, 'Create your account'),
      h('div', { className: 'login-meta' }, 'Choose a name and a password to protect this desktop.'),
      h('label', { className: 'login-label' }, 'Your name'),
      h('input', {
        className: 'login-input',
        type: 'text',
        value: name,
        onChange: (event) => onNameChange(event.target.value),
        onKeyDown: (event) => event.key === 'Enter' && onSubmit(),
        placeholder: 'e.g. Alex',
        maxLength: 24,
        autoFocus: true
      }),
      h('label', { className: 'login-label' }, 'Password'),
      h('input', {
        className: `login-input ${error ? 'login-input--error' : ''}`,
        type: 'password',
        value: password,
        onChange: (event) => onPasswordChange(event.target.value),
        onKeyDown: (event) => event.key === 'Enter' && onSubmit(),
        placeholder: `At least ${MIN_PASSWORD_LENGTH} characters`
      }),
      h('label', { className: 'login-label' }, 'Confirm password'),
      h('input', {
        className: `login-input ${error ? 'login-input--error' : ''}`,
        type: 'password',
        value: confirm,
        onChange: (event) => onConfirmChange(event.target.value),
        onKeyDown: (event) => event.key === 'Enter' && onSubmit(),
        placeholder: '••••••••'
      }),
      error && h('div', { className: 'auth-error' }, error),
      h('button', { className: 'login-button', type: 'button', onClick: onSubmit }, 'Create account'),
      h('div', { className: 'login-hint' }, 'Stored only in this browser, never sent anywhere.')
    )
  );
}
