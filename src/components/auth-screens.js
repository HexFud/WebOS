import { h, useState } from "../lib/dom.js";
import { MIN_PASSWORD_LENGTH } from "../lib/constants.js";
import { initials, formatDate, formatTime } from "../lib/utils.js";
import { t } from "../lib/i18n.js";

function PasswordField({ id, className, value, onChange, onKeyDown, placeholder, autoFocus, autoComplete = "current-password", language }) {
  const [visible, setVisible] = useState(false);
  return h("div", { className: "login-password-wrap" },
    h("input", { id, className, type: visible ? "text" : "password", value, onChange, onKeyDown, placeholder, autoFocus, autoComplete }),
    h("button", { type: "button", className: "login-password-toggle", onClick: () => setVisible(current => !current), "aria-label": visible ? t(language, "hide") : t(language, "show") }, visible ? t(language, "hide") : t(language, "show"))
  );
}

function AuthHeader({ avatar, title, subtitle, setup }) {
  return h("div", { className: "auth-header" },
    h("div", { className: `login-avatar ${setup ? "login-avatar--setup" : ""}` }, avatar),
    h("div", { className: "login-user" }, title),
    h("div", { className: "login-meta" }, subtitle)
  );
}

function AuthError({ error }) {
  return error && h("div", { className: "auth-error", role: "alert" }, error);
}

export function LoginScreen({ userName, clock, password, unlocking, error, shake, onPasswordChange, onSubmit, onShakeEnd, language }) {
  return h("div", { className: `login-screen ${unlocking ? "login-screen--unlocking" : ""}` },
    h("main", { className: `login-card ${shake ? "login-card--shake" : ""}`, onAnimationEnd: event => event.animationName === "auth-shake" && onShakeEnd() },
      h("div", { className: "auth-card__eyebrow" }, t(language, "session")),
      h(AuthHeader, { avatar: initials(userName), title: userName, subtitle: `${formatDate(clock)} · ${formatTime(clock)}` }),
      h("div", { className: "auth-divider" }),
      h("label", { className: "login-label", htmlFor: "login-password" }, t(language, "password")),
      h(PasswordField, { id: "login-password", className: `login-input ${error ? "login-input--error" : ""}`, value: password, onChange: event => onPasswordChange(event.target.value), onKeyDown: event => event.key === "Enter" && onSubmit(), placeholder: t(language, "enterPassword"), autoFocus: true, language }),
      h(AuthError, { error }),
      h("button", { className: "login-button", type: "button", onClick: onSubmit }, h("span", null, t(language, "signIn")), h("span", { "aria-hidden": "true" }, "→")),
      h("div", { className: "login-hint" }, t(language, "localOnly"))
    )
  );
}

export function SetupScreen({ name, password, confirm, unlocking, error, shake, onNameChange, onPasswordChange, onConfirmChange, onSubmit, onShakeEnd, language }) {
  const passwordReady = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch = Boolean(confirm) && password === confirm;
  return h("div", { className: `login-screen ${unlocking ? "login-screen--unlocking" : ""}` },
    h("main", { className: `login-card login-card--setup ${shake ? "login-card--shake" : ""}`, onAnimationEnd: event => event.animationName === "auth-shake" && onShakeEnd() },
      h("div", { className: "auth-card__eyebrow" }, t(language, "setup")),
      h(AuthHeader, { avatar: initials(name || "W"), title: t(language, "createTitle"), subtitle: t(language, "createSubtitle"), setup: true }),
      h("div", { className: "auth-divider" }),
      h("label", { className: "login-label", htmlFor: "setup-name" }, t(language, "name")),
      h("input", { id: "setup-name", className: "login-input", type: "text", value: name, onChange: event => onNameChange(event.target.value), onKeyDown: event => event.key === "Enter" && onSubmit(), placeholder: t(language, "namePlaceholder"), maxLength: 24, autoFocus: true, autoComplete: "nickname" }),
      h("label", { className: "login-label", htmlFor: "setup-password" }, t(language, "password")),
      h(PasswordField, { id: "setup-password", className: `login-input ${error ? "login-input--error" : ""}`, value: password, onChange: event => onPasswordChange(event.target.value), onKeyDown: event => event.key === "Enter" && onSubmit(), placeholder: t(language, "minimumPassword", { count: MIN_PASSWORD_LENGTH }), autoComplete: "new-password", language }),
      h("div", { className: "password-status", "aria-live": "polite" },
        h("span", { className: `password-status__dot ${passwordReady ? "is-valid" : ""}` }),
        passwordReady ? t(language, "passwordValid") : t(language, "passwordMinimum", { count: MIN_PASSWORD_LENGTH })
      ),
      h("label", { className: "login-label", htmlFor: "setup-confirm" }, t(language, "confirmPassword")),
      h(PasswordField, { id: "setup-confirm", className: `login-input ${error ? "login-input--error" : ""}`, value: confirm, onChange: event => onConfirmChange(event.target.value), onKeyDown: event => event.key === "Enter" && onSubmit(), placeholder: t(language, "repeatPassword"), autoComplete: "new-password", language }),
      confirm && h("div", { className: `password-status ${passwordsMatch ? "password-status--valid" : "password-status--error"}` }, h("span", { className: `password-status__dot ${passwordsMatch ? "is-valid" : ""}` }), passwordsMatch ? t(language, "passwordsMatch") : t(language, "passwordsMismatch")),
      h(AuthError, { error }),
      h("button", { className: "login-button", type: "button", onClick: onSubmit }, h("span", null, t(language, "createAccount")), h("span", { "aria-hidden": "true" }, "→")),
      h("div", { className: "login-hint" }, t(language, "accountLocalOnly"))
    )
  );
}
