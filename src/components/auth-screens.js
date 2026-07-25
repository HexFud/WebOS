import { h, Fragment, useState } from "../lib/dom.js";

import { MIN_PASSWORD_LENGTH } from "../lib/constants.js";

import { initials, formatDate, formatTime } from "../lib/utils.js";

function PasswordField({className: className, value: value, onChange: onChange, onKeyDown: onKeyDown, placeholder: placeholder, autoFocus: autoFocus}) {
  const [visible, setVisible] = useState(false);
  return h("div", {
    className: "login-password-wrap"
  }, h("input", {
    className: className,
    type: visible ? "text" : "password",
    value: value,
    onChange: onChange,
    onKeyDown: onKeyDown,
    placeholder: placeholder,
    autoFocus: autoFocus
  }), h("button", {
    type: "button",
    className: "login-password-toggle",
    onClick: () => setVisible(current => !current),
    tabIndex: -1,
    "aria-label": visible ? "Nascondi password" : "Mostra password"
  }, visible ? "Nascondi" : "Mostra"));
}

export function LoginScreen({userName: userName, clock: clock, password: password, unlocking: unlocking, error: error, shake: shake, onPasswordChange: onPasswordChange, onSubmit: onSubmit, onShakeEnd: onShakeEnd}) {
  return h("div", {
    className: `login-screen ${unlocking ? "login-screen--unlocking" : ""}`
  }, h("div", {
    className: `login-card ${shake ? "login-card--shake" : ""}`,
    onAnimationEnd: event => {
      if (event.animationName === "auth-shake") onShakeEnd();
    }
  }, h("div", {
    className: "login-avatar"
  }, initials(userName)), h("div", {
    className: "login-user"
  }, userName), h("div", {
    className: "login-meta"
  }, `${formatDate(clock)} · ${formatTime(clock)}`), h("label", {
    className: "login-label"
  }, "Password"), h(PasswordField, {
    className: `login-input ${error ? "login-input--error" : ""}`,
    value: password,
    onChange: event => onPasswordChange(event.target.value),
    onKeyDown: event => event.key === "Enter" && onSubmit(),
    placeholder: "••••••••",
    autoFocus: true
  }), error && h("div", {
    className: "auth-error"
  }, error), h("button", {
    className: "login-button",
    type: "button",
    onClick: onSubmit
  }, "Unlock"), h("div", {
    className: "login-hint"
  }, "Enter the password you chose during setup.")));
}

export function SetupScreen({name: name, password: password, confirm: confirm, unlocking: unlocking, error: error, shake: shake, onNameChange: onNameChange, onPasswordChange: onPasswordChange, onConfirmChange: onConfirmChange, onSubmit: onSubmit, onShakeEnd: onShakeEnd}) {
  return h("div", {
    className: `login-screen ${unlocking ? "login-screen--unlocking" : ""}`
  }, h("div", {
    className: `login-card ${shake ? "login-card--shake" : ""}`,
    onAnimationEnd: event => {
      if (event.animationName === "auth-shake") onShakeEnd();
    }
  }, h("div", {
    className: "login-avatar"
  }, initials(name)), h("div", {
    className: "login-user"
  }, "Create your account"), h("div", {
    className: "login-meta"
  }, "Choose a name and a password to protect this desktop."), h("label", {
    className: "login-label"
  }, "Your name"), h("input", {
    className: "login-input",
    type: "text",
    value: name,
    onChange: event => onNameChange(event.target.value),
    onKeyDown: event => event.key === "Enter" && onSubmit(),
    placeholder: "e.g. Alex",
    maxLength: 24,
    autoFocus: true
  }), h("label", {
    className: "login-label"
  }, "Password"), h(PasswordField, {
    className: `login-input ${error ? "login-input--error" : ""}`,
    value: password,
    onChange: event => onPasswordChange(event.target.value),
    onKeyDown: event => event.key === "Enter" && onSubmit(),
    placeholder: `At least ${MIN_PASSWORD_LENGTH} characters`
  }), h("label", {
    className: "login-label"
  }, "Confirm password"), h(PasswordField, {
    className: `login-input ${error ? "login-input--error" : ""}`,
    value: confirm,
    onChange: event => onConfirmChange(event.target.value),
    onKeyDown: event => event.key === "Enter" && onSubmit(),
    placeholder: "••••••••"
  }), error && h("div", {
    className: "auth-error"
  }, error), h("button", {
    className: "login-button",
    type: "button",
    onClick: onSubmit
  }, "Create account"), h("div", {
    className: "login-hint"
  }, "Stored only in this browser, never sent anywhere.")));
}
